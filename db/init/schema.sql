CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE devices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label           TEXT NOT NULL,
    api_key_hash    TEXT NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at    TIMESTAMPTZ
);

CREATE TABLE apps (
    id                   SERIAL PRIMARY KEY,
    name                 TEXT NOT NULL UNIQUE,
    wm_class             TEXT,
    category             TEXT,
    category_confidence  NUMERIC(3,2),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE raw_events (
    id               BIGSERIAL PRIMARY KEY,
    device_id        UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    app_id           INT NOT NULL REFERENCES apps(id),
    window_title     TEXT,
    start_time       TIMESTAMPTZ NOT NULL,
    end_time         TIMESTAMPTZ NOT NULL,
    duration_seconds INT GENERATED ALWAYS AS (
                          EXTRACT(EPOCH FROM (end_time - start_time))::INT
                      ) STORED,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_time > start_time)
);

CREATE TABLE daily_usage (
    id            BIGSERIAL PRIMARY KEY,
    device_id     UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    app_id        INT NOT NULL REFERENCES apps(id),
    usage_date    DATE NOT NULL,
    total_seconds INT NOT NULL DEFAULT 0,
    event_count   INT NOT NULL DEFAULT 0,
    UNIQUE (device_id, app_id, usage_date)
);

CREATE TABLE weekly_usage (
    id            BIGSERIAL PRIMARY KEY,
    device_id     UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    app_id        INT NOT NULL REFERENCES apps(id),
    week_start    DATE NOT NULL,
    total_seconds INT NOT NULL DEFAULT 0,
    UNIQUE (device_id, app_id, week_start)
);

CREATE TABLE monthly_usage (
    id            BIGSERIAL PRIMARY KEY,
    device_id     UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    app_id        INT NOT NULL REFERENCES apps(id),
    month_start   DATE NOT NULL,
    total_seconds INT NOT NULL DEFAULT 0,
    UNIQUE (device_id, app_id, month_start)
);

CREATE TABLE yearly_usage (
    id            BIGSERIAL PRIMARY KEY,
    device_id     UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    app_id        INT NOT NULL REFERENCES apps(id),
    usage_year    INT NOT NULL,
    total_seconds INT NOT NULL DEFAULT 0,
    UNIQUE (device_id, app_id, usage_year)
);

CREATE TABLE insights (
    id            BIGSERIAL PRIMARY KEY,
    device_id     UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    range_type    TEXT NOT NULL CHECK (range_type IN ('daily','weekly','monthly','yearly')),
    period_start  DATE NOT NULL,
    period_end    DATE NOT NULL,
    summary_text  TEXT NOT NULL,
    generated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (device_id, range_type, period_start)
);

CREATE INDEX idx_raw_events_device_time ON raw_events(device_id, start_time);
CREATE INDEX idx_daily_usage_device_date ON daily_usage(device_id, usage_date);
CREATE INDEX idx_weekly_usage_device_date ON weekly_usage(device_id, week_start);
CREATE INDEX idx_monthly_usage_device_date ON monthly_usage(device_id, month_start);
CREATE INDEX idx_yearly_usage_device_date ON yearly_usage(device_id, usage_year);