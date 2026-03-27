# ElementTracker2026 - Installationsanleitung

*Stand: 27. März 2026*

---

## 1. SYSTEMANFORDERUNGEN

### Linux Mint (empfohlen)
```bash
- Linux Mint 21.X (basierend auf Ubuntu 22.04 LTS)
- 4 GB RAM (mindestens)
- 20 GB Speicherplatz (50 GB für Production mit vielen Fotos)
- Internet-Verbindung für Package-Downloads
```

### Befehle zum Überprüfen
```bash
# OS-Version
lsb_release -a

# RAM
free -h

# Speicherplatz
df -h

# Internetverbindung
ping 8.8.8.8
```

---

## 2. AUTOMATED INSTALLATION (EMPFOHLEN)

### 2.1 Ein-Befehl Installation

```bash
# 1. Repository klonen
git clone https://github.com/yourusername/ElementTracker2026.git
cd ElementTracker2026

# 2. Installation starten (erfordert sudo)
chmod +x install.sh
sudo ./install.sh

# Das Script wird Sie fragen:
# - Admin-Benutzername (z.B. 'admin')
# - Admin-Passwort (mind. 12 Zeichen) → wird gehashed
# - PostgreSQL Root-Passwort
# - Hostname / Domain
# - Cloudflare-Subdomain (optional)
```

**Dauer:** ~5-10 Minuten (je nach Internet-Geschwindigkeit)

---

### 2.2 Was der install.sh macht

```bash
#!/bin/bash
# install.sh - Kompletter Setup aller Komponenten

set -e  # Exit on error

echo "=== ElementTracker2026 Installation ==="

# ============================================
# 1. SYSTEM UPDATES
# ============================================
echo "[1/10] System Updates..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git build-essential

# ============================================
# 2. NODE.JS 20 LTS
# ============================================
echo "[2/10] Node.js 20 LTS installieren..."
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

node --version  # Verify

# ============================================
# 3. POSTGRESQL 15 + PostGIS
# ============================================
echo "[3/10] PostgreSQL 15 + PostGIS installieren..."
sudo apt install -y postgresql postgresql-contrib postgis

# PostgreSQL starten
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostGIS Extension aktivieren (später)

# ============================================
# 4. REDIS (für Sessions & Caching)
# ============================================
echo "[4/10] Redis installieren..."
sudo apt install -y redis-server

sudo systemctl start redis-server
sudo systemctl enable redis-server

# ============================================
# 5. NGINX (Reverse Proxy)
# ============================================
echo "[5/10] Nginx installieren..."
sudo apt install -y nginx

# Custom nginx.conf kopieren
sudo cp setup/nginx.conf /etc/nginx/sites-available/elementtracker
sudo ln -sf /etc/nginx/sites-available/elementtracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx testen & starten
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# ============================================
# 6. SSL/TLS mit Let's Encrypt
# ============================================
echo "[6/10] Let's Encrypt Certbot installieren..."
sudo apt install -y certbot python3-certbot-nginx

# Interaktive SSL-Setup (Manual oder Auto)
read -p "Domain für SSL-Zertifikat (z.B. example.com): " DOMAIN
sudo certbot certonly --nginx -d $DOMAIN

# Auto-Renewal activieren
sudo systemctl enable certbot.timer

# ============================================
# 7. FAIL2BAN (DDoS/Brute-Force Schutz)
# ============================================
echo "[7/10] Fail2Ban installieren..."
sudo apt install -y fail2ban

sudo cp setup/fail2ban-jail.conf /etc/fail2ban/jail.d/elementtracker.conf
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# ============================================
# 8. APPLICATION CODE
# ============================================
echo "[8/10] ElementTracker-Anwendung installieren..."

# Backend
cd backend
npm install --production
npm run build  # TypeScript kompilieren
cd ..

# Frontend
cd frontend
npm install --production
npm run build  # Next.js Build
cd ..

# ============================================
# 9. DATABASE SETUP
# ============================================
echo "[9/10] Datenbank initialisieren..."

# PostgreSQL User erstellen
sudo -u postgres psql -c "CREATE USER elementtracker WITH PASSWORD 'db_password';"
sudo -u postgres createdb -O elementtracker elementtracker

# PostGIS Extension
sudo -u postgres psql -d elementtracker -c "CREATE EXTENSION postgis;"

# Schema & Tabellen laden
sudo -u postgres psql -d elementtracker -f setup/init.sql

# ============================================
# 10. SYSTEMD SERVICES
# ============================================
echo "[10/10] Systemd Services konfigurieren..."

# Backend Service
sudo cp setup/elementtracker-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable elementtracker-backend
sudo systemctl start elementtracker-backend

# Frontend Service (wenn eigenständig)
sudo cp setup/elementtracker-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable elementtracker-frontend
sudo systemctl start elementtracker-frontend

# ============================================
# 11. BACKUP CRON JOB
# ============================================
echo "[11/11] Daily Backup konfigurieren..."

sudo cp setup/backup-elementtracker.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup-elementtracker.sh

# Crontab für root
sudo bash -c 'echo "0 2 * * * /usr/local/bin/backup-elementtracker.sh >> /var/log/elementtracker-backup.log 2>&1" | crontab -'

# ============================================
# FINISH
# ============================================
echo ""
echo "✅ Installation ERFOLGREICH!"
echo ""
echo "URL: https://$DOMAIN"
echo "Admin Panel: https://$DOMAIN/admin"
echo "Standard Username: admin"
echo "Passwort: [wird angefordert während Setup]"
echo ""
echo "Logs:"
echo "  - Backend: sudo journalctl -u elementtracker-backend -f"
echo "  - Frontend: sudo journalctl -u elementtracker-frontend -f"
echo "  - Nginx: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "Weitere Schritte:"
echo "  1. Admin-Passwort im /admin/settings ändern"
echo "  2. Datenschutz-Seite anpassen (Setup/settings)"
echo "  3. Test-Element hinzufügen"
echo ""
```

