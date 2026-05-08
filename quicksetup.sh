#!/bin/bash

# ElementTracker2026 - Quick Setup Script für neuen Server
# Installiert alles automatisch oder restored aus Backup

echo "🚀 ElementTracker2026 - Quick Server Setup"
echo ""

# ============================================
# PARAMETER PRÜFEN
# ============================================

if [ $# -eq 0 ]; then
    echo "Verwendung:"
    echo "  bash quicksetup.sh new          - Komplett neues System"
    echo "  bash quicksetup.sh restore <backup.tar.gz>  - Aus Backup wiederherstellen"
    echo ""
    echo "Szenario 1: Neues System"
    echo "  $ bash quicksetup.sh new"
    echo ""
    echo "Szenario 2: Mit Backup Transfer"
    echo "  $ scp elementtracker_backup_*.tar.gz server:/tmp/"
    echo "  $ ssh user@server 'bash quicksetup.sh restore /tmp/elementtracker_backup_*.tar.gz'"
    exit 1
fi

MODE=$1
BACKUP_FILE=$2

# ============================================
# MODUS: NEU
# ============================================

if [ "$MODE" = "new" ]; then
    echo "📋 Szenario: NEUES System komplett installieren"
    echo ""
    
    # Repository prüfen
    if [ ! -f "install.sh" ]; then
        echo "❌ install.sh nicht gefunden!"
        echo "   Bitte im ElementTracker2026 Verzeichnis arbeiten"
        exit 1
    fi
    
    echo "1️⃣  Starte Komplette Installation..."
    bash install.sh || { echo "❌ Installation fehlgeschlagen"; exit 1; }
    
    echo ""
    echo "2️⃣  Starteumgebung..."
    bash start.sh &
    START_PID=$!
    
    sleep 10
    
    echo ""
    echo "✅ Setup abgeschlossen!"
    echo ""
    echo "📍 Zugriff:"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend: http://localhost:3000"
    echo "   Admin: admin / admin123"
    echo ""
    echo "📝 WICHTIG: Ändere Admin-Passwort in Production!"
    echo "   backend/.env öffnen und DB_PASSWORD ändern"
    echo ""
    
    wait $START_PID

# ============================================
# MODUS: RESTORE
# ============================================

elif [ "$MODE" = "restore" ]; then
    if [ -z "$BACKUP_FILE" ]; then
        echo "❌ Backup-Datei erforderlich"
        echo "Verwendung: bash quicksetup.sh restore <backup.tar.gz>"
        exit 1
    fi
    
    echo "📋 Szenario: BACKUP wiederherstellen"
    echo ""
    
    # Dateien prüfen
    if [ ! -f "install.sh" ] || [ ! -f "restore.sh" ]; then
        echo "❌ install.sh oder restore.sh nicht gefunden!"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "❌ Backup-Datei nicht gefunden: $BACKUP_FILE"
        exit 1
    fi
    
    echo "1️⃣  Starte Basis-Installation (Systempakete)..."
    bash install.sh || { echo "❌ Installation fehlgeschlagen"; exit 1; }
    
    echo ""
    echo "2️⃣  Spielde Backup ein..."
    bash restore.sh "$BACKUP_FILE" || { echo "❌ Restore fehlgeschlagen"; exit 1; }
    
    echo ""
    echo "3️⃣  Starte Umgebung..."
    bash start.sh &
    START_PID=$!
    
    sleep 10
    
    echo ""
    echo "✅ Wiedherstellung abgeschlossen!"
    echo ""
    echo "📍 Zugriff (wie zuvor):"
    echo "   Frontend: http://localhost:3001"
    echo "   Backend: http://localhost:3000"
    echo ""
    echo "⚠️  Prüfe backend/.env auf Korrektheit vorher!"
    echo ""
    
    wait $START_PID

# ============================================
# UNGÜLTIGER MODUS
# ============================================

else
    echo "❌ Ungültiger Modus: $MODE"
    echo "Gültige Modi: new, restore"
    exit 1
fi
