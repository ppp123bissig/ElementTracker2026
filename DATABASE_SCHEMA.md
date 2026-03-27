# ElementTracker2026 - Datenbankschema & Datenmodell

*Stand: 27. März 2026*

---

## 1. DATENBANK-STRUKTUR (PostgreSQL + PostGIS)

```sql
-- ============================================
-- 1. USERS & ADMIN-VERWALTUNG
-- ============================================

-- Admin-Tabelle (für Login + Passwort-Schutz)
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 2. ELEMENT-VERWALTUNG
-- ============================================

-- Elements: Die zu verfolgenden Entitäten
/* Beispiel:
   id: "ELEMENT001"
   name: "Wanderfalke 2026"
   owner_name: "Max Mustermann"
*/
CREATE TABLE elements (
  id VARCHAR(50) PRIMARY KEY,  -- Von Admin vorgegeben
  name VARCHAR(255) NOT NULL,  -- Name/Motiv des "Steines"
  owner_name VARCHAR(255) NOT NULL,  -- Eigentümer
  description TEXT,
  is_approved BOOLEAN DEFAULT FALSE,  -- Wartet auf Admin-Freigabe
  created_by INT REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL  -- Soft-delete für DSGVO
);

-- Index für häufige Abfragen
CREATE INDEX idx_elements_approved ON elements(is_approved);
CREATE INDEX idx_elements_owner ON elements(owner_name);

-- ============================================
-- 3. EINTRÄGE / TRACKING-DATEN
-- ============================================

-- Entries: Einzelne Positionen + Daten je Element
/* Beispiel:
   - Element "ELEMENT001" hat mehrere Einträge (zeitliche Reihe)
   - Jeder Eintrag hat GPS-Koordinaten, Zeitstempel, Foto
*/
CREATE TABLE entries (
  id BIGSERIAL PRIMARY KEY,
  element_id VARCHAR(50) NOT NULL REFERENCES elements(id) ON DELETE CASCADE,
  
  -- 1. Eindeutige ID (von Element geerbt, aber Eintrag selbst unique)
  -- (handled via element_id + created_at Kombination)
  
  -- 2. Zeitstempel (YYYY-MM-DD HH:mm)
  timestamp TIMESTAMP NOT NULL,
  
  -- 3a. GPS-Koordinaten (PostGIS Geometry)
  location_point GEOMETRY(Point, 4326),  -- WGS84, (lon, lat)
  
  -- 3b. Adresse (als Text, falls GPS nicht vorhanden)
  address TEXT,
  
  -- 4. Ortstext (optional)
  location_name VARCHAR(255),
  
  -- 5. Kommentar (optional)
  comment TEXT,
  
  -- 6. E-Mail Adresse für Benachrichtigung (optional)
  notification_email VARCHAR(255),
  
  -- 7. Foto (optional, max 3MB)
  photo_filename VARCHAR(255),  -- z.B. "entry_123456.jpg"
  photo_size_bytes INT,  -- zum Validieren der 3MB-Grenze
  photo_url VARCHAR(500),  -- URL zum Foto
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT REFERENCES admins(id),
  deleted_at TIMESTAMP NULL,  -- Soft-delete für DSGVO
  
  -- Audit-Log
  ip_address INET,  -- IP für DSGVO & Security
  user_agent VARCHAR(500)  -- Browser-Info für DSGVO
);

-- Indexes für Performance
CREATE INDEX idx_entries_element ON entries(element_id);
CREATE INDEX idx_entries_timestamp ON entries(timestamp DESC);
CREATE INDEX idx_entries_location ON entries USING GIST(location_point);
CREATE INDEX idx_entries_deleted ON entries(deleted_at);

-- ============================================
-- 4. AUDIT-LOG für DSGVO-Compliance
-- ============================================

-- Audit Log: Tracking aller Änderungen (wer, wann, was)
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,  -- z.B. "entries", "elements"
  record_id VARCHAR(100) NOT NULL,  -- Foreign Key
  action VARCHAR(20) NOT NULL,  -- INSERT, UPDATE, DELETE
  old_values JSONB,  -- Alte Werte (für Vergleich)
  new_values JSONB,  -- Neue Werte
  changed_by INT REFERENCES admins(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,  -- Wer hat es gemacht von wo
  reason TEXT  -- Optional: warum (z.B. "Fehlerhafte Eingabe entfernt")
);

CREATE INDEX idx_audit_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_at ON audit_logs(changed_at DESC);

-- ============================================
-- 5. E-MAIL NOTIFIKATION LOG (DSGVO)
-- ============================================

-- Email Log: Tracking von allen Notifications (für DSGVO-Compliance)
CREATE TABLE email_logs (
  id BIGSERIAL PRIMARY KEY,
  entry_id BIGINT REFERENCES entries(id),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50),  -- 'sent', 'failed', 'bounced'
  error_message TEXT,
  ip_recipient INET  -- Optional: IP des Empfängers für Logging
);

CREATE INDEX idx_email_entry ON email_logs(entry_id);
CREATE INDEX idx_email_timestamp ON email_logs(sent_at DESC);

-- ============================================
-- 6. DSGVO: DATENSCHUTZ-REQUESTE
-- ============================================

-- DSGVO Request: Tracking von Datenexport- und Lösch-Anfragen
CREATE TABLE dsgvo_requests (
  id BIGSERIAL PRIMARY KEY,
  request_type VARCHAR(50) NOT NULL,  -- 'export', 'delete'
  email VARCHAR(255) NOT NULL,
  element_id VARCHAR(50),  -- Optional: nur für spezifisches Element
  status VARCHAR(50) NOT NULL DEFAULT 'pending',  -- 'pending', 'completed', 'rejected'
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  response_file_url VARCHAR(500),  -- Link zum ZIP-Export (falls export)
  notes TEXT,  -- Admin-Notizen
  approved_by INT REFERENCES admins(id)
);

CREATE INDEX idx_dsgvo_email ON dsgvo_requests(email);
CREATE INDEX idx_dsgvo_status ON dsgvo_requests(status);

-- ============================================
-- 7. SESSIONS (für Admin-Login)
-- ============================================

-- Session Management (üblicherweise in Redis, aber auch in DB möglich)
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,  -- JWT Token
  ip_address INET,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_sessions_admin ON sessions(admin_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- 8. WEBSITE-SETTINGS (für Admin-Panel)
-- ============================================

-- Konfiguration (wie Impressum, Support-E-Mail, etc.)
CREATE TABLE settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO settings (key, value, description) VALUES
  ('site_name', 'ElementTracker', 'Website-Titel'),
  ('site_description', 'Tracking System für Datenelemente', 'Meta-Description'),
  ('support_email', 'support@example.com', 'Support E-Mail Adresse'),
  ('imprint_text', 'Impressum Text hier...', 'Gesetzlich erforderlich'),
  ('dsgvo_text', 'Datenschutz Text hier...', 'DSGVO-konforme Datenschutzerklärung'),
  ('max_photo_size_mb', '3', 'Maximale Fotogröße in MB'),
  ('pagination_limit', '50', 'Einträge pro Seite');

-- ============================================
-- 9. TRIGGERS für Automation
-- ============================================

-- Trigger: updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_elements_updated_at
BEFORE UPDATE ON elements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 10. VIEWS für häufige Abfragen
-- ============================================

-- View: Alle aktiven Einträge mit Element-Info
CREATE VIEW v_entries_with_element AS
SELECT
  e.id,
  e.element_id,
  el.name AS element_name,
  el.owner_name,
  e.timestamp,
  ST_AsText(e.location_point) AS coordinates,
  ST_Y(e.location_point) AS latitude,
  ST_X(e.location_point) AS longitude,
  e.address,
  e.location_name,
  e.comment,
  e.notification_email,
  e.photo_url,
  e.created_at
FROM entries e
JOIN elements el ON e.element_id = el.id
WHERE e.deleted_at IS NULL
AND el.deleted_at IS NULL
ORDER BY e.timestamp DESC;

-- View: Element-Statistik pro Element
CREATE VIEW v_element_stats AS
SELECT
  el.id,
  el.name,
  el.owner_name,
  COUNT(e.id) AS entry_count,
  MAX(e.timestamp) AS last_entry,
  MIN(e.timestamp) AS first_entry,
  COUNT(CASE WHEN e.photo_filename IS NOT NULL THEN 1 END) AS photo_count
FROM elements el
LEFT JOIN entries e ON el.id = e.element_id AND e.deleted_at IS NULL
WHERE el.deleted_at IS NULL
GROUP BY el.id, el.name, el.owner_name;

-- ============================================
```

