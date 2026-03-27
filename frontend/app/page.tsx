/**
 * Home Page - Landing Page
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ElementTracker</h1>
          <div className="space-x-4">
            <a href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </a>
            <a href="/entries/new" className="text-gray-700 hover:text-blue-600">
              Daten eintragen
            </a>
            <a href="/map" className="text-gray-700 hover:text-blue-600">
              Karte
            </a>
            <a href="/admin" className="text-gray-700 hover:text-blue-600">
              Admin
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Intelligentes Tracking-System
        </h2>
        <p className="text-xl text-gray-700 mb-8">
          Erfasse, visualisiere und verfolge räumliche Daten auf einer
          interaktiven Karte.
        </p>

        <div className="grid md:grid-cols-3 gap-8 my-12">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-xl font-bold mb-4">GPS-Tracking</h3>
            <p className="text-gray-600">
              Erfasse Positionen mit GPS-Koordinaten oder Adresse
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold mb-4">Kartendarstellung</h3>
            <p className="text-gray-600">
              Visualisiere alle Einträge auf einer zoombar Karte
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-4">Sicher & DSGVO</h3>
            <p className="text-gray-600">
              Enterprise-Grade Sicherheit mit vollständiger Datenschutz
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <a
            href="/entries/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Jetzt starten
          </a>
          <a
            href="/map"
            className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-900 px-8 py-3 rounded-lg font-semibold"
          >
            Karte ansehen
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p>&copy; 2026 ElementTracker. Alle Rechte vorbehalten.</p>
          <div className="mt-4 space-x-4">
            <a href="/datenschutz" className="hover:text-blue-400">
              Datenschutz
            </a>
            <a href="/impressum" className="hover:text-blue-400">
              Impressum
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
