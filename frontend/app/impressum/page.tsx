import SiteShell from '../../components/SiteShell';

export default function ImpressumPage() {
  return (
    <SiteShell
      title="Impressum"
      description="Angaben gemäß § 5 TMG zum Betreiber des ElementTracker-Projekts."
    >
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Betreiber</h2>
          <p className="text-slate-600">ElementTracker2026 GmbH</p>
          <p className="text-slate-600">Musterstraße 1</p>
          <p className="text-slate-600">12345 Musterstadt</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Kontakt</h2>
          <p className="text-slate-600">E-Mail: <strong>admin@example.com</strong></p>
          <p className="text-slate-600">Telefon: <strong>+49 30 1234567</strong></p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Verantwortlich für den Inhalt</h2>
          <p className="text-slate-600">Max Mustermann</p>
          <p className="text-slate-600">Musterstraße 1, 12345 Musterstadt</p>
        </section>
      </div>
    </SiteShell>
  );
}
