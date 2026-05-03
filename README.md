

https://github.com/user-attachments/assets/8ea8b1d4-5fce-490d-9348-f3cea8390269

# API-to-Database Integration Service (Middleware)

A high-performance bridge designed to synchronize 3rd-party API payloads into a local database with zero downtime.

---

## Visual demo

<!-- Reserve this block for an embedded MP4, GIF, or linked recording. Image/video label intentionally empty (alt=""). -->

<p align="center">
  <sub><em>Placeholder — add demo recording here.</em></sub>
</p>

---

## Core functionalities

- **Secure webhook** — An Express-based listener that accepts external JSON payloads over HTTPS in production, with validation before persistence.
- **Intelligent upsert** — Row-level logic that inserts new records or updates existing ones using a stable unique identifier (e.g. `order_id`), avoiding duplicate rows and keeping data aligned with the source system.
- **Error management** — Structured server-side logging and HTTP responses that surface validation, database, and integration errors so data-mapping issues can be diagnosed quickly.
- **Modern monitoring UI** — A lightweight, minimalist dashboard (Tailwind CSS) to review synchronized records and refresh the view on demand.

---

## Technical stack

| Layer | Technology |
| --- | --- |
| **Backend** | Node.js, Express |
| **Database** | Supabase (PostgreSQL) for this proof of concept |
| **Frontend** | HTML5, Tailwind CSS (via CDN) |

---

## On-premise implementation (The Goal)

This middleware pattern is **not tied to a single database vendor**. The same flow—receive payload, validate, upsert by unique key, expose read APIs and a small UI—maps cleanly to **MySQL** (or other relational engines) by swapping the data access layer while keeping the HTTP surface stable.

For **local server and intranet deployments**, the intended operational model is to run the Node process as a **Windows Service** (or equivalent background service on your OS) so the bridge stays available without an interactive session—suitable for continuous synchronization from partner APIs into your on-premise datastore.

---

## Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Create or edit `.env` in the project root:

   | Variable | Description |
   | --- | --- |
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_KEY` | Server-side key with permission to read/write the target table (use appropriate credentials for production) |
   | `PORT` | HTTP port (default `3000` if omitted) |

3. **Start the server**

   ```bash
   npm start
   ```

   Open the dashboard at `http://localhost:<PORT>/` and use `POST /api/webhook` for ingestion and `GET /api/orders` for the JSON feed used by the UI.
