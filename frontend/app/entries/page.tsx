import SiteShell from '../../components/SiteShell';
import EntriesList from '../../components/EntriesList';

export default function EntriesPage() {
  return (
    <SiteShell
      title="Alle Einträge"
      description="Übersicht aller erfassten Standortdaten. Du kannst nach Element-ID filtern und die Einträge sortieren."
    >
      <EntriesList />
    </SiteShell>
  );
}
