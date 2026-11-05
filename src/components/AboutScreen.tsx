import React from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  DollarSign,
  MapPin,
  TrendingUp,
  Camera,
  Trash2,
  ExternalLink,
  Award,
  Sparkles
} from 'lucide-react';
import { SaplingRecord, Language } from '../types';
import { calculateMetrics } from '../utils/storage';
import { getTranslation } from '../utils/i18n';

interface AboutScreenProps {
  saplings: SaplingRecord[];
  onOpenCapture: () => void;
  onClearData: () => void;
  language: Language;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({
  saplings,
  onOpenCapture,
  onClearData,
  language,
}) => {
  const metrics = calculateMetrics(saplings);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Hero Section */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18261E] border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>TEAM VOLT VISION • VISAKHAPATNAM</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
          About GREEN SHIELD VIZAG
        </h1>

        <div className="p-4 rounded-xl bg-[#132219] border border-[#00E676]/30 text-white font-medium text-sm sm:text-base leading-relaxed">
          <strong className="text-[#00E676]">Our Pitch:</strong> GREEN SHIELD VIZAG is a mobile geo-tracking app that turns one-off tree planting drives into photo-verified sapling survival logs for NGOs and CSR sponsors in Vizag.
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={onOpenCapture}
            className="flex items-center gap-2 py-3 px-5 rounded-xl font-bold text-sm bg-[#00E676] text-black shadow-[0_0_20px_rgba(0,230,118,0.35)] hover:bg-[#15f385] transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
            <span>{getTranslation(language, 'captureLivePhoto')}</span>
          </button>
        </div>
      </div>

      {/* Required Stats Strip: MAS, Retention, Survival Rate */}
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-5 shadow-lg">
        <div className="text-xs font-mono font-bold text-[#8E8E93] uppercase mb-3">
          Verified Field Metrics Strip
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2B2B2B]">
            <span className="text-xs text-[#8E8E93] block">Monthly Active Saplings (MAS)</span>
            <div className="text-3xl font-extrabold font-mono text-[#00E676] mt-1">
              {metrics.monthlyActiveSaplings}
            </div>
            <span className="text-[11px] text-[#A0A0A0] mt-1 block">
              Audited with geo-photo logs in last 30 days
            </span>
          </div>

          <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2B2B2B]">
            <span className="text-xs text-[#8E8E93] block">Volunteer 30-Day Retention Rate</span>
            <div className="text-3xl font-extrabold font-mono text-[#FFD600] mt-1">
              {metrics.retentionRatePercent}%
            </div>
            <span className="text-[11px] text-[#A0A0A0] mt-1 block">
              Active university NSS & youth club retention
            </span>
          </div>

          <div className="bg-[#1C1C1C] p-4 rounded-xl border border-[#2B2B2B]">
            <span className="text-xs text-[#8E8E93] block">Verified Sapling Survival Rate</span>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">
              {metrics.survivalRatePercent}%
            </div>
            <span className="text-[11px] text-[#00E676] mt-1 block">
              Outperforming the sub-30% municipal average
            </span>
          </div>
        </div>
      </div>

      {/* The Problem & Our Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Card */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#291717] border border-[#FF5252]/40 flex items-center justify-center text-[#FF5252]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">The Problem It Solves</h2>
          <p className="text-sm text-[#A0A0A0] leading-relaxed">
            Urban tree plantation drives in Visakhapatnam suffer from low sapling survival rates because NGOs and volunteer groups lack tools to geo-tag and monitor post-plantation care. Trees are planted with fanfare during VIP drives, but within weeks dehydrate or have their tree guards vandalized due to zero follow-up tracking.
          </p>
        </div>

        {/* Solution Card */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#172B1E] border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Our Solution</h2>
          <p className="text-sm text-[#A0A0A0] leading-relaxed">
            For Vizag NGOs and student groups who struggle to track saplings, <strong>GREEN SHIELD VIZAG</strong> is a mobile geo-tracking platform that enables photo-verified monthly sapling audit logs. Unlike static municipal portals, we focus on crowdsourced post-plantation survival tracking.
          </p>
        </div>
      </div>

      {/* What Makes Us Different & Why It Matters */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFD600]" />
            <span>What Makes Us Different</span>
          </h2>
          <p className="text-sm text-[#00E676] font-semibold mt-1">
            "No solution provides hyper-local sapling survival tracking and volunteer care scheduling for Indian municipal wards."
          </p>
        </div>

        <div className="border-t border-[#262626] pt-4 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Why It Matters (Visakhapatnam Realities):
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-[#A0A0A0]">
            <li className="flex items-start gap-2">
              <span className="text-[#FF5252] font-bold">•</span>
              <span>
                <strong>Mature Tree Loss Outrage:</strong> Commercial and road-widening projects in Vizag cause major mature tree loss and community outrage (<a href="https://www.deccanchronicle.com/southern-states/andhra-pradesh/visakhapatnam-felling-of-trees-along-national-highway-sparks-outrage-1986822" target="_blank" rel="noopener noreferrer" className="text-[#00E676] underline inline-flex items-center gap-0.5">Deccan Chronicle <ExternalLink className="w-3 h-3" /></a>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#FFD600] font-bold">•</span>
              <span>
                <strong>Sub-30% Survival Rate:</strong> Urban tree transplantation survival rates across municipal drives in India frequently fall under 30% (<a href="https://www.sakshi.com/news/telangana/trees-transplantation-failure-siricilla-1087735" target="_blank" rel="noopener noreferrer" className="text-[#00E676] underline inline-flex items-center gap-0.5">Sakshi Investigation <ExternalLink className="w-3 h-3" /></a>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E676] font-bold">•</span>
              <span>
                <strong>Civic Dashboard Gap:</strong> GVMC handles civic issues via centralized helpline (1800-4250-0009) but lacks public real-time tree-survival tracking dashboards (<a href="https://downrightnow.in/helpline/gvmc-vizag" target="_blank" rel="noopener noreferrer" className="text-[#00E676] underline inline-flex items-center gap-0.5">GVMC Helpline <ExternalLink className="w-3 h-3" /></a>).
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Stakeholders & Revenue Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00E676]" />
            <h3 className="font-bold text-white text-base">Target Users</h3>
          </div>
          <p className="text-sm text-[#A0A0A0]">
            Vizag NGO Campaign Leads & University NSS/NCC Student Green Clubs (Andhra University, GITAM Green Club, GVP College, ANITS, Rotary Youth Vizag).
          </p>
        </div>

        {/* Who Pays Later */}
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#FFD600]" />
            <h3 className="font-bold text-white text-base">Who Pays Later & Monetization</h3>
          </div>
          <p className="text-sm text-[#A0A0A0]">
            Corporate CSR Departments & Regional Environmental Foundations via CSR Impact Verification Fee (per drive reporting package) at <strong>₹30,000 per 100-sapling 1-year tracking package</strong>.
          </p>
        </div>
      </div>

      {/* Team & Place */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[#8E8E93] uppercase font-bold">PROJECT ATTRIBUTION</span>
          <h3 className="text-lg font-extrabold text-white">Team volt vision</h3>
          <p className="text-xs text-[#00E676] flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>Visakhapatnam, Andhra Pradesh, India</span>
          </p>
        </div>

        {/* Clear my data button */}
        <button
          onClick={onClearData}
          className="px-4 py-2.5 rounded-xl bg-[#261818] hover:bg-[#331B1B] text-[#FF5252] border border-[#FF5252]/40 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>{getTranslation(language, 'clearMyData')}</span>
        </button>
      </div>
    </div>
  );
};
