/**
 * Layout Root Component
 * Global layout für alle Seiten
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ElementTracker - Tracking System',
  description:
    'Modernes Web-Tracking-System für räumliche Datenerfassung und Kartendarstellung',
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="icon" href="/favicon.ico" />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
        />
      </head>
      <body className="bg-light text-dark">
        <main>{children}</main>
      </body>
    </html>
  );
}
