'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteShell from '../../../components/SiteShell';
import { getAPIBaseURL } from '../../../lib/api';

interface Element {
  id: string;
  name: string;
  owner_name: string;
  description: string;
  is_approved: boolean;
  created_at: string;
}

interface Entry {
  id: string;
  element_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  address?: string;
  location_name?: string;
  comment?: string;
  notification_email?: string;
  photo_url?: string;
}

interface ElementWithEntries {
  element: Element;
  entries: Entry[];
}

export default function AdminElementsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [elementsWithEntries, setElementsWithEntries] = useState<ElementWithEntries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValues, setEditValues] = useState({
    address: '',
    location_name: '',
    comment: '',
    notification_email: '',
    latitude: '',
    longitude: '',
    photo_url: '',
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('elementtracker_token');
    const storedRefreshToken = localStorage.getItem('elementtracker_refresh_token');
    setToken(storedToken);
    setRefreshToken(storedRefreshToken);
  }, []);

  const saveTokens = (accessToken: string, newRefreshToken: string) => {
    localStorage.setItem('elementtracker_token', accessToken);
    localStorage.setItem('elementtracker_refresh_token', newRefreshToken);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('elementtracker_token');
    localStorage.removeItem('elementtracker_refresh_token');
    setToken(null);
    setRefreshToken(null);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      return false;
    }

    try {
      const res = await fetch(`${getAPIBaseURL()}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        clearTokens();
        return false;
      }

      saveTokens(json.token, json.refreshToken);
      return true;
    } catch (err) {
      clearTokens();
      return false;
    }
  };

  const fetchWithToken = async (url: string, options: RequestInit = {}, overrideToken?: string) => {
    const authToken = overrideToken || token;
    if (!authToken) {
      throw new Error('Admin-Token fehlt. Bitte melden Sie sich an.');
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${authToken}`,
    } as Record<string, string>;

    const res = await fetch(url, { ...options, headers });
    const json = await res.json();

    if (res.status === 401 && json.code === 'TOKEN_EXPIRED') {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        throw new Error('Session abgelaufen. Bitte melden Sie sich erneut an.');
      }
      return fetchWithToken(url, options, localStorage.getItem('elementtracker_token') || undefined);
    }

    if (!res.ok) {
      throw new Error(json.error || 'Unknown error');
    }

    return json;
  };

  const loadElementsWithEntries = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const elementsRes = await fetchWithToken(`${getAPIBaseURL()}/api/v1/elements`);
      const elements = elementsRes.elements || [];

      const entriesRes = await fetchWithToken(`${getAPIBaseURL()}/api/v1/entries`);
      const allEntries = entriesRes.entries || [];

      const elementsList = elements.map((element: Element) => ({
        element,
        entries: allEntries.filter((entry: Entry) => entry.element_id === element.id),
      }));

      setElementsWithEntries(elementsList);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadElementsWithEntries();
    }
  }, [token]);

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Eintrag wirklich löschen?')) return;

    try {
      const res = await fetchWithToken(`${getAPIBaseURL()}/api/v1/admin/entries/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ id: entryId }),
      });

      setFeedback('Eintrag gelöscht');
      setFeedbackType('success');
      setTimeout(() => loadElementsWithEntries(), 500);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Fehler beim Löschen');
      setFeedbackType('error');
    }

    setTimeout(() => setFeedback(''), 3000);
  };

  const handleDeleteElement = async (elementId: string) => {
    if (!confirm(`Element "${elementId}" wirklich löschen? (Softdelete)`)) return;

    try {
      const res = await fetchWithToken(`${API_BASE_URL}/api/v1/admin/elements/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ id: elementId }),
      });

      setFeedback('Element gelöscht');
      setFeedbackType('success');
      setTimeout(() => loadElementsWithEntries(), 500);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Fehler beim Löschen');
      setFeedbackType('error');
    }

    setTimeout(() => setFeedback(''), 3000);
  };

  const startEditingEntry = (entry: Entry) => {
    setEditingEntry(entry);
    setEditValues({
      address: entry.address || '',
      location_name: entry.location_name || '',
      comment: entry.comment || '',
      notification_email: entry.notification_email || '',
      latitude: entry.latitude.toString(),
      longitude: entry.longitude.toString(),
      photo_url: entry.photo_url || '',
    });
    setShowEditModal(true);
  };

  const cancelEditingEntry = () => {
    setEditingEntry(null);
    setShowEditModal(false);
  };

  const saveEditedEntry = async () => {
    if (!editingEntry) return;
    try {
      await fetchWithToken(`${getAPIBaseURL()}/api/v1/admin/entries/${editingEntry.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          address: editValues.address || null,
          location_name: editValues.location_name || null,
          comment: editValues.comment || null,
          notification_email: editValues.notification_email || null,
          photo_url: editValues.photo_url || null,
          latitude: parseFloat(editValues.latitude) || 0,
          longitude: parseFloat(editValues.longitude) || 0,
        }),
      });

      setFeedback('Eintrag wurde erfolgreich aktualisiert.');
      setFeedbackType('success');
      setEditingEntry(null);
      setShowEditModal(false);
      setTimeout(() => {
        setFeedback('');
        loadElementsWithEntries();
      }, 500);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
      setFeedbackType('error');
    }
  };

  const allEntries = elementsWithEntries.flatMap(({ element, entries }) =>
    entries.map((entry) => ({
      ...entry,
      element_name: element.name,
      element_is_approved: element.is_approved,
      element_owner_name: element.owner_name,
    }))
  );

  if (!token) {
    return (
      <SiteShell title="Admin - Element Management" description="Verwalten Sie alle Elemente und deren Einträge">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-700">
          <p className="font-semibold">Bitte melden Sie sich an</p>
          <p className="text-sm mt-2">
            <Link href="/admin" className="text-amber-800 font-medium hover:underline">
              Zur Admin-Login Seite
            </Link>
          </p>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell title="Admin - Element Management" description="Verwalten Sie alle Elemente und deren Einträge">
      {feedback && (
        <div
          className={`rounded-3xl p-6 mb-6 ${
            feedbackType === 'success'
              ? 'border border-green-200 bg-green-50 text-green-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback}
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 mb-6">
          <p className="font-semibold">Fehler</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Lade Elemente...</p>
        </div>
      ) : elementsWithEntries.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Keine Elemente vorhanden.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Alle Einträge</h2>
                <p className="text-sm text-slate-600">Zeige alle Einträge tabellarisch. Hier kannst du Einträge prüfen, bearbeiten oder löschen.</p>
              </div>
              <div className="text-sm text-slate-500">
                {allEntries.length} Einträge in {elementsWithEntries.length} Elementen
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-medium">Element</th>
                  <th className="px-4 py-3 font-medium">Zeitpunkt</th>
                  <th className="px-4 py-3 font-medium">Adresse</th>
                  <th className="px-4 py-3 font-medium">Ortstitel</th>
                  <th className="px-4 py-3 font-medium">Kommentar</th>
                  <th className="px-4 py-3 font-medium">E-Mail</th>
                  <th className="px-4 py-3 font-medium">Koordinaten</th>
                  <th className="px-4 py-3 font-medium">Foto</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {allEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-900">
                      <div className="font-semibold">{entry.element_id}</div>
                      <div className="text-xs text-slate-500">{entry.element_name}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 text-xs">{new Date(entry.timestamp).toLocaleString('de-DE')}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs">{entry.address || '—'}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs">{entry.location_name || '—'}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs">{entry.comment || '—'}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs">{entry.notification_email || '—'}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs">{entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}</td>
                    <td className="px-4 py-4 text-slate-600 text-xs">
                      {entry.photo_url ? (
                        <a
                          href={entry.photo_url.startsWith('http') ? entry.photo_url : `${getAPIBaseURL()}${entry.photo_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Foto
                        </a>
                      ) : (
                        <span className="text-slate-400">Kein Foto</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <span className={`inline-flex rounded-full px-2 py-1 ${entry.element_is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {entry.element_is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingEntry(entry)}
                          className="rounded-2xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 text-xs"
                        >
                          Bearbeiten
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="rounded-2xl bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200 text-xs"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showEditModal && editingEntry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Eintrag bearbeiten</h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Latitude</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={editValues.latitude}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, latitude: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Longitude</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={editValues.longitude}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, longitude: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Adresse</span>
                    <input
                      value={editValues.address}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Ortstitel</span>
                    <input
                      value={editValues.location_name}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, location_name: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Kommentar</span>
                    <textarea
                      value={editValues.comment}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, comment: e.target.value }))}
                      rows={3}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Benachrichtigungs-E-Mail</span>
                    <input
                      type="email"
                      value={editValues.notification_email}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, notification_email: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Foto-URL (optional, leer lassen um Foto zu entfernen)</span>
                    <input
                      value={editValues.photo_url}
                      onChange={(e) => setEditValues((prev) => ({ ...prev, photo_url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                    />
                  </label>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={saveEditedEntry}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 font-medium"
                  >
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditingEntry}
                    className="rounded-2xl bg-slate-100 px-5 py-3 text-slate-700 hover:bg-slate-200 font-medium"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </SiteShell>
  );
}
