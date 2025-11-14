#!/usr/bin/env bash
set -e
export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get upgrade -y

# ------------------------------------
# Install core packages
# ------------------------------------
apt-get install -y curl git nginx postgresql redis-server ufw build-essential

# ------------------------------------
# Install Node.js 20 LTS
# ------------------------------------
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Create a non-root system user to run the Node service and add to vagrant group
# (the synced folder is mounted with group `vagrant`, so adding the service user
# to that group allows read access to repo files).
if ! id -u fitness >/dev/null 2>&1; then
    useradd --system --shell /usr/sbin/nologin fitness || true
fi
usermod -aG vagrant fitness || true

# ------------------------------------
# Configure PostgreSQL
# ------------------------------------
# Create a dedicated DB user and the expected database `fitnessdb`.
sudo -u postgres psql <<EOF
CREATE USER fitness WITH PASSWORD 'fitness123';
CREATE DATABASE fitnessdb;
GRANT ALL PRIVILEGES ON DATABASE fitnessdb TO fitness;
EOF

# ------------------------------------
# Install backend dependencies (as `vagrant` user)
# ------------------------------------
sudo -u vagrant -H bash -lc "cd /opt/fitness-project/server && npm install"

# ------------------------------------
# Build frontend (as `vagrant` user)
# ------------------------------------
sudo -u vagrant -H bash -lc "cd /opt/fitness-project/client && npm install && npm run build"

# Copy build output to a static directory served by nginx and set permissions
mkdir -p /var/www/fitness-client
cp -a /opt/fitness-project/client/dist/. /var/www/fitness-client/ || true
chown -R www-data:www-data /var/www/fitness-client

# ------------------------------------
# Create systemd service for Node backend
# ------------------------------------
cat >/etc/systemd/system/fitness-backend.service <<'EOF'
[Unit]
Description=Fitness App Backend
After=network.target postgresql.service redis-server.service

[Service]
WorkingDirectory=/opt/fitness-project/server
ExecStart=/usr/bin/node server.js
# Use an environment file for configuration and run as the non-root `fitness` user
EnvironmentFile=/opt/fitness-project/server/.env
User=fitness
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create `.env` for the server with DB and runtime config
cat >/opt/fitness-project/server/.env <<'EOF'
PORT=3001
DB_USER=fitness
DB_PASS=fitness123
DB_HOST=localhost
DB_NAME=fitnessdb
DB_PORT=5432
REDIS_URL=redis://localhost:6379
EOF
chown fitness:vagrant /opt/fitness-project/server/.env || true
chmod 640 /opt/fitness-project/server/.env || true

systemctl daemon-reload
systemctl enable fitness-backend
systemctl start fitness-backend

# ------------------------------------
# Configure Nginx
# ------------------------------------
rm -f /etc/nginx/sites-enabled/default

cat >/etc/nginx/sites-available/fitness <<'EOF'
server {
    listen 80;
    server_name _;

    # Serve frontend from a static folder copied from the build output
    root /var/www/fitness-client;
    index index.html;

    # Backend API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # React SPA fallback
    location / {
        try_files $uri /index.html;
    }
}
EOF

ln -s /etc/nginx/sites-available/fitness /etc/nginx/sites-enabled/fitness
nginx -t
systemctl reload nginx

# ------------------------------------
# Firewall
# ------------------------------------
ufw allow OpenSSH
ufw allow 80
ufw --force enable
