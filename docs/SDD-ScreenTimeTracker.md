# System Design Document (SDD)
## Screen Time Tracker

### 1. Architecture Overview
The Screen Time Tracker is designed as a decoupled three-tier system:
1. **Desktop Client (Agent)**: Native background process with OS window access.
2. **Backend Service (API & Cron Scheduler)**: Express REST API with background worker jobs.
3. **Frontend Dashboard**: Single-page React web application.
4. **Data Layer**: PostgreSQL database for centralized persistence, SQLite for client-side offline buffering.

```
+-----------------------------------------------------------+
|                       Desktop Host                        |
|                                                           |
|   +--------------------+          +-------------------+   |
|   | OS Window Detector |  ----->  | SQLite Local FIFO |   |
|   +--------------------+          +-------------------+   |
|                                             |             |
|                                             v             |
|                                    +-----------------+    |
|                                    |   Sync Client   |    |
|                                    +-----------------+    |
+---------------------------------------------|-------------+
                                              | HTTPS/REST (X-API-Key)
                                              v
+-----------------------------------------------------------+
|                       Backend API                         |
|                                                           |
|   +-----------------------+     +---------------------+   |
|   | Express REST Services |     | Node-Cron Scheduler |   |
|   +-----------------------+     +---------------------+   |
|               |                            |              |
|               |                            |              |
|               v                            v              |
|        PostgreSQL DB           Gemini 3.1 Flash-Lite      |
|     (Raw & Rollup Data)       (Classification & Insights) |
+-----------------------------------------------------------+
                                              ^
                                              | HTTPS/JSON
+---------------------------------------------|-------------+
|                     React Web Dashboard                   |
|                                                           |
|   +-------------------+  +------------------+  +------+   |
|   | Range Select & Nav|  | Metric Breakdown |  | AI UI|   |
|   +-------------------+  +------------------+  +------+   |
+-----------------------------------------------------------+
```

---

### 2. Desktop Tracking Agent Design
- **Window Polling**: Implemented in Node.js.
  - Windows / macOS / Linux X11: Native bindings via `active-win`.
  - Linux Wayland: D-Bus communication with GNOME Shell extension `org.gnome.Shell.Extensions.FocusedWindow`.
- **Local SQLite Store**: Events are queued into an embedded SQLite table (`unsynced_events`). This decouples OS polling from network status.
- **Sync Protocol**: The sync worker reads batches from SQLite, transmits them with exponential backoff (`1s, 2s, 4s, 8s, 16s`), and marks items synced upon 201 Created confirmation.
- **Dynamic Config**: The agent periodically refreshes device policies (such as `capture_titles`) from `/api/devices/me`.

---

### 3. Backend & Data Processing Architecture
- **API Server**: Express.js handling JSON payloads and authentication.
- **Authentication**: Devices authenticate with random 32-byte hexadecimal tokens. The database stores only the SHA-256 hash.
- **Hierarchical Rollup Engine**:
  - `rollupDaily`: Reads `raw_events` for today and yesterday, upserting into `daily_usage`.
  - `rollupWeekly`: Derives weekly sums directly from `daily_usage` (`date_trunc('week', usage_date)`).
  - `rollupMonthly`: Derives monthly sums from `daily_usage` (`date_trunc('month', usage_date)`).
  - `rollupYearly`: Derives yearly sums from `daily_usage` (`EXTRACT(YEAR FROM usage_date)`).
- **Asynchronous Scheduling**:
  - `0 * * * *` (Hourly): Rollup aggregation jobs.
  - `0 */6 * * *` (Every 6h): Application categorizer with Gemini.
  - `5 0 * * *` (Daily 00:05): Summarizer for closed periods with Gemini.
  - `0 1 * * *` (Daily 01:00): Raw event 90-day retention cleanup.

---

### 4. AI Integration Strategy
- **App Categorizer**: Sends uncategorized application names to Gemini 3.1 Flash Lite with a constrained classification prompt. Results are stored in the `apps` table. Once categorized, an app is never sent to the LLM again.
- **Period Summarizer**: Extracts total usage and categories for a completed period, constructs a structured prompt, and queries Gemini for a 2-3 sentence trend review. Insights are persisted in `insights` with unique constraints preventing duplicate generation.

---

### 5. Frontend Dashboard Architecture
- Single-page application built with React, Vite, and modular CSS design tokens.
- **Routing**: Lightweight screen state machine based on `deviceId` presence:
  - If no `deviceId` in `localStorage`: render `DeviceSetupPage`.
  - If `screen === 'settings'`: render `SettingsPage`.
  - Default: render `DashboardPage`.
- **State Management**: React state hooks with abort controllers to cancel in-flight fetches when switching time ranges.
