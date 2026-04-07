# Run Frontend and Backend Separately

This guide runs the backend API and frontend UI in separate terminals.

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas connection string configured
- Project dependencies installed

```bash
npm install
```

## 1) Configure environment

Create `.env` in project root (or update existing):

```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@ksridealab.fpfklnn.mongodb.net/idealab?retryWrites=true&w=majority&appName=KSRidealab
PORT=5000
VITE_API_URL=http://localhost:5000
DEFAULT_ADMIN_EMAIL=admin@ksrce.ac.in
DEFAULT_ADMIN_PASSWORD=Password@123
DEFAULT_ADMIN_NAME=KSR Admin
```

Notes:
- If password contains `@`, encode it as `%40`.
- Backend runs on port `5000`.
- Frontend reads API base from `VITE_API_URL`.

## 2) Seed settings data (one-time or when needed)

```bash
npm run seed:settings
```

This seeds:
- Notifications
- Security activity
- Default admin (if missing)

## 3) Run backend only

Open Terminal A:

```bash
npm run server
```

Expected:
- `Auth server running on http://localhost:5000`

Health check:
- Open `http://localhost:5000/api/health`

## 4) Run frontend only

Open Terminal B:

```bash
npm run dev
```

Expected:
- Vite starts on `http://localhost:5173`

Open browser:
- `http://localhost:5173`

## 5) Verify both are connected

1. Backend health returns JSON at `/api/health`.
2. Login works using seeded admin credentials.
3. Settings page loads profile, notifications, and security activity from API.

## 6) Stop services

- In each terminal, press `Ctrl + C`.
- If needed, free common ports (`5000`, `5173`) before restarting.

## Troubleshooting

- `MONGODB_URI is not set`: Add `MONGODB_URI` to `.env` and restart backend.
- `Database is not connected yet`: Confirm Atlas IP access and cluster status.
- `npm run dev` fails on port conflict: stop existing listener and restart.
- CORS/API issues: ensure `VITE_API_URL=http://localhost:5000`.
