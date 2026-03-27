# ElementTracker2026 - REST API Spezifikation

*Stand: 27. März 2026*
*Format: OpenAPI 3.0 Specification*

---

## BASE

```
Base URL: https://api.elementtracker.local/api/v1
Authentication: JWT Bearer Token
Content-Type: application/json
```

---

## 1. AUTHENTICATION & ADMIN ENDPOINTS

### 1.1 Admin Login
```
POST /auth/login

Request Body:
{
  "username": "admin",
  "password": "geheim123"
}

Response (200):
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "admin": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}

Response (401):
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Security:**
- Rate Limiting: Max 5 Loginversuche pro 15 Minuten (IP-basiert)
- Password Hash: bcrypt mit Salt
- Token: JWT mit 1h expiry
- HTTPS nur!

---

### 1.2 Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 1.3 Token Refresh
```
POST /auth/refresh
Authorization: Bearer {token}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

---

## 2. ELEMENT MANAGEMENT (Admin Only)

### 2.1 Alle Elemente abrufen
```
GET /admin/elements?approved=false&limit=50&offset=0
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "ELEMENT001",
      "name": "Wanderfalke 2026",
      "owner_name": "Max Mustermann",
      "is_approved": false,
      "entry_count": 5,
      "created_at": "2026-03-01T10:00:00Z"
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

---

### 2.2 Neues Element vorgeben (Pre-Registration)
```
POST /admin/elements
Authorization: Bearer {token}

Request Body:
{
  "id": "ELEMENT001",
  "name": "Wanderfalke 2026",
  "owner_name": "Max Mustermann",
  "description": "Optional: Detailfoto"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "ELEMENT001",
    "name": "Wanderfalke 2026",
    "owner_name": "Max Mustermann",
    "is_approved": false,
    "created_at": "2026-03-27T14:30:00Z"
  }
}

Response (400):
{
  "success": false,
  "error": "Element mit ID 'ELEMENT001' existiert bereits"
}
```

**Validierung:**
- `id`: Eindeutig, max 50 chars, alphanumeric + Underscore
- `name`: Erforderlich, max 255 chars
- `owner_name`: Erforderlich, max 255 chars

---

### 2.3 Element freigeben
```
PATCH /admin/elements/{id}/approve
Authorization: Bearer {token}

Request Body:
{
  "note": "Freigegeben nach Überprüfung"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "ELEMENT001",
    "is_approved": true,
    "updated_at": "2026-03-27T14:35:00Z"
  }
}
```

---

### 2.4 Element und alle Einträge löschen
```
DELETE /admin/elements/{id}
Authorization: Bearer {token}

Request Body:
{
  "reason": "Fehlerhafte Registrierung"
}

Response (200):
{
  "success": true,
  "message": "Element und 5 Einträge gelöscht"
}
```

**Note:** Soft-delete mit `deleted_at` timestamp für DSGVO-Audit

---

## 3. EINTRÄGE (DATA ENTRIES) - Public API

### 3.1 Neue Daten für Element eintragen
```
POST /entries
(Kein Token nötig - Public API, aber Rate-Limited!)

Request Body (multipart/form-data):
{
  "element_id": "ELEMENT001",
  "timestamp": "2026-03-27 14:30",
  "location_point": {
    "latitude": 52.52,
    "longitude": 13.405
  },
  "address": "Berlin, Germany",
  "location_name": "Tiergarten",
  "comment": "Vogel beobachtet",
  "notification_email": "observer@example.com",
  "photo": <binary file, max 3MB>
}

Response (201):
{
  "success": true,
  "data": {
    "id": 12345,
    "element_id": "ELEMENT001",
    "timestamp": "2026-03-27T14:30:00Z",
    "coordinates": {
      "latitude": 52.52,
      "longitude": 13.405
    },
    "photo_url": "/photos/entry_12345_abc123.jpg",
    "created_at": "2026-03-27T14:31:00Z"
  }
}