---

## 2. ER-DIAGRAMM (Vereinfacht)

```
┌─────────────┐
│   admins    │
├─────────────┤
│ id (PK)     │
│ username    │
│ password... │
└──────┬──────┘
       │
       │ 1..n
       └─────────────────┐
                         │
┌──────────────┐    ┌────▼────────┐
│  elements    │    │ audit_logs  │
├──────────────┤    ├─────────────┤
│ id (PK)      │◄───│ changed_by  │
│ name         │    │ record_id   │
│ owner_name   │    │ action      │
│ is_approved  │    └─────────────┘
│ created_by   │
└──────┬───────┘
       │ 1..n
       └─────────────────┐
                         │
┌──────────────────┐    ┌────▼──────────┐
│    entries       │    │ email_logs    │
├──────────────────┤    ├───────────────┤
│ id (PK)          │◄───│ entry_id      │
│ element_id (FK)  │    │ recipient_... │
│ timestamp        │    │ sent_at       │
│ location_point   │    └───────────────┘
│ address          │
│ photo_filename   │
└──────────────────┘

```

---

## 3. DDL-BEFEHLE (Für install.sql)

Die komplette Installation erfolgt via:

```bash
# PostgreSQL + PostGIS initialisieren
sudo -u postgres createdb elementtracker
sudo -u postgres psql -d elementtracker -c "CREATE EXTENSION postgis"

# Alle Tabellen & Views laden
sudo -u postgres psql -d elementtracker -f setup/init.sql
```

