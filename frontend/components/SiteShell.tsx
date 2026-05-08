import Link from 'next/link';

type SiteShellProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export default function SiteShell({ title, description, children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-slate-900">
      <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          <div>
            <Link href="/" className="text-2xl font-bold text-blue-600">
              ElementTracker
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <Link href="/entries" className="hover:text-blue-600">
              Einträge
            </Link>
            <Link href="/entries/new" className="hover:text-blue-600">
              Eintragen
            </Link>
            <Link href="/map" className="hover:text-blue-600">
              Karte
            </Link>
            <div className="flex items-center gap-1 hover:text-blue-600">
              <Link href="/admin" className="hover:text-blue-600">
                Admin
              </Link>
              <span className="text-slate-400">▼</span>
            </div>
            <Link href="/admin/elements" className="hover:text-blue-600 ml-2 pl-2 border-l border-slate-300">
              • Element Verwaltung
            </Link>
            <Link href="/datenschutz" className="hover:text-blue-600">
              Datenschutz
            </Link>
            <Link href="/impressum" className="hover:text-blue-600">
              Impressum
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
              {description}
            </p>
          ) : null}
        </header>

        <section>{children}</section>
      </main>

      <footer className="bg-slate-900 text-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <p className="text-sm">© 2026 ElementTracker. Alle Rechte vorbehalten.</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
            <Link href="/datenschutz" className="hover:text-white">
              Datenschutz
            </Link>
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
