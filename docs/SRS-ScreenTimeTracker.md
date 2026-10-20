# Software Requirements Specification (SRS)
## Screen Time Tracker

### 1. Introduction
The Screen Time Tracker is a privacy-conscious, multi-platform desktop agent and web dashboard that monitors active computer application usage, generates automated periodic aggregations, provides AI-driven natural language insights, and displays productivity trends across daily, weekly, monthly, and yearly intervals.

---

### 2. Functional Requirements (FR)

#### Window Detection & Desktop Agent
- **FR-1 (Window Polling)**: The agent shall periodically sample the active focused desktop window at a configurable polling frequency (default: 5000ms).
- **FR-2 (Focus Change Event Generation)**: When the active window or application changes, the agent shall calculate the elapsed duration (`start_time`, `end_time`, `duration_seconds`) and record a window session event.
- **FR-3 (Multi-Platform Detection)**: The agent shall support active window detection on Windows, macOS, and Linux X11 using native OS hooks, and on Linux Wayland using the GNOME Shell Focused Window D-Bus interface.
- **FR-4 (Local Event Buffer)**: The agent shall store recorded events in a local embedded SQLite database before transmission, preventing data loss when offline or when the API is unreachable.
- **FR-5 (Independent Sync Loop)**: The agent shall sync untransmitted events to the backend API on a background timer (default: 60000ms) with exponential backoff on network failures.
- **FR-6 (Detector Error Handling)**: If platform window detection dependencies are absent (such as missing Wayland D-Bus extensions), the agent shall log clear remediation guidance rather than silently recording null events.
- **FR-7 (Privacy / Window Title Control)**: The agent shall allow window title tracking to be toggled off, transmitting only the application name when disabled.

#### Ingestion, Security & Device Management
- **FR-8 (Event Ingestion Validation)**: The API shall validate all incoming event submissions with strict schema rules (non-empty `app_name`, valid ISO 8601 timestamps, `end_time > start_time`).
- **FR-9 (Usage Retrieval)**: The API shall provide an endpoint to query aggregated usage statistics filtered by device ID and time range (`daily`, `weekly`, `monthly`, `yearly`).
- **FR-10 (Insights Retrieval)**: The API shall provide an endpoint to retrieve the most recent AI summary for a selected time range and device, returning HTTP 204 No Content for in-progress periods.
- **FR-11 (Device Authentication)**: The API shall authenticate agent requests using an `X-API-Key` HTTP header verified against SHA-256 hashed keys stored in the database.
- **FR-11a (Device Registration)**: The API shall allow registration of a new device label, returning an API key exactly once upon creation.

#### Data Rollups & Aggregations
- **FR-12 (Daily Rollups)**: The system shall aggregate raw events into `daily_usage` totals per device and application.
- **FR-13 (Hierarchical Long-Term Rollups)**: The system shall aggregate weekly, monthly, and yearly totals hierarchically from `daily_usage` rather than reprocessing raw events.
- **FR-14 (Scheduled Background Jobs)**: Rollup calculations, app classifications, and summary generations shall execute asynchronously on schedules managed by a background scheduler, completely decoupled from user request paths.

#### AI Categorization & Summarization
- **FR-15 (Application Classification)**: Uncategorized applications shall be classified into standard categories (*Productivity, Communication, Entertainment, Development, Browsing, System, Other*) via the Gemini API, caching results indefinitely.
- **FR-16 (Natural Language Summarization)**: Closed usage periods shall be summarized into concise 2–3 sentence natural language insights via the Gemini API.
- **FR-17 (Idempotent Insights)**: Summaries shall only be generated once per closed period and never re-evaluated or overwritten.

#### Dashboard & UI Presentation
- **FR-18 (Summary Metric Cards)**: The dashboard shall display high-level overview metrics: total active screen time, top application used, and dominant category.
- **FR-19 (Usage Breakdown View)**: The dashboard shall render a ranked list of applications with formatted duration (`Xh Ym`) and category-colored proportional progress bars.
- **FR-20 (Pending Period Handling)**: The UI shall gracefully inform the user when an insight summary for the active period is still pending completion.
- **FR-21 (Time Range Navigation)**: The dashboard shall allow seamless switching between Daily, Weekly, Monthly, and Yearly views.
- **FR-22 (Device Settings Management)**: The dashboard shall allow updating the device label and toggling window title capture.
- **FR-23 (Client Device State)**: The frontend shall persist active device identification in local storage, routing unconfigured users to a first-run setup wizard.

---

### 3. Non-Functional Requirements (NFR)
- **NFR-1 (Resource Efficiency)**: The desktop agent shall consume less than 1% CPU utilization during regular window polling.
- **NFR-2 (Offline Durability)**: The local SQLite event queue shall persist across reboots, with unsynced events retained until successfully transmitted.
- **NFR-3 (Query Performance)**: Aggregate usage endpoints shall respond in under 100ms by querying indexed aggregate rollup tables.
- **NFR-4 (Secure Transport)**: Production deployments shall enforce HTTPS/TLS for all communication between the dashboard, agent, and API.
- **NFR-5 (Resilience)**: Network disconnections or LLM service degradation shall not interrupt continuous local event tracking.
- **NFR-6 (Minimal Latency)**: UI range transitions and metric rendering shall occur in under 200ms.
- **NFR-7 (Data Integrity)**: Database constraints and foreign keys with cascading deletions shall guarantee referential integrity.
- **NFR-8 (Privacy by Default)**: The user retains explicit control over whether window titles are recorded or masked.
- **NFR-9 (Data Retention)**: Raw events older than 90 days shall be purged automatically by a scheduled retention job, while aggregate totals are preserved.
