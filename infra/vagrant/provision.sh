#!/usr/bin/env bash

set -e                          #exit immediately if any command returns a non-zero (error) code.
VM_HOSTNAME=$(hostname)         # Get the hostname of the VM
DOMAIN="${VM_HOSTNAME}.lrk.si"  # Construct the domain name using the hostname
export DEBIAN_FRONTEND=noninteractive # prevent some packages from prompting for user input during installation

echo "=== Updating system ==="

apt-get update -y 
apt-get upgrade -y 

echo "=== Installing core packages ==="
# core packages
apt-get install -y curl git nginx postgresql ufw build-essential 

echo "=== Installing Node.js 20 ==="
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - # Add NodeSource APT repository for Node.js 20
apt-get install -y nodejs 

echo "=== Cloning project repo ==="
# Clone project into /opt
rm -rf /opt/fitness-project # Remove existing project directory if it exists
git clone https://github.com/ACodes3/fitness-project.git /opt/fitness-project # Clone the project repository

# Permissions: allow vagrant + postgres to read files
chown -R vagrant:vagrant /opt/fitness-project # Change ownership to vagrant user to allow npm installs
chmod -R 755 /opt/fitness-project # Set directory permissions to allow read and execute access

echo "=== Creating fitness system user ==="
# Create system user for backend service
if ! id -u fitness >/dev/null 2>&1; then
    useradd --system --shell /usr/sbin/nologin fitness || true # Create system user 'fitness' without login shell
fi
usermod -aG vagrant fitness || true # Add 'fitness' user to 'vagrant' group for file access

echo "=== Setting up PostgreSQL ==="
# Configure PostgreSQL for app
sudo -u postgres psql <<EOF
CREATE USER fitness WITH PASSWORD 'fitness123';
CREATE DATABASE fitnessdb;
GRANT ALL PRIVILEGES ON DATABASE fitnessdb TO fitness;
EOF

echo "=== Applying SQL schema ==="
# Apply SQL schema
sudo -u postgres psql -d fitnessdb -f /opt/fitness-project/server/schema.sql # Load the database schema

# Fix permissions after schema load
echo "=== Granting DB permissions to fitness user ===" # Ensure 'fitness' user has necessary permissions
sudo -u postgres psql -d fitnessdb <<EOF
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fitness;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fitness;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fitness;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fitness;
EOF

echo "=== Installing Redis ==="

apt-get install -y redis-server 

sed -i 's/^supervised .*/supervised systemd/' /etc/redis/redis.conf # Configure Redis to use systemd supervision
sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf # Set max memory to 256MB
sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf # Set eviction policy to allkeys-lru

systemctl enable redis-server 
systemctl restart redis-server 

echo "=== Redis installed and running ==="

echo "=== Installing backend dependencies ==="
sudo -u vagrant -H bash -lc "cd /opt/fitness-project/server && npm install" # Install backend Node.js dependencies

echo "=== Setting frontend environment ===" # Create frontend .env.production file

# Create frontend .env.production file with API URL
cat >/opt/fitness-project/client/.env.production <<'EOF'
VITE_API_URL=/api
EOF

# Set ownership and permissions for frontend .env file
chown vagrant:vagrant /opt/fitness-project/client/.env.production # Set ownership for frontend .env file
chmod 644 /opt/fitness-project/client/.env.production # Set permissions for frontend .env file

echo "=== Building frontend ===" 
sudo -u vagrant -H bash -lc "cd /opt/fitness-project/client && npm install && npm run build" # Install frontend dependencies and build the project

# Copy frontend build to Nginx directory
mkdir -p /var/www/fitness-client # Create directory for Nginx to serve frontend
cp -a /opt/fitness-project/client/dist/. /var/www/fitness-client/ # Copy built frontend files to Nginx directory
chown -R www-data:www-data /var/www/fitness-client # Set ownership for Nginx to access frontend files

echo "=== Creating backend .env ===" # Create backend .env file with database and Redis configuration
cat >/opt/fitness-project/server/.env <<'EOF'
PORT=3001
DB_USER=fitness
DB_PASS=fitness123
DB_HOST=localhost
DB_NAME=fitnessdb
DB_PORT=5432

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_ENABLED=true
EOF

chown fitness:vagrant /opt/fitness-project/server/.env # Set ownership for backend .env file
chmod 640 /opt/fitness-project/server/.env # Set permissions for backend .env file

echo "=== Creating systemd service ==="
# Create systemd backend service
cat >/etc/systemd/system/fitness-backend.service <<'EOF'
[Unit]
Description=Fitness App Backend
After=network.target postgresql.service redis-server.service

[Service]
WorkingDirectory=/opt/fitness-project/server
ExecStart=/usr/bin/node server.js
EnvironmentFile=/opt/fitness-project/server/.env
User=fitness
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload # Reload systemd to recognize new service
systemctl enable fitness-backend # Enable backend service to start on boot
systemctl start fitness-backend # Start backend service

echo "=== Installing Certbot (Let's Encrypt) ==="
apt-get install -y certbot python3-certbot-nginx # Install Certbot and Nginx plugin

echo "=== Creating initial HTTP-only Nginx config ==="

rm -f /etc/nginx/sites-enabled/default # Remove default Nginx site

# Create Nginx site configuration for the fitness app
# It serves the frontend and proxies API requests to the backend
# It also includes a placeholder for Guacamole configuration
cat >/etc/nginx/sites-available/fitness <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Serve frontend files
    root /var/www/fitness-client;
    index index.html;

    # Required for Let's Encrypt HTTP challenge
    location /.well-known/acme-challenge/ {
        root /var/www/fitness-client;
    }

    # API backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # SPA frontend
    location / {
        try_files \$uri /index.html;
    }

    # GUACAMOLE BLOCK WILL BE INSERTED HERE
}
EOF

# Enable the new Nginx site
# Create symbolic link to enable the site
# Test Nginx configuration and reload if successful
ln -sf /etc/nginx/sites-available/fitness /etc/nginx/sites-enabled/fitness
nginx -t && systemctl reload nginx

echo "=== Requesting Let's Encrypt SSL certificate with fallback ==="

CERTBOT_EMAIL="admin@${DOMAIN}"

# Try requesting REAL certificate first
if certbot --nginx \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    -m "$CERTBOT_EMAIL"; then

    echo "=== Production certificate installed successfully ==="

else
    echo "=== Production certificate FAILED ==="

    # Check for rate limit
    # If rate limit detected, switch to STAGING certificates
    # Check Certbot log for rate limit message
    # If found, request staging certificates
    if grep -q "too many certificates" /var/log/letsencrypt/letsencrypt.log 2>/dev/null; then
        echo "=== Let's Encrypt RATE LIMIT detected — switching to STAGING certificates ==="

        certbot --nginx \
            --test-cert \
            -d "$DOMAIN" \
            --non-interactive \
            --agree-tos \
            -m "$CERTBOT_EMAIL" || echo "=== Staging certificate FAILED as well ==="

    else
        echo "=== Certbot failed for a non-rate-limit reason. Continuing deployment. ==="
    fi
fi

echo "=== Setting up Certbot auto-renew ==="
# Enable and start Certbot timer for automatic certificate renewal
systemctl enable certbot.timer
systemctl start certbot.timer