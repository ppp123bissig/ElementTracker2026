# ElementTracker2026 - Sicherheit & DSGVO Compliance

*Stand: 27. März 2026*

---

## 1. SICHERHEITS-ÜBERSICHT

```
┌──────────────────────────────────────────────────────┐
│           SECURITY LAYERS - ElementTracker           │
├──────────────────────────────────────────────────────┤
│ 1. Network Layer                                      │
│    ├─ HTTPS/TLS 1.3 (Let's Encrypt)                 │
│    ├─ Nginx Reverse Proxy mit Security Headers      │
│    └─ Fail2Ban gegen Brute-Force                    │
│                                                       │
│ 2. API Layer                                          │
│    ├─ Rate Limiting gegen DDoS/Brute-Force          │
│    ├─ Input Validation & Sanitization               │
│    ├─ JWT Authentication                             │
│    ├─ CORS & CSRF Protection                        │
│    └─ SQL Injection Prevention (Prepared Statements)│
│                                                       │
│ 3. Authentication & Authorization                    │
│    ├─ Passwort: bcrypt (10+ Rounds)                 │
│    ├─ Sessions: JWT + HTTP-Only Cookies             │
│    ├─ Admin-Panel: 2FA (Optional, später)           │
│    └─ Role-Based Access Control (RBAC)              │
│                                                       │
│ 4. Data Protection                                    │
│    ├─ Passwords: bcrypt Hash (Never Plaintext)      │
│    ├─ File Upload: Virus-Scan + MIME-Type Check    │
│    ├─ Photo Storage: Separate vom Code              │
│    ├─ Encryption: HTTPS für Transit, DB-Password   │
│    └─ Backups: Verschlüsselt + Redundant            │
│                                                       │
│ 5. Audit & Compliance                                │
│    ├─ Audit Logging: Alle Änderungen tracked        │
│    ├─ DSGVO: Consent Tracking, Datenexport, Löschung│
│    ├─ Datenschutz-Seite: Impressum, Privacy Policy │
│    └─ Cookie-Banner: Privacy by Default             │
└──────────────────────────────────────────────────────┘
```

---

## 2. OWASP TOP 10 MITIGATION

### 2.1 Injection (z.B. SQL Injection)

**Threat:** Benutzer input wird direkt in SQL-Query eingefügt
```
// ❌ NICHT SO:
db.query(`SELECT * FROM entries WHERE id = ${id}`);

// ✅ SO:
db.query('SELECT * FROM entries WHERE id = $1', [id]);
```

**Implementierung:**
- PostgreSQL: Immer Parameterized Queries verwenden
- `node-postgres` (pg library) macht das automatisch
- Input Validation auf der App-Ebene zusätzlich

---

### 2.2 Broken Authentication

**Threat:** Schwaches Passwort, Session Hijacking, etc.

**Implementierung:**
```javascript
// ✅ Passwort hashen mit bcrypt
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);  // 10 Rounds

// ✅ Login mit Timeoutschutz
const isValid = await bcrypt.compare(inputPassword, storedHash);
if (!isValid) {
  // Intentional: Keine spezifische Error-Message
  throw new Error('Invalid credentials');
}

// ✅ JWT Token mit Expiry
const token = jwt.sign(
  { adminId: admin.id },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// ✅ Cookies: HTTP-Only + Secure + SameSite
res.cookie('token', token, {
  httpOnly: true,
  secure: true,  // HTTPS nur
  sameSite: 'strict',
  maxAge: 3600000
});
```

---

### 2.3 Sensitive Data Exposure

**Threat:** Daten im Transit unverschlüsselt, unsichere Storage

**Implementierung:**
- ✅ HTTPS/TLS 1.3 für alle Verbindungen
- ✅ `.env` Datei mit Secrets (nicht im Git!)
- ✅ Keine Passwort-Logs (Logger muss Secrets filtern)
- ✅ Database-Verbindung über SSL
- ✅ Backups mit Encryption (openssl oder gpg)

---

### 2.4 XML External Entities (XXE)

**Attack Vector:** XML/SVG Upload mit Entity-Expansion
**Implementierung:** Nicht relevant. Sie akzeptieren nur JPG/PNG Fotos. XML wird nicht parsed.

---

### 2.5 Broken Access Control

**Threat:** Benutzer kann Daten anderer Elemente / Admin-Funktionen aufrufen

**Implementierung:**
```javascript
// ✅ Middleware: Admin-Schutz
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.adminId) return res.status(403).json({ error: 'Not admin' });
    req.adminId = decoded.adminId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ In Endpoint:
app.patch('/admin/elements/:id/approve', requireAdmin, async (req, res) => {
  // Nur Admins können freigeben
  const element = await Element.findById(req.params.id);
  element.is_approved = true;
  await element.save();
  // ... audit log
});
```

---

### 2.6 Security Misconfiguration

**Threat:** Default-Passwort, fehlende Security Headers, etc.

**Implementierung:**
```javascript
// ✅ Helmet für Security Headers
const helmet = require('helmet');
app.use(helmet());

// ✅ Environment-spezifische Config
if (process.env.NODE_ENV === 'production') {
  app.use(enforce HTTPS redirect);
  app.disable('x-powered-by');  // Keine Express-Signatur
}

// ✅ .env Datei ist erforderlich (not optional)
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET missing!');
```

---

### 2.7 Cross-Site Scripting (XSS)

**Threat:** Benutzer input wird unsanitized in HTML eingefügt

**Implementierung:**
```javascript
// ✅ Express Headers sanitization
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());

// ✅ Frontend: React escapes per default
// React-JSX: <div>{userInput}</div> ist sicher

// ❌ Nur nicht mit dangerouslySetInnerHTML!
// ❌ <div dangerouslySetInnerHTML={{__html: userInput}}></div>
```

---

### 2.8 Insecure Deserialization

**Threat:** Benutzer-JSON wird ohne Prüfung parsed

**Implementierung:**
```javascript
// ✅ Schema Validation mit joi/zod
const schema = Joi.object({
  element_id: Joi.string().required().max(50),
  timestamp: Joi.date().iso().required(),
  notification_email: Joi.string().email().optional()
});

const { error, value } = schema.validate(req.body);
if (error) return res.status(400).json({ error: error.details });
```

---

### 2.9 Using Components with Known Vulnerabilities

**Threat:** npm Packages mit Security-Bugs

**Implementierung:**
```bash
# ✅ Regelmäßig updaten
npm audit
npm audit fix

# ✅ In CI/CD Pipeline
npm ci
npm audit --production --audit-level=moderate

# ✅ Dependabot oder Snyk für Auto-Updates
```

---

### 2.10 Insufficient Logging & Monitoring

**Threat:** Security Events werden nicht geloggt

**Implementierung:**
```javascript
// ✅ Audit Logging für alle Admin-Aktionen
async function logAdminAction(adminId, action, recordId, oldValues, newValues) {
  await AuditLog.create({
    table_name: 'entries',
    record_id: recordId,
    action: action,  // INSERT, UPDATE, DELETE
    old_values: oldValues,
    new_values: newValues,
    changed_by: adminId,
    changed_at: new Date(),
    ip_address: req.ip
  });
}

// ✅ Login-Versuche loggen
if (loginFailed) {
  logger.warn(`Failed login attempt for ${username} from ${ip}`, {
    timestamp: new Date(),
    username,
    ip,
    userAgent: req.headers['user-agent']
  });
}

// ✅ Rate Limit Alerts
if (rateLimitExceeded) {
  logger.error(`Rate limit exceeded from IP ${ip}`, {
    endpoint: req.path,
    ip,
    timestamp: new Date()
  });
}
```

---

## 3. DSGVO-COMPLIANCE (Deutsche Datenschutz-Grundverordnung)

### 3.1 Rechtliche Anforderungen

| Anforderung | Implementierung | Status |
|---|---|---|
| **Rechtliche Basis** | Einwilligung via Checkbox | ✅ Frontend-Form |
| **Datenschutz-Seite** | Öffentliche Seite /datenschutz | ✅ Zu erstellen |
| **Impressum** | /impressum mit Verantwortlicher | ✅ Zu erstellen |
| **Datenexport** | POST /dsgvo/export-request | ✅ API vorhanden |
| **Recht auf Löschung** | POST /dsgvo/delete-request | ✅ API vorhanden |
| **Berichtigung** | Admin kann Einträge editieren | ✅ Implementiert |
| **Data Minimization** | Nur notwendige Daten sammeln | ✅ Spec erfüllt |
| **Privacy by Default** | Fotos/E-Mails optional | ✅ Spec erfüllt |
| **Audit Trail** | audit_logs Tabelle | ✅ DB vorhanden |
| **Datenschutz-Folgenabschätzung (DSFA)** | Zu dokumentieren | ⚠️ Später |

---

### 3.2 Datenschutz-Absichtserklärung (Template)

```markdown
# Datenschutzerklärung

## Verantwortlicher
Max Mustermann
Musterstraße 1
10115 Berlin
E-Mail: admin@example.com

## Rechtsgrundlage
Verarbeitung auf Basis Ihrer ausdrücklichen Einwilligung (Art. 6 Abs. 1 a DSGVO).

## Datenkategorien
1. **Lokalisierungsdaten**: GPS-Koordinaten oder Adresse
2. **Zeitstempel**: Datum & Uhrzeit der Beobachtung
3. **Fotos**: Optional hochgeladene Bilder (max 3 MB)
4. **Kontaktdaten**: E-Mail-Adresse (optional)
5. **Kommentare**: Freitext-Notizen

## Zweck der Verarbeitung
Verfolgung und Dokumentation von Beobachtungspunkten zur Nachverfolgung spezifischer Objekte.

## Empfänger (wer sieht die Daten)
- Admin: Zur Qualitätskontrolle und Freigabeentscheidung
- Öffentlich: Alle Einträge sind auf der Karte sichtbar (keine Benutzer-Zuordnung)
- Keine Weitergabe an Dritte

## Speicherdauer
- Während das Element aktiv ist PLUS 30 Tage nach Deaktivierung
- Auf Anfrage: Sofortige Löschung möglich

## Ihre Rechte
- **Auskunft**: POST /dsgvo/export-request (Ihre Daten herunterladen)
- **Berichtigung**: Kontaktieren Sie admin@example.com
- **Löschung**: POST /dsgvo/delete-request
- **Einspruch**: admin@example.com
- **Beschwerde**: Bundesdatenschutzbeauftragte (BfDI) oder Landesamt

## Sicherheit
- HTTPS-Verschlüsselung für alle Datenübertragung
- Passwörter mit bcrypt gehasht
- Tägliche Backups mit Verschlüsselung
- Zugriff auf Admin-Tools mit JWT-Token

## Cookies
Diese Website nutzt keine Tracking-Cookies.
Nur funktionale Cookies für Session-Management (HTTP-Only, Secure).

## Kontakt
Datenschutzbeauftragte: [optional, wenn >20 Mitarbeiter]
E-Mail: datenschutz@example.com
```

---

### 3.3 Implementierungs-Checkliste

```
☐ 1. Datenschutz-Seite /datenschutz publizieren
☐ 2. Impressum /impressum mit Kontaktdaten
☐ 3. Einwilligungsformular bei Datenerfassung
     "Ich akzeptiere die Datenschutzerklärung"
☐ 4. Cookie-Banner (Newsletter/Tracking) - FALLS RELEVANT
     (Sie sollten KEIN Tracking nutzen!)
☐ 5. Datenexport-API funktional testen
☐ 6. Datenlöschungs-API funktional testen
☐ 7. Audit-Logging für Admin-Aktionen aktivieren
☐ 8. Backup-Strategie dokumentiert + getestet
☐ 9. Datenschutz-Folgenabschätzung (DSFA) Document
☐ 10. Externe Sicherheits-Prüfung / Penetration-Test (optional)
```

---

### 3.4 Datenschutz-Folgenabschätzung (DSFA) - Vereinfacht

```
Risikobetrachtung:

HIGH RISK:
- GPS-Daten sind personenbezogene Daten und ermöglichen Nachverfolgung
- Fotos können biometrische Daten enthalten
- E-Mails können auf reale Personen zurückgeführt werden

MITIGATIONS:
- Einwilligung IMMER erforderlich
- Daten-Löschung möglich (DSGVO Art. 17)
- Audit Trail für alle Zugriffe
- Keine Profilbildung, kein Tracking
- Keine Weitergabe an Dritte
- Tägliche Backups für Disaster Recovery
- HTTPS + bcrypt Hash
- Nutzer-Anonymisierung möglich (nur ID sichtbar)

OVERALL RISK: MEDIUM (mit Mitigations: LOW)
```

---

## 4. ADMIN-PASSWORT-SETUP

```bash
# ✅ Sicheres Passwort generieren
openssl rand -base64 12

# ✅ Passwort in .env eintragen
DATABASE_PASSWORD=xyz...
JWT_SECRET=...
ADMIN_DEFAULT_PASSWORD=...  # NUR temporär!

# ✅ Nach Start: Admin-Shell
node scripts/create-admin.js

# Prompts:
# Username: admin
# Password: ••••••••••
# Email: admin@example.com

# ✅ Dann sofort Passwort im Admin-Panel ändern
# https://elementtracker.local/admin/settings/change-password
```

---

## 5. DDoS & DoS PROTECTION

### 5.1 Rate Limiting (express-rate-limit)

```javascript
const rateLimit = require('express-rate-limit');

// ✅ Strikte Limits für Admin-Login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // 5 attempts
  message: 'Zu viele Login-Versuche. Bitte später erneut versuchen.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== 'POST'
});
app.post('/auth/login', loginLimiter, handleLogin);

// ✅ Moderate Limits für Daten-Erfassung
const entriesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,  // 10 entries per hour
  skipSuccessfulRequests: false
});
app.post('/entries', entriesLimiter, createEntry);

// ✅ Großzügig für Lesezugriffe
const readLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100  // 100 requests per minute
});
app.get('/entries', readLimiter, getEntries);
```

---

### 5.2 Fail2Ban (auf Linux)

```bash
# ✅ install.sh installiert Fail2Ban

# /etc/fail2ban/jail.d/elementtracker.conf
[DEFAULT]
bantime = 3600  # 1 hour
findtime = 600  # 10 min window
maxretry = 5    # 5 failed attempts

[elementtracker-login]
enabled = true
port = http,https
filter = elementtracker-login
logpath = /var/log/elementtracker/app.log
maxretry = 5
```

---

### 5.3 Cloudflare DDoS Protection (Optional)

Kostenlos über Cloudflare:
- ✅ Automatisches DDoS-Mitigation
- ✅ WAF (Web Application Firewall)
- ✅ Bot Management
- ✅ Rate Limiting

Konfiguration:
```
1. Domain zu Cloudflare hinzufügen
2. Nameserver wechseln
3. SSL Mode: "Full (strict)"
4. DDoS-Level: "High"
5. WAF Rules: "Medium"
```

---

## 6. BACKUP-STRATEGIE

### 6.1 Tägliches Backup (cron job)

```bash
#!/bin/bash
# /usr/local/bin/backup-elementtracker.sh

set -e

BACKUP_DIR="/data/backups/elementtracker"
DB_NAME="elementtracker"
ARCHIVE_DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# ✅ 1. PostgreSQL Dump
pg_dump --format=custom --compress=9 \
  --file="$BACKUP_DIR/elementtracker_db_${ARCHIVE_DATE}.dump" \
  $DB_NAME

# ✅ 2. Fotos komprimieren
tar --gzip --create \
  --file="$BACKUP_DIR/elementtracker_photos_${ARCHIVE_DATE}.tar.gz" \
  /var/www/elementtracker/uploads/photos/

# ✅ 3. Mit GPG verschlüsseln
gpg --symmetric --cipher-algo AES256 \
  "$BACKUP_DIR/elementtracker_db_${ARCHIVE_DATE}.dump"

# ✅ 4. Cloud-Upload (optional)
#aws s3 sync "$BACKUP_DIR" s3://elementtracker-backups/ \
#  --delete --sse=AES256

# ✅ 5. Alte Backups löschen
find "$BACKUP_DIR" -name "elementtracker_*" -mtime +$RETENTION_DAYS -delete

echo "Backup erfolgreich: $ARCHIVE_DATE"
```

**In crontab:**
```cron
# Daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-elementtracker.sh >> /var/log/elementtracker-backup.log 2>&1
```

---

### 6.2 Restore (Notfall)

```bash
# ✅ GPG decrypt
gpg --decrypt elementtracker_db_20260327_000000.dump.gpg > db.dump

# ✅ PostgreSQL restore
pg_restore --clean --if-exists --dbname=elementtracker db.dump

# ✅ Fotos restore
tar --extract --gzip --file=elementtracker_photos_20260327_000000.tar.gz \
  --directory=/var/www/elementtracker/
```

---

## 7. DEPLOYMENT CHECKLIST

```
SICHERHEIT:
☐ HTTPS/SSL Zertifikat (Let's Encrypt)
☐ Nginx Reverse Proxy konfiguriert
☐ Fail2Ban installiert & konfiguriert
☐ Firewall-Regeln gesetzt (ufw)
☐ SSH-Keys statt Passwort-Login
☐ Fail2Ban Block-List aufgewärmt

SECRETS & CONFIG:
☐ .env Datei mit JWT_SECRET, DB_PASSWORD
☐ .env ist in .gitignore (nicht im Repo!)
☐ Passwort-Manager / Vault für Credentials
☐ App läuft unter non-root User (z.B. 'elementtracker')

DATABASE:
☐ PostgreSQL läuft auf localhost (nicht öffentlich)
☐ PostGIS Extension installiert
☐ Backup-Script aktiv & getestet
☐ pg_dump mit Compression

BACKUP:
☐ Daily Backup Script läuft
☐ Backups werden verschlüsselt (GPG)
☐ Restore-Prozess dokumentiert & getestet
☐ Backups sind redundant (lokale HDD + Cloud)

MONITORING:
☐ Systemd Service für App (auto-restart)
☐ Log-Rotation konfiguriert
☐ Error Logs werden überwacht
☐ Uptime-Monitor konfiguriert (optional)

COMPLIANCE:
☐ Datenschutz-Seite publiziert
☐ Impressum publiziert
☐ Datenexport-API funktional
☐ Datenlöschungs-API funktional
☐ Audit-Logging aktiv
```

---

## 8. SICHERHEITS-TESTING

```bash
# ✅ Kostenlose Online-Tools

# 1. SSL Labs
https://www.ssllabs.com/ssltest/

# 2. Mozilla Observatory
https://observatory.mozilla.org/

# 3. NIST NVD
https://nvd.nist.gov/

# ✅ Lokal testen

npm install -g npm-check-updates
npm outdated  # Outdated packages finden
npm audit     # Security vulnerabilities

# ✅ Penetration Testing (optional, später)
# owasp ZAP: https://www.zaproxy.org/
# Burp Suite Community: https://portswigger.net/burp/communitydownload
```

---

## NÄCHSTE SCHRITTE

1. ✅ Diese Sicherheits-Dokumentation verstanden?
2. → Datenschutz-Seite & Impressum schreiben
3. → install.sh mit allen Security-Tools schreiben
4. → Sicherheits-Tests durchführen
5. → Produktiv-Deployment!

