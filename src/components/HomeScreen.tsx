import React from 'react';
import {
  ShieldCheck,
  Camera,
  MapPin,
  BarChart3,
  Users,
  AlertTriangle,
  TreePine,
  ExternalLink,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Leaf,
  CheckCircle2,
  Info,
  Building2,
  Compass
} from 'lucide-react';
import { SaplingRecord, Language, ScreenType } from '../types';
import { STAT_CARDS_FACTS } from '../data/sampleData';
import { calculateMetrics } from '../utils/storage';
import { getTranslation } from '../utils/i18n';

interface HomeScreenProps {
  saplings: SaplingRecord[];
  onOpenCapture: () => void;
  onSelectScreen: (screen: ScreenType) => void;
  language: Language;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  saplings,
  onOpenCapture,
  onSelectScreen,
  language,
}) => {
  const metrics = calculateMetrics(saplings);

  return (
    <div className="space-y-10 pb-16">
      {/* HERO SECTION: HEADING, AIM & TEAM VOLT VISION TAG */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#182B1F] via-[#141C17] to-[#121212] border-2 border-[#00E676]/40 p-6 sm:p-12 lg:p-16 shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E676]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFD600]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          {/* TEAM VOLT VISION ATTRIBUTION TAG BADGE */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121212] border-2 border-[#00E676] text-[#00E676] text-xs font-mono font-extrabold tracking-wider shadow-[0_0_15px_rgba(0,230,118,0.3)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] animate-ping" />
              <span>TEAM VOLT VISION</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A] border border-[#333] text-xs text-[#D1D1D6] font-mono">
              <MapPin className="w-3.5 h-3.5 text-[#FFD600]" />
              <span>Visakhapatnam, Andhra Pradesh, India</span>
            </div>
          </div>

          {/* MAIN APP HEADING */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none uppercase font-['Plus_Jakarta_Sans']">
              GREEN SHIELD <span className="text-[#00E676] drop-shadow-[0_0_25px_rgba(0,230,118,0.4)]">VIZAG</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono uppercase tracking-widest text-[#FFD600] font-bold">
              Crowdsourced Post-Plantation Sapling Survival & Geo-Tracking Platform
            </p>
          </div>

          {/* OFFICIAL AIM & PROMISE */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121212]/90 border border-[#00E676]/30 shadow-inner space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#00E676] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Our Core Mission & One-Line Promise:</span>
            </div>
            <p className="text-lg sm:text-2xl font-extrabold text-white leading-snug">
              Turn one-off tree drives into{' '}
              <span className="text-[#00E676] underline decoration-[#00E676]/40 underline-offset-4">
                photo-verified sapling survival logs
              </span>{' '}
              across Visakhapatnam.
            </p>
            <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
              <strong>Our Pitch:</strong> GREEN SHIELD VIZAG is a mobile geo-tracking app that turns one-off tree planting drives into photo-verified sapling survival logs for NGOs and CSR sponsors in Vizag. Unlike static municipal portals, we focus on crowdsourced post-plantation survival tracking and automated volunteer care scheduling.
            </p>
          </div>

          {/* MAIN ACTIONS ROW */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Primary Action Button */}
            <button
              onClick={onOpenCapture}
              className="py-4 px-7 rounded-2xl bg-[#00E676] text-black font-black text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(0,230,118,0.55)] hover:bg-[#15f385] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Capture Live Camera Photo</span>
              <Sparkles className="w-4 h-4 text-black animate-spin" />
            </button>

            <button
              onClick={() => onSelectScreen('map')}
              className="py-4 px-6 rounded-2xl bg-[#1C1C1C] hover:bg-[#252525] text-white font-bold text-sm border border-[#333] hover:border-[#00E676] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#00E676]" />
              <span>Explore Ward GPS Map</span>
            </button>

            <button
              onClick={() => onSelectScreen('feed')}
              className="py-4 px-6 rounded-2xl bg-[#1C1C1C] hover:bg-[#252525] text-white font-bold text-sm border border-[#333] hover:border-[#FFD600] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#FFD600]" />
              <span>View Active Care Feed</span>
            </button>
          </div>
        </div>
      </section>

      {/* VERIFIED FIELD METRICS STRIP */}
      <section className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono font-bold text-[#8E8E93] uppercase">
            Live Visakhapatnam Canopy Audit Indicators
          </span>
          <span className="text-xs font-mono text-[#00E676] font-bold">Updated Live</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2B2B2B]">
            <span className="text-[11px] text-[#8E8E93] block">Monthly Active Saplings (MAS)</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#00E676] mt-1">
              {metrics.monthlyActiveSaplings}
            </div>
            <span className="text-[10px] text-[#A0A0A0] mt-0.5 block">Audited with photo telemetry</span>
          </div>

          <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2B2B2B]">
            <span className="text-[11px] text-[#8E8E93] block">Verified Sapling Survival</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
              {metrics.survivalRatePercent}%
            </div>
            <span className="text-[10px] text-[#00E676] mt-0.5 block">vs. &lt;30% municipal failure avg</span>
          </div>

          <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2B2B2B]">
            <span className="text-[11px] text-[#8E8E93] block">Volunteer 30-Day Retention</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#FFD600] mt-1">
              {metrics.retentionRatePercent}%
            </div>
            <span className="text-[10px] text-[#A0A0A0] mt-0.5 block">University NSS & Green Clubs</span>
          </div>

          <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2B2B2B]">
            <span className="text-[11px] text-[#8E8E93] block">CSR Verification Rate</span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#38BDF8] mt-1">
              ₹30,000
            </div>
            <span className="text-[10px] text-[#A0A0A0] mt-0.5 block">per 100-sapling / 1-year package</span>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS: 3 High-Impact Fact Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-[#FFD600]" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Why Visakhapatnam Needs Real-Time Sapling Tracking
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8E8E93] hidden sm:inline">CITATIONS & DATA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STAT_CARDS_FACTS.map((fact) => (
            <div
              key={fact.id}
              className="bg-[#181818] border border-[#2A2A2A] hover:border-[#3E3E3E] rounded-2xl p-5 flex flex-col justify-between transition-all hover:translate-y-[-2px] shadow-lg"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${fact.accentColor}20`,
                      color: fact.accentColor,
                      border: `1px solid ${fact.accentColor}40`,
                    }}
                  >
                    {fact.metric}
                  </span>
                  <span className="text-[11px] text-[#8E8E93] font-medium">{fact.source}</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-white leading-snug">
                  {fact.headline}
                </h3>

                <p className="text-xs text-[#A0A0A0] leading-relaxed">
                  {fact.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-[#252525] flex items-center justify-between">
                <span className="text-[11px] text-[#71717A] italic">{fact.subtext}</span>
                <a
                  href={fact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00E676] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <span>Report</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM vs SOLUTION vs WHAT MAKES US DIFFERENT */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* The Problem */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#291717] border border-[#FF5252]/40 flex items-center justify-center text-[#FF5252]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white">The Problem It Solves</h3>
          <p className="text-xs text-[#A0A0A0] leading-relaxed">
            Urban tree plantation drives in Visakhapatnam suffer from low sapling survival rates because NGOs and volunteer groups lack tools to geo-tag and monitor post-plantation care. Saplings dehydrate without follow-up watering schedules.
          </p>
        </div>

        {/* Our Solution */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#172B1E] border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white">Our Solution</h3>
          <p className="text-xs text-[#A0A0A0] leading-relaxed">
            For Vizag NGOs and student groups who struggle to track saplings, GREEN SHIELD VIZAG is a mobile geo-tracking platform that enables photo-verified monthly sapling audit logs and automated volunteer watering tasks.
          </p>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 sm:p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#282414] border border-[#FFD600]/40 flex items-center justify-center text-[#FFD600]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-white">What Makes Us Different</h3>
          <p className="text-xs text-[#A0A0A0] leading-relaxed">
            "No solution provides hyper-local sapling survival tracking and volunteer care scheduling for Indian municipal wards." We connect corporate CSR sponsors directly with verified field proof.
          </p>
        </div>
      </section>

      {/* QUICK EXPLORATION TILES: ALL PLATFORM MODULES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Explore the Platform Modules</span>
          </h2>
          <span className="text-xs text-[#8E8E93]">Tap to open module</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Campus Audit Feed */}
          <div
            onClick={() => onSelectScreen('feed')}
            className="p-5 rounded-2xl bg-[#181818] hover:bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#00E676] cursor-pointer transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#18261E] text-[#00E676] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#00E676] group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-base text-white mb-1 group-hover:text-[#00E676] transition-colors">
              Campus Audit Feed
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Live NSS drives, priority watering alerts, overdue warnings, and student streak leaderboard.
            </p>
          </div>

          {/* Card 2: Live Tree Tag Map */}
          <div
            onClick={() => onSelectScreen('map')}
            className="p-5 rounded-2xl bg-[#181818] hover:bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#00E676] cursor-pointer transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#18261E] text-[#00E676] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#00E676] group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-base text-white mb-1 group-hover:text-[#00E676] transition-colors">
              Live Tree Tag Map
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Interactive Leaflet dark mode map with GPS pins, health badges, and Red/Yellow/Green zone filters.
            </p>
          </div>

          {/* Card 3: CSR Impact Exporter */}
          <div
            onClick={() => onSelectScreen('csr')}
            className="p-5 rounded-2xl bg-[#181818] hover:bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#00E676] cursor-pointer transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#282414] text-[#FFD600] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#FFD600] group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-base text-white mb-1 group-hover:text-[#FFD600] transition-colors">
              CSR Impact Exporter
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Executive ESG dashboard and one-click downloadable CSR impact PDF for corporate sponsors.
            </p>
          </div>

          {/* Card 4: Reachable NGOs Directory */}
          <div
            onClick={() => onSelectScreen('ngos')}
            className="p-5 rounded-2xl bg-[#181818] hover:bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#00E676] cursor-pointer transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#18261E] text-[#00E676] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#00E676] group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-base text-white mb-1 group-hover:text-[#00E676] transition-colors">
              Reachable NGOs All Around
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Direct contacts for 8 verified Visakhapatnam NSS cells, student green clubs, and arboricultural societies.
            </p>
          </div>

          {/* Card 5: File Complaint / Query */}
          <div
            onClick={() => onSelectScreen('complaints')}
            className="p-5 rounded-2xl bg-[#181818] hover:bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#FF5252] cursor-pointer transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#2B1717] text-[#FF5252] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#FF5252] group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-base text-white mb-1 group-hover:text-[#FF5252] transition-colors">
              File Complaint / Query
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Report illegal tree felling along highway corridors, broken tree guards, or submit general civic queries.
            </p>
          </div>

          {/* Card 6: About volt vision */}
          <div
            onClick={() => onSelectScreen('about')}
            className="p-5 rounded-2xl bg-[#181818] hover:bg-[#1E1E1E] border border-[#2A2A2A] hover:border-[#38BDF8] cursor-pointer transition-all group shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#16222E] text-[#38BDF8] flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-[#8E8E93] group-hover:text-[#38BDF8] group-hover:translate-x-1 transition-all" />
            </div>
            <h4 className="font-bold text-base text-white mb-1 group-hover:text-[#38BDF8] transition-colors">
              About & Team Attribution
            </h4>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Learn about team volt vision, why post-plantation survival tracking matters, and reset local data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
