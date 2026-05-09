#!/bin/bash

# ElementTracker2026 - System-Setup für neuen Linux-PC
# Installiert benötigte Systempakete wie PostgreSQL, PostGIS, Node.js und Git.

set -e

usage() {
  cat <<EOF
Usage: bash setup-machine.sh

Dieses Skript installiert die Systemabhängigkeiten für ElementTracker2026.

Es sollte auf Ubuntu/Mint ausgeführt werden.
EOF
}

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  usage
  exit 0
fi

if ! command -v lsb_release >/dev/null 2>&1; then
  echo "❌ lsb_release nicht gefunden. Bitte installiere "lsb-release" zuerst."
  exit 1
fi

if ! lsb_release -a | grep -q "Ubuntu\|Mint"; then
  echo "❌ Nur Ubuntu/Mint wird unterstützt. Aktuell: $(lsb_release -d)"
  exit 1
fi

echo "🔧 Installiere Systempakete..."

sudo apt update
sudo apt upgrade -y

sudo apt install -y curl ca-certificates gnupg lsb-release software-properties-common
sudo apt install -y git
sudo apt install -y postgresql postgresql-contrib
sudo apt install -y postgresql-16-postgis-3 postgresql-16-postgis-3-scripts

if ! command -v node >/dev/null 2>&1; then
  echo "📦 Node.js nicht gefunden. Installiere Node.js 22.x..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "📦 Node.js bereits installiert: $(node --version)"
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm konnte nicht gefunden werden. Prüfe die Node.js-Installation."
  exit 1
fi

echo "✅ Systempakete installiert"

echo "📍 PostgreSQL starten..."
sudo systemctl enable --now postgresql

if ! systemctl is-active --quiet postgresql; then
  echo "❌ PostgreSQL konnte nicht gestartet werden"
  exit 1
fi

echo "✅ PostgreSQL läuft"

echo "🎉 System-Setup abgeschlossen"
