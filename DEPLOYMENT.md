# ElementTracker2026 - Deployment Anleitung für neue Server

## 🎯 Übersicht

Dieses Dokument beschreibt, wie du ElementTracker2026 auf einem neuen Server aufzusetzt und wie du ein bestehendes System sicherst und wiederherstellst.

---

## 📋 Systemanforderungen

**Betriebssystem:**
- Ubuntu 20.04 LTS oder neuer
- Oder Linux Mint auf Ubuntu-Basis

**Hardware:**
- Mindestens 4GB RAM
- Mindestens 20GB freier Speicherplatz
- 2+ CPU Cores

**Software (wird automatisch installiert):**
- Node.js 22.x
- PostgreSQL 12+
- PostGIS 3.x
- Git

---

## 🚀 Szenarien

### Szenario 1: Komplett neues System aufsetzen

```bash
# 1. Repository klonen
git clone https://github.com/yourusername/ElementTracker2026.git
cd ElementTracker2026

# 2. Installation durchführen (Sudo-Passwort erforderlich)
bash install.sh

# 3. System starten
bash start.sh

# 4. Zugriff
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
# Admin: admin / admin123
```

### Szenario 2: Bestehendes System mit Backup übertragen

```bash
# Auf ALTEM System: Backup erstellen
bash backup.sh

# Backup-Datei mit scp auf neuen Server übertragen
scp elementtracker_backup_*.tar.gz user@newserver:/tmp/

# Auf NEUEM System:
# 1. Repository klonen (falls nicht vorhanden)
git clone https://github.com/yourusername/ElementTracker2026.git
cd ElementTracker2026

# 2. Basis-Installation (nur Systempakete)
bash install.sh

# 3. Backup einspielen
bash restore.sh /tmp/elementtracker_backup_*.tar.gz

# 4. System starten
bash start.sh
```

### Szenario 3: Sauberer Neustart nach Änderungen

```bash
# Alle Prozesse beenden und Ports freigeben
bash cleanup.sh

# System neu starten
bash start.sh restart

# Oder einzeln
bash cleanup.sh
bash start.sh
```

---

## 📦 Was wird beim Backup gesichert?

Die `backup.sh` erstellt eine sichere Kopie von:

```
elementtracker_backup_YYYYMMDD_HHMMSS/
├── config/                 # Konfigurationsdateien
│  ├── backend.env         # Backend-Secrets (DB, JWT)
│  ├── frontend.env.local  # Frontend-Config
│  ├── package.json        # Dependencies
│  └── tsconfig.json       # TypeScript-Konfiguration
├── data/
│  ├── elementtracker.sql  # Kompletter DB-Dump
│  └── uploads/            # Hochgeladene Fotos
├── src/
│  ├── backend/            # Quellcode Backend
│  └── frontend/           # Quellcode Frontend
└── scripts/               # Setup & Start Scripts
```

**Sicherheit:**
- Backups enthalten Passwörter in `.env` Dateien
- Immer mit Verschlüsselung übertragen (scp, SFTP, rsync mit SSH)
- Backups von sensiblen Umgebungen schützen

---

## 🛠️ Basis-Installation Schritt für Schritt

### Schritt 1: Systemvorbereitung

```bash
# Paketlisten aktualisieren
sudo apt update && sudo apt upgrade -y

# Essenzielle Tools installieren
sudo apt install -y build-essential curl wget git
```

### Schritt 2: Installation durchführen

```bash
# Terminal im Projektverzeichnis öffnen
cd ElementTracker2026

# Installation starten
bash install.sh

# Das Script wird automatisch:
# ✅ Node.js, PostgreSQL, PostGIS installieren
# ✅ npm install für backend & frontend durchführen
# ✅ Datenbank erstellen
# ✅ Admin-User anlegen
# ✅ .env Dateien generieren
# ✅ Funktionstest durchführen
```

Die Installation dauert 5-15 Minuten (Internetgeschwindigkeit abhängig).

### Schritt 3: Service-Autostart konfigurieren (optional)

```bash
# PostgreSQL Autostart
sudo systemctl enable postgresql

# Node Services als Systemd Service (manuell erstellen)
# Siehe section: Systemd Services
```

---

## 📁 Welche Dateien müssen mitgenommen werden?

### Beim manuellen Transfer (ohne backup.sh):

**PFLICHT - müssen IMMER mitgenommen werden:**
```
backend/.env              # DB-Passwörter, JWT Secrets
backend/src/              # Quellcode
frontend/app/             # Quellcode
frontend/components/      # Komponenten
frontend/styles/          # Stylesheets
setup/init.sql            # Datenbank-Schema
backend/package.json      # Dependencies
frontend/package.json     # Dependencies
```