Response (400):
{
  "success": false,
  "errors": [
    "Foto ist 5MB groß, max 3MB erlaubt",
    "Timestamp muss Zukunft sein"
  ]
}
```

**Validierung:**
- `element_id`: Muss existieren und approved sein
- `timestamp`: ISO 8601 oder YYYY-MM-DD HH:mm
- `location_point` ODER `address`: Mindestens eins erforderlich
- `photo`: Max 3MB (JPG/PNG), automatisch optimieren
- `notification_email`: Valid E-Mail (optional), Double-Opt-In erforderlich

**Security:**
- Rate Limiting: Max 10 Einträge pro IP pro Stunde
- File Upload: Virus-Scan (optional: ClamAV)
- CORS: Nur von eigener Domain

---

### 3.2 Einträge eines Elements abrufen
```
GET /entries?element_id=ELEMENT001&limit=50&offset=0
(Public API)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "element_id": "ELEMENT001",
      "timestamp": "2026-03-27T14:30:00Z",
      "coordinates": {
        "latitude": 52.52,
        "longitude": 13.405
      },
      "address": "Berlin, Germany",
      "location_name": "Tiergarten",
      "comment": "Vogel beobachtet",
      "photo_url": "/photos/entry_12345_abc123.jpg",
      "created_at": "2026-03-27T14:31:00Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

**Query Parameter:**
- `element_id`: Erforderlich
- `limit`: Max 100 (default 50)
- `offset`: Pagination (default 0)
- `date_from`, `date_to`: Filter nach Zeitraum (optional)

**Sorting:** Standard: DESC nach timestamp

---

### 3.3 Eintrag abrufen (Detail)
```
GET /entries/{id}

Response (200):
{
  "success": true,
  "data": {
    "id": 12345,
    "element_id": "ELEMENT001",
    "element_name": "Wanderfalke 2026",
    "element_owner": "Max Mustermann",
    "timestamp": "2026-03-27T14:30:00Z",
    "coordinates": {
      "latitude": 52.52,
      "longitude": 13.405
    },
    "address": "Berlin, Germany",
    "location_name": "Tiergarten",
    "comment": "Vogel beobachtet",
    "photo_url": "/photos/entry_12345_abc123.jpg",
    "created_at": "2026-03-27T14:31:00Z"
  }
}
```

---

### 3.4 Eintrag aktualisieren (Admin Only)
```
PATCH /admin/entries/{id}
Authorization: Bearer {token}

Request Body:
{
  "comment": "Gekürzte Beobachtung",
  "location_name": "Tiergarten - Neubau"
}

Response (200):
{
  "success": true,
  "data": { /* updated entry */ }
}
```

---

### 3.5 Eintrag löschen (Admin Only)
```
DELETE /admin/entries/{id}
Authorization: Bearer {token}

Request Body:
{
  "reason": "Versehentlich doppelt eingegeben"
}

Response (200):
{
  "success": true,
  "message": "Eintrag gelöscht"
}
```

---

## 4. KARTENDARSTELLUNG - Spatial Queries

### 4.1 Einträge in Polygon abrufen (z.B. für Kartenbounds)
```
GET /entries/map?bounds=52.48,13.38,52.56,13.48&element_id=ELEMENT001

Response (200):
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "coordinates": {
        "latitude": 52.52,
        "longitude": 13.405
      },
      "timestamp": "2026-03-27T14:30:00Z",
      "element_id": "ELEMENT001",
      "element_color": "#FF5733"  // Für Multi-Element Tracking
    }
  ]
}
```

**Parameter:**
- `bounds`: `min_lat,min_lon,max_lat,max_lon`
- `element_id`: Optional, Komma-getrennt für Multi-Select (max 5)
- `date_from`, `date_to`: Optional, Filter nach Zeitraum

---

## 5. DSGVO & DATENSCHUTZ

### 5.1 Datenexport anfordern
```
POST /dsgvo/export-request

Request Body:
{
  "email": "observer@example.com",
  "element_id": "ELEMENT001"  // Optional: nur für spezifisches Element
}

Response (202):
{
  "success": true,
  "message": "Anfrage akzeptiert. Sie erhalten einen Link in Ihrer E-Mail."
}

Email-Template:
Hallo,

Ihre Anfrage zum Datenexport wurde akzeptiert. 
Ihr Download-Link ist verfügbar für 7 Tage: 
https://elementtracker.local/downloads/export_xyz.zip

Datenschhutz-Info: Die ZIP-Datei enthält alle zu Ihrer E-Mail verknüpften Einträge.
```

---

