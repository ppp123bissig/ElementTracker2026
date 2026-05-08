# 🛠️ ElementTracker2026 - Scripts & Betrieb

Dieses Dokument erklärt die verfügbaren Shell-Scripts zur Verwaltung von ElementTracker2026.

## 📚 Übersicht aller Scripts

| Script | Zweck | Verwendung |
|--------|-------|-----------|
| `start.sh` | Entwicklungsumgebung starten | `bash start.sh` oder `bash start.sh restart` |
| `cleanup.sh` | Alle Prozesse & Ports freigeben | `bash cleanup.sh` |
| `install.sh` | Komplette Neu-Installation | `bash install.sh` |
| `backup.sh` | Projekt-Backup erstellen | `bash backup.sh` |
| `restore.sh` | Backup wiederherstellen | `bash restore.sh backup.tar.gz` |

---

## 🚀 `start.sh` - Hauptstart-Script

Startet alle notwendigen Services (PostgreSQL, Backend, Frontend).

### Normale Verwendung
```bash
bash start.sh
```

**Was passiert:**
1. ✅ Ports 3000 & 3001 freimachen (alte Prozesse beenden)
2. ✅ PostgreSQL prüfen/starten
3. ✅ Backend starten (Port 3000)
4. ✅ Frontend starten (Port 3001)
5. ✅ Wartet auf Ctrl+C zum Beenden

### Sauberer Neustart (empfohlen nach Crashes)
```bash
bash start.sh restart
# oder
bash start.sh clean
```

**Was passiert:**
1. ✅ Führt `cleanup.sh` durch
2. ✅ Löscht Build-Cache (.next, dist)
3. ✅ Startet dann normal neu

### Output Beispiel
```
🚀 ElementTracker2026 - Umgebung starten...

📍 Ports prüfen und freimachen...
Port 3000 belegt, stoppe Prozesse...
✅ Port 3000 freigegeben

📊 PostgreSQL läuft bereits

🔧 Backend starten (Port 3000)...
🌐 Frontend starten (Port 3001)...

✅ Umgebung gestartet!
📍 Backend: http://localhost:3000
📍 Frontend: http://localhost:3001
🛑 Zum Stoppen: kill 12345 12346
```

---

## 🛑 `cleanup.sh` - Graceful Shutdown

Beendet alle Prozesse und gibt Ports frei - **für saubere Neustarts**.

### Verwendung
```bash
bash cleanup.sh
```

**Was wird beendet:**
- ✅ npm run dev Prozesse
- ✅ ts-node Server
- ✅ Next.js Dev-Server
- ✅ Alle Node.js auf Ports 3000 & 3001

**Was wird gelöscht:**
- ✅ Next.js Build-Cache (`.next/`)
- ✅ TypeScript Build (`dist/`)
- ✅ Temporäre Log-Dateien

**Output:**
```
🛑 ElementTracker2026 - Sauberes Herunterfahren starten...

📍 Stoppe Backend-Prozesse...
   → Beende npm run dev Prozesse... ✅
   → Beende ts-node Prozesse... ✅

📍 Gebe Ports frei...
   Backend (3000): ✅ Freigegeben
   Frontend (3001): ✅ Freigegeben

📍 Räume auf...
   → Lösche Next.js Build-Cache (.next/)
   → Lösche TypeScript Build (dist/)

✅ Cleanup abgeschlossen!
```

### 🚨 Probleme?

Falls Port trotzdem noch belegt:
```bash
# Manuell Prozess finden & beenden
lsof -ti:3000          # Zeigt PID
kill -9 <PID>          # Force-Kill

# Oder ganzer Befehl
lsof -ti:3000 | xargs kill -9
```

---

## 🔧 `install.sh` - Erste Installation

Installiert **alle Systemanforderungen** und richtet das Projekt ein - nur einmalig nötig!

### Vollständige Installation
```bash
bash install.sh
```

**Was wird installiert:**
1. ✅ Systemanforderungen prüfen (RAM, Disk, OS)
2. ✅ PostgreSQL + PostGIS
3. ✅ Node.js 22.x
4. ✅ npm Abhängigkeiten (backend & frontend)
5. ✅ Datenbank-Schema
6. ✅ Admin-User (admin/admin123)
7. ✅ `.env` Dateien mit zufälligen Secrets

**Benötigte Eingaben:**
- Sudo-Passwort (für apt, systemctl, postgres)
- ⏱️ Dauert 5-15 Minuten

**Systemanforderungen:**
- ✅ Ubuntu 20.04 oder neuer
- ✅ Mindestens 4GB RAM
- ✅ Mindestens 20GB freier Speicherplatz
- ✅ Internetverbindung

### Nach Installation (wichtig!)

```bash
# Admin-Passwort ÄNDERN!
# backend/.env öffnen und ändern:
DB_PASSWORD=elementtracker2026  ← auf Produktionsserver ändern!

# Dann starten
bash start.sh
```

---

## 💾 `backup.sh` - Projekte Sichern

Erstellt ein **vollständiges Backup** für Datensicherung oder Transfer auf neuen Server.

### Backup erstellen
```bash
bash backup.sh
```

**Output:**
```
💾 ElementTracker2026 - Backup starten...

📂 Backup-Verzeichnis: elementtracker_backup_20260412_120000

📋 Sichere Konfigurationsdateien...
   ✅ backend/.env
   ✅ package.json files
   ...

🗄️  Sichere Datenbank...
   ✅ PostgreSQL Dump (elementtracker.sql)

📸 Sichere Uploads...
   ✅ public/uploads

📝 Sichere Quellcode-Struktur...
   ✅ backend/src
   ✅ frontend (app, components, styles)

📦 Komprimiere Backup...
✅ Backup erstellt: elementtracker_backup_20260412_120000.tar.gz
   Größe: 245M
```

