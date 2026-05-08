#!/bin/bash

# ElementTracker2026 - Vollständiges Installations-Skript
# Installiert PostgreSQL, Node.js, Projekt-Abhängigkeiten und führt Funktionstest durch

set -e  # Exit on any error

echo "🔧 ElementTracker2026 - Vollständige Installation starten..."

# ============================================
# 1. SYSTEMANFORDERUNGEN PRÜFEN
# ============================================

echo "📋 Systemanforderungen prüfen..."

# OS-Version
if ! lsb_release -a | grep -q "Ubuntu\|Mint"; then
    echo "❌ Nur Ubuntu/Mint unterstützt. Aktuell: $(lsb_release -d)"
    exit 1
fi

# RAM (mind. 4GB)
RAM_GB=$(free -g | awk 'NR==2{printf "%.0f", $2}')
if [ "$RAM_GB" -lt 4 ]; then
    echo "❌ Mindestens 4GB RAM erforderlich. Aktuell: ${RAM_GB}GB"
    exit 1
fi

# Speicherplatz (mind. 20GB)
DISK_GB=$(df / | awk 'NR==2{printf "%.0f", $4/1024/1024}')
if [ "$DISK_GB" -lt 20 ]; then
    echo "❌ Mindestens 20GB freier Speicher erforderlich. Aktuell: ${DISK_GB}GB"
    exit 1
fi

# Internetverbindung
if ! ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo "❌ Keine Internetverbindung"
    exit 1
fi

echo "✅ Systemanforderungen erfüllt"

# ============================================
# 2. PAKETE INSTALLIEREN
# ============================================

echo "📦 Pakete installieren..."

# System updaten
sudo apt update && sudo apt upgrade -y

# PostgreSQL installieren
sudo apt install -y postgresql postgresql-contrib

# PostGIS installieren
sudo apt install -y postgresql-16-postgis-3 postgresql-16-postgis-3-scripts

# Node.js prüfen/installieren (falls nicht vorhanden)
if ! command -v node >/dev/null 2>&1; then
    echo "📦 Node.js installieren..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Git prüfen
if ! command -v git >/dev/null 2>&1; then
    sudo apt install -y git
fi

echo "✅ Pakete installiert"

# ============================================
# 3. PROJEKT KLONEN/SETUP
# ============================================

echo "📂 Projekt einrichten..."

# Repository klonen (falls nicht bereits vorhanden)
if [ ! -d "ElementTracker2026" ]; then
    git clone https://github.com/yourusername/ElementTracker2026.git
    cd ElementTracker2026
else
    echo "Projekt bereits vorhanden, überspringe Klonen"
fi

# ============================================
# 4. ABHÄNGIGKEITEN INSTALLIEREN
# ============================================

echo "🔧 Abhängigkeiten installieren..."

# Backend
cd backend
npm install
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/pg @types/cors
cd ..

# Frontend
cd frontend
npm install
cd ..

echo "✅ Abhängigkeiten installiert"

# ============================================
# 5. DATENBANK EINRICHTEN
# ============================================

echo "🗄️ Datenbank einrichten..."

# PostgreSQL starten
sudo systemctl start postgresql

# Datenbank erstellen
sudo -u postgres createdb elementtracker 2>/dev/null || echo "Datenbank existiert bereits"

# PostGIS aktivieren und Schema laden
cat setup/init.sql | sudo -u postgres psql -d elementtracker

# Upload-Verzeichnis erstellen
mkdir -p backend/public/uploads
chmod 755 backend/public/uploads

# Admin-Passwort hashen und User anlegen
cd backend
node -e "
import bcrypt from 'bcryptjs';
const password = 'admin123';
const saltRounds = 12;
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) { console.error('Error:', err); process.exit(1); }
  console.log(hash);
});
" > /tmp/admin_hash.txt

ADMIN_HASH=$(cat /tmp/admin_hash.txt)
rm /tmp/admin_hash.txt

# Admin-User einfügen
sudo -u postgres psql -d elementtracker -c "
INSERT INTO admins (username, password_hash, email) VALUES ('admin', '$ADMIN_HASH', 'admin@elementtracker2026.local')
ON CONFLICT (username) DO NOTHING;
"

# Postgres-Passwort setzen
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'elementtracker2026';"

cd ..

echo "✅ Datenbank eingerichtet"

# ============================================
# 6. KONFIGURATION ERSTELLEN
# ============================================

echo "⚙️ Konfiguration erstellen..."

# Backend .env
cat > backend/.env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elementtracker
DB_USER=postgres
DB_PASSWORD=elementtracker2026
PORT=3000
NODE_ENV=development
JWT_SECRET=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
UPLOAD_DIR=uploads
MAX_FILE_SIZE=3145728
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$ADMIN_HASH
EOF

echo "✅ Konfiguration erstellt"

# ============================================
# 7. FUNKTIONSTEST
# ============================================

echo "🧪 Funktionstest starten..."

# Backend kompilieren
cd backend
npx tsc
cd ..

# Backend starten (im Hintergrund)
cd backend
npm run start &
BACKEND_PID=$!
cd ..

sleep 5

# Health-Check
echo "Testing Health-Check..."
if ! curl -s http://localhost:3000/health | grep -q '"status":"ok"'; then
    echo "❌ Health-Check fehlgeschlagen"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Login-Test
echo "Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}')

if ! echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo "❌ Login fehlgeschlagen"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Token extrahieren
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Eintrag erstellen
echo "Testing Eintrag erstellen..."
ENTRY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/entries \
  -H 'Content-Type: application/json' \
  -d '{"element_id":"ELEMENT_1","timestamp":"2026-04-03T10:00:00Z","latitude":52.5200,"longitude":13.4050,"address":"Berlin","comment":"Installation Test"}')

if ! echo "$ENTRY_RESPONSE" | grep -q '"success":true'; then
    echo "❌ Eintrag erstellen fehlgeschlagen"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Einträge abrufen
echo "Testing Einträge abrufen..."
ENTRIES_RESPONSE=$(curl -s http://localhost:3000/api/v1/entries?element_id=ELEMENT_1)

if ! echo "$ENTRIES_RESPONSE" | grep -q '"success":true'; then
    echo "❌ Einträge abrufen fehlgeschlagen"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Backend stoppen
kill $BACKEND_PID 2>/dev/null

echo "✅ Funktionstest erfolgreich!"

# ============================================
# 8. ABSCHLUSS
# ============================================

echo ""
echo "🎉 ElementTracker2026 erfolgreich installiert!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Umgebung starten: ./start.sh"
echo "2. Backend testen: curl http://localhost:3000/health"
echo "3. Frontend öffnen: http://localhost:3001"
echo ""
echo "🔐 Admin-Zugangsdaten:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📚 Dokumentation: README.md"