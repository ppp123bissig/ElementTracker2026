'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { API_BASE_URL } from '../lib/api';

interface Entry {
  id: string;
  element_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  address?: string;
  comment?: string;
  photo_url?: string;
}

const ELEMENT_COLORS: { [key: string]: string } = {
  ELEMENT_1: '#FF6B6B',
  ELEMENT_2: '#4ECDC4',
  ELEMENT_3: '#45B7D1',
  ELEMENT_4: '#FFA07A',
  ELEMENT_5: '#98D8C8',
  ELEMENT_6: '#F7DC6F',
  ELEMENT_7: '#BB8FCE',
  ELEMENT_8: '#85C1E9',
  ELEMENT_9: '#F8C471',
  ELEMENT_10: '#82E0AA',
};

// Dynamische Farbgenerierung für unbegrenzte Elemente
function getColorForElement(elementId: string): string {
  // Zuerst prüfen ob feste Farbe definiert
  if (ELEMENT_COLORS[elementId]) {
    return ELEMENT_COLORS[elementId];
  }
  
  // Sonst: Hash-basierte Farbgenerierung für konsistente Farben pro Element
  let hash = 0;
  for (let i = 0; i < elementId.length; i++) {
    hash = elementId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // HSL-Farbe generieren (satte, gut sichtbare Farben)
  const hue = Math.abs(hash) % 360;
  const saturation = 70 + (Math.abs(hash) % 20); // 70-90%
  const lightness = 50 + (Math.abs(hash >> 8) % 20); // 50-70%
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

export default function MapViewer({ initialFilter = '' }: { initialFilter?: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState(initialFilter);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([52.52, 13.405]);
  const [allElementIds, setAllElementIds] = useState<string[]>([]);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const handleMapCreated = (map: L.Map) => {
    setMapInstance(map);
  };

  useEffect(() => {
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [mapInstance]);

  function MapInstanceSetter({ onCreate }: { onCreate: (map: L.Map) => void }) {
    const map = useMap();
    useEffect(() => {
      onCreate(map);
    }, [map, onCreate]);
    return null;
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/entries`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const ids = Array.from(new Set((json.entries || []).map((entry: Entry) => entry.element_id))).sort();
          setAllElementIds(ids as string[]);
        }
      })
      .catch(() => {
        // ignore for filter fallback
      });
  }, []);

  useEffect(() => {
    setFilter(initialFilter);
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    const url = activeFilter
      ? `${API_BASE_URL}/api/v1/entries?element_id=${encodeURIComponent(activeFilter)}`
      : `${API_BASE_URL}/api/v1/entries`;

    setLoading(true);
    setError('');

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          throw new Error(json.error || 'Beim Laden der Einträge ist ein Fehler aufgetreten.');
        }
        const data = json.entries || [];
        setEntries(data);
        if (data.length > 0) {
          setMapCenter([data[0].latitude, data[0].longitude]);
        }
      })
      .catch((err) => setError(err.message || 'Unbekannter Fehler'))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  const elementGroups = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.element_id]) {
        acc[entry.element_id] = [];
      }
      acc[entry.element_id].push(entry);
      return acc;
    },
    {} as { [key: string]: Entry[] }
  );

  const elementIds = allElementIds.length > 0
    ? allElementIds
    : Object.keys(elementGroups).sort();

  const toggleSelection = (elementId: string) => {
    setSelectedElements((current) => {
      if (current.includes(elementId)) {
        return current.filter((item) => item !== elementId);
      }
      if (current.length >= 5) {
        return current;
      }
      return [...current, elementId];
    });
  };

  const selectedEntries = selectedElements
    .map((id) => {
      const entriesForElement = elementGroups[id] || [];
      return {
        elementId: id,
        entries: entriesForElement.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
      };
    })
    .filter((group) => group.entries.length > 0);

  useEffect(() => {
    // Update map center based on first selected entries or all entries
    const entriesToCenter = selectedEntries.length > 0
      ? selectedEntries.flatMap((g) => g.entries)
      : entries;

    if (entriesToCenter.length > 0) {
      setMapCenter([entriesToCenter[0].latitude, entriesToCenter[0].longitude]);
    }
  }, [selectedEntries, entries]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nach Element-ID filtern
            </label>
            <div className="flex gap-3">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Alle Elemente anzeigen ({entries.length} Einträge)</option>
                {elementIds.map((id) => (
                  <option key={id} value={id}>
                    {id} ({(elementGroups[id] || []).length} Einträge)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setActiveFilter(filter)}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                GO
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Aktiver Filter
            </label>
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {activeFilter ? `Aktuell: ${activeFilter}` : 'Keine Filterung aktiv'}
            </p>
          </div>
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFilter('');
                setActiveFilter('');
                setSelectedElements([]);
              }}
              className="rounded-2xl bg-slate-100 px-6 py-2 text-slate-700 hover:bg-slate-200 font-medium"
            >
              Zurücksetzen
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          {error ? (
            <div className="h-[560px] flex items-center justify-center bg-red-50 border border-red-200">
              <p className="text-red-700 text-center px-4">{error}</p>
            </div>
          ) : loading ? (
            <div className="h-[560px] flex items-center justify-center bg-slate-50">
              <p className="text-slate-600">Lade Karte...</p>
            </div>
          ) : (
            <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className="h-[560px] w-full">
              <MapInstanceSetter onCreate={handleMapCreated} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {selectedEntries.length > 0 ? (
                // MODUS: Nur ausgewählte 5 Elemente anzeigen
                <>
                  {selectedEntries.map((group) => {
                    const color = getColorForElement(group.elementId);
                    // Nummerierung pro Element (1, 2, 3, ...) - nicht global
                    return group.entries.map((entry, positionIdx) => {
                      const markerIcon = L.divIcon({
                        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 13px;">${positionIdx + 1}</div>`,
                        iconSize: [32, 32],
                        className: 'custom-marker',
                      });

                      return (
                        <Marker key={entry.id} position={[entry.latitude, entry.longitude]} icon={markerIcon}>
                          <Popup>
                            <div className="space-y-2 text-sm max-w-xs">
                              <p className="font-semibold text-slate-900">{entry.element_id}</p>
                              <p className="text-xs text-slate-500">Position {positionIdx + 1}</p>
                              {entry.address && <p className="text-slate-700">{entry.address}</p>}
                              <p className="text-slate-600 text-xs">
                                {new Date(entry.timestamp).toLocaleString('de-DE')}
                              </p>
                              {entry.comment && <p className="italic text-slate-700">{entry.comment}</p>}
                              <a
                                href={`https://www.openstreetmap.org/?mlat=${entry.latitude}&mlon=${entry.longitude}&zoom=17`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 block text-xs"
                              >
                                🔗 In OpenStreetMap öffnen
                              </a>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    });
                  })}

                  {/* Polylines: Verbinde alle Punkte pro Element zeitlich */}
                  {selectedEntries.map((group) => {
                    if (group.entries.length < 2) return null;
                    const color = getColorForElement(group.elementId);
                    const pathPositions = group.entries.map((entry) => [entry.latitude, entry.longitude] as [number, number]);
                    return (
                      <Polyline
                        key={`polyline-${group.elementId}`}
                        pathOptions={{
                          color: color,
                          weight: 3,
                          dashArray: undefined,
                          opacity: 0.7,
                        }}
                        positions={pathPositions}
                      />
                    );
                  })}
                </>
              ) : (
                // MODUS: Alle Elemente anzeigen (wenn keine Auswahl)
                <>
                  {entries.map((entry, idx) => {
                    const color = getColorForElement(entry.element_id);
                    const markerIcon = L.divIcon({
                      html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 13px;">${idx + 1}</div>`,
                      iconSize: [32, 32],
                      className: 'custom-marker',
                    });

                    return (
                      <Marker key={entry.id} position={[entry.latitude, entry.longitude]} icon={markerIcon}>
                        <Popup>
                          <div className="space-y-2 text-sm max-w-xs">
                            <p className="font-semibold text-slate-900">{entry.element_id}</p>
                            {entry.address && <p className="text-slate-700">{entry.address}</p>}
                            <p className="text-slate-600 text-xs">
                              {new Date(entry.timestamp).toLocaleString('de-DE')}
                            </p>
                            {entry.comment && <p className="italic text-slate-700">{entry.comment}</p>}
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${entry.latitude}&mlon=${entry.longitude}&zoom=17`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 block text-xs"
                            >
                              🔗 In OpenStreetMap öffnen
                            </a>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </>
              )}
            </MapContainer>
          )}
        </div>

        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Legende & Auswahl</h3>
            <p className="text-xs text-slate-600">Wähle bis zu 5 Element-IDs, um ihre letzten Punkte miteinander zu verbinden.</p>
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-4">
            {elementIds.length === 0 ? (
              <p className="text-sm text-slate-600">Keine Elemente vorhanden.</p>
            ) : (
              elementIds.map((id) => {
                const selected = selectedElements.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleSelection(id)}
                    className={`w-full rounded-2xl px-3 py-2 text-left text-sm transition ${
                      selected
                        ? 'bg-blue-100 border border-blue-300 text-blue-900'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: getColorForElement(id) }}
                    />
                    {id} <span className="text-xs text-slate-500">({(elementGroups[id] || []).length})</span>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-2">
            <p className="text-sm text-slate-700">
              <strong>Gesamt:</strong> {entries.length} Einträge
            </p>
            <p className="text-sm text-slate-700">
              <strong>Ausgewählt:</strong> {selectedElements.length} von 5
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
