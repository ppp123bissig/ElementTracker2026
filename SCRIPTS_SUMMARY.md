# 📦 ElementTracker2026 - Scripts & Tools Summary

## ✅ Neue/Verbesserte Scripts

### 1. 🛑 `cleanup.sh` - NEU
**Zweck:** Sauberes Herunterfahren aller Prozesse
**Features:**
- Graceful SIGTERM an alle node/npm/ts-node Prozesse
- Force-Kill mit SIGKILL nach Timeout
- Löscht Build-Cache (.next/, dist/)
- Gibt Ports 3000 & 3001 frei
- Verifikation der Port-Freigabe

**Verwendung:**
```bash
bash cleanup.sh
```

---

### 2. ✨ `start.sh` - ERWEITERT
**Neue Features:**
- Parameter `restart` für sauberen Neustart
- Ruft `cleanup.sh` bei `restart` auf
- Bessere Fehlerbehandlung

**Verwendung:**
```bash
bash start.sh              # Normaler Start
bash start.sh restart      # Sauberer Neustart
bash start.sh clean        # Alias für restart
```

---

### 3. 🔧 `install.sh` - ERWEITERT
**Neue Features:**
- Erstellt `backend/public/uploads/` Verzeichnis
- chmod 755 für Uploads
- Bessere Fehlerbehandlung

**Systemanforderungen geprüft:**
- Ubuntu 20.04+
- Mindestens 4GB RAM
- Mindestens 20GB freier Speicherplatz

---

### 4. 💾 `backup.sh` - NEU
**Zweck:** Komplettes Backup für Sicherung/Transfer
**Sichert:**
- ✅ Konfigurationsdateien (.env, tsconfig, package.json)
- ✅ PostgreSQL Dump (komplette Datenbank)
- ✅ Quellcode (backend/src, frontend/app+components)
- ✅ Uploaded Photos (backend/public/uploads/)
- ✅ Setup & Start Scripts
- ✅ Dokumentation (README.md)

**Output:** `elementtracker_backup_YYYYMMDD_HHMMSS.tar.gz`

**Verwendung:**
```bash
bash backup.sh
```

---

### 5. 🔄 `restore.sh` - NEU
**Zweck:** Backup auf neuem/vorherigen System wiederherstellen
**Features:**
- Extrahiert Backup automatisch
- Fragt vor dem Droppen der alten DB
- Spieled Datenbank-Dump ein
- Restored .env Dateien
- Restored Quellcode + Uploads
- npm install durchgeführt

**Verwendung:**
```bash
bash restore.sh elementtracker_backup_20260412_120000.tar.gz
```

---

## 📋 Neue Dokumentationen

### `DEPLOYMENT.md`
Komplette Server-Installation & Deployment Guide:
- Systemanforderungen
- Installation Schritt-für-Schritt
- Szenarien (neu, mit Backup, Neustart)
- Sicherheitshinweise
- Nginx Reverse Proxy Beispiel
- Systemd Services
- Troubleshooting

### `SCRIPTS.md`
Detaillierte Dokumentation aller Scripts:
- Übersicht aller 5 Scripts
- Ausführliche Verwendungsbeispiele
- Typical Workflows
- Trouble-shooting
- Was wird gemacht / Was wird gespeichert

### `.instructions.md`
Agent-Guidelines für Entwicklung:
- Projektkontext & Architektur
- Feature Implementation Workflow
- ⚠️ **Script-Wartung Checklist**
  - Bei neuen Dependencies
  - Bei neuen Umgebungs-Variablen
  - Bei neuen Verzeichnissen
  - Bei Port-Änderungen
  - Bei DB-Änderungen
- Kritische Regeln
- Performance & Sicherheit

---

## 🔐 Sicherheit & Best Practices

### .gitignore Updates
Neue Einträge hinzugefügt:
```
backend/public/uploads/*    # Uploadierte Fotos
*elementtracker_backup*.tar.gz  # Backups
.env / .env.local           # Secrets
*.log *.sql                 # Logs & DB-Dumps
```

### Backup Verzeichnis:
```
backend/public/uploads/.gitkeep  # Leeres Verzeichnis committen
```

---