**EMPFOHLEN:**
```
backend/public/uploads/   # Hochgeladene Bilder
Alle *.md Dateien        # Dokumentation
```

**IGNORIEREN (auto-generiert):**
```
node_modules/            # npm install
.next/                   # Next.js Build
dist/                    # TypeScript Build
.env.local              # Wird neu generiert
*.log                   # Logs
```

---

## 🐳 Mit Docker (optional)

Wenn Docker verfügbar ist, kann mit einemcontainer schneller deployt werden:

```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app

# Backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production

# Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci --production

# Copy source
COPY backend/src ./backend/src
COPY frontend/app ./frontend/app
COPY frontend/components ./frontend/components

# Runtime
EXPOSE 3000 3001
CMD ["bash", "-c", "npm --prefix backend run dev & npm --prefix frontend run dev -- --port 3001"]
```

---

## 🔧 Systemd Services (Linux)

### Backend als Service

```bash
# File: /etc/systemd/system/elementtracker-backend.service
[Unit]
Description=ElementTracker2026 Backend
After=network.target postgresql.service

[Service]
Type=simple
User=elementtracker
WorkingDirectory=/opt/elementtracker
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node --loader ts-node/esm src/server.ts
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable elementtracker-backend.service
sudo systemctl start elementtracker-backend.service
```

---

## 🧪 Verifikation nach Setup

```bash
# Health-Check Backend
curl http://localhost:3000/health

# Test API
curl http://localhost:3000/api/v1

# Frontend Zugriff
curl http://localhost:3001

# Admin Login testen
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 🔐 Sicherheitshinweise

### .env Sicherheit

Nach Restore/Setup WICHTIG ändern:
```bash
# backend/.env
DB_USER=postgres                    # Benutzer ggfs. ändern
DB_PASSWORD=elementtracker2026      # ⚠️  UNBEDINGT ÄNDERN!
JWT_SECRET=...                      # Neu generiert, ok
CORS_ORIGIN=http://localhost:3001   # Production: anpassen!
```

### PostgreSQL Passwort

```bash
# Postgres-User Passwort in Production ändern
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_secure_password';"

# In backend/.env updaten
DB_PASSWORD=your_secure_password
```

### Firewall-Konfiguration

```bash
# Nur SSH, nicht NodePorts direkt exponieren!
sudo ufw allow 22/tcp          # SSH
sudo ufw allow 80/tcp          # HTTP (für Reverse Proxy)
sudo ufw allow 443/tcp         # HTTPS (für Reverse Proxy)
# ❌ 3000 und 3001 nicht direkt exponieren
```

### Nginx Reverse Proxy (Production)

```nginx
# /etc/nginx/sites-enabled/elementtracker
upstream backend {
    server 127.0.0.1:3000;
}

upstream frontend {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name tracker.example.com;

    location /api {
        proxy_pass http://backend;
    }

    location / {
        proxy_pass http://frontend;
    }
}
```

---

## 🆘 Troubleshooting

### Port bereits belegt

```bash
# Sauberes Cleanup durchführen
bash cleanup.sh

# Oder manuell Ports freigeben
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### PostgreSQL Verbindungsfehler

```bash
# PostgreSQL Status prüfen
sudo systemctl status postgresql

# PostgreSQL starten
sudo systemctl start postgresql

# Verbindung testen
psql -U postgres -d elementtracker
```

### npm install Fehler

```bash
# npm Cache löschen
npm cache clean --force

# node_modules löschen und neu installieren
rm -rf backend/node_modules frontend/node_modules
npm --prefix backend install
npm --prefix frontend install
```

---

## 📊 Checkliste für neuen Server

- [ ] OS installiert (Ubuntu 20.04+)
- [ ] Grundkonfiguration (Firewall, SSH)
- [ ] Repository geklont
- [ ] `bash install.sh` erfolgreich
- [ ] Environment variablen geprüft (.env)
- [ ] Datenbank migrate durchgeführt
- [ ] Admin-Passwort geändert
- [ ] `bash start.sh` erfolgreich
- [ ] Frontend erreichbar (localhost:3001)
- [ ] Admin-Login funktioniert
- [ ] Test-Entry erstellen und prüfen
- [ ] Backup erstellen für Sicherung
- [ ] Monitoring/Logging einrichten

---

## 📞 Support & Ressourcen

- **Dokumentation**: README.md
- **Issues**: GitHub Issues
- **API Spec**: API_SPECIFICATION.md
- **Architektur**: ARCHITECTURE.md

