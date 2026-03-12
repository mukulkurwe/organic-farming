# Smart Farm Planning Application

A full-stack web application that helps farmers digitally manage farms, land boundaries, crops, activities, workers, sales, and demand-supply matching with map-based tools and data-driven insights.

---

## Features

### Authentication

- JWT-based stateless authentication
- OTP login via Twilio / TextBee
- Role-based access control: **Farmer**, **Admin**, **Expert**, **Supervisor**
- All API routes protected; ownership enforced server-side via JWT payload

### Farm & Land Management

- Create and manage multiple farms per user
- Draw farm boundary on an interactive GPS-centered map (Leaflet + leaflet-draw)
- Store GPS polygon in PostgreSQL (JSONB)
- Auto-calculate area, elevation, slope, and risk level (Low / Medium / High)
- Divide farms into named zones/plots

### Activity Logging

- Log field activities (planting, irrigation, fertilization, harvesting, etc.) per farm zone
- Attach crop, inputs (seed/fertilizer/pesticide/water), and workers to each activity
- Activities scoped strictly to the authenticated farmer's own farms

### Agricultural Calendar

- AI-assisted crop recommendation engine based on soil type, irrigation type, and state
- Auto-generated task calendar for each crop plan (seeding → harvest)
- Calendar view with `react-big-calendar`
- Farmer profile with soil type and irrigation preferences

### Sales Module

- Produce listings: list harvested produce with quantity, price, and status
- Buyer registry: maintain buyer contacts with type (retail / wholesale / mandi / direct)
- Sales transactions: record quantity sold, price, payment mode, and status
- Sales report: revenue summary per farm
- All data scoped to the authenticated farmer

### Demand & Supply Module

- **Supply forecasts**: farmers declare upcoming harvests
- **Demand requests**: buyers / admin post crop requirements
- **Smart matching**: demand-supply matching with relevance scores
- Admin dashboard for monitoring and managing demand board

### Reports & Analytics

- Activity reports per farm (filterable by date and type)
- Sales revenue reports
- Calendar aggregation view

---

## Tech Stack

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| Frontend      | Next.js 16 (React 19), Tailwind CSS v4     |
| Maps          | Leaflet 1.9, react-leaflet 5, leaflet-draw |
| State / Data  | Axios, React hooks                         |
| Calendar UI   | react-big-calendar, date-fns               |
| Backend       | Node.js, Express 5                         |
| Database      | PostgreSQL (via `pg` pool)                 |
| Auth          | JWT (jsonwebtoken), bcryptjs               |
| Geo / Spatial | @turf/turf                                 |
| SMS OTP       | Twilio                                     |
| Dev tooling   | nodemon, ESLint, TypeScript (frontend)     |

---

## Project Structure

```
organic-farming/
├── backend/
│   ├── server.js               # Express app entry point
│   ├── config/db.js            # PostgreSQL pool
│   ├── middleware/auth.js      # JWT authenticate middleware
│   ├── controllers/            # Route handler logic
│   ├── routes/                 # Express routers
│   ├── services/               # Crop recommendation, calendar generation, OTP
│   ├── scripts/                # Seed scripts
│   └── migrations/             # SQL migration files (run in order)
└── frontend/
    ├── app/                    # Next.js App Router pages
    │   ├── login / signup
    │   ├── farmer/             # Farmer dashboard, calendar, activities, sales
    │   ├── farm/[id]/map       # GPS boundary drawing map
    │   ├── admin/              # Admin dashboard, demand-supply
    │   ├── expert/             # Expert dashboard
    │   └── supervisor/         # Supervisor dashboard
    ├── lib/api.js              # Fetch wrapper with auth headers
    ├── services/api.js         # Axios instance with auth interceptor
    └── src/components/         # Shared UI components
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- PostgreSQL (create a database and note the connection string)

### 1. Clone & install

```bash
git clone <repo-url>

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>
JWT_SECRET=your_jwt_secret
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

### 3. Run database migrations

```bash
cd backend
npm run migrate
```

Migrations are applied in order from `migrations/001_init_schema.sql` through `006_demand_supply.sql`.

### 4. (Optional) Seed the agricultural calendar

```bash
npm run seed:calendar
```

### 5. Start the servers

```bash
# Backend (port 4000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

---

## API Overview

All backend routes are mounted under `/api/` on port 4000. Protected routes require an `Authorization: Bearer <token>` header.

| Route prefix                      | Description                                |
| --------------------------------- | ------------------------------------------ |
| `POST /api/auth/...`              | Login, signup, OTP                         |
| `GET/POST /api/farms`             | Farm CRUD (auth required, scoped to owner) |
| `PUT /api/farms/:id/boundary`     | Save GPS polygon                           |
| `GET/POST /api/activities`        | Activity log (auth required, owner-scoped) |
| `GET /api/activities/report`      | Aggregated activity report                 |
| `GET /api/calendar/...`           | Agri calendar and crop plans               |
| `GET/POST /api/sales/...`         | Listings, transactions, buyers, report     |
| `GET/POST /api/demand-supply/...` | Supply forecasts, demand requests, matches |
| `GET /api/master/...`             | Crops, soils, inputs master data           |
| `GET /api/supervisor/...`         | Supervisor views                           |

---

## Database Schema (summary)

| Table                   | Purpose                                |
| ----------------------- | -------------------------------------- |
| `users`                 | User accounts with roles               |
| `farms`                 | Farm records, linked to `owner_id`     |
| `zones`                 | Plots / zones within a farm            |
| `crops`                 | Crop master with agri-calendar columns |
| `activities`            | Field activity log                     |
| `activity_inputs`       | Inputs used per activity               |
| `activity_workers`      | Workers on each activity               |
| `farmer_profiles`       | Soil type, irrigation type, state      |
| `soil_profiles`         | Soil metadata                          |
| `crop_task_templates`   | Default task schedule per crop         |
| `crop_plans`            | Farmer's planned crop on a zone        |
| `calendar_events`       | Generated task events per plan         |
| `produce_listings`      | Harvest produce for sale               |
| `buyers`                | Buyer registry                         |
| `sales_transactions`    | Individual sale records                |
| `supply_forecasts`      | Upcoming harvest declarations          |
| `demand_requests`       | Buyer crop requirements                |
| `demand_supply_matches` | Matched supply-demand pairs            |