### 5.2 Datenlöschung anfordern
```
POST /dsgvo/delete-request

Request Body:
{
  "email": "observer@example.com",
  "reason": "Ich benötige diese Daten nicht mehr"
}

Response (202):
{
  "success": true,
  "message": "Anfrage eingegangen. Bitte überprüfen Sie Ihre E-Mail."
}

Email-Template:
Hallo,

Sie haben beantragt, Ihre Daten zu löschen.
Aus Sicherheitsgründen muss ein Admin dies bestätigen.
Bestätigungslink (gültig 24h): https://elementtracker.local/confirm-delete/token_xyz

Datenschutz-Info: Dies ist ein 2-Faktor-Prozess für DSGVO-Compliance.
```

---

### 5.3 Datenlöschungs-Anfrage genehmigen (Admin)
```
PATCH /admin/dsgvo/requests/{id}/approve
Authorization: Bearer {token}

Request Body:
{
  "approved": true,
  "note": "Gelöscht, Audit-Log erhalten"
}

Response (200):
{
  "success": true,
  "message": "Anfrage genehmigt. 12 Einträge wurden gelöscht."
}
```

---

## 6. FEHLERBEHANDLUNG

Alle Error-Responses folgen diesem Format:

```
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": { /* optional */ }
}
```

**HTTP Status Codes:**
- `200`: OK
- `201`: Created
- `202`: Accepted (Async Operations)
- `400`: Bad Request (Validierungsfehler)
- `401`: Unauthorized (Token fehlend/ungültig)
- `403`: Forbidden (Permission denied)
- `404`: Not Found
- `409`: Conflict (z.B. Element-ID existiert bereits)
- `413`: Payload Too Large (Foto > 3MB)
- `429`: Too Many Requests (Rate Limit exceeded)
- `500`: Internal Server Error

---

## 7. RATE LIMITING

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1648389600

Endpoints:
- /auth/login: 5 pro 15 min per IP
- /entries (POST): 10 pro Stunde per IP
- /entries (GET): 100 pro min per IP
- /dsgvo/*: 5 pro Tag per Email
- /admin/*: 50 pro min per Token
```

---

## 8. BEISPIEL-WORKFLOWS

### Workflow A: Benutzer erfasst neuen Datenpunkt

```
1. GET /entries?element_id=ELEMENT001
   → Zeige alle bisherigen Einträge auf Karte

2. POST /entries
   → Erfasse neuen Punkt
   → Optional: Foto hochladen

3. Manuell (im Browser):
   → Admin erhält E-Mail "Neuer Eintrag für ELEMENT001"
   → Eintrag wird auf Karte angezeigt
```

---

### Workflow B: Admin genehmigt neue Element-ID

```
1. Admin sieht Voreintrag im Admin-Panel
   GET /admin/elements?approved=false

2. Admin überprüft Details & genehmigt
   PATCH /admin/elements/ELEMENT002/approve

3. E-Mail an Requester
   → Element ist nun freigegeben
   → Benutzer kann Einträge erfassen
```

---

### Workflow C: Benutzer fordert Datenlöschung an

```
1. Benutzer klickt "Meine Daten löschen"
   POST /dsgvo/delete-request
   → E-Mail mit Bestätigungs-Link

2. Benutzer bestätigt in E-Mail
   → Admin sieht Anfrage im Panel

3. Admin genehmigt
   PATCH /admin/dsgvo/requests/123/approve
   → Alle Einträge werden gelöscht
   → Audit-Log bewahrt (für Compliance)
```

---

## 9. SICHERHEITS-HEADER

Alle Responses sollten folgende Header enthalten:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 10. Dokumentation für Clients

### Public Endpoint (für Datenerfassung)
```javascript
// Beispiel: JavaScript Client
const elementTracker = {
  baseURL: 'https://elementtracker.local/api/v1',

  // Neue Daten eintragen
  addEntry: async (elementId, data) => {
    const formData = new FormData();
    formData.append('element_id', elementId);
    formData.append('timestamp', data.timestamp);
    // ... weitere Felder
    if (data.photo) formData.append('photo', data.photo);

    const response = await fetch(`${this.baseURL}/entries`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return response.json();
  },

  // Einträge abrufen
  getEntries: async (elementId, options = {}) => {
    const params = new URLSearchParams({ element_id: elementId, ...options });
    const response = await fetch(`${this.baseURL}/entries?${params}`);
    return response.json();
  }
};
```

---

Nächster Schritt: **Frontend-Wireframes** und **Backend-Code-Gerüst** erstellen?