---

## 3. MANUELLE INSTALLATION (Schritt für Schritt)

Falls der Auto-Install nicht funktioniert:

### 3.1 System vorbereiten

```bash
# Update Package Lists
sudo apt update
sudo apt upgrade -y

# Basic Tools
sudo apt install -y curl wget git build-essential
```

---

### 3.2 Node.js 20 installieren

```bash
# NodeSource Repository hinzufügen
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install
sudo apt install -y nodejs

# Verify
node --version   # sollte v20.x.x sein
npm --version    # sollte 10.x.x sein
```

---

### 3.3 PostgreSQL + PostGIS

```bash
# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Starten & Auto-Start
sudo systemctl start postgresql
sudo systemctl enable postgresql

# User für App erstellen
sudo -u postgres psql -c "CREATE USER elementtracker WITH PASSWORD 'sicheres_passwort_hier';"

# Datenbank erstellen
sudo -u postgres createdb -O elementtracker elementtracker

# PostGIS Extension aktivieren
sudo apt install -y postgis postgresql-15-postgis-3
sudo -u postgres psql -d elementtracker -c "CREATE EXTENSION postgis;"

# Verify PostGIS
sudo -u postgres psql -d elementtracker -c "SELECT PostGIS_Version();"
# sollte: PostGIS 3.x.x ... ausgeben
```

---

### 3.4 Redis installieren

```bash
sudo apt install -y redis-server

# Starten
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # sollte PONG ausgeben
```

---

### 3.5 Nginx + SSL/TLS

```bash
# Nginx installieren
sudo apt install -y nginx

# Certbot für Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# SSL-Zertifikat beantragen
# (Ersetze example.com mit Ihrer Domain)
sudo certbot certonly --nginx -d example.com

# Nginx Config kopieren & anpassen
sudo cp setup/nginx.conf /etc/nginx/sites-available/elementtracker
# Edit: /etc/nginx/sites-available/elementtracker
#   - server_name auf Ihre Domain setzen
#   - SSL-Zertifikat-Pfade anpassen

# Enable
sudo ln -sf /etc/nginx/sites-available/elementtracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test & Start
sudo nginx -t
sudo systemctl start nginx
sudo systemctl enable nginx

# Auto-Renewal aktivieren
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

### 3.6 Application Code

```bash
# Code klonen / in Ordner navigieren
cd /opt/elementtracker  # oder Ihr Pfad

# Backend: npm install
cd ~/ElementTracker2026/backend
npm install --production

# TypeScript kompilieren (falls src/ mit .ts Dateien)
npm run build

# Frontend: npm install
cd ~/ElementTracker2026/frontend
npm install --production
npm run build  # Next.js static build

