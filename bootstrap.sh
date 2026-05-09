#!/bin/bash

# ElementTracker2026 - Bootstrap für neuen PC
# Nutze dieses Skript, um eine neue Maschine mit dem Projekt einzurichten.

set -e

usage() {
  cat <<EOF
Usage:
  bash bootstrap.sh <git-repo-url> [backup-archive.tar.gz] [target-dir]

Beispiele:
  bash bootstrap.sh https://github.com/ppp123bissig/ElementTracker2026.git
  bash bootstrap.sh https://github.com/ppp123bissig/ElementTracker2026.git backup.tar.gz
  bash bootstrap.sh https://github.com/ppp123bissig/ElementTracker2026.git backup.tar.gz ~/09_Dev/ElementTracker2026
EOF
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  usage
  exit 0
fi

if [ $# -lt 1 ] || [ $# -gt 3 ]; then
  usage
  exit 1
fi

REPO_URL=$1
BACKUP_FILE=${2:-}
TARGET_DIR=${3:-"$HOME/09_Dev/ElementTracker2026"}

if [ ! -d "$TARGET_DIR" ]; then
  echo "📥 Klone Repository in $TARGET_DIR"
  mkdir -p "$(dirname "$TARGET_DIR")"
  git clone "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"

if [ ! -f "setup-machine.sh" ] || [ ! -f "project-setup.sh" ]; then
  echo "❌ Die erforderlichen Skripte wurden nicht im Repository gefunden."
  exit 1
fi

bash setup-machine.sh
bash project-setup.sh

if [ -n "$BACKUP_FILE" ]; then
  bash restore-backup.sh "$BACKUP_FILE"
fi

echo "✅ Bootstrap abgeschlossen"
echo "Starte die Umgebung mit: bash start.sh"
