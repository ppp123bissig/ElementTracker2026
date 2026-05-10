'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getAPIBaseURL } from '../lib/api';

const MapViewer = dynamic(() => import('./MapViewer'), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] flex items-center justify-center bg-slate-50">
      <p className="text-slate-600">Lade Karte...</p>
    </div>
  ),
});

interface Entry {
  id: string;
  element_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  address?: string;
  comment?: string;
  photo_url?: string;
  created_at?: string;
}

export default function EntriesList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'address' | 'element' | 'position'>('newest');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'map'>('table');

  useEffect(() => {
    const url = filter
      ? `${getAPIBaseURL()}/api/v1/entries?element_id=${encodeURIComponent(filter)}`
      : `${getAPIBaseURL()}/api/v1/entries`;

    setLoading(true);
    setError('');

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) {
          throw new Error(json.error || 'Fehler beim Laden der Einträge.');
        }
        let data: Entry[] = json.entries || [];

        if (sortBy === 'oldest') {
          data = data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } else if (sortBy === 'newest') {
          data = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } else if (sortBy === 'address') {
          data = data.sort((a, b) => (a.address || '').localeCompare(b.address || ''));
        } else if (sortBy === 'element') {
          data = data.sort((a, b) => a.element_id.localeCompare(b.element_id));
        } else if (sortBy === 'position') {
          data = data.sort((a, b) => {
            const latDiff = a.latitude - b.latitude;
            return latDiff !== 0 ? latDiff : a.longitude - b.longitude;
          });
        }
        
        setEntries(data);
      })
      .catch((err) => setError(err.message || 'Unbekannter Fehler'))
      .finally(() => setLoading(false));
  }, [filter, sortBy]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nach Element-ID filtern
            </label>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="z.B. ELEMENT_1"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sortierung
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'address' | 'element' | 'position')}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option value="newest">Aktuellste zuerst</option>
              <option value="oldest">Älteste zuerst</option>
              <option value="address">Nach Ort (A-Z)</option>
              <option value="element">Nach Element (A-Z)</option>
              <option value="position">Nach Position</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-600">
              {loading ? 'Lade Einträge...' : `${entries.length} Einträge`}
            </p>
            <div className="inline-flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Karten
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tabelle
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'map'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Karte
              </button>
            </div>
          </div>
          <button
            onClick={() => setFilter('')}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
          >
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          <p className="font-semibold">Fehler beim Laden</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Lade Einträge...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Keine Einträge gefunden.</p>
          {filter && (
            <button
              onClick={() => setFilter('')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-medium">Element</th>
                <th className="px-4 py-3 font-medium">Zeitpunkt</th>
                <th className="px-4 py-3 font-medium">Adresse</th>
                <th className="px-4 py-3 font-medium">Koordinaten</th>
                <th className="px-4 py-3 font-medium">Kommentar</th>
                <th className="px-4 py-3 font-medium">Foto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 font-semibold text-slate-900">{entry.element_id}</td>
                  <td className="px-4 py-4 text-slate-600 text-xs">{new Date(entry.timestamp).toLocaleString('de-DE')}</td>
                  <td className="px-4 py-4 text-slate-600 text-xs">{entry.address || '—'}</td>
                  <td className="px-4 py-4 text-slate-600 text-xs">{entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}</td>
                  <td className="px-4 py-4 text-slate-600 text-xs">{entry.comment || '—'}</td>
                  <td className="px-4 py-4 text-xs">
                    {entry.photo_url && entry.photo_url.trim() !== '' ? (
                      <a
                        href={entry.photo_url.startsWith('http') ? entry.photo_url : `${getAPIBaseURL()}${entry.photo_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        📷 Öffnen
                      </a>
                    ) : (
                      <span className="text-slate-400">Kein Foto</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'map' ? (
        <MapViewer initialFilter={filter} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">
                    {entry.element_id}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {entry.address || 'Keine Adresse angegeben'}
                  </p>
                </div>
                <div className="text-right">
                  <time className="text-sm text-slate-500">
                    {new Date(entry.timestamp).toLocaleString('de-DE')}
                  </time>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {entry.comment && (
                  <p className="text-sm text-slate-700">
                    <strong>Kommentar:</strong> {entry.comment}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  <strong>Koordinaten:</strong> {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                </p>
              </div>

              {entry.photo_url && (
                <div className="mt-4">
                  <a
                    href={entry.photo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    📷 Foto anschauen
                  </a>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${entry.latitude}&mlon=${entry.longitude}&zoom=15`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  🗺️ In OSM anzeigen
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
