# ElementTracker2026 - Architektur & Technologie-Empfehlungen

*Stand: 27. März 2026*

---

## 1. ANFORDERUNGSANALYSE - Zusammenfassung

### Funktionale Anforderungen
- **Datenerfassung**: 8 Felder pro Element (ID, Name/Motiv, Zeitstempel, GPS/Adresse, Ortstext, Kommentar, E-Mail, Foto ≤3MB)
- **Datenverwaltung**: Wiederholte Eingaben pro ID, Chronologische Sortierung
- **Kartendarstellung**: Zoombar, mehrfarbig (bis zu 5 Einträge), aktivierbar/deaktivierbar
- **Admin-Funktionen**: ID-Vorregistrierung, Freigabe neuer IDs, Fehlerhafte Einträge löschen
- **Benachrichtigungen**: E-Mail-Benachrichtigungen (optional)

### Non-Funktionale Anforderungen
- **Sicherheit**: DSGVO-konform, DoS/DDoS-Schutz, sichere Passwort-Speicherung
- **Responsive Design**: Mobile-First, Desktop-kompatibel
- **Wartbarkeit**: Einfache Installation (Shell-Skript), leichte Wartung
- **Skalierbarkeit**: Von lokal (Linux Mint) zu produktivem Hoster portierbar

---