**Was wird gesichert:**
```
backup/
├── config/           # .env, tsconfig, package.json
├── data/
│  ├── elementtracker.sql    # Komplette DB
│  └── uploads/              # Hochgeladene Fotos
├── src/
│  ├── backend/src            # Quellcode
│  └── frontend/             # Quellcode
└── scripts/          # Setup & Start Scripts
```

### Backup auf anderen Server übertragen
```bash
# Backup erstellen
bash backup.sh

# Auf anderen Server übertragen
scp elementtracker_backup_*.tar.gz user@newserver.de:/tmp/

# Auf neuem Server wiederherstellen (siehe restore.sh)
ssh user@newserver.de 'bash restore.sh /tmp/elementtracker_backup_*.tar.gz'
```

### Verschlüsselt übertragen (empfohlen!)
```bash
# Mit tar Verschlüsselung
tar -czf - backup/ | gpg --encrypt -r your@email.com > backup.tar.gz.gpg

# Übertragen
scp backup.tar.gz.gpg server:/tmp/

# Entschlüsseln und wiederherstellen
gpg --decrypt backup.tar.gz.gpg | tar -xz
bash restore.sh
```

---

## 🔄 `restore.sh` - Backup Wiederherstellen

Stellt ein Backup auf einem neuen (oder vorherigen) System wieder her.

### Voraussetzungen
- ✅ Git-Repository vorhanden
- ✅ `bash install.sh` mindestens einmal ausgeführt
- ✅ Backup-Datei vorhanden
- ✅ PostgreSQL läuft

### Wiederherstellen
```bash
# Backup-Datei übergeben
bash restore.sh elementtracker_backup_20260412_120000.tar.gz
```

**Was passiert:**
1. ✅ Extrahiert Backup
2. ✅ Droppt alte DB (+ Bestätigung)
3. ✅ Restored Datenbank (SQL-Dump)
4. ✅ Kopiert `.env` Dateien
5. ✅ Restored Quellcode
6. ✅ npm install durchgeführt
7. ✅ Uploads wiederhergestellt
8. ✅ Cleanup

**Output:**
```
🔄 ElementTracker2026 - Backup Wiederherstellung starten...

📦 Backup-Datei: elementtracker_backup_20260412_120000.tar.gz

📂 Extrahiere Backup...
✅ Backup extrahiert zu: elementtracker_backup_20260412_120000

🗄️  Stelle Datenbank wieder her...
   ⚠️  Existierende 'elementtracker' Datenbank droppen? (y/N): y
   → Alte Datenbank gelöscht
   → Spiele Datenbank-Dump ein...
✅ Datenbank wiederhergestellt

⚙️  Stelle Konfigurationsdateien wieder her...
   ✅ backend/.env
   ✅ Konfiguration wiederhergestellt

✅ Wiederherstellung abgeschlossen!
```

### Nach Restore
```bash
# Konfiguration überprüfen (ggfs. anpassen)
# - backend/.env prüfen (DB-Passwort, JWT_SECRET, CORS)
# - Neue Passwörter für Production?

# Starten
bash start.sh
```

---

## 🔄 Typische Workflows

### 🚀 Normaler Arbeitstag

```bash
# Morgens Starten
bash start.sh

# ... Entwicklung ...

# Zulang laufen lassen? Sauberer Neustart
bash cleanup.sh
bash start.sh

# Oder schneller
bash start.sh restart
```

### 🔧 Nach Server-Probleme

```bash
# Sauberer Neustart durchführen
bash cleanup.sh

# Prüfen, was belegt ist
lsof -ti:3000
lsof -ti:3001

# Nochmal starten
bash start.sh
```

### 💾 VOR Release/Production

```bash
# Backup erstellen
bash backup.sh

# Backup testen auf anderem Rechner
scp elementtracker_backup_*.tar.gz testuser@testserver:/tmp/

# Release testen
# git tag v1.0.0; git push origin v1.0.0
```

### 🖥️ Server-Migration

```bash
# WAS: Altes System
bash backup.sh

# TRANSFER
scp elementtracker_backup_*.tar.gz admin@newserver:/tmp/

# WO: neues System
ssh admin@newserver
cd ~/ElementTracker2026

# Installation
bash install.sh

# Restore
bash restore.sh /tmp/elementtracker_backup_*.tar.gz

# Run
bash start.sh
```

---

## 🆘 Troubleshooting

### Port bereits belegt (Address already in use)

```bash
# Option 1: Cleanup durchführen
bash cleanup.sh
bash start.sh

# Option 2: Manuell Prozesse beenden
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
sleep 2
bash start.sh
```

### PostgreSQL Verbindungsfehler

```bash
# PostgreSQL prüfen
sudo systemctl status postgresql

# Starten
sudo systemctl start postgresql

# Testen
psql -U postgres -d elementtracker -c "SELECT 1"
```

### npm install Fehler

```bash
# Cache löschen
npm cache clean --force

# node_modules
rm -rf backend/node_modules frontend/node_modules

# Neu installieren
npm install --prefix backend
npm install --prefix frontend
```

### Frontend zeigt Fehler nach Änderungen

```bash
# Next.js Cache löschen
rm -rf frontend/.next

# Nächster Start baut neu
bash start.sh
```

---

## 📖 Weitere Informationen

- **DEPLOYMENT.md** - Server-Setup komplett
- **API_SPECIFICATION.md** - API Endpoints & Dokumentation
- **ARCHITECTURE.md** - Technische Architektur
- **.instructions.md** - Agent-Guidelines für Entwicklung

---

✅ **Fertig!** Alle Scripts sind einsatzbereit. Viel Erfolg mit ElementTracker2026! 🚀
