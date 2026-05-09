# ElementTracker2026 Quick Start

## Schnellstart: Neuer PC

1. Repository klonen:

```bash
cd ~/09_Dev
git clone https://github.com/<DEIN_USERNAME>/ElementTracker2026.git
cd ElementTracker2026
```

2. System einrichten:

```bash
bash setup-machine.sh
```

3. Projekt aufsetzen:

```bash
bash project-setup.sh
```

4. Optional: Backup wiederherstellen:

```bash
bash restore-backup.sh /pfad/zum/backup.tar.gz
```

5. Anwendung starten:

```bash
bash start.sh
```

6. Prüfen:

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`

---

## Schnellstart: Projekt aktualisieren

```bash
cd ~/09_Dev/ElementTracker2026
bash update-project.sh
```

Wenn du einen anderen Branch verwenden willst:

```bash
bash update-project.sh develop
```

Danach ggf. neu starten:

```bash
bash cleanup.sh
bash start.sh
```

---

## Schnellstart: Backup wiederherstellen

```bash
cd ~/09_Dev/ElementTracker2026
bash restore-backup.sh /pfad/zum/backup.tar.gz
```

---

## Git: Lokalen Stand ins Repository legen

1. Prüfen, was geändert ist:

```bash
git status
```

2. Dateien hinzufügen:

```bash
git add backend/package.json backend/package-lock.json frontend/package.json frontend/package-lock.json

git add bootstrap.sh setup-machine.sh project-setup.sh restore-backup.sh update-project.sh start.sh cleanup.sh

git add SETUP_GUIDE.md QUICK_START.md
```

3. Commit erstellen:

```bash
git commit -m "Add setup, restore and update scripts with documentation"
```

4. Remote hinzufügen (nur einmal nötig):

```bash
git remote add origin https://github.com/<DEIN_USERNAME>/ElementTracker2026.git
```

5. Branch aufsetzen und pushen:

```bash
git branch -M main

git push -u origin main
```

Wenn dein Branch stattdessen `master` heißt, nutze stattdessen:

```bash
git push -u origin master
```

---

## Git: Initiale Dateien auf neuem PC holen

1. Installiere Git und öffne ein Terminal.
2. Klone das Repository:

```bash
cd ~/09_Dev
git clone https://github.com/<DEIN_USERNAME>/ElementTracker2026.git
cd ElementTracker2026
```

3. Installiere und setze das Projekt auf:

```bash
bash setup-machine.sh
bash project-setup.sh
```

4. Optional: Backup wiederherstellen:

```bash
bash restore-backup.sh /pfad/zum/backup.tar.gz
```

5. Starte die Umgebung:

```bash
bash start.sh
```
