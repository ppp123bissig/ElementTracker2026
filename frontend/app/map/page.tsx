import dynamic from 'next/dynamic';
import SiteShell from '../../components/SiteShell';

const MapViewer = dynamic(() => import('../../components/MapViewer'), {
  ssr: false,
});

export default function MapPage() {
  return (
    <SiteShell
      title="Kartendarstellung"
      description="Alle erfassten Einträge werden auf einer interaktiven Karte angezeigt. Filtere nach Element-ID, um nur die relevanten Daten zu sehen."
    >
      <MapViewer />
    </SiteShell>
  );
}