## 📊 Vergleich Vorher vs. Nachher

| Funktion | Vorher | Nachher |
|----------|--------|---------|
| Normale Installation | ✅ install.sh | ✅ install.sh |
| Start Umgebung | ✅ start.sh | ✅ start.sh + restart-Option |
| Sauberer Neustart | ❌ Manuell | ✅ bash cleanup.sh + bash start.sh |
| Ports freigeben | ❌ Manuell | ✅ cleanup.sh |
| Backup erstellen | ❌ Nicht vorhanden | ✅ backup.sh |
| Backup wiederherstellen | ❌ Nicht vorhanden | ✅ restore.sh |
| Deployment Guide | ⚠️ Teilweise | ✅ DEPLOYMENT.md komplett |
| Agent-Guidelines | ❌ Keine | ✅ .instructions.md mit Script-Checks |

---

## 🚀 Verwendungsszenarien

### 1️⃣ Normaler Entwickler-Alltag
```bash
# Start
bash start.sh

# ... Entwicklung ...

# Probleme? Sauberer Neustart
bash start.sh restart

# Oder mit cleanup
bash cleanup.sh && bash start.sh
```

### 2️⃣ Sicherung VOR Production-Deploy
```bash
bash backup.sh
# → elementtracker_backup_20260412_120000.tar.gz
# Archivieren / mit Git Tagging speichern
```

### 3️⃣ Server-Migration
```bash
# Altes System
bash backup.sh

# Transfer
scp elementtracker_backup_*.tar.gz admin@newserver:/tmp/

# Neues System
ssh admin@newserver
cd ElementTracker2026
bash install.sh
bash restore.sh /tmp/elementtracker_backup_*.tar.gz
bash start.sh
```

### 4️⃣ Emergency: Port belegt
```bash
bash cleanup.sh      # Auch beim reboot sauberer als kill -9
bash start.sh
```

---

## 🧠 Agent-Integration

Die neue `.instructions.md` enthält einen **Script-Wartungs-Checklist** für den Entwicklungs-Agenten:

Bei JEDER neuen Feature müssen geprüft werden:
- ✅ `start.sh` - Neue Services zu starten?
- ✅ `cleanup.sh` - Neue Prozesse zum Cleanup?
- ✅ `install.sh` - Neue Dependencies, DB-Migrations, Verzeichnisse?
- ✅ `backup.sh` - Neue kritische Dateien zum Backup?
- ✅ `restore.sh` - Entsprechend updaten wenn backup.sh sich ändert?
- ✅ `.env` Variablen - Neue Secrets/Config dokumentiert?

**Regeln:**
- ❌ NIEMALS .env mit Passwörtern committen
- ✅ .env.example für nicht-sensible Defaults
- ✅ Feature = Backend API + Frontend + Tests + **Script Updates**
- ✅ Regression-Tests VOR und NACH Feature

---

## 📈 Verbesserungen für die Zukunft

Mögliche weitere Automatisierungen:
- [ ] Docker Compose Setup
- [ ] GitHub Actions CI/CD
- [ ] Automated Backups (cron)
- [ ] SSL/TLS für Production
- [ ] Load Balancing Setup
- [ ] Monitoring & Alerts (Prometheus, Grafana)
- [ ] Log Aggregation (ELK Stack)

---

## ✅ Checkliste: Scripts sind produktionsreif

- [x] cleanup.sh - Getestet & funktioniert
- [x] start.sh - Restart-Option integriert
- [x] install.sh - Upload-Verzeichnis erstellt
- [x] backup.sh - Alle wichtigen Dateien erfasst
- [x] restore.sh - DB + Quellcode wiederherstellen
- [x] DEPLOYMENT.md - Vollständige Dokumentation
- [x] SCRIPTS.md - Detaillierte Benutzerhandbuch
- [x] .instructions.md - Agent-Guidelines mit Checks
- [x] .gitignore - Sensible Dateien ausgeschlossen
- [x] backend/public/uploads/.gitkeep - Leeres Verzeichnis committen

---

**Version:** 1.0  
**Stand:** 2026-04-12  
**Status:** ✅ Produktionsreif für neue Server-Deployments
