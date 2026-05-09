# ElementTracker2026 Setup Guide

## Übersicht

Diese Anleitung beschreibt, wie du das Projekt auf einem neuen PC vollständig aufsetzt, wie du ein Backup wiederherstellst und wie du einen bestehenden lokalen Stand aktualisierst.

Die wichtigsten Skripte im Repository sind:

- `bootstrap.sh` – kompletter Neubootstrap auf einem neuen Rechner
- `setup-machine.sh` – installiert Systemabhängigkeiten (PostgreSQL, PostGIS, Node.js, Git)
- `project-setup.sh` – installiert Node-Abhängigkeiten und bereitet das Projekt vor
- `restore-backup.sh` – stellt ein Backup-Archiv wieder her
- `update-project.sh` – zieht den aktuellen Git-Stand und installiert Abhängigkeiten neu
- `start.sh` / `cleanup.sh` – starten und stoppen die Umgebung

---

## 1. Neuer PC: Komplettes Setup mit Git und Backup

### 1.1. GitHub-Repository anlegen

1. Erstelle auf GitHub ein Repository `ElementTracker2026`.
2. Verwende ggf. deinen bestehenden GitHub-Account.
3. Erzeuge keine zusätzliche README/Lizenz beim Anlegen, wenn du das Projekt lokal schon versioniert hast.

### 1.2. Auf dem neuen PC ausführen

```bash
cd ~/09_Dev
bash -c "git clone https://github.com/<DEIN_USERNAME>/ElementTracker2026.git"
cd ElementTracker2026
```

### 1.3. Systemabhängigkeiten installieren

```bash
bash setup-machine.sh
```

### 1.4. Projektabhängigkeiten installieren

```bash
bash project-setup.sh
```

### 1.5. Optional: Backup wiederherstellen

Wenn du einen Backup-Dump hast, übertrage die Datei auf den neuen PC und führe aus:

```bash
bash restore-backup.sh /pfad/zum/backup.tar.gz
```

### 1.6. Umgebung starten

```bash
bash start.sh
```

Danach sollten erreichbar sein:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`

---

## 2. Lokales Projekt aktualisieren

Wenn bereits ein funktionierendes Repository vorhanden ist und du nur den Stand aktualisieren möchtest:

```bash
cd ~/09_Dev/ElementTracker2026
bash update-project.sh
```

Das Skript führt aus:
- `git fetch origin`
- `git checkout main`
- `git pull --ff-only origin main`
- `bash project-setup.sh`

Wenn du einen anderen Branch verwenden willst:

```bash
bash update-project.sh develop
```

---

## 3. Backup wiederherstellen

Wenn du nur ein Backup nachpflegen möchtest, ohne die Maschine neu aufzusetzen:

```bash
cd ~/09_Dev/ElementTracker2026
bash restore-backup.sh /pfad/zum/backup.tar.gz
```

Das Skript stellt wieder her:
- Datenbank-Dump (PostgreSQL)
- `backend/.env`
- `backend/package.json` und `backend/package-lock.json`
- `frontend/package.json` und `frontend/package-lock.json`
- Quellcode aus `src/`
- optional Uploads aus `backend/public/uploads`

---

## 4. Kaputter lokaler Stand: Was ist sinnvoll?

### Option 1: Sauber neu aufsetzen (empfohlen)

1. `bash cleanup.sh`
2. `cd .. && rm -rf ElementTracker2026`
3. Klonen: `git clone https://github.com/<DEIN_USERNAME>/ElementTracker2026.git`
4. `cd ElementTracker2026`
5. `bash bootstrap.sh <repo-url> [backup.tar.gz]`

Diese Variante ist die zuverlässigste, wenn Dateien beschädigt oder stark verändert sind.

### Option 2: Reparieren und drüber installieren

1. `bash cleanup.sh`
2. `git pull`
3. `bash project-setup.sh`
4. `bash start.sh restart`

Diese Option kann funktionieren, wenn nur Abhängigkeiten oder lokale temporäre Dateien das Problem sind.

### Empfehlung

Wenn das lokale System bereits fehlerhaft ist oder du unsicher bist: verwende Option 1.

---

## 5. Was sollte ins Git-Repository?

Folgende Dateien und Ordner sollten auf jeden Fall versioniert sein:

- `backend/package.json`
- `backend/package-lock.json`
- `frontend/package.json`
- `frontend/package-lock.json`
- `backend/src/` und `frontend/app/`, `frontend/components/`, `frontend/styles/`
- `install.sh`, `bootstrap.sh`, `setup-machine.sh`, `project-setup.sh`, `restore-backup.sh`, `update-project.sh`, `start.sh`, `cleanup.sh`
- `README.md`, `SETUP_GUIDE.md`, `QUICK_START.md`

Nicht ins Git:

- `backend/.env`
- `frontend/.env.local`
- `node_modules/`
- `*.log`
- `*.sql`
- `*.tar.gz`
- temporäre Dateien

`.gitignore` sollte das bereits verhindern.

---

## 6. Noch ein Hinweis zum Backup

Die Backup-Skripte speichern `package.json`-Dateien in `config/` innerhalb des Archivs. `restore-backup.sh` kopiert sie dann zurück nach `backend/` und `frontend/`.

Wenn beim Wiederherstellen `frontend/package.json` fehlt, wurde das Backup nicht richtig zurückgespielt oder das falsche Archiv verwendet.
