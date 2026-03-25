# Sit Happens — Pet Care SaaS Platform

A full-stack pet sitting business platform built with Next.js 16 + NestJS + Prisma + PostgreSQL.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4 |
| Backend | NestJS 11, Passport JWT |
| Database | PostgreSQL 16 + PostGIS (via Docker) |
| ORM | Prisma 5 |
| Payments | Stripe (pre-auth + manual capture) |
| Realtime | Socket.io |
| Email | Resend |
| Maps | Mapbox Directions API |
| Cache | Redis |

## Quick Start

### 1. Prerequisites
- Node.js 20+
- Docker Desktop running

### 2. Clone & install
```bash
git clone https://github.com/sithappenspcs/sit-happens.git
cd sit-happens
npm install --legacy-peer-deps
```

### 3. Environment setup
```bash
# API
cp .env.example apps/api/.env
# Edit apps/api/.env — set DATABASE_URL, JWT_SECRET, and any optional keys

# Web
cp .env.example apps/web/.env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000 is the only required var
```

### 4. Start database
```bash
docker-compose up -d
```

### 5. Setup database
```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:seed       # Seed with demo data
```

### 6. Start development servers
```bash
npm run dev           # Starts both API (port 4000) and web (port 3000)
```

Open http://localhost:3000

## Demo Credentials

| Role | Email | Password | Portal |
|---|---|---|---|
| Admin | admin@sithappens.ca | admin123 | /admin |
| Staff | sarah@sithappens.ca | staff123 | /staff |
| Client | emma@example.com | client123 | /dashboard |

## Features

### Client Portal (`/dashboard`)
- Register / login with email + password
- Add and manage pets (feeding, behavioral, medical notes)
- Browse services and book via 6-step wizard
- Real-time availability slots from scheduling engine
- Stripe payment pre-authorisation
- View and cancel bookings

### Admin Console (`/admin`)
- Live KPI dashboard (pending bookings, revenue, staff count)
- Approve/decline bookings with staff assignment
- Manage staff roster (activate/deactivate)
- Browse all client accounts
- Financial overview with payout queue
- Edit email notification templates

### Staff Portal (`/staff`)
- Today's job list with active-job alert
- Weekly schedule calendar
- GPS check-in / check-out with visit notes
- 28-day availability management (saves to DB on tap)
- Earnings history

## Optional Integrations

Set these in `apps/api/.env` to unlock full features:

```env
STRIPE_SECRET_KEY=sk_live_...          # Real payments
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=...                   # Calendar sync
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...    # Real routing for availability
RESEND_API_KEY=re_...                  # Transactional email
```

Without these keys the app still runs in dev mode:
- Bookings are created without payment (status: pending)
- Availability slots fall back to a 600s travel time estimate
- Emails are logged to console instead of sent

## Architecture

```
sit-happens/
├── apps/
│   ├── api/          NestJS API — port 4000
│   └── web/          Next.js — port 3000
├── packages/
│   └── db/           Shared Prisma schema + seed
└── docker-compose.yml  Postgres (PostGIS) + Redis
```

All API routes are prefixed `/api/v1/`.
