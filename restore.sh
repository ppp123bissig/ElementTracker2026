#!/bin/bash

# ElementTracker2026 - Restore-Skript
# Stellt ein Backup auf einem neuen System wieder her

echo "🔄 ElementTracker2026 - Backup Wiederherstellung starten..."
echo ""

# ============================================
# PARAMETER
# ============================================

BACKUP_FILE=${1:-}

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Verwendung: bash restore.sh <backup-file.tar.gz>"
    echo ""
    echo "Beispiel:"
    echo "  bash restore.sh elementtracker_backup_20260412_120000.tar.gz"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup-Datei nicht gefunden: $BACKUP_FILE"
    exit 1
fi

echo "📦 Backup-Datei: $BACKUP_FILE"
echo ""

# ============================================
# EXTRACTION
# ============================================

echo "📂 Extrahiere Backup..."

# Verzeichnis für Extraktion
BACKUP_DIR=$(basename "$BACKUP_FILE" .tar.gz)
tar -xzf "$BACKUP_FILE" || { echo "❌ Extraktion fehlgeschlagen"; exit 1; }

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup-Verzeichnis nicht gefunden: $BACKUP_DIR"
    exit 1
fi

echo "✅ Backup extrahiert zu: $BACKUP_DIR"
echo ""

# ============================================
# SYSTEM VORBEREITUNG
# ============================================

echo "🔧 Richte System vor..."

# Installation skript ausführen (falls nicht bereits installiert)
if ! command -v node >/dev/null 2>&1; then
    echo "   → Node.js wird benötigt. Bitte vorher installieren mit: bash install.sh"
    exit 1
fi

# PostgreSQL prüfen
if ! command -v psql >/dev/null 2>&1; then
    echo "   → PostgreSQL wird benötigt. Bitte vorher installieren mit: bash install.sh"
    exit 1
fi

# PostgreSQL starten
echo "   → Starte PostgreSQL..."
sudo systemctl start postgresql || true
sleep 2

echo "✅ System vorbereitet"
echo ""

# ============================================
# DATENBANK WIEDERHERSTELLEN
# ============================================

echo "🗄️  Stelle Datenbank wieder her..."

DB_SQL="$BACKUP_DIR/data/elementtracker.sql"

if [ -f "$DB_SQL" ]; then
    # Alte Datenbank droppen (optional - Bestätigung fragen)
    read -p "   ⚠️  Existierende 'elementtracker' Datenbank droppen? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo -u postgres dropdb elementtracker 2>/dev/null || true
        echo "   → Alte Datenbank gelöscht"
    fi
    
    # Neue Datenbank erstellen
    sudo -u postgres createdb elementtracker 2>/dev/null || true
    
    # Dump einspielen
    echo "   → Spiele Datenbank-Dump ein..."
    sudo -u postgres psql -d elementtracker < "$DB_SQL" || \
    { echo "❌ Datenbank-Wiederherstellung fehlgeschlagen"; exit 1; }
    
    echo "✅ Datenbank wiederhergestellt"
else
    echo "⚠️  Keine Datenbank-Datei gefunden. Überspringe."
fi

echo ""

# ============================================
# KONFIGURATIONSDATEIEN WIEDERHERSTELLEN
# ============================================

echo "⚙️  Stelle Konfigurationsdateien wieder her..."

# Backend .env
if [ -f "$BACKUP_DIR/config/backend.env" ]; then
    cp "$BACKUP_DIR/config/backend.env" backend/.env
    echo "   ✅ backend/.env"
else
    echo "   ⚠️  backend.env nicht im Backup gefunden"
fi

# Restore backend package files
if [ -f "$BACKUP_DIR/config/backend.package.json" ]; then
    cp "$BACKUP_DIR/config/backend.package.json" backend/package.json
    echo "   ✅ backend/package.json"
fi
if [ -f "$BACKUP_DIR/config/backend.package-lock.json" ]; then
    cp "$BACKUP_DIR/config/backend.package-lock.json" backend/package-lock.json
    echo "   ✅ backend/package-lock.json"