---

## 4. BEISPIEL-DATEN (für Testing)

```sql
-- Admin-User
INSERT INTO admins (username, password_hash, email) VALUES
  ('admin', '$2b$10$...bcrypt_hash...', 'admin@example.com');

-- Test-Element
INSERT INTO elements (id, name, owner_name, created_by, is_approved) VALUES
  ('ELEMENT001', 'Wanderfalke 2026', 'Max Mustermann', 1, true);

-- Test-Eintrag mit GPS
INSERT INTO entries (
  element_id, timestamp, location_point, address, 
  location_name, comment, notification_email, created_at
) VALUES (
  'ELEMENT001',
  '2026-03-27 10:30:00',
  ST_GeomFromText('POINT(13.405 52.52)', 4326),  -- Berlin
  'Berlin, Germany',
  'Tiergarten',
  'Vogel beobachtet',
  'observer@example.com',
  CURRENT_TIMESTAMP
);
```

---

## 5. PERFORMANZ-OPTIMIERUNGEN

| Optimization | Grund | Umsetzung |
|---|---|---|
| Spatial Index | GPS-Queries schneller | `GIST(location_point)` |
| Composite Index | WHERE + ORDER BY schneller | `(element_id, timestamp)` |
| Soft Deletes | DSGVO-Compliance | `deleted_at` Spalte |
| Archivierung | Alte Daten offline | Triggers + pg_dump |
| Partitioning | Große Tabelle teilen | Für Zukunft: by month/year |

---

## 6. BACKUP-STRATEGIE

```bash
# Daily Backup (via cron job)
0 2 * * * /usr/local/bin/backup-elementtracker.sh

# Script sollte:
# 1. pg_dump mit Kompression
# 2. Photos-Ordner als TAR
# 3. Mit Encryption verschlüsseln
# 4. Zum Backup-Destination kopieren (z.B. externe HDD, S3)
# 5. Alte Backups nach 30 Tagen löschen
```

---

## Nächste Schritte

1. ✅ Datenbankschema akzeptiert?
2. → API-Spezifikation (Endpoints, Request/Response)
3. → Frontend-UI/UX Wireframes
4. → Backend-Code Gerüst
5. → Frontend-Code Gerüst

