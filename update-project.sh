#!/bin/bash

# ElementTracker2026 - Projekt aktualisieren
# Führt git pull aus und installiert Node-Abhängigkeiten neu.

set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$SCRIPT_DIR"

if [ ! -d ".git" ]; then
  echo "❌ Dieses Verzeichnis ist kein Git-Repository."
  exit 1
fi

BRANCH=${1:-main}

echo "🔄 Aktualisiere Repository auf Branch $BRANCH"
git fetch origin

git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "✅ Git aktualisiert"

bash project-setup.sh

echo "✅ Projekt aktualisiert"
