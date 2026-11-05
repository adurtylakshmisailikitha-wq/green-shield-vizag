import React, { useState } from 'react';
import { Camera, ShieldCheck, MapPin, BarChart3, Info, Menu, X, Globe, Sparkles, Users, AlertTriangle, Home } from 'lucide-react';
import { Language, ScreenType } from '../types';
import { getTranslation } from '../utils/i18n';

interface NavbarProps {
  currentScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenCapture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onSelectScreen,
  language,
  onToggleLanguage,
  onOpenCapture,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: getTranslation(language, 'navHome'), icon: Home },
    { id: 'feed', label: getTranslation(language, 'navFeed'), icon: ShieldCheck },
    { id: 'map', label: getTranslation(language, 'navMap'), icon: MapPin },
    { id: 'csr', label: getTranslation(language, 'navCsr'), icon: BarChart3 },
    { id: 'ngos', label: getTranslation(language, 'navNgos'), icon: Users },
    { id: 'complaints', label: getTranslation(language, 'navComplaints'), icon: AlertTriangle },
    { id: 'about', label: getTranslation(language, 'navAbout'), icon: Info },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-md border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectScreen('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E676] to-[#00A854] flex items-center justify-center text-black shadow-[0_0_15px_rgba(0,230,118,0.3)] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  GREEN SHIELD <span className="text-[#00E676]">VIZAG</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-[#1F2922] text-[#00E676] border border-[#00E676]/30 rounded">
                  by volt vision
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] hidden md:block">
                Visakhapatnam Sapling Geo-Tracking & Survival Logs
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectScreen(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#1E2E24] text-[#00E676] border border-[#00E676]/40 shadow-[0_0_12px_rgba(0,230,118,0.15)]'
                      : 'text-[#D1D1D6] hover:text-white hover:bg-[#1E1E1E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00E676]' : 'text-[#8E8E93]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language switch */}
            <button
              onClick={onToggleLanguage}
              aria-label="Toggle Language"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333] bg-[#1A1A1A] text-xs font-mono font-bold text-[#E5E5EA] hover:border-[#00E676] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#FFD600]" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* Primary Action Button: Capture Live Camera Photo */}
            <button
              onClick={onOpenCapture}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#00E676] text-black shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:bg-[#15f385] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>{getTranslation(language, 'captureLivePhoto')}</span>
              <Sparkles className="w-3.5 h-3.5 text-black/70 animate-pulse" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#D1D1D6] hover:text-white hover:bg-[#1E1E1E] rounded-lg"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#2A2A2A] bg-[#161616] px-4 pt-3 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectScreen(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-left transition-colors ${
                  isActive
                    ? 'bg-[#1E2E24] text-[#00E676] border border-[#00E676]/40'
                    : 'text-[#E5E5EA] hover:bg-[#202020]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00E676]' : 'text-[#8E8E93]'}`} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenCapture();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>{getTranslation(language, 'captureLivePhoto')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
