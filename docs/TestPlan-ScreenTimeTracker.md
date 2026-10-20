# Test Plan & Traceability Matrix
## Screen Time Tracker

### 1. Requirements Traceability Matrix

| Requirement ID | Test Case | Target Component | Description / Expected Result |
| :--- | :--- | :--- | :--- |
| **FR-1** | `T-01` | Agent Window Detector | Agent polls focused window every 5000ms. |
| **FR-2** | `T-02` | Agent Session Engine | Focus transition calculates correct duration. |
| **FR-3** | `T-03` | Window Detectors | Correct detector selected for platform (Wayland vs other). |
| **FR-4** | `T-04` | SQLite Local Buffer | Buffered events persist in SQLite when API is offline. |
| **FR-5** | `T-05` | Sync Client | Sync transmits queued events and applies exponential backoff on retry. |
| **FR-7 / NFR-8** | `T-06` | Title Capture Setting | When `capture_titles` is false, `window_title` is nullified. |
| **FR-8** | `T-07` | API Validation Middleware | Events missing `app_name` or with `end_time <= start_time` fail with HTTP 400. |
| **FR-9** | `T-08` | API Usage Endpoint | `GET /api/usage` queries correct aggregate table and sorts descending by total seconds. |
| **FR-10** | `T-09` | API Insights Endpoint | In-progress periods return 204 No Content. |
| **FR-11** | `T-10` | Device Auth Middleware | Missing or invalid `X-API-Key` returns HTTP 401. |
| **FR-11a** | `T-11` | Device Registration | `POST /api/devices` generates random 32-byte key, stores SHA-256 hash. |
| **FR-12** | `T-12` | Daily Rollup Job | Sums duration from `raw_events` into `daily_usage`. |
| **FR-13** | `T-13` | Hierarchical Rollups | Weekly, monthly, and yearly rollups compute from `daily_usage`. |
| **FR-14** | `T-14` | Scheduler Job Execution | Scheduled cron expressions trigger corresponding jobs without blocking. |
| **FR-15** | `T-15` | Gemini Categorizer | Categorizes null-category apps and caches them to avoid duplicate LLM calls. |
| **FR-16 / FR-17**| `T-16` | Gemini Summarizer | Generates summaries for completed periods and respects unique constraint. |
| **FR-18** | `T-17` | SummaryCards Component | Renders total time, top app, and top category formatted correctly. |
| **FR-19** | `T-18` | UsageBreakdown Component | Proportional width bars scale relative to highest duration app. |
| **FR-20** | `T-19` | InsightPanel Component | Renders pending notice when API returns 204. |
| **FR-21** | `T-20` | RangeTabs Component | Switching range initiates data re-fetch for selected range. |
| **FR-22** | `T-21` | SettingsPage Component | PATCH updates label and capture titles in database. |
| **FR-23** | `T-22` | First-Run Setup Hook | Missing `deviceId` renders setup wizard before dashboard. |
| **NFR-9** | `T-23` | Retention Cleanup Job | Raw events older than 90 days are purged; aggregate tables intact. |
