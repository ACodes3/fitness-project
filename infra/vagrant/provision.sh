#!/usr/bin/env bash

set -e                          #exit immediately if any command returns a non-zero (error) code.
VM_HOSTNAME=$(hostname)         # Get the hostname of the VM
DOMAIN="${VM_HOSTNAME}.lrk.si"  # Construct the domain name using the hostname
export DEBIAN_FRONTEND=noninteractive # prevent some packages from prompting for user input during installation

apt-get update -y 
apt-get upgrade -y 

# core packages
apt-get install -y curl git nginx postgresql ufw build-essential 

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - # Add NodeSource APT repository for Node.js 20
apt-get install -y nodejs 

# Clone project into /opt
rm -rf /opt/fitness-project # Remove existing project directory if it exists
git clone https://github.com/ACodes3/fitness-project.git /opt/fitness-project # Clone the project repository

# Permissions: allow vagrant + postgres to read files
chown -R vagrant:vagrant /opt/fitness-project # Change ownership to vagrant user to allow npm installs
chmod -R 755 /opt/fitness-project # Set directory permissions to allow read and execute access

# Create system user for backend service
if ! id -u fitness >/dev/null 2>&1; then
    useradd --system --shell /usr/sbin/nologin fitness || true # Create system user 'fitness' without login shell
fi
usermod -aG vagrant fitness || true # Add 'fitness' user to 'vagrant' group for file access

# Configure PostgreSQL for app
sudo -u postgres psql <<EOF
CREATE USER fitness WITH PASSWORD 'fitness123';
CREATE DATABASE fitnessdb;
GRANT ALL PRIVILEGES ON DATABASE fitnessdb TO fitness;
EOF

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

# install redis 
apt-get install -y redis-server 

sed -i 's/^supervised .*/supervised systemd/' /etc/redis/redis.conf # Configure Redis to use systemd supervision
sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf # Set max memory to 256MB
sed -i 's/^# maxmemory-policy .*/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf # Set eviction policy to allkeys-lru

systemctl enable redis-server 
systemctl restart redis-server 
