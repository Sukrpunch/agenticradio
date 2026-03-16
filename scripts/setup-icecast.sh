#!/bin/bash

set -e

echo "=========================================="
echo "  AgenticRadio Icecast Setup Script"
echo "  Ubuntu 22.04 on Hetzner VPS"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "ERROR: This script must be run as root"
  exit 1
fi

# Update system
echo "[1/5] Updating system packages..."
apt update && apt upgrade -y

# Install dependencies
echo "[2/5] Installing Icecast2, Nginx, and Certbot..."
apt install -y icecast2 nginx certbot python3-certbot-nginx

# Create/configure Icecast
echo "[3/5] Configuring Icecast..."

# Backup original config if it exists
if [ -f /etc/icecast2/icecast.xml ]; then
  cp /etc/icecast2/icecast.xml /etc/icecast2/icecast.xml.backup
fi

# Create new Icecast configuration
cat > /etc/icecast2/icecast.xml <<'EOF'
<?xml version="1.0"?>
<icecast>
  <limits>
    <clients>1000</clients>
    <sources>10</sources>
    <threadpool>4</threadpool>
    <queue-size>524288</queue-size>
    <client-timeout>30</client-timeout>
    <header-timeout>15</header-timeout>
    <source-timeout>10</source-timeout>
    <burst-on-connect>1</burst-on-connect>
    <burst-size>65536</burst-size>
  </limits>

  <authentication>
    <source-password>AgenticSource2026!</source-password>
    <relay-password>AgenticRelay2026!</relay-password>
    <admin-user>admin</admin-user>
    <admin-password>AgenticAdmin2026!</admin-password>
  </authentication>

  <listen-socket>
    <port>8000</port>
  </listen-socket>

  <mount>
    <mount-name>/live</mount-name>
    <description>AgenticRadio — AI Generated Music</description>
    <stream-name>AgenticRadio</stream-name>
    <stream-url>https://agenticradio.ai</stream-name>
    <genre>AI Generated</genre>
    <bitrate>192</bitrate>
    <type>audio/mpeg</type>
    <max-listener-duration>0</max-listener-duration>
  </mount>

  <paths>
    <basedir>/usr/share/icecast2</basedir>
    <logdir>/var/log/icecast2</logdir>
    <webroot>/usr/share/icecast2/web</webroot>
    <adminroot>/usr/share/icecast2/admin</adminroot>
    <alias source="/" dest="/status.xsl"/>
  </paths>

  <logging>
    <accesslog>access.log</accesslog>
    <errorlog>error.log</errorlog>
    <loglevel>3</loglevel>
    <logsize>10000</logsize>
  </logging>

  <security>
    <ssl>false</ssl>
    <chroot>0</chroot>
  </security>
</icecast>
EOF

# Ensure permissions
chmod 644 /etc/icecast2/icecast.xml
chown icecast:icecast /etc/icecast2/icecast.xml

# Configure Nginx as reverse proxy
echo "[4/5] Configuring Nginx reverse proxy..."

# Remove default Nginx config
rm -f /etc/nginx/sites-enabled/default

# Create Nginx config for Icecast
cat > /etc/nginx/sites-available/icecast <<'EOF'
server {
    listen 80;
    server_name stream.agenticradio.ai;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/icecast /etc/nginx/sites-enabled/icecast

# Test Nginx config
nginx -t

# Enable and start services
echo "[5/5] Enabling and starting services..."

# Enable Icecast2
systemctl enable icecast2
systemctl restart icecast2

# Enable and start Nginx
systemctl enable nginx
systemctl restart nginx

# Wait a moment for services to start
sleep 2

# Verify services are running
if systemctl is-active --quiet icecast2; then
  ICECAST_STATUS="✓ Running"
else
  ICECAST_STATUS="✗ Failed to start"
fi

if systemctl is-active --quiet nginx; then
  NGINX_STATUS="✓ Running"
else
  NGINX_STATUS="✗ Failed to start"
fi

# Print setup complete message
echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "Icecast Status: $ICECAST_STATUS"
echo "Nginx Status: $NGINX_STATUS"
echo ""
echo "NEXT STEPS:"
echo "1. Set up SSL with Certbot:"
echo "   certbot --nginx -d stream.agenticradio.ai"
echo ""
echo "2. Stream URL (for broadcasters):"
echo "   icecast://source:AgenticSource2026!@localhost:8000/live"
echo ""
echo "3. Listener URL:"
echo "   http://stream.agenticradio.ai/live"
echo "   (Will be https:// after SSL setup)"
echo ""
echo "4. Admin Panel:"
echo "   http://localhost:8000/admin/"
echo "   (Use admin/AgenticAdmin2026!)"
echo ""
echo "5. View Icecast logs:"
echo "   tail -f /var/log/icecast2/error.log"
echo ""
echo "=========================================="
