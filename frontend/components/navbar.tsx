'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Sun, Moon, Shield, UserCheck, Activity } from 'lucide-react';

interface NavbarProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRole, onRoleChange }) => {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/resources', label: 'Resources' },
    { href: '/recommendations', label: 'Action Hub' },
    { href: '/carbon', label: 'Carbon & Scheduler' },
    { href: '/audit', label: 'Audit Log' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition-transform">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-xl text-foreground">GreenCloud</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-400 uppercase border border-emerald-500/30">
                AI Platform
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground text-slate-400 hidden sm:block">Sustainable Cloud Optimization Engine</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full bg-card/60 p-1 border border-border">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-foreground/70 hover:text-foreground hover:bg-card-hover'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Utility Bar: Role Selector + Dark Mode Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Simulated IAM Role Picker */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">IAM Role:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-transparent font-semibold text-foreground focus:outline-none cursor-pointer text-xs"
              aria-label="Select IAM Simulated Role"
            >
              <option value="admin" className="bg-card text-foreground">Admin (Full Execution)</option>
              <option value="operator" className="bg-card text-foreground">Operator (Low-Risk Only)</option>
              <option value="viewer" className="bg-card text-foreground">Viewer (Read Only)</option>
            </select>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-card-hover transition-colors"
            title="Toggle Light / Dark Mode"
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-emerald-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
