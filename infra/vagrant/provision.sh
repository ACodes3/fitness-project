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
# Install Node.js 18 LTS
# ------------------------------------
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# ------------------------------------
# Configure PostgreSQL
# ------------------------------------
sudo -u postgres psql <<EOF
CREATE USER fitness WITH PASSWORD 'fitness123';
CREATE DATABASE fitnessdb OWNER fitness;
EOF

# ------------------------------------
# Install backend dependencies
# ------------------------------------
cd /opt/fitness-project/server
npm install

# ------------------------------------
# Build frontend
# ------------------------------------
cd /opt/fitness-project/client
npm install
npm run build

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
Environment=PORT=3001
Environment=DATABASE_URL=postgres://fitness:fitness123@localhost:5432/fitnessdb
Environment=REDIS_URL=redis://localhost:6379
Restart=always

[Install]
WantedBy=multi-user.target
EOF

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

    # Serve React frontend
    root /opt/fitness-project/client/build;
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
