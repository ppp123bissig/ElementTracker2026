#!/bin/bash

# ElementTracker2026 - Start-Skript für die gesamte Umgebung
# Startet PostgreSQL, Backend und Frontend
# 
# Verwendung:
#   bash start.sh              - Normaler Start
#   bash start.sh restart      - Sauberer Neustart (cleanup + start)

set -e  # Exit on any error

RESTART_MODE=${1:-}

echo "🚀 ElementTracker2026 - Umgebung starten..."

# ============================================
# SAUBERER NEUSTART (optional)
# ============================================

if [ "$RESTART_MODE" = "restart" ] || [ "$RESTART_MODE" = "clean" ]; then
    echo "🔄 Führe sauberes Cleanup durch..."
    bash cleanup.sh
    echo ""
    echo "🚀 Starte Umgebung neu..."
fi

# ============================================
# PORTS FREI MACHEN
# ============================================

echo "🔍 Ports prüfen und freimachen..."

# Funktion zum Stoppen von Prozessen auf einem Port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -z "$pids" ]; then
        return
    fi

    local safe_pids=""
    for pid in $pids; do
        local args
        args=$(ps -p "$pid" -o args= 2>/dev/null || true)
        if echo "$args" | grep -Eq 'node|npm|pnpm'; then
            safe_pids="$safe_pids $pid"
        else
            echo "Port $port wird von PID $pid ($args) verwendet. Nicht automatisch stoppen." 
        fi
    done

    if [ -n "$safe_pids" ]; then
        echo "Port $port belegt von PIDs: $safe_pids - Stoppe node/npm Prozesse..."
        kill $safe_pids 2>/dev/null || true
        sleep 2
        kill -9 $safe_pids 2>/dev/null || true
    fi
}

# Ports 3000 (Backend) und 3001 (Frontend) freimachen
kill_port 3000
kill_port 3001

# PostgreSQL prüfen
if systemctl is-active --quiet postgresql; then
    echo "📊 PostgreSQL läuft bereits"
else
    echo "📊 PostgreSQL ist nicht aktiv. Versuche zu starten..."
    if [ "$EUID" -eq 0 ]; then
        systemctl start postgresql
    else
        sudo -n systemctl start postgresql 2>/tmp/start-postgresql.err || true
        if ! systemctl is-active --quiet postgresql; then
            echo "⚠️ PostgreSQL konnte nicht ohne Passwort gestartet werden. Bitte manuell starten:" 
            echo "   sudo systemctl start postgresql"
            exit 1
        fi
    fi
fi

sleep 2

# Backend starten
echo "🔧 Backend starten (Port 3000)..."
npm --prefix backend run dev > /tmp/elementtracker-backend.log 2>&1 &
BACKEND_PID=$!

# Frontend starten
echo "🌐 Frontend starten (Port 3001)..."
npm --prefix frontend run dev -- --port 3001 > /tmp/elementtracker-frontend.log 2>&1 &
FRONTEND_PID=$!

echo ""
echo "✅ Umgebung gestartet!"
echo "📍 Backend: http://localhost:3000"
echo "📍 Frontend: http://localhost:3001"
echo "📍 Health-Check: http://localhost:3000/health"
echo ""
echo "🛑 Zum Stoppen: kill $BACKEND_PID $FRONTEND_PID"
echo "   Oder: pkill -f 'npm run dev'"

# Warte auf SIGINT (Ctrl+C) um Prozesse zu stoppen
trap "echo '🛑 Stoppe Prozesse...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait