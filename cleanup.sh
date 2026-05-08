#!/bin/bash

# ElementTracker2026 - Cleanup & Graceful Shutdown Script
# Beendet alle Prozesse sauber für einen Neustart

set -e

echo "🛑 ElementTracker2026 - Sauberes Herunterfahren starten..."
echo ""

# ============================================
# FUNKTION: Prozesse auf Port beenden
# ============================================

kill_port() {
    local port=$1
    local port_name=${2:-"Port $port"}
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -z "$pids" ]; then
        echo "✅ $port_name: Leer"
        return 0
    fi

    echo "⚠️  $port_name belegt von PIDs: $pids"
    
    # Sanft beenden (SIGTERM)
    echo "   → Sende SIGTERM (graceful shutdown)..."
    kill -TERM $pids 2>/dev/null || true
    
    # Warten auf Beendigung
    sleep 3
    
    # Prüfen ob noch aktiv
    remaining=$(lsof -ti:$port 2>/dev/null || echo "")
    if [ -n "$remaining" ]; then
        echo "   → Sende SIGKILL (force shutdown)..."
        kill -9 $remaining 2>/dev/null || true
        sleep 1
    fi
    
    # Verifikation
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "❌ $port_name konnte nicht freigegeben werden"
        return 1
    else
        echo "✅ $port_name: Freigegeben"
        return 0
    fi
}

# ============================================
# BACKEND & FRONTEND PROZESSE STOPPEN
# ============================================

echo "📍 Stoppe Backend-Prozesse..."

# Node.js Prozesse aus npm/ts-node beenden
if pgrep -f "npm run dev" >/dev/null 2>&1; then
    echo "   → Beende npm run dev Prozesse..."
    pkill -TERM -f "npm run dev" 2>/dev/null || true
    sleep 2
fi

if pgrep -f "ts-node" >/dev/null 2>&1; then
    echo "   → Beende ts-node Prozesse..."
    pkill -TERM -f "ts-node" 2>/dev/null || true
    sleep 2
fi

if pgrep -f "next dev" >/dev/null 2>&1; then
    echo "   → Beende Next.js Prozesse..."
    pkill -TERM -f "next dev" 2>/dev/null || true
    sleep 2
fi

# Ports freimachen
echo ""
echo "📍 Gebe Ports frei..."
kill_port 3000 "Backend (3000)"
kill_port 3001 "Frontend (3001)"

# ============================================
# NEXT.JS BUILD-CACHE LÖSCHEN (optional)
# ============================================

echo ""
echo "📍 Räume auf..."

if [ -d "frontend/.next" ]; then
    echo "   → Lösche Next.js Build-Cache (.next/)"
    rm -rf frontend/.next
fi

if [ -d "backend/dist" ]; then
    echo "   → Lösche TypeScript Build (dist/)"
    rm -rf backend/dist
fi

# Temporäre Log-Dateien
if [ -f "/tmp/elementtracker-backend.log" ]; then
    rm -f /tmp/elementtracker-backend.log
fi

if [ -f "/tmp/elementtracker-frontend.log" ]; then
    rm -f /tmp/elementtracker-frontend.log
fi

# ============================================
# VERIFIKATION
# ============================================

echo ""
echo "✅ Cleanup abgeschlossen!"
echo ""
echo "Verifikation der Ports:"
echo "  Port 3000: $(lsof -ti:3000 >/dev/null 2>&1 && echo '❌ Belegt' || echo '✅ Frei')"
echo "  Port 3001: $(lsof -ti:3001 >/dev/null 2>&1 && echo '❌ Belegt' || echo '✅ Frei')"
echo ""
echo "💡 Du kannst jetzt 'bash start.sh restart' ausführen für einen sauberen Neustart."
echo "   Oder: 'bash start.sh' für normale Start"
