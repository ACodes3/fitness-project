 # Fitness Project

An up-to-date full‑stack fitness tracker: a React (Vite) single‑page client and an Express API that let users track workouts and daily steps, view a dashboard, and manage profile/settings. The backend uses PostgreSQL and JWT for authentication.

This README covers the current repo layout, how to run the app locally (Windows/cmd.exe), environment variables, and a short API overview.

---

## Key Features
- User authentication (JWT)
- Track workouts (create/list/get details)
- Log daily steps
- Per-user dashboard with aggregated data
- Profile and settings endpoints

---

## Tech Stack

- Frontend: React 19 + Vite, React Router, Recharts, React Icons, plain CSS
- Backend: Node.js (ESM) + Express 5, JWT, bcrypt, pg (Postgres), Redis (optional cache)
- Dev tools: Vite, nodemon, ESLint

---

## Repository layout

Top-level important folders:

```
client/        # React app (Vite)
server/        # Express API, routes, middleware, db helpers
infra/         # infra/provisioning helpers (Vagrant, cloud-init)
```

Refer to `server/` and `client/src/` for detailed code.

---

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm (comes with Node)
- PostgreSQL (local or hosted)
- (Optional) Redis if you want caching as provided in `server/redis.js`

Commands below assume Windows `cmd.exe`. For PowerShell or Unix shells the commands are similar but with different path separators.

---

## Environment (server)

Create a `server/.env` file with the following variables (example):

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
JWT_SECRET=replace_with_a_strong_secret
```

Notes:
- The server reads DB credentials from these vars (see `server/db/db.js`).
- Redis configuration (if used) is in `server/redis.js` and can be customized.

---

## Install & Run (local, development)

Open two terminals.

1) Install dependencies

```bat
cd server
npm install

cd ..\client
npm install
```

2) Start the backend (Terminal 1)

```bat
npm run dev
```

This runs `nodemon server.js`. Production start is `npm start`.

3) Start the frontend (Terminal 2)

```bat
npm run dev
```

Vite will print the dev URL (commonly `http://localhost:5173`). API defaults to `http://localhost:5000`.

---

## Database

- Schema: `server/schema.sql` contains the tables and example layout. Run it against your Postgres instance to create tables.
- Seed/sample data: no automated seed included. Add demo users directly or extend `server/` with a small seed script.

---

## Scripts

Client (`client/package.json`):

- `npm run dev` — start Vite dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

Server (`server/package.json`):

- `npm run dev` — start server with `nodemon`
- `npm start` — start server with `node`

---

## API Overview (short)

Base URL: `http://localhost:5000/api`

Authentication: send header `Authorization: Bearer <token>` for protected routes.

Main endpoints (see `server/routes/`):

- `POST /api/users/login` — authenticate and receive `{ token, user }`
- `GET /api/users` — list users

- `GET /api/dashboard/:userId` — user dashboard data (protected)

- Workouts:
  - `GET /api/workouts/:userId`
  - `GET /api/workouts/details/:workoutId`
  - `POST /api/workouts` — create workout

- Steps:
  - `GET /api/steps/:userId`
  - `POST /api/steps` — create or update daily steps

- Profile & Settings (protected):
  - `GET /api/profile/:userId`, `PUT /api/profile/:userId`
  - `GET /api/settings/:userId`, `PUT /api/settings/:userId`

For full route details, inspect the files in `server/routes/`.

---

## Vagrant and Cloud-init

This repository includes two ways to provision a development VM or cloud image for the project:

- Vagrant (local VirtualBox/VirtualBox-compatible provider): `infra/vagrant/Vagrantfile` and `infra/vagrant/provision.sh`.
- Cloud-init (cloud-ready user-data): `infra/cloud-init/cloud-config.yaml`.

Vagrant

Use Vagrant for local, repeatable development VMs. Use the cloud-init file when provisioning cloud instances (or for advanced local testing with cloud-image tooling).

Files
- `infra/vagrant/Vagrantfile` — VM definition, forwarded ports, hardware settings, and a shell provisioner that runs `provision.sh`.
- `infra/vagrant/provision.sh` — idempotent shell script that installs system packages (Node, Postgres, Redis, Nginx, Certbot), clones the repo into `/opt/fitness-project`, builds the client, installs server dependencies, and registers the server as a `systemd` service.
- `infra/cloud-init/cloud-config.yaml` — cloud-init `user-data` that performs similar tasks on first boot (package install, repo clone, DB setup, Nginx config, Guacamole optional components).


Quickstart — Vagrant (class-provided nested VMs) - described in the [SOLUTIONS.md file](https://github.com/ACodes3/fitness-project/blob/main/SOLUTIONS.md).

Cloud-init (provision cloud images)

This repository includes a cloud-init `user-data` file at `infra/cloud-init/cloud-config.yaml` that performs the same high-level provisioning steps as the Vagrant provisioner: install system packages, clone the repo to `/opt/fitness-project`, build the client, install server dependencies, create the DB, configure Nginx, and register the backend as a systemd service.

When to use cloud-init
- Use `cloud-config.yaml` when provisioning cloud VM images (AWS EC2, Google Compute Engine, Azure VMs, OpenStack, etc.).
- Use it for automated first-boot configuration of instances created from cloud images (Ubuntu cloud images, etc.).

Edit before use
- Open `infra/cloud-init/cloud-config.yaml` and replace example values (domain names, example passwords, and any placeholder environment variables). Key values to review: repository URL, domain name, database credentials, and any DNS/host entries.

Quickstart — Cloud-init setup - described in the [SOLUTIONS.md file](https://github.com/ACodes3/fitness-project/blob/main/SOLUTIONS.md).

Security & configuration notes
- The provided cloud-init and provision scripts include example passwords and domain names (e.g., `devops-vm-05.lrk.si`, `fitness123`) for convenience. Replace these with secure values before using in any public or production environment.
- Do not commit production secrets to git. Prefer injecting secrets through your cloud provider's secret manager or passing them at provisioning time.
- If you plan to expose the instance to the internet, verify firewall rules and use valid TLS certificates (the Vagrant script uses Certbot to obtain Let's Encrypt certs when DNS points to the VM's public IP).

Troubleshooting
- Provisioning hangs or fails: check `vagrant up` output and `vagrant ssh` into the VM to inspect `/var/log/cloud-init.log` and `/var/log/cloud-init-output.log` (for cloud-init) or `/var/log/syslog` and `journalctl -u fitness-backend` for the service.
- Port collision on host: edit `infra/vagrant/Vagrantfile` forwarded_port host values.
- Database errors: ensure PostgreSQL started successfully and that `/opt/fitness-project/server/.env` has the correct DB settings.

## License

This project is licensed under the MIT License — see the `LICENSE` file.


