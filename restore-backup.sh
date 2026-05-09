#!/bin/bash

# ElementTracker2026 - Backup-Wiederherstellung
# Stellt ein Backup-Archiv für Datenbank und Konfiguration wieder her.

set -e

usage() {
  cat <<EOF
Usage: bash restore-backup.sh <backup-archive.tar.gz>

Das Skript führt restore.sh aus und überprüft die Quelle.
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

echo "🔄 Wiederherstellung aus Backup: $BACKUP_FILE"
bash restore.sh "$BACKUP_FILE"

echo "✅ Backup-Wiederherstellung abgeschlossen"