# Verify
ls -la ../backend/dist/  # sollte JS-Dateien enthalten
ls -la ../frontend/.next/  # sollte Production-Build enthalten
```

---

### 3.7 Fail2Ban Setup

```bash
sudo apt install -y fail2ban

# Config kopieren
sudo cp setup/fail2ban-jail.conf /etc/fail2ban/jail.d/elementtracker.conf

# Start
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Test
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

### 3.8 Systemd Services erstellen

#### Backend Service
```bash
# /etc/systemd/system/elementtracker-backend.service
[Unit]
Description=ElementTracker Backend
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=elementtracker  # Non-root user
WorkingDirectory=/opt/elementtracker/backend
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
EnvironmentFile=/opt/elementtracker/.env

[Install]
WantedBy=multi-user.target
EOF

# Aktivieren
sudo systemctl daemon-reload
sudo systemctl enable elementtracker-backend
sudo systemctl start elementtracker-backend

# Status
sudo systemctl status elementtracker-backend
```

#### Frontend Service (Optional - falls eigenständig)
```bash
# /etc/systemd/system/elementtracker-frontend.service
[Unit]
Description=ElementTracker Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=elementtracker
WorkingDirectory=/opt/elementtracker/frontend
ExecStart=/usr/bin/node_modules/.bin/next start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
EnvironmentFile=/opt/elementtracker/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable elementtracker-frontend
sudo systemctl start elementtracker-frontend
```

---

### 3.9 Environment-Variablen (.env)

```bash
# /opt/elementtracker/.env
# ⚠️ NICHT IN GIT COMMITEN!

NODE_ENV=production

# PostgreSQL
DATABASE_URL=postgresql://elementtracker:db_password@localhost:5432/elementtracker

# JWT Secret (mind. 32 Zeichen, random)
JWT_SECRET=your_random_secret_key_here_min_32_chars

# Passwort für Photos-Ordner (optional)
PHOTO_STORAGE_PATH=/var/www/elementtracker/uploads/photos

# Admin Default
# (wird nur beim ersten Start verwendet, dann geändert)
ADMIN_DEFAULT_PASSWORD=temporary_setup_password

# Email (für Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Datenschutz
SITE_NAME=ElementTracker
SITE_DESCRIPTION=Tracking System für Datenelemente
SUPPORT_EMAIL=support@example.com

# Optional: Cloudflare (falls verwendet)
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_api_token
```

Befehle:
```bash
# .env mit Beispiel-Werten vorbereiten
cp setup/.env.example /opt/elementtracker/.env

# Mit Ihren echten Werten editieren
sudo nano /opt/elementtracker/.env

# Sichern (nur Owner lesbar)
sudo chmod 600 /opt/elementtracker/.env
sudo chown elementtracker:elementtracker /opt/elementtracker/.env
```

---

### 3.10 Daily Backup

```bash
# /usr/local/bin/backup-elementtracker.sh
#!/bin/bash
...
# (siehe SECURITY_DSGVO.md für vollständiges Skript)

sudo cp setup/backup-elementtracker.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup-elementtracker.sh

# Cronjob hinzufügen (2 AM täglich)
sudo bash -c 'echo "0 2 * * * /usr/local/bin/backup-elementtracker.sh >> /var/log/elementtracker-backup.log 2>&1" | crontab -'

# Crontab anzeigen
sudo crontab -l
```

---

## 4. ÜBERPRÜFUNG DER INSTALLATION

```bash
# ✅ 1. Services überprüfen
sudo systemctl status elementtracker-backend
sudo systemctl status elementtracker-frontend
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status fail2ban

# ✅ 2. Ports überprüfen
sudo netstat -tlnp | grep LISTEN
# Sollte zeigen:
#   :80 (HTTP → Nginx Redirect)
#   :443 (HTTPS → Nginx)
#   :5432 (PostgreSQL, lokale Verbindung)
#   :6379 (Redis, lokale Verbindung)
#   :3000 oder :3001 (Backend API)

# ✅ 3. Datenbank testen
sudo -u postgres psql -d elementtracker -c "SELECT count(*) FROM admins;"

# ✅ 4. Website aufrufen
curl -k https://localhost/  # lokal
# oder im Browser: https://yourdomain.com

# ✅ 5. Admin-Panel
https://yourdomain.com/admin

# ✅ 6. Logs überprüfen
sudo journalctl -u elementtracker-backend -n 20  # letzte 20 Lines
sudo journalctl -u elementtracker-frontend -n 20
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 5. TROUBLESHOOTING

### Problem: Nginx zeigt 502 Bad Gateway

```bash
# Prüfe ob Backend läuft
sudo systemctl status elementtracker-backend
sudo journalctl -u elementtracker-backend -n 50

