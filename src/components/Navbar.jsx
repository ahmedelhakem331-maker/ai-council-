'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();

  const links = [
    { href: '/', label: t('home') },
    { href: '/dashboard', label: t('council') },
    { href: '/history', label: t('history') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet flex items-center justify-center text-white font-outfit font-bold text-sm">
                AC
              </div>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-300" />
            </div>
            <span className="font-outfit font-bold text-lg tracking-tight">
              {t('aiCouncil')}
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? 'text-neon-cyan bg-neon-cyan/10'
                    : 'text-dark-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="text-dark-200 hover:text-white font-medium text-sm px-2 py-1 transition-colors"
            >
              {language === 'en' ? 'ع' : 'EN'}
            </button>
            
            {/* CTA Button */}
            <Link
              href="/dashboard"
              className="btn-neon bg-gradient-to-r from-neon-cyan/10 to-neon-violet/10 text-white text-sm px-5 py-2.5 rounded-lg inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {t('startCouncil')}
            </Link>
          </div>

          {/* Mobile Right Section */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleLanguage}
              className="text-dark-200 hover:text-white font-medium text-sm px-2 py-1 transition-colors"
            >
              {language === 'en' ? 'ع' : 'EN'}
            </button>
            
            {/* Mobile Menu Button */}
            <button
              className="p-2 rounded-lg text-dark-200 hover:text-white hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === link.href
                      ? 'text-neon-cyan bg-neon-cyan/10'
                      : 'text-dark-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="mt-2 btn-neon bg-gradient-to-r from-neon-cyan/10 to-neon-violet/10 text-white text-sm text-center py-3 rounded-lg"
              >
                {t('startCouncil')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
