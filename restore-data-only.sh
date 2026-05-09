#!/bin/bash

# ElementTracker2026 - Daten-only Restore
# Stellt nur die Datenbank, Uploads und Umgebungsdateien aus einem Backup wieder her.
# Quellcode, package.json und Build-Dateien werden nicht überschrieben.

set -e

usage() {
  cat <<EOF
Usage: bash restore-data-only.sh <backup-archive.tar.gz>

Dieses Skript stellt nur folgende Backup-Inhalte wieder her:
- PostgreSQL Datenbank-Dump
- backend/.env
- frontend/.env.local
- Uploads aus backend/public/uploads

Es überschreibt nicht:
- backend/src/
- frontend/app/
- frontend/components/
- frontend/styles/
- package.json/package-lock.json
EOF
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  usage
  exit 0
fi

if [ $# -ne 1 ]; then
  echo "❌ Bitte gib das Backup-Archiv an."
  usage
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup-Datei nicht gefunden: $BACKUP_FILE"
  exit 1
fi

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

echo "🔄 Starte Daten-Only Restore aus: $BACKUP_FILE"

BACKUP_DIR=$(basename "$BACKUP_FILE" .tar.gz)
rm -rf "$BACKUP_DIR"

tar -xzf "$BACKUP_FILE" || { echo "❌ Extraktion fehlgeschlagen"; exit 1; }

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Backup-Verzeichnis nicht gefunden: $BACKUP_DIR"
  exit 1
fi

echo "✅ Backup extrahiert zu: $BACKUP_DIR"

if ! command -v psql >/dev/null 2>&1; then
  echo "❌ PostgreSQL client (psql) nicht gefunden. Bitte installiere zuerst die System-Abhängigkeiten."
  exit 1
fi

if ! systemctl is-active --quiet postgresql; then
  echo "📍 Starte PostgreSQL..."
  sudo systemctl start postgresql || true
  sleep 2
fi

if systemctl is-active --quiet postgresql; then
  echo "✅ PostgreSQL läuft"
else
  echo "❌ PostgreSQL konnte nicht gestartet werden"
  exit 1
fi

# Restore database
DB_DUMP="$BACKUP_DIR/data/elementtracker.sql"
if [ -f "$DB_DUMP" ]; then
  echo "🗄️  Stelle Datenbank wieder her..."
  read -p "   ⚠️  Alte Datenbank 'elementtracker' droppen? (y/N): " -r
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo -u postgres dropdb elementtracker 2>/dev/null || true
    echo "   → Alte Datenbank gelöscht"
  fi
  sudo -u postgres createdb elementtracker 2>/dev/null || true
  sudo -u postgres psql -d elementtracker < "$DB_DUMP" || { echo "❌ Datenbank-Wiederherstellung fehlgeschlagen"; exit 1; }
  echo "   ✅ Datenbank wiederhergestellt"
else
  echo "⚠️  Kein Datenbank-Dump im Backup gefunden. Überspringe Datenbank-Restore."
fi

# Restore env files
if [ -f "$BACKUP_DIR/config/backend.env" ]; then
  echo "⚙️  Stelle backend/.env wieder her..."
  cp "$BACKUP_DIR/config/backend.env" backend/.env
  echo "   ✅ backend/.env"
fi

if [ -f "$BACKUP_DIR/config/frontend.env.local" ]; then
  echo "⚙️  Stelle frontend/.env.local wieder her..."
  cp "$BACKUP_DIR/config/frontend.env.local" frontend/.env.local
  echo "   ✅ frontend/.env.local"
fi

# Restore uploads
if [ -d "$BACKUP_DIR/data/uploads" ]; then
  echo "📸 Stelle Uploads wieder her..."
  mkdir -p backend/public/uploads
  cp -r "$BACKUP_DIR/data/uploads/"* backend/public/uploads/ 2>/dev/null || true
  echo "   ✅ backend/public/uploads"
else
  echo "⚠️  Keine Uploads im Backup gefunden"
fi

# Cleanup temporary extraction
rm -rf "$BACKUP_DIR"

echo "✅ Daten-only Restore abgeschlossen"
