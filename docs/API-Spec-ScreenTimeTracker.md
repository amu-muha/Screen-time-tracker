# API Specification
## Screen Time Tracker

Base URL: `http://localhost:3000/api` (dev) / `https://<domain>/api` (prod)

---

### 1. Devices

#### 1.1 Register Device
- **Method**: `POST /api/devices`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "label": "Home Workstation"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "device": {
      "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
      "label": "Home Workstation",
      "created_at": "2026-10-20T10:00:00.000Z"
    },
    "api_key": "4f9d2a8b..."
  }
  ```
  *(Note: `api_key` is only returned once upon registration).*

#### 1.2 Get Device Status
- **Method**: `GET /api/devices/:id`
- **Response**: `200 OK`
  ```json
  {
    "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "label": "Home Workstation",
    "capture_titles": true,
    "created_at": "2026-10-20T10:00:00.000Z",
    "last_seen_at": "2026-10-20T10:45:00.000Z"
  }
  ```

#### 1.3 Get Current Authenticated Device
- **Method**: `GET /api/devices/me`
- **Headers**: `X-API-Key: <api-key>`
- **Response**: `200 OK`
  ```json
  {
    "id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "label": "Home Workstation",
    "capture_titles": true
  }
  ```

#### 1.4 Update Device Configuration
- **Method**: `PATCH /api/devices/:id`
- **Request Body**:
  ```json
  {
    "label": "New Label",
    "capture_titles": false
  }
  ```
- **Response**: `200 OK`

---

### 2. Events

#### 2.1 Ingest Usage Event
- **Method**: `POST /api/events`
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-Key: <api-key>`
- **Request Body**:
  ```json
  {
    "app_name": "Visual Studio Code",
    "window_title": "Screen-time-tracker - index.js",
    "start_time": "2026-10-20T10:00:00.000Z",
    "end_time": "2026-10-20T10:05:00.000Z"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "id": 1042,
    "device_id": "c56a4180-65aa-42ec-a945-5fd21dec0538",
    "app_id": 4,
    "window_title": "Screen-time-tracker - index.js",
    "start_time": "2026-10-20T10:00:00.000Z",
    "end_time": "2026-10-20T10:05:00.000Z",
    "duration_seconds": 300,
    "capture_titles": true
  }
  ```

---

### 3. Usage Aggregates

#### 3.1 Get Usage Totals
- **Method**: `GET /api/usage?device_id=<uuid>&range=daily`
- **Query Params**:
  - `device_id` (Required, UUID)
  - `range` (Optional, enum: `daily`, `weekly`, `monthly`, `yearly`, default: `daily`)
- **Response**: `200 OK`
  ```json
  [
    {
      "app_name": "Visual Studio Code",
      "category": "Development",
      "total_seconds": 14200
    },
    {
      "app_name": "Google Chrome",
      "category": "Browsing",
      "total_seconds": 7800
    }
  ]
  ```

---

### 4. Insights

#### 4.1 Get Latest AI Summary
- **Method**: `GET /api/insights?device_id=<uuid>&range=daily`
- **Query Params**:
  - `device_id` (Required, UUID)
  - `range` (Optional, enum: `daily`, `weekly`, `monthly`, `yearly`, default: `daily`)
- **Response (Summary Ready)**: `200 OK`
  ```json
  {
    "range_type": "daily",
    "period_start": "2026-10-19",
    "period_end": "2026-10-19",
    "summary_text": "You spent 58% of your active time in Development tools, primarily Visual Studio Code. Communication via Slack remained consistent with previous days.",
    "generated_at": "2026-10-20T00:05:12.000Z"
  }
  ```
- **Response (Current Period Pending)**: `204 No Content`
