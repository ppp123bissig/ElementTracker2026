import SiteShell from '../../components/SiteShell';

export default function DatenschutzPage() {
  return (
    <SiteShell
      title="Datenschutzerklärung"
      description="Diese Seite informiert über die Datenerfassung, Rechtmäßigkeit und Verarbeitung personenbezogener Daten im ElementTracker-Projekt."
    >
      <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Datenerfassung</h2>
          <p className="text-slate-600">
            Der ElementTracker erfasst nur die unbedingt notwendigen Daten für die Auswertung räumlicher Ereignisse: Element-ID, Zeitpunkt, Standort, Kommentar und optional ein Foto oder Kontaktadresse.
          </p>
          <p className="text-slate-600">
            Personenbezogene Daten wie E-Mail-Adressen werden nur optional erhoben und dienen ausschließlich der Benachrichtigung oder Dokumentation.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Rechtsgrundlage</h2>
          <p className="text-slate-600">
            Die Verarbeitung erfolgt nach den Anforderungen der DSGVO und ist auf die Zwecke der Projektsteuerung, Datenqualität und Prüfprozesse beschränkt.
          </p>
          <p className="text-slate-600">
            Es werden keine Nutzerprofile erstellt, und offene Kartendarstellungen enthalten keine direkte Zuordnung zu einzelnen Personen. Nur administrative Benutzer erhalten Zugriff auf das interne Management-Interface.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Speicherdauer</h2>
          <p className="text-slate-600">
            Daten werden nur so lange gespeichert, wie es für den Betrieb des Systems erforderlich ist. Bei Löschungsanfragen werden betroffene Daten gemäß gesetzlichen Vorgaben entfernt oder anonymisiert.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Kontakt</h2>
          <p className="text-slate-600">
            Bei Fragen zur Datenverarbeitung erreichen Sie uns unter <strong>admin@example.com</strong> oder <strong>datenschutz@example.com</strong>.
          </p>
          <p className="text-slate-600">Bitte verwenden Sie diese Adresse auch für Berichtigungs- oder Löschungsanfragen.</p>
        </section>
      </div>
    </SiteShell>
  );
}
