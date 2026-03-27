# ElementTracker2026 - Projekt-Roadmap & Implementierungsplan

*Stand: 27. März 2026*

---

## PROJEKT-PHASEN

### PHASE 1: Grundlage & Setup (Wochen 1-2)

**Ziel:** Infrastruktur bereit, lokale Entwicklung möglich

| Task | Duration | Status |
|------|----------|--------|
| Repository initialisieren (Git) | 2h | ⏳ Ausstehend |
| Backend-Skelett (Express.js) | 4h | ⏳ Ausstehend |
| Frontend-Skelett (Next.js) | 4h | ⏳ Ausstehend |
| Datenbank-Schema (PostgreSQL) | 6h | ⏳ Ausstehend |
| `.env` & Config-System | 3h | ⏳ Ausstehend |
| Docker Setup (optional) | 4h | ⏳ Ausstehend |
| **TOTAL PHASE 1** | **~25h** | |

**Deliverable:** Dev-Environment mit allen Tools lauffähig

---

### PHASE 2: Backend API (Wochen 2-4)

**Ziel:** Alle REST-Endpoints funktional

| Task | Duration | Status |
|------|----------|--------|
| Auth System (Login/JWT) | 8h | ⏳ Ausstehend |
| Admin-Panel Endpoints | 8h | ⏳ Ausstehend |
| Entry Management Endpoints | 8h | ⏳ Ausstehend |
| Photo Upload Handler | 6h | ⏳ Ausstehend |
| Spatial Queries (GPS) | 8h | ⏳ Ausstehend |
| Input Validation & Error Handling | 6h | ⏳ Ausstehend |
| Rate Limiting & DDoS Protection | 4h | ⏳ Ausstehend |
| Audit Logging | 4h | ⏳ Ausstehend |
| Unit Tests (Backend) | 8h | ⏳ Ausstehend |
| **TOTAL PHASE 2** | **~60h** | |

**Deliverable:** API mit alle Endpoints, läuft auf http://localhost:3000

**Testing:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test"}'

# Sollte JWT-Token zurückgeben
```

---

### PHASE 3: Frontend UI (Wochen 4-6)

**Ziel:** Responsive Website mit allen Features

| Task | Duration | Status |
|------|----------|--------|
| Landing Page (Homepage) | 6h | ⏳ Ausstehend |
| Datenerfassungs-Form | 8h | ⏳ Ausstehend |
| Kartendarstellung (Leaflet) | 10h | ⏳ Ausstehend |
| Multi-Element Tracking UI | 6h | ⏳ Ausstehend |
| Admin-Panel Basis | 8h | ⏳ Ausstehend |
| Form Validation & Fehlerbehandlung | 4h | ⏳ Ausstehend |
| Mobile Responsive Design | 8h | ⏳ Ausstehend |
| Image Optimization & Lazy Loading | 4h | ⏳ Ausstehend |
| Accessibility (WCAG 2.1 AA) | 4h | ⏳ Ausstehend |
| **TOTAL PHASE 3** | **~58h** | |

**Deliverable:** Funktionierende Website auf https://localhost:3000

---

### PHASE 4: Integration & Testing (Wochen 6-7)

**Ziel:** Backend + Frontend vollständig integriert, keine Bugs

| Task | Duration | Status |
|------|----------|--------|
| End-to-End Tests (Selenium/Cypress) | 8h | ⏳ Ausstehend |
| Performance Testing & Optimization | 6h | ⏳ Ausstehend |
| Load Testing (Apache JMeter) | 4h | ⏳ Ausstehend |
| Security Testing (OWASP ZAP) | 6h | ⏳ Ausstehend |
| Browser Compatibility (Chrome, Firefox, Safari) | 4h | ⏳ Ausstehend |
| Mobile Testing (iOS, Android) | 4h | ⏳ Ausstehend |
| Bug Fixes & Refinement | 8h | ⏳ Ausstehend |
| **TOTAL PHASE 4** | **~40h** | |

**Deliverable:** Produktionsreife Code, alle Tests grün

---

### PHASE 5: Sicherheit & Compliance (Woches 7-8)

**Ziel:** DSGVO-konform, Alle Sicherheits-Standards erfüllt

| Task | Duration | Status |
|------|----------|--------|
| DSGVO-Audit & Dokumentation | 8h | ⏳ Ausstehend |
| Datenschutz-Seite schreiben | 4h | ⏳ Ausstehend |
| Impressum & Nutzungsbedingungen | 3h | ⏳ Ausstehend |
| Sicherheits-Tests durchführen | 6h | ⏳ Ausstehend |
| Backup & Disaster Recovery Plan | 6h | ⏳ Ausstehend |
| SSL/TLS Zertifikat (Let's Encrypt) | 2h | ⏳ Ausstehend |
| Penetrations-Test (optional, freiberuflich) | 0h | 🔲 Optional |
| **TOTAL PHASE 5** | **~29h** | |

**Deliverable:** DSGVO-Konformitätszertifikat, Security-Audit-Report

---

### PHASE 6: Installation & Deployment (Woches 8)

**Ziel:** Automatisiertes Setup-Skript, ready für Production

| Task | Duration | Status |
|------|----------|--------|
| `install.sh` schreiben (automatisch) | 8h | ⏳ Ausstehend |
| Systemd Service-Files | 3h | ⏳ Ausstehend |
| Nginx Config (Reverse Proxy) | 4h | ⏳ Ausstehend |
| Fail2Ban & DDoS-Config | 3h | ⏳ Ausstehend |
| Backup-Script (täglich) | 3h | ⏳ Ausstehend |
| Deployment-Guide schreiben | 4h | ⏳ Ausstehend |
| Test Installation on Clean System | 4h | ⏳ Ausstehend |
| **TOTAL PHASE 6** | **~29h** | |

**Deliverable:** production-ready Installation mit install.sh

---

### PHASE 7: Dokumentation & Übergabe (Woches 9)

**Ziel:** Alles dokumentiert, wartbar für andere Entwickler

| Task | Duration | Status |
|------|----------|--------|
| API-Dokumentation (OpenAPI/Swagger) | 4h | ⏳ Ausstehend |
| User-Guide (HTML/PDF) | 6h | ⏳ Ausstehend |
| Admin-Guide | 4h | ⏳ Ausstehend |
| Code-Dokumentation (JSDoc) | 6h | ⏳ Ausstehend |
| Troubleshooting Guide | 4h | ⏳ Ausstehend |
| FAQ & Common Issues | 3h | ⏳ Ausstehend |
| Training für Admin-User | 2h | ⏳ Ausstehend |
| **TOTAL PHASE 7** | **~29h** | |

**Deliverable:** Vollständige Dokumentation in /docs

---

## GESAMTÜBERSICHT

```
Phase 1: Grundlage          25h  ████░░░░░░░░░░░░░ (≈3 Tage)
Phase 2: Backend API        60h  █████████░░░░░░░░ (≈1.5 Wochen)
Phase 3: Frontend UI        58h  █████████░░░░░░░░ (≈1.5 Wochen)
Phase 4: Testing            40h  ██████░░░░░░░░░░░ (≈1 Woche)
Phase 5: Security/DSGVO     29h  ████░░░░░░░░░░░░░ (≈4 Tage)
Phase 6: Installation       29h  ████░░░░░░░░░░░░░ (≈4 Tage)
Phase 7: Docs & Übergabe    29h  ████░░░░░░░░░░░░░ (≈4 Tage)
─────────────────────────────────────────────────────────
TOTAL:                     270h  (≈8-9 Wochen Vollzeit)
```

---

## DETAILED DEVELOPMENT PLAN

### Phase 2a: Backend - Auth System

```javascript
// 1. User Model & DB
models/Admin.js  // bcrypt, JWT
migration: CREATE TABLE admins

// 2. Routes
routes/auth.js
  POST /auth/login
  POST /auth/logout
  POST /auth/refresh

// 3. Middleware
middleware/auth.js  // JWT validation
middleware/rateLimit.js  // 5 attempts per 15 min

// 4. Error Handling
utils/errorHandler.js
utils/logger.js

// 5. Tests
tests/auth.test.js
  ✓ Login with correct credentials
  ✓ Login fails with wrong password
  ✓ Token expires after 1 hour
  ✓ Rate limiting blocks at 5 attempts
```

---

### Phase 2b: Backend - Entry Management

```javascript
// 1. Entry Model
models/Entry.js
  - element_id
  - timestamp
  - location_point (PostGIS)
  - address
  - photo_filename
  - comment
  - notification_email

// 2. Routes
routes/entries.js
  POST /entries  // Public, rate-limited
  GET /entries?element_id=X
  GET /entries/:id
  PATCH /admin/entries/:id
  DELETE /admin/entries/:id

// 3. File Upload Handler
middleware/fileUpload.js
  - Max 3MB check
  - MIME type: image/jpeg, image/png
  - Virus scan (optional: ClamAV)
  - Image optimization (sharp library)

// 4. Geospatial
services/geoService.js
  - Convert address → coords (geocoding)
  - Reverse geocoding (coords → address)
  - Distance calculations

// 5. Tests
tests/entries.test.js
  ✓ Create entry with valid data
  ✓ Rate limit: 10 per hour
  ✓ Photo upload validates size
  ✓ GPS coordinates stored correctly
```

---

### Phase 3a: Frontend - Landing Page

```jsx
// pages/index.jsx
components/
  ├─ Header.jsx      // Navigation
  ├─ Hero.jsx        // Title + Image Carousel
  ├─ Features.jsx    // What is ElementTracker?
  ├─ CTA.jsx         // "Start Tracking" Button
  ├─ Footer.jsx      // Links + Contact
  └─ PrivacyBanner.jsx  // GDPR Cookie notice

// Styles
styles/home.module.css
tailwind.config.js  // Mobile-first responsive
```

---

### Phase 3b: Frontend - Data Entry Form

```jsx
// pages/entries/new.jsx
components/
  ├─ ElementSelect.jsx      // Dropdown mit approved Elements
  ├─ DateTimePicker.jsx     // YYYY-MM-DD HH:mm
  ├─ LocationInput.jsx      // GPS oder Adresse
  ├─ PhotoUpload.jsx        // Drag & Drop, Preview
  ├─ CommentField.jsx       // Optional Textarea
  ├─ EmailField.jsx         // Optional, mit Validation
  ├─ ConsentCheckbox.jsx    // Datenschutz akzeptanz
  └─ SubmitButton.jsx

// API Integration
hooks/useEntryApi.js

// Validation
utils/validation.js
  - validateCoordinates()
  - validateEmail()
  - validatePhotoSize()
  - validateTimestamp()

// Error Handling
components/ErrorMessage.jsx
components/SuccessNotification.jsx
```

---

### Phase 3c: Frontend - Karte

```jsx
// pages/map.jsx
components/
  ├─ MapContainer.jsx      // Leaflet Map
  ├─ ElementSelector.jsx   // Multi-select (max 5)
  ├─ MarkerPopup.jsx       // Click detail
  ├─ TimelineFilter.jsx    // Date range
  └─ Legend.jsx            // Color-coded elements

// Libraries
"leaflet": "^1.9.0"
"react-leaflet": "^4.0.0"

// Map Features
- Zoom & Pan
- Different colors for each element
- Click marker → detail view
- Timeline filter (date from/to)
- Toggle markers on/off
```

---

### Phase 3d: Frontend - Admin Panel

```jsx
// pages/admin/
├─ index.jsx         // Dashboard
├─ elements/
│  ├─ index.jsx      // List all
│  ├─ [id].jsx       // Detail & Edit
│  └─ new.jsx        // Create new
├─ entries/
│  ├─ index.jsx      // List
│  ├─ [id].jsx       // Edit/Delete
├─ settings/
│  ├─ index.jsx      // Site settings
│  ├─ account.jsx    // Password change
│  ├─ dsgvo.jsx      // DSGVO requests
│  └─ content.jsx    // Datenschutz/Impressum
└─ audit/
   └─ index.jsx      // Audit logs

// Authentication
components/AdminRoute.jsx  // Redirect if not logged in
```

---

## MONTHLY MILESTONES

```
March 27 - April 3    | Phase 1: Infrastruktur
April 3  - April 10   | Phase 2: Backend API
April 10 - April 17   | Phase 3: Frontend
April 17 - April 24   | Phase 4: Testing & Integration
April 24 - May 1      | Phase 5: Security & DSGVO
May 1   - May 8       | Phase 6: Installation & Deployment
May 8   - May 15      | Phase 7: Documentation
May 15  - May 20      | Buffer: Bug-Fixes, Polish
May 20  - May 27      | LAUNCH READY ✅
```

---

## SUCCESS CRITERIA (Definition of Done)

### MVP (Minimum Viable Product)

✅ **Data Entry:**
- [ ] Form für alle 8 Datenfelder
- [ ] Datenspeicherung in PostgreSQL
- [ ] Foto-Upload (max 3MB)

✅ **Kartendarstellung:**
- [ ] Alle Punkte einer Element-ID auf Karte
- [ ] Zoom & Pan
- [ ] Punkt-Details bei Klick

✅ **Admin:**
- [ ] ID-Vorregistrierung
- [ ] Freigabe / Löschung
- [ ] Admin-Login mit JWT

✅ **Sicherheit:**
- [ ] HTTPS/SSL
- [ ] Rate Limiting
- [ ] Passwort-Hashing (bcrypt)

✅ **DSGVO:**
- [ ] Datenschutz-Seite
- [ ] Datenexport-API
- [ ] Datenlöschungs-API
- [ ] Audit Logging

✅ **Installation:**
- [ ] install.sh funktioniert auf frischem Linux Mint
- [ ] Alle Services starten automatisch

---

## NICE-TO-HAVE (Phase 8+, bei Zeit)

- [ ] 2FA für Admin-Login (Authenticator App)
- [ ] E-Mail Notifications bei neuen Einträgen
- [ ] Heatmap-Visualisierung (where most tracked)
- [ ] Historical Timeline View
- [ ] Photo Gallery per Element
- [ ] Advanced Search & Filtering
- [ ] API Rate Limit Dashboard (Admin)
- [ ] Automated Testing (Cypress E2E)
- [ ] Multi-language Support (i18n)
- [ ] Dark Mode

---

## ABNAHME-PROZESS

Vor **GoLive**:

1. **Client Acceptance Test (CAT)**
   - [ ] Alle Features funktionieren wie spezifiziert
   - [ ] Performance akzeptabel (< 2s page load)
   - [ ] Mobile-responsive OK
   - [ ] Admin-Panel usable

2. **Security Review**
   - [ ] OWASP Top 10 geaddressed
   - [ ] SSL Lab: A+ rating
   - [ ] DSGVO-Compliance nachgewiesen
   - [ ] Backup & Recovery getestet

3. **User Acceptance Test (UAT)**
   - [ ] Admin trainiert
   - [ ] Testdaten vollständig
   - [ ] Dokumentation OK
   - [ ] SLA defined (Uptime, Response time)

4. **Sign-off**
   - [ ] Client sign-off form unterschrieben
   - [ ] Production release approved
   - [ ] 24/7 Support plan in place

---

Nächste Schritte: Wollen Sie jetzt mit **Phase 1: Repository Setup** beginnen?

