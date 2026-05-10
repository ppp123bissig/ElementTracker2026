"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import SiteShell from '../../../components/SiteShell';
import { getAPIBaseURL } from '../../../lib/api';

// Dynamisches Import für Leaflet-Karte (SSR-sicher)
const PositionMap = dynamic(() => import('../../../components/PositionMap'), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
      <p className="text-slate-600 text-sm">Lade Positions-Karte...</p>
    </div>
  ),
});

interface Element {
  id: string;
  name: string;
  owner_name: string;
  description: string;
  is_approved: boolean;
}

export default function EntryForm() {
  const [elements, setElements] = useState<Element[]>([]);
  const [elementId, setElementId] = useState('');
  const [elementMode, setElementMode] = useState<'existing' | 'custom'>('existing');
  const [customElementId, setCustomElementId] = useState('');
  const [latitude, setLatitude] = useState('52.5200');
  const [longitude, setLongitude] = useState('13.4050');
  const [address, setAddress] = useState('Berlin');
  const [locationName, setLocationName] = useState('Tiergarten');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [comment, setComment] = useState('Frontend test entry');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | ''>('');
  const [loadingElements, setLoadingElements] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('elementtracker_token') : null;

  const loadElements = async (forceSetFirstElement = false) => {
    setLoadingElements(true);
    try {
      const res = await fetch(`${getAPIBaseURL()}/api/v1/elements`);
      const json = await res.json();
      if (json.success) {
        setElements(json.elements);
        // Nur auf erstes Element setzen wenn:
        // 1. forceSetFirstElement true ist (initial load)
        // 2. UND noch kein Element selected wurde
        if (forceSetFirstElement && json.elements.length > 0 && !elementId) {
          setElementId(json.elements[0].id);
          setElementMode('existing');
        }
      }
    } catch (err) {
      console.error('Failed to load elements:', err);
    } finally {
      setLoadingElements(false);
    }
  };

  useEffect(() => {
    loadElements(true); // Initial load: true
    // Auto-refresh every 30 seconds, aber NICHT das elementId zurücksetzen
    const interval = setInterval(() => loadElements(false), 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || photoPreview === '') {
      return null;
    }

    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const base64String = event.target?.result as string;
            const res = await fetch(`${getAPIBaseURL()}/api/v1/upload`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ photo: base64String }),
            });

            const json = await res.json();
            if (json.success && json.url) {
              const absoluteUrl = json.url.startsWith('http')
                ? json.url
                : `${getAPIBaseURL()}${json.url}`;
              resolve(absoluteUrl);
            } else {
              console.error('Upload failed:', json.error);
              resolve(null);
            }
          } catch (error) {
            console.error('Upload error:', error);
            resolve(null);
          }
        };
        reader.onerror = () => {
          console.error('FileReader error');
          resolve(null);
        };
        reader.readAsDataURL(photoFile);
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const selectedElementId = elementMode === 'custom' ? customElementId.trim() : elementId;
    if (!selectedElementId) {
      setFeedback('Bitte geben Sie eine Element-ID ein.');
      setFeedbackType('error');
      return;
    }

    // Upload photo if provided
    const photoUrl = await uploadPhoto();

    const body = {
      element_id: selectedElementId,
      timestamp: new Date().toISOString(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address,
      location_name: locationName,
      comment,
      notification_email: notificationEmail,
      photo_url: photoUrl || null,
    };

    try {
      const res = await fetch(`${getAPIBaseURL()}/api/v1/pending-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFeedback(`Fehler: ${json.error || res.statusText}`);
        setFeedbackType('error');
        return;
      }

      const message = json.message ||
        (json.pending_entry
          ? 'Eintrag wurde zur Prüfung eingereicht. Ein Admin überprüft die Freigabe.'
          : 'Eintrag wurde gespeichert.');

      setFeedback(`${message} Du kannst einen weiteren Eintrag vornehmen.`);
      setFeedbackType('success');
      setComment('');
      setNotificationEmail('');
      setPhotoFile(null);
      setPhotoPreview('');
      
      // Reload elements after 2 seconds in case admin approved one
      setTimeout(() => {
        loadElements();
      }, 2000);
    } catch (error) {
      setFeedback(`Netzwerkfehler: ${error}`);
      setFeedbackType('error');
    }
  };

  return (
    <SiteShell
      title="Daten erfassen"
      description="Sende neue Standortdaten für ein Element. Optional kannst du einen Ortstitel, E-Mail-Benachrichtigung und Kommentar ergänzen."
    >
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setElementMode('existing')}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  elementMode === 'existing'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                disabled={loadingElements || elements.length === 0}
              >
                Bestehendes Element
              </button>
              <button
                type="button"
                onClick={() => setElementMode('custom')}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  elementMode === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Neues Element
              </button>
            </div>

            {elementMode === 'existing' ? (
              <label className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Element</span>
                  <button
                    type="button"
                    onClick={() => loadElements()}
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                    disabled={loadingElements}
                  >
                    {loadingElements ? 'Aktualisiere...' : '🔄 Aktualisieren'}
                  </button>
                </div>
                <select
                  value={elementId}
                  onChange={(e) => setElementId(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                  disabled={loadingElements || elements.length === 0}
                >
                  <option value="">{loadingElements ? 'Lade Elemente...' : 'Wähle ein Element...'}</option>
                  {elements.length > 0 && elements.map((element) => (
                    <option key={element.id} value={element.id}>
                      {element.name} ({element.id})
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Neue Element-ID</span>
                <input
                  value={customElementId}
                  onChange={(e) => setCustomElementId(e.target.value)}
                  placeholder="Z.B. ELEMENT_42"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </label>
            )}
          </div>
          <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Zeitpunkt</span>
              <input
                value={new Date().toISOString().slice(0, 16)}
                readOnly
                className="w-full rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500"
              />
            </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Latitude</span>
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="52.5200"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Longitude</span>
              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="13.4050"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">Karte wird mit den aktuellen Koordinaten automatisch aktualisiert.</p>
            <button
              type="button"
              onClick={async () => {
                if (!navigator.geolocation) {
                  setFeedback('Geolocation wird von Ihrem Browser nicht unterstützt.');
                  setFeedbackType('error');
                  return;
                }

                setGeoLoading(true);
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setLatitude(position.coords.latitude.toFixed(6));
                    setLongitude(position.coords.longitude.toFixed(6));
                    setFeedback('Geräteposition erfolgreich übernommen.');
                    setFeedbackType('success');
                    setGeoLoading(false);
                  },
                  (error) => {
                    setFeedback(`Konnte Geräteposition nicht ermitteln: ${error.message}`);
                    setFeedbackType('error');
                    setGeoLoading(false);
                  },
                  { enableHighAccuracy: true, timeout: 10000 }
                );
              }}
              className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
              disabled={geoLoading}
            >
              {geoLoading ? 'Position ermitteln...' : 'Geräteposition verwenden'}
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Position auf Karte setzen (optional)</span>
            <PositionMap
              latitude={parseFloat(latitude) || 52.52}
              longitude={parseFloat(longitude) || 13.405}
              onPositionChange={(lat, lng) => {
                setLatitude(lat.toFixed(6));
                setLongitude(lng.toFixed(6));
              }}
            />
          </div>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Adresse</span>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Berlin, Germany"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Ortstitel (optional)</span>
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Tiergarten"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Benachrichtigungs-E-Mail (optional)</span>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder="observer@example.com"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Kommentar</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Beobachtung, Zustand oder Hinweise"
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Foto (optional)</span>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:text-blue-700 file:font-medium"
              />
              {photoPreview && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Vorschau:</p>
                  <img src={photoPreview} alt="preview" className="w-full max-w-sm rounded-2xl border border-slate-200 shadow-sm" />
                  <p className="text-xs text-slate-500">Das Foto wird mit dem Eintrag hochgeladen.</p>
                </div>
              )}
              {photoFile && <p className="text-xs text-slate-600">Datei: {photoFile.name} ({(photoFile.size / 1024).toFixed(2)} KB)</p>}
            </div>
          </label>

          <div className="space-y-3">
            <button type="submit" className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700">
              Eintrag speichern
            </button>
            <p className="text-sm text-slate-500">
              Hinweis: Bei einem bestehenden Element wird der Eintrag direkt gespeichert. Bei einer neuen Element-ID wird der Eintrag als Vorab-Eintrag eingereicht und muss von einem Admin freigegeben werden.
            </p>
          </div>

          {feedback ? (
            <p className={`text-sm ${feedbackType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {feedback}
            </p>
          ) : null}
        </form>
      </div>
    </SiteShell>
  );
}
