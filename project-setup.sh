#!/bin/bash

# ElementTracker2026 - Projekt-Setup
# Installiert Node-Abhängigkeiten und bereitet das Projektverzeichnis vor.

set -e

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT_DIR"

echo "🔧 Starte Projekt-Setup in $ROOT_DIR"

if [ ! -f "backend/package.json" ]; then
  echo "❌ backend/package.json fehlt. Bitte überprüfe dein Repository." 
  exit 1
fi

if [ ! -f "frontend/package.json" ]; then
  echo "❌ frontend/package.json fehlt. Bitte überprüfe dein Repository." 
  exit 1
fi

echo "📦 Installiere Backend-Abhängigkeiten..."
cd backend
npm install
cd "$ROOT_DIR"

echo "📦 Installiere Frontend-Abhängigkeiten..."
cd frontend
npm install
cd "$ROOT_DIR"

echo "✅ Node-Abhängigkeiten installiert"

if [ ! -d "backend/public/uploads" ]; then
  echo "📁 Erstelle Upload-Verzeichnis"
  mkdir -p backend/public/uploads
  chmod 755 backend/public/uploads
fi

if [ ! -f "backend/.env" ]; then
  echo "⚠️  backend/.env fehlt. Erstelle Default-Datei."
  cat > backend/.env <<EOF
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
ADMIN_PASSWORD_HASH=
EOF
  echo "   ➜ backend/.env erstellt. Bitte passe ADMIN_PASSWORD_HASH an oder nutze existierende .env-Datei." 
fi

echo "✅ Projekt-Setup abgeschlossen"
