# 🎯 Schnellanleitung - Neue Features 12.04.2026

## 1️⃣ **5-Element Karte mit Verbindungen**

### Wie verwendet man's:
```
1. Gehe zu: http://localhost:3001/map
2. Im rechten Panel: Wähle bis zu 5 Elemente
3. Auf der Karte sehen:
   - Farbcodierte Marker pro Element (1, 2, 3, ... pro Element)
   - Bunte Linien verbinden die Punkte zeitlich
   - Hover über Marker → Popup mit Details
```

### Features:
- 🔴 Jedes Element hat eigene Farbe
- 🔢 Marker werden pro Element nummeriert (nicht global!)
- 📍 Polylines verbinden chronologische Reihenfolge
- 🖱️ Nur die 5 ausgewählten Elements sichtbar

---

## 2️⃣ **Einträge Tabelle mit Sortierung**

### Wie verwendet man's:
```
1. Gehe zu: http://localhost:3001/entries
2. STANDARD: Tabelle (nicht Karten!)
3. Sortiere nach:
   - Aktuellste zuerst / Älteste zuerst 📅
   - Nach Ort (A-Z) 📍
   - Nach Element-ID (A-Z) 🏷️
   - Nach Position (Geografisch) 📐
4. Fotos: Klick auf "📷 Öffnen"
```

### Tabelle Spalten:
| Element | Zeitpunkt | Adresse | Koordinaten | Kommentar | Foto |

---

## 3️⃣ **Fotos jetzt überall sichtbar**

### Fotos hochladen & anschauen:
```
1. Neuer Eintrag: http://localhost:3001/entries/new
   - Foto Upload funktioniert ✅
2. Tabelle: Kolonne "Foto" zeigt "📷 Öffnen"
   - Klick öffnet Foto in neuem Tab ✅
3. Karten-Popup: Zeigt Photo URL
   - Anklickbar als Link ✅
```

---

## 4️⃣ **Dropdown beim neuen Eintrag springt nicht mehr herum**

### Das Problem war:
```
❌ VORHER: Alle 30 Sekunden Auto-Refresh → Dropdown reset auf Element 1
❌ Es wurden nicht alle Elemente angeboten
```

### JETZT ✅:
```
✅ Wähle ein Element aus → Bleibt ausgewählt
✅ Auto-Refresh lädt neue Elemente im Hintergrund
✅ Deine Auswahl wird nicht zurückgesetzt
✅ Alle Elemente in Dropdown
```

---

## 5️⃣ **Admin: Element & Einträge verwalten**

### Neue Admin-Seite:
```
Gehe zu: http://localhost:3001/admin/elements
```

### Was man kann:
```
1. ALLE Elemente sehen
   - Mit Status: ✅ Approved / ⏳ Pending
   - Eintrags-Zähler pro Element
   
2. Expand/Collapse Element → Sehe alle Einträge
   
3. LÖSCHEN:
   - 🗑️ Ganzes Element (mit Bestätigung)
   - ✕ Einzelne Einträge (mit Bestätigung)
   
4. Gelöschte Daten:
   - SOFTDELETE = nicht wirklich weg
   - Admin kann später in DB wiederherstellen
```

### Seitenaufbau:
```
┌─────────────────────────────────┐
│ Element: ELEMENT_1              │  ← Klick zum aufklappen ▼
│ Name: Test Element              │
│ Owner: Tester                   │
│ Status: ✅ Approved (5 Einträge)│
└─────────────────────────────────┘
    ↓ Expand
    ├─ Beschreibung: Automatisch angelegt
    ├─ [🗑️ Element löschen]
    │
    ├─ 📋 Einträge:
    │  ├─ 12.04.2026 09:00 - Berlin [✕ Löschen]
    │  ├─ 11.04.2026 14:30 - Offenburg [✕ Löschen]
    │  └─ 10.04.2026 11:15 - Stuttgart [✕ Löschen]
```

---

## 6️⃣ **Neue Navigation: Admin Menü**

### Navbar oben (neu):
```
Home | Einträge | Eintragen | Karte | Admin ▼ • Element Verwaltung | Datenschutz | Impressum
                                              └─ Hover/Click oben
```

---

## ⚡ Tipps & Tricks

### Karte perfekt nutzen:
```
1. Wähle 2-3 Elemente (nicht zu viele!)
2. Zoom raus (Mouse Wheel)
3. Sieh die Polylines viel besser
4. Hover über jeden Marker
```

### Schnell suchen:
```
1. Einträge → Sortiere nach "Element"
2. Alle ELEMENT_1 Einträge beisammen
3. Oder: Nach "Ort" → Sehe Berlin, Offenburg, ... together
```

### Admin Tipps:
```
1. Löschungen: Vorsicht! Softdelete = später schwer zu finden
2. Bulk-Löschungen: Mache einzeln (sicherer)
3. Backups: Mache Backup VOR großen Löschungen!
   → bash backup.sh
```

---

## 🐛 Falls etwas nicht funktioniert

### Problem: Karte zeigt keine Polylines
```
✅ Lösung: Mindestens 2 Einträge pro Element nötig
          (Polyline braucht mindestens 2 Punkte)
```

### Problem: Fotos laden nicht
```
✅ Lösung: Prüfe uploads beim Upload
          Foto URL muss mit http://localhost:3000 starten
```

### Problem: Element Dropdown leer
```
✅ Lösung: Erst Admin müssen Element genehmigen
          → http://localhost:3001/admin
```

### Problem: Admin urlose werden angezeigt
```
✅ Lösung: Du brauchst Admin Login
          → Gehe zu /admin für Login
          → Default: admin / admin123
```

---

## 📞 Quick Commands für Dev

```bash
# Sauberer Neustart
bash start.sh restart

# Nur Cleanup
bash cleanup.sh

# Map mit Element 1 Filter
http://localhost:3001/map?filter=ELEMENT_1

# Entries Tabelle Sortieren nach Zeit
# Automatisch! (Neu)

# Element löschen (Admin)
# http://localhost:3001/admin/elements
# → Expand Element → 🗑️ Löschen
```

---

## ✨ Summary

| Feature | Status | Wo |
|---------|--------|-----|
| 5-Element Karte | ✅ Fertig | `/map` |
| Polylines Verbindungen | ✅ Fertig | `/map` (auto) |
| Tabelle Default | ✅ Fertig | `/entries` |
| Sortierung (4 Modi) | ✅ Fertig | `/entries` Dropdown |
| Fotos anzeigen | ✅ Fertig | `/entries` Tabelle |
| Dropdown-Bug Fix | ✅ Fertig | `/entries/new` |
| Admin Verwaltung | ✅ Fertig | `/admin/elements` |
| Element Löschen | ✅ Fertig | `/admin/elements` |

---

**Letztes Update: 12. April 2026**  
**Alle Features ohne Regressions getestet ✅**
