#!/usr/bin/env bash
# Setup / redeploy itebafolio di Ubuntu VPS: bersihkan proses & config lama,
# lalu install nginx + pm2 + node, clone/pull repo, build frontend, jalankan backend, aktifkan SSL.
#
# Jalankan sebagai root: sudo bash deploy.sh

set -euo pipefail

DOMAIN="itebafolio.locavps.my.id"
CERT_EMAIL="adam.anwar@talentadigis.com"
APP_DIR="/var/www/itebafolio"
REPO_URL="https://github.com/chairulaw/itebafolio.git"
NODE_MAJOR="20"

if [ "$EUID" -ne 0 ]; then
  echo "Jalankan script ini sebagai root (sudo bash deploy.sh)"
  exit 1
fi

echo "=============================================="
echo "Step 0: Backup config nginx & pm2 yang lama"
echo "=============================================="
BACKUP_DIR="/root/deploy-backup-$(date +%Y%m%d%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /etc/nginx/sites-available "$BACKUP_DIR/sites-available" 2>/dev/null || true
cp -r /etc/nginx/sites-enabled "$BACKUP_DIR/sites-enabled" 2>/dev/null || true
if command -v pm2 &> /dev/null; then
  pm2 list > "$BACKUP_DIR/pm2-list-before.txt" 2>/dev/null || true
fi
echo "Backup disimpan di $BACKUP_DIR"

echo "=============================================="
echo "Step 1: Stop & hapus semua proses PM2 lama"
echo "=============================================="
if command -v pm2 &> /dev/null; then
  pm2 delete all || true
  pm2 kill || true
fi

echo "=============================================="
echo "Step 2: Hapus config nginx lama (site & default)"
echo "=============================================="
rm -f /etc/nginx/sites-enabled/*
rm -f /etc/nginx/sites-available/itebafolio
rm -f /etc/nginx/sites-available/default

echo "=============================================="
echo "Step 3: Install nginx, git, node, pm2, certbot"
echo "=============================================="
apt-get update -y
apt-get install -y nginx git curl ufw

if ! command -v node &> /dev/null; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

if ! command -v certbot &> /dev/null; then
  apt-get install -y certbot python3-certbot-nginx
fi

echo "=============================================="
echo "Step 4: Ambil source code (git clone/pull)"
echo "=============================================="
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git fetch origin
  git reset --hard origin/main
else
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi

echo "=============================================="
echo "Step 5: Setup backend (.env, npm install)"
echo "=============================================="
cd "$APP_DIR/backend"
npm install --omit=dev

if [ ! -f .env ]; then
  echo ">> backend/.env belum ada, membuat template. WAJIB EDIT DB_PASSWORD sebelum lanjut!"
  cat > .env <<EOF
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=itebafolio
JWT_SECRET=$(openssl rand -hex 32)
EOF
  echo ">> Edit dulu: $APP_DIR/backend/.env (isi DB_PASSWORD sesuai database yang sudah Anda setup), lalu jalankan ulang script ini."
  exit 1
fi
mkdir -p public/uploads

echo "=============================================="
echo "Step 6: Build frontend (Vite)"
echo "=============================================="
cd "$APP_DIR/frontend"
npm install
npm run build

echo "=============================================="
echo "Step 7: Konfigurasi nginx"
echo "=============================================="
cp "$APP_DIR/deploy/nginx-itebafolio.conf" /etc/nginx/sites-available/itebafolio
ln -sf /etc/nginx/sites-available/itebafolio /etc/nginx/sites-enabled/itebafolio
nginx -t
systemctl enable nginx
systemctl reload nginx || systemctl restart nginx

echo "=============================================="
echo "Step 8: Jalankan backend via PM2"
echo "=============================================="
cd "$APP_DIR/backend"
pm2 start ecosystem.config.cjs
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root > /tmp/pm2-startup.out 2>&1 || true
STARTUP_CMD=$(grep -Eo '^sudo .*pm2 startup.*|^systemctl .*pm2.*' /tmp/pm2-startup.out || true)
if [ -n "$STARTUP_CMD" ]; then
  eval "${STARTUP_CMD#sudo }" || true
fi

echo "=============================================="
echo "Step 9: Buka firewall (80/443/SSH) + aktifkan SSL"
echo "=============================================="
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true
ufw --force enable || true

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$CERT_EMAIL" --redirect

echo "=============================================="
echo "SELESAI. Buka: https://$DOMAIN"
echo "Cek status: pm2 status | pm2 logs itebafolio-backend"
echo "=============================================="
