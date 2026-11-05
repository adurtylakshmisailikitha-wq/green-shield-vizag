import React, { useState } from 'react';
import {
  Users,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  TreePine,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Camera,
  ArrowRight
} from 'lucide-react';
import { NGOContact, Language, ScreenType } from '../types';
import { REACHABLE_NGOS } from '../data/sampleData';
import { getTranslation } from '../utils/i18n';

interface ReachableNGOsTabProps {
  onOpenCapture: () => void;
  onNavigateToQuery: (prefillSubject?: string) => void;
  language: Language;
}

export const ReachableNGOsTab: React.FC<ReachableNGOsTabProps> = ({
  onOpenCapture,
  onNavigateToQuery,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contactModalNgo, setContactModalNgo] = useState<NGOContact | null>(null);

  const zones = ['all', 'Central Vizag', 'Beach Corridor', 'North Vizag', 'Industrial / South'];
  const categories = [
    'all',
    'University NSS/NCC',
    'Registered Environmental NGO',
    'Youth Green Club',
    'Civic Conservation',
  ];

  const filteredNgos = REACHABLE_NGOS.filter((ngo) => {
    if (selectedZone !== 'all' && ngo.zone !== selectedZone) return false;
    if (selectedCategory !== 'all' && ngo.category !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        ngo.name.toLowerCase().includes(q) ||
        ngo.leadCoordinator.toLowerCase().includes(q) ||
        ngo.headquarters.toLowerCase().includes(q) ||
        ngo.wardsCovered.some((w) => w.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const totalVolunteers = REACHABLE_NGOS.reduce((acc, curr) => acc + curr.activeVolunteerCount, 0);
  const totalMaintained = REACHABLE_NGOS.reduce((acc, curr) => acc + curr.saplingsMaintained, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Hero Banner */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18261E] border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold">
            <Users className="w-4 h-4" />
            <span>VISAKHAPATNAM REACHABLE ENVIRONMENTAL NETWORK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Reachable NGOs & Collegiate Green Cells
          </h1>
          <p className="text-sm text-[#A0A0A0]">
            Direct verified contacts for university NSS/NCC units, youth environmental clubs, and civic arboricultural societies monitoring Greater Visakhapatnam Municipal Corporation (GVMC) wards.
          </p>
        </div>

        {/* Big Action Button */}
        <button
          onClick={onOpenCapture}
          className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-[#00E676] text-black shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:bg-[#15f385] transition-all cursor-pointer whitespace-nowrap"
        >
          <Camera className="w-4 h-4 stroke-[2.5]" />
          <span>{getTranslation(language, 'captureLivePhoto')}</span>
        </button>
      </div>

      {/* Network Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#18261E] border border-[#00E676]/40 flex items-center justify-center text-[#00E676]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white">{REACHABLE_NGOS.length}</div>
            <div className="text-xs text-[#8E8E93]">Active Verified Vizag Organizations</div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#282414] border border-[#FFD600]/40 flex items-center justify-center text-[#FFD600]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-[#FFD600]">{totalVolunteers}+</div>
            <div className="text-xs text-[#8E8E93]">Mobilized Student & Youth Volunteers</div>
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1C1F2B] border border-[#38BDF8]/40 flex items-center justify-center text-[#38BDF8]">
            <TreePine className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white">{totalMaintained}+</div>
            <div className="text-xs text-[#8E8E93]">Saplings Under Active Geo-Care</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NGO, coordinator, or ward (e.g. Maddilapalem, Siripuram)..."
              className="w-full bg-[#121212] border border-[#333] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#00E676]"
            />
          </div>

          {/* Zone Filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            >
              <option value="all">All Vizag Geographic Zones</option>
              <option value="Central Vizag">Central Vizag (Waltair / Dwarakanagar)</option>
              <option value="Beach Corridor">Beach Corridor (RK Beach / Rushikonda)</option>
              <option value="North Vizag">North Vizag (MVP / Kailasagiri / Tagarapuvalasa)</option>
              <option value="Industrial / South">Industrial / South (Gajuwaka / Kurmannapalem)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
            >
              <option value="all">All Organization Types</option>
              <option value="University NSS/NCC">University NSS/NCC</option>
              <option value="Registered Environmental NGO">Registered Environmental NGO</option>
              <option value="Youth Green Club">Youth Green Club</option>
              <option value="Civic Conservation">Civic Conservation</option>
            </select>
          </div>
        </div>
      </div>

      {/* NGOs Directory Cards */}
      {filteredNgos.length === 0 ? (
        <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-8 text-center text-[#8E8E93] space-y-2">
          <Users className="w-8 h-8 mx-auto text-[#FFD600]" />
          <h3 className="font-bold text-white text-base">No organizations matched your filter</h3>
          <p className="text-xs">Try selecting 'All Zones' or clearing your search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredNgos.map((ngo) => (
            <div
              key={ngo.id}
              className="bg-[#181818] border border-[#2A2A2A] hover:border-[#3E3E3E] rounded-2xl p-5 flex flex-col justify-between transition-all hover:translate-y-[-2px] shadow-lg space-y-4"
            >
              <div className="space-y-3">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white hover:text-[#00E676] transition-colors">
                        {ngo.name}
                      </span>
                      {ngo.verifiedStatus && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#18261E] text-[#00E676] border border-[#00E676]/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#FFD600] font-mono mt-0.5">
                      {ngo.category} • {ngo.zone}
                    </p>
                  </div>

                  <span className="text-[11px] font-mono text-[#8E8E93] bg-[#121212] px-2.5 py-1 rounded border border-[#262626]">
                    {ngo.id}
                  </span>
                </div>

                {/* Coordinator & HQ info */}
                <div className="text-xs text-[#A0A0A0] space-y-1.5 bg-[#121212] p-3 rounded-xl border border-[#262626]">
                  <div className="flex items-center gap-2 text-white">
                    <Users className="w-3.5 h-3.5 text-[#00E676] flex-shrink-0" />
                    <span className="font-semibold">{ngo.leadCoordinator}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-[#FFD600] flex-shrink-0 mt-0.5" />
                    <span>{ngo.headquarters}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8E8E93]">
                    <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Hours: {ngo.operatingHours}</span>
                  </div>
                </div>

                {/* Wards Covered Tags */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#8E8E93] block mb-1.5">
                    Municipal Wards Under Active Supervision:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ngo.wardsCovered.map((ward, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#1F2220] border border-[#303833] text-[#D1D1D6]"
                      >
                        {ward}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Initiatives */}
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#8E8E93] block mb-1.5">
                    Focus Initiatives:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ngo.keyInitiatives.map((init, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#252525] text-[#A0A0A0]"
                      >
                        • {init}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Call, Email, Request Support */}
              <div className="pt-3 border-t border-[#252525] flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${ngo.phone.replace(/\s+/g, '')}`}
                  className="flex-1 min-w-[120px] py-2 px-3 rounded-xl bg-[#1A261E] hover:bg-[#203328] text-[#00E676] border border-[#00E676]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {ngo.phone}</span>
                </a>

                <a
                  href={`mailto:${ngo.email}?subject=Green%20Shield%20Vizag%20Sapling%20Inquiry`}
                  className="py-2 px-3 rounded-xl bg-[#222] hover:bg-[#2A2A2A] text-white border border-[#333] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>

                <button
                  type="button"
                  onClick={() => onNavigateToQuery(`Sapling Support Request for ${ngo.name} (${ngo.wardsCovered[0]})`)}
                  className="py-2 px-3 rounded-xl bg-[#FFD600]/15 hover:bg-[#FFD600]/25 text-[#FFD600] border border-[#FFD600]/40 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Connect / Query</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
