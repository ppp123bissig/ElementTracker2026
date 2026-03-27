# ElementTracker2026 - Tracking System für Datenelemente

![Status](https://img.shields.io/badge/Status-In%20Development-blue)
![Version](https://img.shields.io/badge/Version-0.1.0--planning-blue)
![License](https://img.shields.io/badge/License-Proprietary-blue)

---

## 📋 Übersicht

**ElementTracker2026** ist ein modernes Web-Tracking-System zur Erfassung und Visualisierung von räumlichen Daten zu definierten Datenelementen (z.B. Tiere, Objekte, Events) mit:

- 🗺️ **Interaktive Kartendarstellung** (Leaflet.js + OpenStreetMap)
- 📊 **Datenerfassungs-Form** mit GPS-Koordinaten, Fotos, Kommentaren
- 🔐 **Admin-Panel** mit ID-Verwaltung und Audit-Logging
- 📱 **Mobile-responsive Design** (Mobile-First)
- 🛡️ **Enterprise-grade Sicherheit** (OWASP Top 10, DSGVO-konform)
- ⚡ **Production-ready Stack** (Next.js + Node.js + PostgreSQL)

---

## 🎯 Hauptmerkmale

### Für Benutzer
- ✅ Erfasse Beobachtungen für eine Element-ID
- ✅ Lade Fotos (max 3 MB) hoch
- ✅ Speichere GPS-Koordinaten oder Adressen
- ✅ Optionale E-Mail-Benachrichtigungen
- ✅ Zeige alle Einträge auf einer zoombar Karte
- ✅ Tracke bis zu 5 Elemente parallel (verschiedene Farben)

### Für Administratoren
- ✅ Verwalte zugel Assene Element-IDs
- ✅ Genehmige neue Element-Registrierungen
- ✅ Lösche fehlerhafte Einträge
- ✅ Sehe alle Änderungen im Audit-Log
- ✅ Exportiere / lösche Benutzerdaten (DSGVO)

### Technologie
- ✅ Sicher gegen DDoS/DoS-Attacken
- ✅ Verschlüsselt (HTTPS/TLS 1.3)
- ✅ Datenbankgehardert (SQL Injection Prevention)
- ✅ DSGVO-konform (Datenschutz by Design)
- ✅ Einfache Installation (ein Skript)
- ✅ Open Source Technologien

---

## 📚 DOKUMENTATION

### Schnelleinstieg
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technologie-Stack mit Pro/Contra Analyse
- **[INSTALLATION.md](INSTALLATION.md)** - Schritt-für-Schritt Setup

### Detaillierte Spezifikationen
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Vollständiges DB-Modell (ER, Tables, Views)
- **[API_SPECIFICATION.md](API_SPECIFICATION.md)** - REST API (OpenAPI 3.0)
- **[SECURITY_DSGVO.md](SECURITY_DSGVO.md)** - Sicherheit & Datenschutz

### Planung & Roadmap
- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)** - Phasenuplan (270h, 8-9 Wochen)
- **[Spec.txt](Spec.txt)** - Original-Anforderungen

---

## 🚀 Quick Start (Local)

### Voraussetzungen
- Linux Mint 21+ (oder Ubuntu 22+)
- 4 GB RAM
- 20 GB freier Speicherplatz
- Internet-Verbindung

### Automatische Installation (5-10 Minuten)

```bash
# 1. Repository klonen
git clone https://github.com/yourusername/ElementTracker2026.git
cd ElementTracker2026

# 2. Installation starten
chmod +x install.sh
sudo ./install.sh

# Follow prompts for:
# - Admin Username
# - Admin Password
# - PostgreSQL Password
# - Domain (z.B. example.local oder element tracker.local)
```

**Fertig!** Website läuft unter:
- 🌐 Nutzer: https://elementtracker.local
- 🔐 Admin: https://elementtracker.local/admin

---

## 📖 Erste Schritte

### 1. Admin Login

```
URL: https://elementtracker.local/admin
Username: admin
Password: [Ihr Passwort aus Installation]
```

### 2. Element-ID erstellen

Admin Panel → Elements → "Create New"

```
ID:        TEST001
Name:      Wanderfalke 2026
Owner:     Max Mustermann
```

→ Save → Approve (freigeben)

### 3. Daten erfassen

Hauptseite → "Daten eintragen"

```
Element:  TEST001
Datum:    2026-03-27
Zeit:     14:30
GPS:      52.52° N, 13.40° E  (oder Adresse)
Foto:     [optional, max 3 MB]
Email:    [optional, für Benachrichtigungen]
```

→ Submit

### 4. Auf Karte anzeigen

Hauptseite → "Karte"

Select Element: TEST001

→ Punkt sollte auf OpenStreetMap sichtbar sein

---

## 🛠️ Technologie-Stack

```
┌─────────────────────────┐
│   Frontend-Tier         │
│  Next.js 14 + React 18  │
│  Leaflet.js + Tailwind  │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│   API-Tier (Backend)    │
│ Node.js + Express.js    │
│ Port 3000               │
└──────────┬──────────────┘
           │
┌──────────▼──────────────┐
│  Data-Tier              │
│ PostgreSQL 15           │
│ + PostGIS (Spatial)     │
│ + Redis (Sessions)      │
└─────────────────────────┘

┌─────────────────────────┐
│   Infrastruktur         │
│ Nginx (Reverse Proxy)   │
│ Let's Encrypt (SSL/TLS) │
│ Fail2Ban (DDoS-Schutz)  │
│ Systemd (Services)      │
└─────────────────────────┘
```

---

## 🔐 Sicherheitsmerkmale

### OWASP Top 10 Mitigation
✅ **SQL Injection** → Parameterized Queries (pg-library)  
✅ **Authentication** → bcrypt + JWT (1h expiry)  
✅ **Sensitive Data** → HTTPS/TLS 1.3, .env Secrets  
✅ **Broken Access Control** → Role-based Auth  
✅ **XSS** → React auto-escaping  
✅ **CSRF** → HTTP-Only Cookies, SameSite=strict  
✅ **Vulnerable Dependencies** → npm audit  
✅ **Logging** → Audit Trail für Admin-Aktionen  

### DDoS/DoS Protection
✅ **Rate Limiting** → 5 LOGIN attempts / 15 min  
✅ **Fail2Ban** → Auto IP-blocking nach Brute-Force  
✅ **Nginx** → Connection limits, Buffer limits  
✅ **Cloudflare** (optional) → CDN + DDoS Mitigation  

### Datenschutz (DSGVO)
✅ **Einwilligung** → Checkbox vor Dateneingabe  
✅ **Datenexport** → ZIP mit allen Benutzerdaten  
✅ **Datenlöschung** → Automatische Soft-Delete  
✅ **Audit Trail** → Alle Änderungen geloggt  
✅ **Privacy by Default** → Fotos/Emails optional  
✅ **Backups** → Täglichv, verschlüsselt  

---

## 📦 Projektstruktur

```
ElementTracker2026/
├── ARCHITECTURE.md          # Tech-Stack Empfehlungen
├── DATABASE_SCHEMA.md       # ER-Diagramm + DDL
├── API_SPECIFICATION.md     # OpenAPI 3.0 Spec
├── SECURITY_DSGVO.md        # Sicherheit + GDPR
├── INSTALLATION.md          # Setup-Guide
├── PROJECT_ROADMAP.md       # 8-Woche Planung
├── Spec.txt                 # Original-Anforderungen
├── README.md                # This file
│
├── setup/
│   ├── install.sh           # Automated installation
│   ├── .env.example         # Environment template
│   ├── init.sql             # Database schema
│   ├── nginx.conf           # Reverse proxy config
│   ├── fail2ban-jail.conf   # DDoS protection
│   ├── backup-script.sh     # Daily backup
│   └── systemd/             # Service files
│
├── backend/
│   ├── src/
│   │   ├── server.js        # Express app entry
│   │   ├── routes/          # API endpoints
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers
│   │   └── config/          # Configuration
│   ├── package.json
│   ├── tsconfig.json        # TypeScript config
│   └── tests/               # Jest unit tests
│
├── frontend/
│   ├── app/
│   │   ├── page.jsx         # Landing page
│   │   ├── admin/
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx
│   │   │   ├── elements/
│   │   │   ├── entries/
│   │   │   └── settings/
│   │   ├── entries/         # User forms
│   │   ├── map/             # Map view
│   │   ├── layout.jsx       # Root layout
│   │   └── api/             # Next.js API routes (optional)
│   ├── components/          # React components
│   ├── public/              # Static assets
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.js
│
└── docs/
    ├── GETTING_STARTED.md
    ├── USER_GUIDE.md
    ├── ADMIN_GUIDE.md
    └── TROUBLESHOOTING.md
```

---

## 🔧 Development

### Prerequisite für Entwickler
```bash
# Node.js 20+ & npm 10+
node --version
npm --version

# PostgreSQL 15 running
psql --version

# DBeaver (DB-Admin tool, optional)
# VSCode Extensions:
# - ESLint
# - Prettier
# - PostgreSQL
# - REST Client
```

### Local Development (nach Installation)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Läuft auf http://localhost:3000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Läuft auf http://localhost:3001

# Terminal 3: Database (monitor)
sudo psql -d elementtracker
# SELECT count(*) FROM entries;
```

### Testing

```bash
# Backend Unit Tests
cd backend
npm test

# Integration Tests
npm run test:integration

# Frontend Tests
cd frontend
npm test

# E2E Tests (später)
npm run test:e2e
```

---

## 📊 Projektstatistiken

| Metrik | Wert |
|--------|------|
| **Geschätzte Entwicklungszeit** | 270h (8-9 Wochen Vollzeit) |
| **Backend Endpoints** | ~15 REST APIs |
| **Database Tables** | 9 Tabellen |
| **Frontend Pages** | 8 Seiten |
| **Test Coverage** | Target: >80% |
| **Code Qualität** | ESLint + Prettier |
| **Security** | OWASP Top 10 + DSGVO |
| **Performance** | <2s page load (lighthouse) |

---

## 🚢 Deployment

### Production Server (Linux Mint)

```bash
# Eine Installation
sudo ./setup/install.sh
```

### Hoster Migration (z.B. Linode, DigitalOcean)

```bash
# 1. Auf Hoster-Server installieren
sudo ./setup/install.sh

# 2. .env mit neuer Domain
sudo nano /opt/elementtracker/.env

# 3. Backup von lokal
/usr/local/bin/backup-elementtracker.sh

# 4. Restore auf Hoster
pg_restore -d elementtracker local_backup.dump

# 5. Test & Go-Live
```

---

## 🤝 Contribute

```bash
# Feature Branch
git checkout -b feature/neue-feature

# Nach Änderungen
git push origin feature/neue-feature

# Pull Request erstellen für Review
```

---

## 📋 Checklisten

### Installation
- [ ] install.sh erfolgreich ausgeführt
- [ ] Website erreichbar unter https://elementtracker.local
- [ ] Admin-Panel zugänglich
- [ ] Datenbank läuft
- [ ] Redis läuft
- [ ] Nginx läuft

### Pre-Launch
- [ ] Alle APIs getestet
- [ ] Frontend responsiv (mobil)
- [ ] DSGVO-Seiten publiziert
- [ ] Backup-Script getestet
- [ ] SSL-Zertifikat valid
- [ ] Admin trainiert
- [ ] Monitoring aktiv

### Security
- [ ] SSL Labs: A+
- [ ] OWASP Top 10 gedeckt
- [ ] Rate Limiting aktiv
- [ ] Audit Logging läuft
- [ ] Passwords bcrypt gehashed
- [ ] Secrets in .env (not in code)

---

## ❓ FAQ

**Q: Kann ich das System selbst hosten?**  
A: Ja! Einfach install.sh auf Linux Mint/Ubuntu Server laufen lassen.

**Q: Wie viel kostet es?**  
A: Kostenlos (Open Source Stack + Linux). Nur Hoster-Kosten falls Cloud.

**Q: Ist es DSGVO-konform?**  
A: Ja, Design mit Privacy-by-Default und Datenexport/Löschungs-APIs.

**Q: Kann ich Fotos speichern?**  
A: Ja, max 3 MB pro Foto, automatisch optimiert.

**Q: Wie ist der Support?**  
A: Dokumentation im /docs Ordner, GitHub Issues, oder Entwickler kontaktieren.

---

## 📞 Support & Kontakt

- 📧 Email: support@elementtracker.local
- 🐛 Bug Reports: GitHub Issues
- 📖 Dokumentation: /docs Ordner
- 💬 Fragen: admin@elementtracker.local

---

## 📄 Lizenz

ElementTracker2026 ist Proprietary Software.  
Alle Rechte vorbehalten © 2026.

---

## 🎯 Next Steps

1. **Lesen Sie [ARCHITECTURE.md](ARCHITECTURE.md)** für Technologie-Überblick
2. **Lesen Sie [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)** für Implementierungs-Plan
3. **Starten Sie Installation** mit `sudo ./install.sh`
4. **Folgen Sie [INSTALLATION.md](INSTALLATION.md)** für Troubleshooting

---

**Last updated:** 27. März 2026  
**Status:** Planning Phase ✅ | Development: Ausstehend

