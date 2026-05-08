#!/bin/bash

# ElementTracker2026 - Backup-Skript
# Sichert alle wichtigen Dateien und Konfiguration für ein Backup/Transfer

echo "💾 ElementTracker2026 - Backup starten..."
echo ""

# ============================================
# KONFIGURATION
# ============================================

BACKUP_DIR="elementtracker_backup_$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}.tar.gz"

echo "📂 Backup-Verzeichnis: $BACKUP_DIR"

# ============================================
# VERZEICHNISSE ERSTELLEN
# ============================================

mkdir -p "$BACKUP_DIR/config"
mkdir -p "$BACKUP_DIR/data"
mkdir -p "$BACKUP_DIR/src"

# ============================================
# KONFIGURATIONSDATEIEN
# ============================================

echo "📋 Sichere Konfigurationsdateien..."

# Backend .env (WICHTIG: Passwörter!)
if [ -f "backend/.env" ]; then
    cp backend/.env "$BACKUP_DIR/config/backend.env"
    echo "   ✅ backend/.env"
fi

# Frontend .env (falls vorhanden)
if [ -f "frontend/.env.local" ]; then
    cp frontend/.env.local "$BACKUP_DIR/config/frontend.env.local"
    echo "   ✅ frontend/.env.local"
fi

# TypeScript Konfiguration
if [ -f "tsconfig.json" ]; then
    cp tsconfig.json "$BACKUP_DIR/config/"
fi
if [ -f "backend/tsconfig.json" ]; then
    cp backend/tsconfig.json "$BACKUP_DIR/config/backend.tsconfig.json"
fi
if [ -f "frontend/tsconfig.json" ]; then
    cp frontend/tsconfig.json "$BACKUP_DIR/config/frontend.tsconfig.json"
fi

# Next.js Config
if [ -f "frontend/next.config.js" ]; then
    cp frontend/next.config.js "$BACKUP_DIR/config/"
fi
if [ -f "frontend/tailwind.config.ts" ]; then
    cp frontend/tailwind.config.ts "$BACKUP_DIR/config/"
fi
if [ -f "frontend/postcss.config.js" ]; then
    cp frontend/postcss.config.js "$BACKUP_DIR/config/"
fi

# package.json Files (für Dependencies)
echo "   ✅ package.json files"
cp backend/package.json "$BACKUP_DIR/config/backend.package.json"
cp backend/package-lock.json "$BACKUP_DIR/config/backend.package-lock.json" 2>/dev/null || true
cp frontend/package.json "$BACKUP_DIR/config/frontend.package.json"
cp frontend/package-lock.json "$BACKUP_DIR/config/frontend.package-lock.json" 2>/dev/null || true

# ============================================
# DATENBANK BACKUP
# ============================================

echo "🗄️  Sichere Datenbank..."

if command -v pg_dump >/dev/null 2>&1; then
    sudo -u postgres pg_dump -d elementtracker > "$BACKUP_DIR/data/elementtracker.sql" 2>/dev/null && \
    echo "   ✅ PostgreSQL Dump (elementtracker.sql)" || \
    echo "   ⚠️  PostgreSQL Dump fehlgeschlagen (Rechte?)"
else
    echo "   ⚠️  pg_dump nicht verfügbar"
fi

# ============================================
# DATEIABLAGE (optional)
# ============================================

echo "📸 Sichere Uploads..."

if [ -d "backend/public/uploads" ]; then
    mkdir -p "$BACKUP_DIR/data/uploads"
    cp -r backend/public/uploads/* "$BACKUP_DIR/data/uploads/" 2>/dev/null || true
    echo "   ✅ public/uploads"
fi

# ============================================
# QUELLCODE STRUKTUR (wichtige Dateien)
# ============================================

echo "📝 Sichere Quellcode-Struktur..."

# Backend Routes
if [ -d "backend/src/routes" ]; then
    mkdir -p "$BACKUP_DIR/src/backend"
    cp -r backend/src/* "$BACKUP_DIR/src/backend/" 2>/dev/null || true
    echo "   ✅ backend/src"
fi

# Frontend App
if [ -d "frontend/app" ]; then
    mkdir -p "$BACKUP_DIR/src/frontend"
    cp -r frontend/app "$BACKUP_DIR/src/frontend/" 2>/dev/null || true
    cp -r frontend/components "$BACKUP_DIR/src/frontend/" 2>/dev/null || true
    cp -r frontend/styles "$BACKUP_DIR/src/frontend/" 2>/dev/null || true
    echo "   ✅ frontend (app, components, styles)"
fi

# Datenbank Setup
if [ -d "setup" ]; then
    mkdir -p "$BACKUP_DIR/scripts"
    cp -r setup/* "$BACKUP_DIR/scripts/" 2>/dev/null || true
    echo "   ✅ setup/"
fi

# Shell Scripts
if [ -f "start.sh" ]; then
    mkdir -p "$BACKUP_DIR/scripts"
    cp start.sh cleanup.sh install.sh restore.sh backup.sh "$BACKUP_DIR/scripts/" 2>/dev/null || true
    echo "   ✅ Scripts (start.sh, cleanup.sh, install.sh, restore.sh, backup.sh)"
fi

# Dokumentation
if [ -f "README.md" ]; then
    cp README.md "$BACKUP_DIR/"
    echo "   ✅ README.md"
fi

# ============================================
# KOMPRESSIONUND INFO-DATEI
# ============================================

echo ""
echo "📦 Komprimiere Backup..."

# Erstelle Info-Datei
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
=== ElementTracker2026 Backup ===

Erstellt: $(date '+%Y-%m-%d %H:%M:%S')
Hostname: $(hostname)
Benutzer: $(whoami)

Inhalt:
- config/    : Konfigurationsdateien (.env, tsconfig, package.json)
- data/      : Datenbankdump + Uploads
- src/       : Quellcode (backend & frontend)
- scripts/   : Setup und Start Scripts

Wiederherstellung:
1. bash restore.sh
2. Folge den Anweisungen

Wichtig:
- Überprüfe die .env Dateien auf sensible Daten
- Backups sollten verschlüsselt übertragen werden
EOF

# Komprimiere
tar -czf "$BACKUP_FILE" "$BACKUP_DIR" && \
echo "✅ Backup erstellt: $BACKUP_FILE" && \
echo "   Größe: $(du -h "$BACKUP_FILE" | cut -f1)" || \
echo "❌ Kompression fehlgeschlagen"

# ============================================
# ZUSAMMENFASSUNG
# ============================================

echo ""
echo "✅ Backup abgeschlossen!"
echo ""
echo "📊 Gesicherte Dateien:"
echo "   ├─ Konfiguration (.env, tsconfig, package.json)"
echo "   ├─ Datenbank (elementtracker.sql)"
echo "   ├─ Quellcode (backend & frontend)"
echo "   ├─ Uploads (public/uploads)"
echo "   └─ Scripts"
echo ""
echo "📦 Backup-Datei: $BACKUP_FILE"
echo ""
echo "💾 Zum Transfer auf neuen Server:"
echo "   scp $BACKUP_FILE user@newserver:/path/to/"
echo "   ssh user@newserver 'bash restore.sh $BACKUP_FILE'"
