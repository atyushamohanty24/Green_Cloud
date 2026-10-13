'use client';

import React, { useState } from 'react';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { AlertCircle } from 'lucide-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentRole, setCurrentRole] = useState<string>('admin');

  return (
    <html lang="en" className="dark">
      <head>
        <title>GreenCloud AI — Sustainable Cloud Optimization & Carbon-Aware Management</title>
        <meta name="description" content="Portfolio/Academic grade prototype for cloud resource monitoring, ML demand prediction, cost and carbon optimization, and safety governance." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        
        {/* Top Navbar */}
        <Navbar currentRole={currentRole} onRoleChange={setCurrentRole} />

        {/* Disclaimer Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-xs text-amber-400 font-medium flex items-center justify-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            <strong>Disclaimer:</strong> GreenCloud AI is an independent academic/portfolio project and is not affiliated with or an official product of Amazon Web Services (AWS). All financial savings and carbon footprint figures are ESTIMATES.
          </span>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {React.cloneElement(children as React.ReactElement, { currentRole })}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/40 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © 2026 GreenCloud AI Platform. Open Source Portfolio Architecture.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Next.js 14</span>
              <span>•</span>
              <span>FastAPI</span>
              <span>•</span>
              <span>Random Forest ML</span>
              <span>•</span>
              <span>SQLite</span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
