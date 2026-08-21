# IT-Bookmark Self-Hosting Guide

This guide walks you through deploying **IT-Bookmark** on your own server or VPS using Docker Compose.

---

## 🖥 System Requirements

- **CPU**: 2 cores minimum (recommended: 4 cores for fast Playwright archiving)
- **RAM**: 2 GB minimum (recommended: 4 GB RAM to comfortably handle headless Chromium instances)
- **Disk**: 10 GB+ available SSD storage (varies based on screenshot and PDF archive volume)
- **OS**: Ubuntu 22.04 LTS / Debian 12 / AlmaLinux 9 or any modern Docker-capable Linux distribution

---

## 📦 Prerequisites

1. **Docker & Docker Compose**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```
2. **A Registered Domain Name** (e.g. `bookmarks.yourdomain.com`) pointing to your server's public IP address via an `A` record.

---

## 🚀 Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/it-bookmark.git /opt/it-bookmark
cd /opt/it-bookmark
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cat << 'EOF' > .env
# Database Configuration
POSTGRES_USER=it_admin
POSTGRES_PASSWORD=generate_a_strong_database_password_here
POSTGRES_DB=it_bookmark

# Security & Authentication
JWT_SECRET=generate_a_64_char_random_hex_key_here
NODE_ENV=production

# Supabase Storage & Auth (Cloud or External Self-Hosted)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Networking
PORT=80
CORS_ORIGIN=https://bookmarks.yourdomain.com
EOF
```

### 3. Run Database Migrations

Apply the migration SQL files into your PostgreSQL database. If using Supabase, paste the SQL contents in the Supabase SQL Editor in this order:

1. `backend/supabase_migration.sql` (Core tables: users, collections, tags, bookmarks)
2. `backend/supabase_migration_phase2.sql` (Search vector & archiving indices)
3. `backend/supabase_migration_phase13_rss.sql` (RSS subscriptions)
4. `backend/supabase_migration_phase14_sharing.sql` (Sharing tokens and collection members)

### 4. Build and Start the Stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Verify all containers are running and healthy:

```bash
docker compose -f docker-compose.prod.yml ps
```

---

## 🔒 Reverse Proxy & SSL (Recommended)

To expose IT-Bookmark securely on HTTPS with automatic SSL certificates, use **Caddy** or **Nginx**.

### Option A: Caddy (Simplest with Automatic HTTPS)

Install Caddy:
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

Edit `/etc/caddy/Caddyfile`:
```caddy
bookmarks.yourdomain.com {
    reverse_proxy localhost:80
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

---

### Option B: Nginx with Certbot

```nginx
server {
    server_name bookmarks.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Obtain SSL certificate:
```bash
sudo certbot --nginx -d bookmarks.yourdomain.com
```

---

## 💾 Backups & Maintenance

### Database Backup Script

Create a backup script at `/opt/it-bookmark/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/it-bookmark"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

docker exec it_bookmark_db pg_dump -U it_admin it_bookmark | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Keep only the last 30 days of backups
find "$BACKUP_DIR" -type f -name "db_*.sql.gz" -mtime +30 -delete
```

Make executable and schedule via cron:
```bash
chmod +x /opt/it-bookmark/backup.sh
# Run every night at 2:00 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/it-bookmark/backup.sh") | crontab -
```

### Restoring from Backup

```bash
gunzip < /var/backups/it-bookmark/db_YYYYMMDD_HHMMSS.sql.gz | docker exec -i it_bookmark_db psql -U it_admin -d it_bookmark
```

---

## ❓ Troubleshooting

### Playwright Archiving Fails with Memory Error
If the background worker crashes during screenshot generation on pages with heavy WebGL/canvas assets:
- Ensure the server has at least 2GB of RAM + 2GB swap configured:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  ```

### SSRF Protection Blocks Internal Hostnames
The built-in SSRF defense prevents feeds or scrapers from accessing private IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`). If you intentionally run self-hosted feeds on your local network, you can adjust the validator in `backend/src/utils/ssrf.ts`.

---

## 🔄 Updating IT-Bookmark

To pull the latest release and recreate containers:

```bash
cd /opt/it-bookmark
git pull origin main
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```
