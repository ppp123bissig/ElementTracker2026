"use client";

import { useState } from 'react';
import SiteShell from '../../components/SiteShell';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [message, setMessage] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage(`Login fehlgeschlagen: ${json.error || res.statusText}`);
        return;
      }

      localStorage.setItem('elementtracker_token', json.token);
      setMessage('Login erfolgreich! Token gespeichert.');
    } catch (error) {
      setMessage(`Error: ${error}`);
    }
  };

  return (
    <SiteShell
      title="Admin Login"
      description="Melden Sie sich an, um administrative Funktionen wie Elementfreigabe und Eintragsverwaltung zu nutzen."
    >
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
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
          <button type="submit" className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700">
            Anmelden
          </button>
          {message && <p className="text-sm text-indigo-700">{message}</p>}
        </form>
      </div>
    </SiteShell>
  );
}
