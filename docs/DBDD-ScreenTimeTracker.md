# Database Design Document (DBDD)
## Screen Time Tracker

### 1. Database Overview
The application utilizes PostgreSQL for central data storage. It is structured into transactional operational tables, hierarchical aggregate tables, and AI-derived insight tables.

---

### 2. Entity Relationship Diagram (ERD)

```
 +--------------------+       1:N       +----------------------+
 |      devices       | <-------------- |      raw_events      |
 |--------------------|                 |----------------------|
 | id (PK, UUID)      |                 | id (PK, BIGSERIAL)   |
 | label (TEXT)       |                 | device_id (FK, UUID) |
 | api_key_hash (TEXT)|                 | app_id (FK, INT)     |
 | capture_titles(BOOL|                 | window_title (TEXT)  |
 | created_at(TSTZ)   |                 | start_time (TSTZ)    |
 | last_seen_at(TSTZ) |                 | end_time (TSTZ)      |
 +--------------------+                 | duration_seconds(INT)|
        |        |                      +----------------------+
        |        |                                 |
        |        | 1:N                             | N:1
        |        +-------------------+             v
        |                            |    +--------------------+
        v 1:N                        |    |       apps         |
 +--------------------+              |    |--------------------|
 |    daily_usage     |              |    | id (PK, SERIAL)    |
 |--------------------|              |    | name (TEXT, UNIQUE)|
 | id (PK, BIGSERIAL) |              |    | wm_class (TEXT)    |
 | device_id (FK)     |              |    | category (TEXT)    |
 | app_id (FK)        |              |    | category_confidence|
 | usage_date (DATE)  |              |    +--------------------+
 | total_seconds (INT)|              |             |
 +--------------------+              |             |
        |                            |             |
        v rolls up into              v 1:N         v
 +--------------------+       +--------------------+
 |weekly/monthly/year |       |      insights      |
 |  usage tables      |       |--------------------|
 +--------------------+       | id (PK, BIGSERIAL) |
                              | device_id (FK)     |
                              | range_type (TEXT)  |
                              | period_start (DATE)|
                              | period_end (DATE)  |
                              | summary_text (TEXT)|
                              +--------------------+
```

---

### 3. Table Specifications

#### 3.1 `devices`
Stores registered computing devices authorized to ingest screen time events.
- `id`: UUID (Primary Key, default `gen_random_uuid()`)
- `label`: TEXT NOT NULL (User-friendly name e.g. "Work Laptop")
- `api_key_hash`: TEXT NOT NULL UNIQUE (SHA-256 hash of API secret key)
- `capture_titles`: BOOLEAN NOT NULL DEFAULT true (Privacy control flag)
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `last_seen_at`: TIMESTAMPTZ (Updated on authenticated requests)

#### 3.2 `apps`
Catalog of discovered desktop executables and their AI-assigned categories.
- `id`: SERIAL PRIMARY KEY
- `name`: TEXT NOT NULL UNIQUE (Normalized application binary name)
- `wm_class`: TEXT (Window manager class on Linux/X11)
- `category`: TEXT (Productivity, Communication, Entertainment, Development, Browsing, System, Other)
- `category_confidence`: NUMERIC(3,2)
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

#### 3.3 `raw_events`
High-resolution log of individual active window sessions.
- `id`: BIGSERIAL PRIMARY KEY
- `device_id`: UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE
- `app_id`: INT NOT NULL REFERENCES apps(id)
- `window_title`: TEXT (Nullable, governed by `capture_titles`)
- `start_time`: TIMESTAMPTZ NOT NULL
- `end_time`: TIMESTAMPTZ NOT NULL (Checked `end_time > start_time`)
- `duration_seconds`: INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time))::INT) STORED
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT now()

#### 3.4 Aggregation Tables (`daily_usage`, `weekly_usage`, `monthly_usage`, `yearly_usage`)
- `daily_usage`: Keyed on `(device_id, app_id, usage_date)`. Contains `total_seconds` and `event_count`.
- `weekly_usage`: Keyed on `(device_id, app_id, week_start)`. Contains `total_seconds`.
- `monthly_usage`: Keyed on `(device_id, app_id, month_start)`. Contains `total_seconds`.
- `yearly_usage`: Keyed on `(device_id, app_id, usage_year)`. Contains `total_seconds`.

#### 3.5 `insights`
Persists LLM-generated summaries for completed periods.
- `id`: BIGSERIAL PRIMARY KEY
- `device_id`: UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE
- `range_type`: TEXT NOT NULL CHECK (`range_type IN ('daily','weekly','monthly','yearly')`)
- `period_start`: DATE NOT NULL
- `period_end`: DATE NOT NULL
- `summary_text`: TEXT NOT NULL
- `generated_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
- UNIQUE CONSTRAINT: `(device_id, range_type, period_start)`

---

### 4. Indexing Strategy
- `idx_raw_events_device_time`: `raw_events(device_id, start_time)`
- `idx_daily_usage_device_date`: `daily_usage(device_id, usage_date)`
- `idx_weekly_usage_device_date`: `weekly_usage(device_id, week_start)`
- `idx_monthly_usage_device_date`: `monthly_usage(device_id, month_start)`
- `idx_yearly_usage_device_date`: `yearly_usage(device_id, usage_year)`