# Prüfe ob Port korrekt ist
sudo netstat -tlnp | grep 3000

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Problem: "Datenbankverbindung fehlgeschlagen"

```bash
# .env DATABASE_URL überprüfen
cat /opt/elementtracker/.env | grep DATABASE

# PostgreSQL testen
psql -h localhost -U elementtracker -d elementtracker -c "SELECT 1"
# sollte: (returns: 1) zeigen
```

### Problem: "SSL Certificate nicht vertraut"

```bash
# Certbot List
sudo certbot certificates

# Erneuern (sollte auto-renew, aber manual auch möglich)
sudo certbot renew --dry-run
sudo certbot renew

# Nginx SSL-Pfade überprüfen
grep "ssl_certificate" /etc/nginx/sites-available/elementtracker
```

### Problem: Rate-Limit / 429 Too Many Requests

```bash
# Über lokal IP testen (bypass rate-limiting)
curl -H "X-Forwarded-For: 127.0.0.1" https://localhost/api/v1/entries

# Redis Cache leeren (falls Cache-Probleme)
redis-cli FLUSHALL

# Rate-Limit Einstellungen überprüfen
grep "rateLimit" backend/src/middleware/rateLimit.ts
```

---

## 6. POST-INSTALLATION

### 6.1 Admin-Passwort ändern

1. Öffne https://yourdomain.com/admin
2. Login mit username: `admin`, password: `temporary_setup_password` (aus .env)
3. → Admin-Panel → Settings → Change Password
4. Neues, sicheres Passwort setzen (min 12 Zeichen)
5. **Alte Password- und Secret-Keys aus .env löschen!**

### 6.2 Website-Inhalte anpassen

Settings (als Admin):
- Datenschutz-Text
- Impressum
- Support Email
- Website Titel & Description

### 6.3 Test-Element erstellen

1. Admin-Panel → Elements → Create New (noch nicht freigegeben)
2. ID: `TEST001`
3. Name: `Test Object`
4. Owner: `Tester`
5. Save
6. Approve (freigeben)

### 6.4 Test-Eintrag erfassen

1. Hauptseite → Daten eintragen
2. Element: `TEST001`
3. Datum/Zeit: Heute, jetzt
4. Koordinaten: GPS oder Adresse
5. Optional: Kommentar, Foto
6. Submit

7. Kartenseite → Element: `TEST001`
8. Sollte einen Punkt auf der Karte zeigen

### 6.5 DSGVO Seiten publizieren

1. Admin → Settings
2. "DSGVO Text" & "Impressum" ausfüllen (oder mit Vorlage)
3. Speichern
4. Public Seiten überprüfen:
   - /datenschutz
   - /impressum

---

## 7. ERHALTUNG & UPDATES

```bash
# Wöchentlich: Security Updates
sudo apt update && sudo apt upgrade -y

# Monatlich: npm Package Updates
cd backend && npm update
cd ../frontend && npm update

# Logs überprüfen
sudo journalctl -u elementtracker-backend -p errnow

# Backups überprüfen
ls -lah /data/backups/elementtracker/
```

---

## 8. PRODUKT-DEPLOYMENT (Hoster)

Falls Sie später zu einem Hoster umziehen:

```bash
# 1. Aktuelles System auf Backup sichern
sudo /usr/local/bin/backup-elementtracker.sh

# 2. Auf Hoster-Server installieren (wieder install.sh)
# 3. .env mit neuer Domain konfigurieren
# 4. Backup von lokal zu Hoster durchspielen:
pg_restore -d elementtracker backup.dump
tar xzf photos.tar.gz -C /var/www/...

# 5. Testen, Testen, Testen!
```

---

## NÄCHSTE SCHRITTE

1. ✅ install.sh ausführen (oder manuell installieren)
2. ✅ Website auf https://yourdomain.com erreichbar
3. ✅ Admin-Panel funktional
4. ✅ Test-Element & Test-Eintrag erstellen
5. ✅ DSGVO-Seiten publizieren
6. → Frontend-UI verfeinern
7. → Live-GoLive vorbereiten

