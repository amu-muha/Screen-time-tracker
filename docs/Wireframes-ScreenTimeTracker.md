# Wireframes & UI Specifications
## Screen Time Tracker

### 1. Dashboard Layout (`/`)

```
+--------------------------------------------------------------------------+
|  Screen Time Tracker           [Daily] [Weekly] [Monthly] [Yearly]  [⚙]  |
+--------------------------------------------------------------------------+
|                                                                          |
|  +--------------------+  +--------------------+  +--------------------+  |
|  | TOTAL TIME         |  | TOP APPLICATION    |  | TOP CATEGORY       |  |
|  | 6h 45m             |  | VS Code (3h 20m)   |  | Development (60%)  |  |
|  +--------------------+  +--------------------+  +--------------------+  |
|                                                                          |
|  +-------------------------------------+  +---------------------------+  |
|  | BREAKDOWN                           |  | AI INSIGHTS               |  |
|  |                                     |  |                           |  |
|  | VS Code                      3h 20m |  | [Sparkle Icon]            |  |
|  | [████████████████████████] (Dev)    |  | "Your day was primarily   |  |
|  |                                     |  |  focused on development,  |  |
|  | Chrome                       2h 10m |  |  with VS Code accounting  |  |
|  | [███████████████] (Browsing)        |  |  for over half your active|  |
|  |                                     |  |  time. Browsing usage was |  |
|  | Slack                        1h 15m |  |  concentrated in morning."|  |
|  | [█████████] (Communication)         |  |                           |  |
|  +-------------------------------------+  +---------------------------+  |
+--------------------------------------------------------------------------+
```

---

### 2. Device Setup Page (First Run)

```
+------------------------------------------------------+
|                  Set Up Your Device                  |
|                                                      |
|   Give this device a label to get started:           |
|                                                      |
|   [ My Desktop Workstation                     ]     |
|                                                      |
|   [ Register device ]                                |
|                                                      |
|   ------------------------------------------------   |
|   (After registration, the generated API key is shown|
|    with instructions to copy it into agent/.env)     |
+------------------------------------------------------+
```

---

### 3. Settings Page

```
+------------------------------------------------------+
|  Settings                                   [ Back ] |
|                                                      |
|  Device label:                                       |
|  [ My Desktop Workstation                          ] |
|                                                      |
|  Capture window titles                       [ x ]   |
|  Controls whether window titles are sent             |
|  alongside app names.                                |
|                                                      |
|  Raw usage events are kept for 90 days, then         |
|  automatically removed. Aggregated totals and        |
|  summaries are kept indefinitely.                    |
|                                                      |
|  ▸ Advanced                                          |
|                                                      |
|  [ Save changes ]                                    |
+------------------------------------------------------+
```
