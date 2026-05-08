'use client';

import { useEffect, useState } from 'react';
import SiteShell from '../../components/SiteShell';

interface PendingEntry {
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
  created_at: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loginMessage, setLoginMessage] = useState('');

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
      const res = await fetch('http://localhost:3000/api/v1/auth/refresh', {
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
      const newToken = localStorage.getItem('elementtracker_token');
      if (!newToken) {
        throw new Error('Token wiederherstellen fehlgeschlagen.');
      }
      setToken(newToken);
      const retryHeaders = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${newToken}`,
      } as Record<string, string>;
      const retryRes = await fetch(url, { ...options, headers: retryHeaders });
      const retryJson = await retryRes.json();
      if (!retryRes.ok || !retryJson.success) {
        throw new Error(retryJson.error || `Fehler beim Zugriff auf ${url}`);
      }
      return retryJson;
    }

    if (!res.ok || !json.success) {
      throw new Error(json.error || `Fehler beim Zugriff auf ${url}`);
    }

    return json;
  };

  const fetchPendingEntries = async (accessToken?: string) => {
    if (!accessToken && !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const json = await fetchWithToken('http://localhost:3000/api/v1/admin/pending-entries', {}, accessToken);
      setPendingEntries(json.pending_entries || []);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Admin-Daten.');
    } finally {
      setLoading(false);
    }
  };

  const refreshPendingEntries = async () => {
    await fetchPendingEntries();
  };

  useEffect(() => {
    if (token) {
      fetchPendingEntries();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginMessage('');
    setFeedback('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setLoginMessage(`Login fehlgeschlagen: ${json.error || res.statusText}`);
        return;
      }

      saveTokens(json.token, json.refreshToken);
      setLoginMessage('Login erfolgreich!');
      await fetchPendingEntries(json.token);
    } catch (err: any) {
      setLoginMessage(`Login-Fehler: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setPendingEntries([]);
    setFeedback('Abgemeldet.');
  };

  const handleReview = async (entryId: string, action: 'approve' | 'reject') => {
    if (!token) {
      setFeedback('Admin-Token fehlt. Bitte melden Sie sich zuerst an.');
      return;
    }

    setFeedback('');
    setLoading(true);

    try {
      const json = await fetchWithToken(`http://localhost:3000/api/v1/admin/pending-entries/${entryId}/${action}`, {
        method: 'PATCH',
        body: JSON.stringify(action === 'reject' ? { reason: 'Kein ausreichender Nachweis' } : {}),
      });

      setFeedback(`Eintrag erfolgreich ${action === 'approve' ? 'genehmigt' : 'abgelehnt'}.`);
      await fetchPendingEntries();
    } catch (err: any) {
      setFeedback(err.message || 'Unbekannter Fehler');
      setLoading(false);
    }
  };

  return (
    <SiteShell
      title="Admin-Bereich"
      description="Hier können Administratoren eingereichte Vorab-Einträge prüfen und freigeben oder ablehnen."
    >
      <div className="space-y-6">
        {!token ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Admin Login</h2>
            <p className="text-slate-600 mb-6">Melden Sie sich hier an, um Vorab-Einträge zu prüfen und freizugeben.</p>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Benutzername</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Anmelden...' : 'Anmelden'}
              </button>
              {loginMessage && <p className="text-sm text-indigo-700">{loginMessage}</p>}
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Vorab-Einträge prüfen</h2>
                <p className="text-slate-600">Zeigt neue Einträge, die auf Freigabe warten.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={refreshPendingEntries}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200"
                  disabled={loading}
                >
                  {loading ? 'Aktualisiere...' : 'Aktualisieren'}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-2xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                >
                  Abmelden
                </button>
              </div>
            </div>

            {feedback && <p className="mt-4 rounded-2xl bg-green-100 p-3 text-sm text-green-800">{feedback}</p>}
            {error && <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                  Einträge werden geladen...
                </div>
              ) : pendingEntries.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                  Keine neuen Vorab-Einträge zur Freigabe vorhanden.
                  <p className="mt-2 text-sm text-slate-500">
                    Hinweis: Einträge für bereits vorhandene Elemente werden direkt gespeichert und erscheinen hier nicht.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEntries.map((entry) => (
                    <article key={entry.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <p className="text-sm font-medium text-slate-500">Element ID</p>
                          <p className="text-xl font-semibold text-slate-900">{entry.element_id}</p>
                          <p className="text-sm text-slate-600">{entry.location_name || 'Kein Ortstitel angegeben'}</p>
                        </div>
                        <div className="text-sm text-slate-500">
                          Erstellt: {new Date(entry.created_at).toLocaleString('de-DE')}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Adresse</p>
                          <p className="text-slate-700">{entry.address || 'Keine Adresse'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500">Koordinaten</p>
                          <p className="text-slate-700">{entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}</p>
                        </div>
                      </div>

                      {entry.comment && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-slate-500">Kommentar</p>
                          <p className="text-slate-700">{entry.comment}</p>
                        </div>
                      )}

                      {entry.photo_url && entry.photo_url.trim() !== '' && (
                        <div className="mt-4">
                          <a
                            href={entry.photo_url.startsWith('http') ? entry.photo_url : `http://localhost:3000${entry.photo_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            📷 Foto ansehen
                          </a>
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleReview(entry.id, 'approve')}
                          className="rounded-2xl bg-green-600 px-5 py-3 text-white hover:bg-green-700"
                        >
                          Genehmigen
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview(entry.id, 'reject')}
                          className="rounded-2xl bg-red-600 px-5 py-3 text-white hover:bg-red-700"
                        >
                          Ablehnen
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