## 2. ARCHITEKTUR-ÜBERSICHT - Empfohlener Stack

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (Browser)                 │
│  React/Next.js 14 + TypeScript + TailwindCSS       │
│  - Responsive UI für Mobile/Desktop                 │
│  - Leaflet/Maplibre für interaktive Karte          │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│                  API Layer (Backend)                 │
│  Node.js/Express.js mit JWT-Auth                   │
│  - RESTful API                                       │
│  - Rate Limiting gegen DoS/DDoS                     │
│  - Input Validation & Sanitization                  │
│  - CORS & HTTPS-only                                │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│                 Datenschicht                        │
│  PostgreSQL mit PostGIS Extension                   │
│  - Relational Schema für Elemente, Einträge, Admin │
│  - GIS-Support für GPS-Koordinaten                  │
│  - Backup & Audit-Logging                          │
└─────────────────────────┬───────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────┐
│              Infrastruktur & Services               │
│  - Nginx als Reverse Proxy + SSL/TLS               │
│  - Redis für Session Management & Rate Limiting   │
│  - File Storage für Fotos (lokal oder S3-kompatibel)
│  - Nodemailer oder SendGrid für E-Mails            │
└────────────────────────────────────────────────────┘
```

---

## 3. TECHNOLOGIE-OPTIONEN MIT PRO/CONTRA

### 3.1 Frontend-Framework

#### Option A: Next.js 14 (🎯 EMPFOHLEN)
**Pro:**
- ✅ Server-Side Rendering (SSR) für mobile Performance
- ✅ Built-in API Routes (Backend-Integration einfacher)
- ✅ Automatische Optimierung (Image, Code-Splitting)
- ✅ Exzellente TypeScript-Unterstützung
- ✅ Rich Ecosystem (Authentication, Forms, etc.)
- ✅ Mobile-First: Responsive von Haus aus

**Contra:**
- ❌ Größere Bundle-Size als Vanilla React
- ❌ Node.js-Umgebung notwendig (aber Sie haben ohnehin einen Node-Backend)

**Kosten/Aufwand:** Mittel (3-4 Wochen)

---

#### Option B: React 18 + TypeScript (klassisch)
**Pro:**
- ✅ Leicht zu lernen, großes Ökosystem
- ✅ Performance: SPA mit Lazy Loading
- ✅ Mobile-ready mit Standard-Tools
- ✅ Weniger "Magic", mehr Kontrolle

**Contra:**
- ❌ Mehr Boilerplate-Code für Routing, SEO, APIs
- ❌ Client-side Rendering bei langsamem Netz (mobil) schlechter

**Kosten/Aufwand:** Mittel (4-5 Wochen)

---

#### Option C: Vue 3 + Vite
**Pro:**
- ✅ Schnellere Dev-Experience
- ✅ Kleinere Bundle-Size
- ✅ Einfacher zu verstehen als React

**Contra:**
- ❌ Kleineres Ökosystem für spezialisierte Komponenten
- ❌ Weniger Sicherheits-Audits als React/Next

**Kosten/Aufwand:** Ähnlich React, aber für Sie weniger relevant (Sie kennen eher React/Node-Stack)

---

**🎯 EMPFEHLUNG: Next.js 14**
- In Deutschland sehr beliebt
- Sicherheit & Performance optimal for mobiles
- Integration mit Node.js-Backend nahtlos
- Modern & wartbar über lange Zeit

---

### 3.2 Backend-Framework

#### Option A: Node.js + Express.js (🎯 EMPFOHLEN)
**Pro:**
- ✅ JavaScript full-stack (Frontend + Backend = gemeinsame Sprache)
- ✅ Leicht zu skalieren, viele Security-Libraries verfügbar
- ✅ Großes Ecosystem (Passport, Helmet, Rate-Limit)
- ✅ Einfach zu hosten (überall verfügbar)
- ✅ DSGVO-Tools & E-Mail-Libraries existieren

**Contra:**
- ❌ Weniger Typ-Sicherheit ohne TypeScript-Setup
- ❌ Single-Thread, aber mit Clustering lösbar

**Kosten/Aufwand:** Gering (3-4 Wochen)

---

#### Option B: Python + Flask/FastAPI
**Pro:**
- ✅ Einfach zu lernen, sehr sicher zu schreiben
- ✅ Exzellentes Geo-Support (GeoPy, Folium)
- ✅ Weniger Abhängigkeiten, monolithischer

**Contra:**
- ❌ Ein weiteres Sprachökosystem (nicht JavaScript)
- ❌ Deployment komplexer (WSGI, Gunicorn)
- ❌ Weniger Standard-Libraries für SecurePassword-Speicherung

**Kosten/Aufwand:** Mittel (4-6 Wochen)

---

#### Option C: Go (Gin)
**Pro:**
- ✅ Ultra-schnell, kompiliert
- ✅ DDoS-Schutz einfacher zu implementieren
- ✅ Single Binary, einfaches Deployment

**Contra:**
- ❌ Neues Ökosystem zu erlernen
- ❌ Weniger "ergonomisch" als JavaScript/Python

**Kosten/Aufwand:** Hoch (6-8 Wochen)

---

**🎯 EMPFEHLUNG: Node.js + Express.js**
- Maximale Code-Wiederverwendung mit Frontend
- Entwickler-Ökosystem sehr reif
- In Berlin/Deutschland sehr verbreitet
- Optimal für Ihre Anforderung nach "leicht zu pflegen"

---

### 3.3 Datenbank

#### Option A: PostgreSQL + PostGIS (🎯 EMPFEHLEN)
**Pro:**
- ✅ Bestes Geo-Support (PostGIS für GPS-Koordinaten)
- ✅ Open Source, kostenlos, überall verfügbar
- ✅ DSGVO-freundlich (Audit-Logging möglich)
- ✅ Powerful Backup-Tools
- ✅ Excellent Dokumentation
- ✅ Skaliert von lokal auf Cloud einfach

**Contra:**
- ❌ Ressourcen-intensiver als SQLite lokal
- ❌ Setup komplexer als Alternativen

**Kosten/Aufwand:** Gering (Setup: 2 Stunden)

---

#### Option B: MySQL 8
**Pro:**
- ✅ Sehr verbreitet, einfach zu hosten
- ✅ GEO-Funktionen vorhanden (aber nicht so gut wie PostGIS)

**Contra:**
- ❌ Geo-Support weniger mächtig
- ❌ Langsamer bei komplexeren Queries

**Kosten/Aufwand:** Gering (1-2 Stunden)

---

#### Option C: SQLite (lokal) + PostgreSQL (Produktion)
**Pro:**
- ✅ Schnelle Local-Entwicklung ohne separate DB-Service
- ✅ Zero-Setup lokal

**Contra:**
- ❌ Migrations-Risk beim Wechsel zu PostgreSQL
- ❌ SQLite nicht für Multi-User-Umgebung geeignet

**Kosten/Aufwand:** Mittel (zusätzliche Testing-Komplexität)

---

**🎯 EMPFEHLUNG: PostgreSQL + PostGIS**
- Von Anfang an "echte" Datenbank
- Kein Migrations-Risiko später
- PostGIS: Hervorragend für GPS-Koordinaten & Kartendarstellung
- DSGVO-konform mit Audit-Logging

---

### 3.4 Kartendarstellung

#### Option A: Leaflet.js + OpenStreetMap (🎯 EMPFOHLEN)
**Pro:**
- ✅ Open Source, kostenlos
- ✅ Leicht, schnell (wichtig für Mobile)
- ✅ Großes Plugin-Ökosystem
- ✅ Deutsche Karten-Provider verfügbar
- ✅ Kein API-Key nötig (wenn OpenStreetMap genutzt)

**Contra:**
- ❌ Tile-Server bei schwerem Traffic kann überlastet sein

**Kosten/Aufwand:** Gering (2-3 Tage)

---

#### Option B: Mapbox GL JS
**Pro:**
- ✅ Moderne 3D-Karten, sehr schnell
- ✅ Vektor-basiert, schöne Darstellung

**Contra:**
- ❌ Bezahlte API (für hohen Traffic)
- ❌ Abhängigkeit von Mapbox-Service

**Kosten/Aufwand:** Gering (2-3 Tage), aber **monatliche Kosten** ab ~25€

---

#### Option C: Google Maps API
**Pro:**
- ✅ Am vertrautesten für Nutzer
- ✅ Exzellente Dokumentation

**Contra:**
- ❌ **Monatliche Kosten** (10-50€ je nach Traffic)
- ❌ DSGVO-Probleme: Google Analytics Tracking
- ❌ Abhängigkeit von Google

**Kosten/Aufwand:** Gering (1-2 Tage), aber **monatlich teuer**

---

**🎯 EMPFEHLUNG: Leaflet.js + OpenStreetMap**
- Kostenlos, Open Source
- DSGVO-freundlich
- Vollkommen ausreichend für Ihr Use-Case
- Für Deutsche Nutzer: German Tiles (z.B. via Stamen)

---

### 3.5 Sicherheit & DDoS-Schutz

#### Option A: Nginx + Fail2Ban + Rate Limiting (🎯 EMPFOHLEN)
**Pro:**
- ✅ Open Source, kostenlos
- ✅ Auf Linux Mint einfach zu installieren
- ✅ Potente Rate-Limiting Capabilities
- ✅ IP-Blocking automatisierbar

**Contra:**
- ❌ Manuelles Setup erforderlich
- ❌ DDoS von großen Botnets nicht vollständig stoppbar

**Kosten/Aufwand:** Mittel (3-4 Tage Setup + Testing)

---

#### Option B: Cloudflare (Free Plan)
**Pro:**
- ✅ Kostenloses DDoS-Protection
- ✅ WAF (Web Application Firewall) auch kostenlos
- ✅ Automatic HTTPS
- ✅ CDN für schnellere Auslieferung

**Contra:**
- ❌ Abhängigkeit von Cloudflare
- ❌ DSGVO-Compliance muss überprüft werden
- ❌ Your Domain muss durch Cloudflare laufen

**Kosten/Aufwand:** Sehr gering (30 Min Setup), **Kostenlos**

---

#### Option C: AWS Shield / Azure DDoS Protection
**Pro:**
- ✅ Enterprise-grade Schutz

**Contra:**
- ❌ Komplexer zu konfigurieren
- ❌ Monatliche Kosten (20-100€+)
- ❌ Overkill für Ihr Projekt

**Kosten/Aufwand:** Hoch, **monatlich teuer**

---

**🎯 EMPFEHLUNG: Nginx + Fail2Ban + optional Cloudflare Free**
- Nginx mit Rate-Limiting für Basis-Schutz
- Fail2Ban für automatisches IP-Blocking von Brute-Force-Angriffen
- Cloudflare kostenlos für zusätzliche Schutz-Layer
- Kombiniert: sehr gut, kostenlos, wartbar

---

### 3.6 File Storage für Fotos

#### Option A: Lokal im Dateisystem (einfach, aber mit Backup-Komplexität)
**Pro:**
- ✅ Keine externe Abhängigkeit
- ✅ Schnell
- ✅ Kostenlos

**Contra:**
- ❌ Backup kompliziert
- ❌ Nicht skalierbar (wenn Server wechselt)
- ❌ Speicherplatz muss manuell verwaltet werden

**Kosten/Aufwand:** Gering (Setup), aber **höherer Betrieb**

---

#### Option B: AWS S3 / MinIO (Self-Hosted S3-kompatibel)
**Pro:**
- ✅ Skalierbar
- ✅ Einfaches Backup
- ✅ MinIO: Open Source, auf Linux lauffähig

**Contra:**
- ❌ MinIO: zusätzlicher Service zu managen
- ❌ MinIO: etwas komplexer zum Setup

**Kosten/Aufwand:** Mittel (2-3 Tage MinIO-Setup)

---

#### Option C: Firebase Storage (Google)
**Pro:**
- ✅ Sehr einfaches Setup
- ✅ Automatisches Backup

**Contra:**
- ❌ DSGVO-Probleme (Google-Abhängigkeit)
- ❌ Monatliche Kosten je nach Speicher

---

**🎯 EMPFEHLUNG: Lokal + Backup-Strategie**
- Für MVP: **einfaches lokales Speichern**
- Struktur so vorbereiten, dass später MinIO leicht integrierbar
- Backup-Skript (rsync zu External HDD oder Cloud)
- Später: MinIO für Production-Hoster

---

## 4. DEUTSCHE DATENSCHUTZ & DSGVO-COMPLIANCE

### Must-Haves:
1. **Passwort-Hashing**: bcrypt oder Argon2 (NICHT SHA-256!)
2. **Datenschutz-Seite** (Impressum, Datenschutz, Nutzungsbedingungen)
3. **Cookie-Banner** (wenn Tracking genutzt wird; Sie sollten es NICHT nutzen!)
4. **HTTPS/SSL-Zertifikat** (kostenlös via Let's Encrypt)
5. **Datenexport-Funktion** (Nutzer können ihre Daten herunterladen)
6. **Lösch-Funktion** (Nutzer können ihre Daten löschen lassen - "Recht auf Vergessenheit")
7. **Audit-Logging**: Wer hat welche Daten wann verändert/gelöscht
8. **Datenschutz-Folgenabschätzung** (DSFA) für Ihr Projekt
9. **Einwilligung vor E-Mail-Versand** (Double-Opt-In)
10. **No Google Analytics** (verwenden Sie selbst gehostetes Plausible oder Umami statt)

### Empfohlene Libraries:
- **bcryptjs** für Passwort-Hashing
- **dotenv** für Secrets-Management
- **helmet** für Express (Security Headers)
- **express-rate-limit** für DDoS-Schutz
- **pg** mit Parameterized Queries (verhindert SQL Injection)

---

## 5. INSTALLATIONSSTRATEGIE - Shell-Skript

**Ziel: Zero-Click Setup auf Linux Mint**

```bash
# install.sh soll installieren:
1. Node.js 20 LTS
2. PostgreSQL 15 mit PostGIS
3. Redis (für Caching/Sessions)
4. Nginx
5. Certbot (Let's Encrypt SSL)
6. npm dependencies
7. init.sql durchspielen (Datenbankstruktur)
8. systemd-Services erstellen (für Auto-Restart)
9. Firewall-Regeln setzen
10. Backup-Cron-Job
```

**Struktur:**
```
ElementTracker2026/
├── install.sh           # Hauptinstallations-Skript
├── setup/
│   ├── postgres.sh      # PostgreSQL + PostGIS Setup
│   ├── nginx.conf       # Nginx Config
│   ├── init.sql         # DDL für Datenbank
│   ├── .env.example     # Umgebungsvariablen
│   └── backup.sh        # Daily Backup Script
├── src/
│   ├── backend/         # Node.js Express
│   ├── frontend/        # Next.js
│   ├── database/        # Migrations, Seeds
│   └── scripts/         # Utility-Scripts
└── docs/
    ├── INSTALLATION.md
    ├── DSGVO.md
    └── DEPLOYMENT.md
```

---

## 6. PROJEKTZEITPLANUNG (Rough Estimate)

| Phase | Aufgabe | Weeks | Notes |
|-------|---------|-------|-------|
| **1** | Anforderungs-Analyse + Design | 1 | DB-Schema, API-Spec, Wireframes |
| **2** | Backend (Express + DB) | 3-4 | CRUD APIs, Auth, Validierung |
| **3** | Frontend (Next.js) | 3-4 | UI/UX, Forms, Kartendarstellung |
| **4** | Integration + Testing | 2 | End-to-End, Security-Tests |
| **5** | Sicherheit & DSGVO-Auditierung | 1-2 | Penetration Testing, Compliance |
| **6** | Installation-Skript | 1 | Automatisiertes Setup |
| **7** | Dokumentation + Deployment | 1 | How-to Guides, Production Setup |
| | **TOTAL** | **12-16 Wochen** | **ca. 3-4 Monate** |

---

## 7. 🎯 FINAL-EMPFEHLUNG "Production-Ready Stack"

### Frontend
```javascript
// Next.js 14 + TypeScript + TailwindCSS + React Query
// für Datenerfassung, Karten, Admin-Panel
```

### Backend
```javascript
// Node.js 20 + Express.js + TypeScript
// + bcryptjs, helmet, express-rate-limit, pg, nodemailer
```

### Datenbank
```sql
// PostgreSQL 15 mit PostGIS Extension
// Strukturen für Elements, Entries, Users, Audit-Log
```

### Kartendarstellung
```javascript
// Leaflet.js + React-Leaflet + OpenStreetMap
```

### Sicherheit & Betrieb
```bash
// Nginx Reverse Proxy + Let's Encrypt HTTPS
// Fail2Ban + Rate Limiting gegen DDoS
// Cloudflare Free optional für extra Schutz
// Daily Backup via rsync oder pg_dump
// systemd Services für Auto-Restart
```

### Installation
```bash
// Ein Shell-Skript (install.sh)
// Setup: <5 Minuten mit Internet
// Alles: PostgreSQL, Nginx, SSL, npm modules, systemd
```

### Warum dieser Stack?
✅ **Sicherheit**: Alle Modern-Standards (OWASP Top 10 gedeckt)
✅ **Performance**: Optimal für Mobile
✅ **Wartbarkeit**: JavaScript Full-Stack, großes Ökosystem
✅ **Skalierbarkeit**: Lokal → Hoster ohne Änderungen
✅ **DSGVO-konform**: Keine externen Tracking-Services
✅ **Kostenlos**: Alle Tools sind Open Source
✅ **Dokumentiert**: Deutsche Community, viele Tutorials

---

## 8. NÄCHSTE SCHRITTE

1. ✅ **Sie bestätigen** diese Architektur-Empfehlungen
2. 📋 **Datenbank-Schema** definieren (Tabellen, Relationen)
3. 🔧 **API-Spezifikation** schreiben (OpenAPI/Swagger)
4. 🎨 **UI/UX-Wireframes** skizzieren
5. 📦 **Repository-Struktur** initialisieren
6. 🏗️ **Backend-Skeleton** aufbauen
7. 🖥️ **Frontend-Skeleton** aufbauen
8. 🔐 **Sicherheits-Tests** schreiben
9. 📜 **DSGVO-Dokumentation** finalisieren
10. 📥 **install.sh** schreiben

---

**Fragen?** Verfeinern Sie alle Punkte oder sollen wir direkt anfangen?

