import SiteShell from '../components/SiteShell';

export default function Home() {
  return (
    <SiteShell
      title="ElementTracker"
      description="Intelligentes Tracking-System für die Erfassung und Visualisierung räumlicher Daten."
    >
      <div className="space-y-12">
        <section className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h2 className="text-5xl font-bold tracking-tight text-slate-900 mb-6">
            Erfasse, visualisiere und verwalte Standortdaten einfach.
          </h2>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            Der ElementTracker verbindet eine intuitive Dateneingabe mit einer interaktiven Kartendarstellung für schnelle Auswertungen und transparente Kontrolle. Ideal für Projekte, die GPS-Ereignisse, Foto-Vor-Ort-Belege und DSGVO-konforme Admin-Prozesse benötigen.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="/entries/new"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-white shadow hover:bg-blue-700"
            >
              Jetzt Daten eintragen
            </a>
            <a
              href="/map"
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-8 py-3 text-slate-900 hover:bg-slate-200"
            >
              Karte anzeigen
            </a>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">GPS-basierte Erfassung</h3>
            <p className="text-slate-600">Erfasse Standortdaten mit Koordinaten, Adresse und optionalen Fotos.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Interaktive Karte</h3>
            <p className="text-slate-600">Visualisiere Punkte direkt auf einer zoombaren OpenStreetMap-Karte.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Sichere Verwaltung</h3>
            <p className="text-slate-600">Admin-Login, DSGVO-konforme Datenschutzerklärung und Impressum sind integriert.</p>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
