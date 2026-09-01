# Screen Time Tracker

A desktop-agent + web-dashboard system that tracks which applications you use on your PC, stores the data, generates AI-powered summaries, and displays usage across daily, weekly, monthly, and yearly views.

Built as a full professional SDLC — every design decision below is documented, not improvised.

---

## Why a desktop agent?
A browser cannot see what other applications are running on your machine (sandboxing). Collecting real usage data requires a native background process with OS-level access to the focused window. The dashboard and API, by contrast, are a normal web stack — see [`/docs/SDD-ScreenTimeTracker.md`](./docs/SDD-ScreenTimeTracker.md) for the full architecture rationale.

---

## Project documentation
This project follows a full requirements → design → implementation pipeline. Before touching code, start here:

| Document | What it covers |
|---|---|
| [SRS](./docs/SRS-ScreenTimeTracker.md) | What the system must do — functional and non-functional requirements |
| [SDD](./docs/SDD-ScreenTimeTracker.md) | System architecture, component responsibilities, design decisions |
| [Database Design](./docs/DBDD-ScreenTimeTracker.md) | Full schema, ERD, indexing strategy |
| [API Specification](./docs/API-Spec-ScreenTimeTracker.md) | Every endpoint's request/response contract |
| [Wireframes](./docs/Wireframes-ScreenTimeTracker.md) | Dashboard layout and navigation |
| [Test Plan](./docs/TestPlan-ScreenTimeTracker.md) | Test cases mapped to every requirement ID |

Every requirement in the SRS has an ID (e.g. `FR-9`, `NFR-3`) that's referenced throughout the other documents and, eventually, in code comments and commit messages — so any piece of the system can be traced back to *why* it exists.

---

## Tech stack

| Layer | Technology |
|---|---|
| Tracking agent | Node.js, `active-win` (Windows/macOS/Linux-X11), D-Bus (Linux-Wayland), SQLite (local buffer) |
| Backend API | Express |
| Database | PostgreSQL |
| AI analysis | LLM API (categorization + natural-language summaries), run as a scheduled job |
| Dashboard | React, Recharts |
| Dev environment | Docker Compose |

**Note on Linux support:** on Wayland sessions (default on modern Ubuntu/GNOME), the agent requires the [Focused Window D-Bus](https://extensions.gnome.org/extension/5592/focused-window-d-bus) GNOME Shell extension, since Wayland blocks apps from querying the focused window directly. X11 sessions need no extra setup. See `DC-1` in the SRS for details.

---

## Project structure
```
.
├── agent/          # Background tracking agent (Node.js)
├── api/            # Express REST API
├── dashboard/       # React frontend
├── docs/           # SRS, SDD, DBDD, API spec, wireframes, test plan
├── docker-compose.yml
└── README.md
```

---

## Getting started

### Prerequisites
- Node.js 20+
- Docker (for local PostgreSQL)
- On Linux/Wayland: the Focused Window D-Bus GNOME extension (see note above)

### 1. Clone and install
```bash
git clone <repo-url>
cd screen-time-tracker
```
Install dependencies in each component:
```bash
cd api && npm install
cd ../agent && npm install
cd ../dashboard && npm install
```

### 2. Start the database
```bash
docker-compose up -d
```

### 3. Configure environment variables
Copy the example env files and fill in real values:
```bash
cp api/.env.example api/.env
cp agent/.env.example agent/.env
```

### 4. Run each component (separate terminals)
```bash
# API
cd api && npm run dev

# Agent
cd agent && npm run dev

# Dashboard
cd dashboard && npm run dev
```

### 5. Register your device
Before the agent can send data, register it once (see `POST /api/devices` in the API spec):
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -d '{"label": "My Desktop"}'
```
Copy the returned `api_key` into `agent/.env`.

---

## Status
🚧 In active development, following the documented pipeline in `/docs`. See open issues for current progress against the SRS requirements.

## License
