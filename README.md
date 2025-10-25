# 🏋️‍♂️ Fitness Tracker App

A full‑stack fitness tracking platform built with React (Vite), Node.js (Express), and PostgreSQL. Track workouts and steps, view a personalized dashboard, and manage your profile and settings with JWT‑secured APIs.

---

## 🚀 Tech Stack

### 🖥️ Frontend (client)
- React 19 (Vite)
- React Router v7
- Recharts (charts)
- React Icons
- Plain CSS (in `client/src/assets/styles`)

### ⚙️ Backend (server)
- Node.js + Express 5
- JWT authentication (auth middleware)
- pg (node‑postgres)
- dotenv, cors, nodemon
- bcrypt installed (hashing planned; not fully wired yet)

### 🗄️ Database
A standalone copy of this schema is available at `server/schema.sql` for display/reference.


## 🧩 Features
- Dashboard: monthly totals and a yearly workout trend line chart
- Workouts: list and create (API ready), client table with pagination
- Steps: log steps with derived distance and calories
- Profile: view and update basic account + fitness info
- Settings: theme, language, notifications

---

## 📁 Project structure

```
fitness-project/
├─ client/                 # React app (Vite)
│  ├─ src/
│  │  ├─ pages/            # Home, Login, Profile, Settings, Workout
│  │  ├─ component/        # Layout, feature components, guards
│  │  └─ assets/styles/    # Global CSS files
│  └─ package.json
└─ server/                 # Express API
	 ├─ routes/              # users, workouts, steps, profile, settings, dashboard
	 ├─ middleware/          # auth (JWT verify)
	 ├─ db/                  # PostgreSQL pool
	 ├─ server.js            # app entry
	 └─ package.json
```

---

## ⚙️ Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 13+ (local or remote)
- Windows terminal: Commands below are for cmd.exe

---

## 🔐 Environment variables (server/.env)

Create a `server/.env` file with:

```
PORT=5000

# PostgreSQL
DB_HOST=your_host
DB_PORT=5432
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_db_name

# Auth
JWT_SECRET=change-this-secret
```

> Note: CORS is open by default in this project. Lock it down in production.

---

## ▶️ Run locally

Open two terminals (one for the API, one for the client).

1) Install dependencies

```bat
cd server && npm install
cd ..\client && npm install
```

2) Start the API (Terminal 1)

```bat
cd server && npm run dev
```

3) Start the client (Terminal 2)

```bat
cd client && npm run dev
```

- API: http://localhost:5000
- Vite dev server: printed in the terminal (usually http://localhost:5173)

### Test login

- Email: demo@example.com (add based on your DB Query)
- Password: demo1234 (add based on your DB Query)

---

## 🔌 API overview

Base URL: `http://localhost:5000/api`

Auth header where required: `Authorization: Bearer <token>`

### Users
- `GET /users` → list users
- `GET /users/:id` → user details
- `POST /users/login` → returns `{ token, user }`
	- body: `{ email, password }`

### Dashboard (protected)
- `GET /dashboard/:userId` → `{ totalWorkouts, totalSteps, activeDays, monthlyData[] }`

### Workouts
- `GET /workouts/:userId` → array of workouts
- `GET /workouts/details/:workoutId` → workout + exercises
- `POST /workouts` → create workout
	- body: `{ user_id, type, name, date, duration_min, notes }`

### Steps
- `GET /steps/:userId` → recent step logs
- `POST /steps` → create/update by day
	- body: `{ user_id, step_date(YYYY-MM-DD), steps_count }`

### Profile (protected)
- `GET /profile/:userId` → profile summary (joined user + fitness_profile)
- `PUT /profile/:userId` → update user and fitness_profile

### Settings (protected)
- `GET /settings/:userId` → current settings
- `PUT /settings/:userId` → update settings
	- body: `{ theme, language, notifications: { emailAlerts, smsNotifications } }`

---

## 🔧 Configuration notes

- The client currently calls `http://localhost:5000` directly in several files.
	- If you change the API port/host, search for `http://localhost:5000` in `client/src` and update.
	- Future improvement: move to `VITE_API_URL` and a small API client helper.

---

## 🧪 Scripts

Client:
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built app
- `npm run lint` – run ESLint

Server:
- `npm run dev` – start with nodemon
- `npm start` – start with node

---

## 🛠️ Troubleshooting

- Port in use: change `PORT` in `server/.env` or close the other process
- DB connection errors: verify `DB_*` vars and that PostgreSQL is running
- 401/403 on protected routes: ensure you include `Authorization: Bearer <token>`
- Login fails: confirm the demo user exists and the password matches `password_hash`
- CORS issues: backend has `cors()` enabled globally; tighten as needed

---

## 🗺️ Roadmap

- Use bcrypt for hashing and secure password storage
- Extract API base URL to `VITE_API_URL`
- Add migrations (e.g., with Prisma or Knex) and seed scripts
- Add tests for routes and components

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