fi

# Frontend .env
if [ -f "$BACKUP_DIR/config/frontend.env.local" ]; then
    cp "$BACKUP_DIR/config/frontend.env.local" frontend/.env.local
    echo "   ✅ frontend/.env.local"
fi

# Restore frontend package files
if [ -f "$BACKUP_DIR/config/frontend.package.json" ]; then
    cp "$BACKUP_DIR/config/frontend.package.json" frontend/package.json
    echo "   ✅ frontend/package.json"
fi
if [ -f "$BACKUP_DIR/config/frontend.package-lock.json" ]; then
    cp "$BACKUP_DIR/config/frontend.package-lock.json" frontend/package-lock.json
    echo "   ✅ frontend/package-lock.json"
fi

echo "✅ Konfiguration wiederhergestellt"
echo ""

# ============================================
# QUELLCODE WIEDERHERSTELLEN
# ============================================

echo "📝 Stelle Quellcode wieder her..."

# Backend
if [ -d "$BACKUP_DIR/src/backend" ]; then
    rm -rf backend/src
    cp -r "$BACKUP_DIR/src/backend" backend/src
    echo "   ✅ backend/src"
fi

# Frontend
if [ -d "$BACKUP_DIR/src/frontend" ]; then
    [ -d "frontend/app" ] && rm -rf frontend/app
    [ -d "frontend/components" ] && rm -rf frontend/components
    [ -d "frontend/styles" ] && rm -rf frontend/styles
    
    [ -d "$BACKUP_DIR/src/frontend/app" ] && cp -r "$BACKUP_DIR/src/frontend/app" frontend/
    [ -d "$BACKUP_DIR/src/frontend/components" ] && cp -r "$BACKUP_DIR/src/frontend/components" frontend/
    [ -d "$BACKUP_DIR/src/frontend/styles" ] && cp -r "$BACKUP_DIR/src/frontend/styles" frontend/
    echo "   ✅ frontend/ (app, components, styles)"
fi

# Setup
if [ -d "$BACKUP_DIR/scripts" ]; then
    # Nur PostGIS Setup (init.sql) wenn neu
    if [ ! -d "setup" ]; then
        mkdir -p setup
        [ -f "$BACKUP_DIR/scripts/init.sql" ] && cp "$BACKUP_DIR/scripts/init.sql" setup/
    fi
    echo "   ✅ setup/"
fi

echo "✅ Quellcode wiederhergestellt"
echo ""

# ============================================
# ABHÄNGIGKEITEN INSTALLIEREN
# ============================================

echo "📦 Installiere Abhängigkeiten..."

cd backend || exit 1
npm install --production 2>&1 | tail -3
cd ..

cd frontend || exit 1
npm install --production 2>&1 | tail -3
cd ..

echo "✅ Abhängigkeiten installiert"
echo ""

# ============================================
# UPLOADS WIEDERHERSTELLEN (optional)
# ============================================

echo "📸 Stelle Uploads wieder her..."

if [ -d "$BACKUP_DIR/data/uploads" ]; then
    mkdir -p backend/public/uploads
    cp -r "$BACKUP_DIR/data/uploads"/* backend/public/uploads/ 2>/dev/null || true
    echo "   ✅ public/uploads wiederhergestellt"
else
    echo "   ⚠️  Keine Uploads im Backup"
fi

echo ""

# ============================================
# CLEANUP
# ============================================

echo "🧹 Räume auf..."
rm -rf "$BACKUP_DIR"
echo "   ✅ Temporäre Dateien gelöscht"

echo ""

# ============================================
# VERIFIKATION
# ============================================

echo "✅ Wiederherstellung abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Überprüfe backend/.env auf Korrektheit"
echo "2. Starte die Umgebung: bash start.sh"
echo "3. Führe Tests durch: curl http://localhost:3000/health"
echo ""
echo "🚀 Zum Start: bash start.sh"
