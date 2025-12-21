 # Fitness Project

A full-stack fitness tracking application that allows users to log workouts and daily steps, view a personal dashboard, and manage profile and settings.
The project consists of a React (Vite) single-page application and a Node.js (Express) backend API, backed by PostgreSQL and Redis.

This repository also demonstrates multiple deployment approaches:

- VM provisioning using Vagrant and Cloud-init 
- Containerized deployment using Docker Compose

---

## Key Features
- User authentication (JWT)
- Track workouts (create/list/get details)
- Log daily steps
- Per-user dashboard with aggregated data
- Profile and settings endpoints

---

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js (Express)
- Database: PostgreSQL
- Cache: Redis
- Reverse proxy: Nginx
- Containers: Docker, Docker Compose
- CI/CD: GitHub Actions
- TLS: Let’s Encrypt (Certbot)

---

## Repository layout

```
client/        # React frontend
server/        # Express backend API
nginx/         # Nginx reverse proxy configuration (for Docker)
infra/         # Vagrant & Cloud-init provisioning 
certbot/       # TLS certificates and ACME challenge data (for Docker)
```

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

## License

This project is licensed under the MIT License — see the `LICENSE` file.

---

## Local development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (comes with Node)
- PostgreSQL (local or hosted)
- (Optional) Redis if you want caching as provided in `server/redis.js`

Commands below assume Windows `cmd.exe`. For PowerShell or Unix shells the commands are similar but with different path separators.

1) Install dependencies

```bat
cd server
npm install

cd ..\client
npm install
```

2) Create environment file for backend:

```
nano server/.env
```

Example:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
JWT_SECRET=replace_with_a_strong_secret
```

2) Start the backend 

```bat
cd server
npm run dev
```

This runs `nodemon server.js`. Production start is `npm start`.

3) Start the frontend (new terminal)

```
cd client
npm run dev
```

Vite will print the dev URL (commonly `http://localhost:5173`). API defaults to `http://localhost:5000`.

---

## Vagrant 

This section describes deployment using Vagrant on a Linux host (e.g. Ubuntu).

### Prerequisites

- Linux host (Ubuntu recommended)
- VirtualBox
- Vagrant
- Git

1. Install required packages:

```
sudo apt update
sudo apt install -y virtualbox git
sudo apt install -y vagrant
```

2. Clone the repo:

```
git clone https://github.com/ACodes3/fitness-project.git
cd fitness-project/infra/vagrant
```

3. Start the VM with vagrant:

```
vagrant up
```

4. Wait until the provisioning is finished. You will be then able to visit the deployed link.

 Link to the deployment video: (https://drive.google.com/file/d/1BrEpeRqYZeISf-I7-LidWV-EW6P73NAm/view?usp=sharing)

---

## Cloud-init

This section describes automated VM provisioning using cloud-init and LXD on a Linux host.

### Prerequisites

- Linux host (Ubuntu recommended)
- Git
- snapd

1. Install required packages:

```
sudo apt update
sudo apt install -y git snapd
sudo systemctl enable --now snapd.socket
```

2. Install and initialize LXD:

```
sudo snap install lxd
lxd init --minimal
```

3. Clone the repo:

```
git clone https://github.com/ACodes3/fitness-project.git
cd fitness-project/infra/cloud-init
```

4. Run the deployment script:

```
chmod +x deploy.sh
./deploy.sh
```

5. Wait until the provisioning is finished. Once finished, the application URL will be printed in the output.

---

## Containerized deployment with Docker Compose

This section describes the container-based deployment. The entire application stack is deployed using Docker Compose and consists of multiple services connected via an internal Docker network.

### Prerequisites

- Linux VM (or any host with Docker support)
- Docker
- Docker Compose plugin
- A domain pointing to this VM (example: devops-vm-30.lrk.si)
- Ports 80 and 443 reachable from the internet (opened in VM firewall / security group)

1. Clone repo 

```
git clone https://github.com/ACodes3/fitness-project.git
cd fitness-project
```

2. Create environment file on the VM 

```
nano .env
```

Example:

```
# Database
POSTGRES_USER=dev
POSTGRES_PASSWORD=change_me
POSTGRES_DB=fitnessdb

# Backend
DB_HOST=db
DB_PORT=5432
DB_USER=${POSTGRES_USER}
DB_PASS=${POSTGRES_PASSWORD}
DB_NAME=${POSTGRES_DB}

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Security
JWT_SECRET=change_me_to_a_strong_secret
```

3. Run Docker Compose up (development/testing) (staging cert.)

```
docker compose run --rm certbot certonly \
  --staging \
  --webroot -w /var/www/certbot \
  -d YOUR_DOMAIN \
  --email YOUR_EMAIL \
  --agree-tos --no-eff-email
```

Run the same command without --staging for production certificate.

4. Reload ngix:

```
docker exec $(docker ps -qf name=proxy) nginx -s reload
```

---

Link to the deployment video: [Video of deployment logs/output.](https://drive.google.com/file/d/1wPJRGoT21q1EvEOf4DHR3E_7V7nCbXyJ/view?usp=sharing)