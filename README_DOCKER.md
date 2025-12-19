 # Fitness Project

A full-stack fitness tracking application that allows users to log workouts and daily steps, view a personal dashboard, and manage profile and settings.
The project consists of a React (Vite) single-page application and a Node.js (Express) backend API, backed by PostgreSQL and Redis.

This repository also demonstrates multiple deployment approaches:

- VM provisioning using Vagrant / cloud-init 
- Containerized deployment using Docker Compose, TLS, and CI/CD 

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
client/        # React frontend (multi-stage Docker build)
server/        # Express backend API
nginx/         # Nginx reverse proxy configuration
infra/         # Vagrant & cloud-init provisioning 
certbot/       # TLS certificates and ACME challenge data
```

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
server/.env
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
```

2. Install vagrant:

```
sudo apt install -y vagrant
```

3. Clone the repo:

```
git clone https://github.com/ACodes3/fitness-project.git
cd fitness-project/infra/vagrant
```

4. Start the VM with vagrant:

```
vagrant up
```

5. Wait until the provisioning is finished. You will be then able to visit the deployed link.

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

This section describes the container-based deployment. The entire application stack is deployed using Docker Compose and consists of multiple services connected via an internal Docker network. TLS is terminated at the Nginx reverse proxy.

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

2. Create a .env file on the VM. You can copy the example:

```
cp .env.example .env
nano .env
```

Fill in your own values (DB password, JWT secret, etc.).

3. Development/testing (staging)

```
docker compose run --rm certbot certonly \
  --staging \
  --webroot -w /var/www/certbot \
  -d devops-vm-30.lrk.si \
  --email evaluna.mu@gmail.com \
  --agree-tos --no-eff-email
```

2. Reload ngix:

```
docker exec $(docker ps -qf name=proxy) nginx -s reload
```

3. Production certificate (final):

Run the same command without --staging, then reload Nginx again.