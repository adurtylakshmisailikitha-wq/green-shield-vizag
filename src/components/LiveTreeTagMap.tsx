import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Search,
  Camera,
  Layers,
  Compass,
  ArrowRight,
  Maximize2,
  Navigation,
  Globe2,
  Building2,
  TreeDeciduous,
  Droplets,
  AlertTriangle,
  Info,
  X,
  CheckCircle2,
  Calendar,
  Users
} from 'lucide-react';
import L from 'leaflet';
import { SaplingRecord, HealthStatus, Language } from '../types';
import {
  VIZAG_AREAS_DIRECTORY,
  VIZAG_BOUNDS,
  findNearestVizagArea,
  VizagAreaInfo
} from '../data/sampleData';
import { getTranslation } from '../utils/i18n';

interface LiveTreeTagMapProps {
  saplings: SaplingRecord[];
  onOpenCapture: (
    treeId?: string,
    initialLocation?: { lat: number; lng: number; locationName: string; ward?: number }
  ) => void;
  language: Language;
}

export const LiveTreeTagMap: React.FC<LiveTreeTagMapProps> = ({
  saplings,
  onOpenCapture,
  language,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const tapMarkerRef = useRef<L.Marker | null>(null);

  // States
  const [statusFilter, setStatusFilter] = useState<'all' | 'green' | 'yellow' | 'red'>('all');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTree, setSelectedTree] = useState<SaplingRecord | null>(null);
  const [isAreasDirectoryOpen, setIsAreasDirectoryOpen] = useState<boolean>(false);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Click-to-tag on map state
  const [tappedLocation, setTappedLocation] = useState<{
    lat: number;
    lng: number;
    nearestArea: VizagAreaInfo;
  } | null>(null);

  // Filtered saplings based on health group, selected area/ward, and search query
  const filteredSaplings = saplings.filter((s) => {
    // Health status color group filter
    if (statusFilter === 'green' && s.status !== 'Healthy') return false;
    if (statusFilter === 'yellow' && s.status !== 'Needs Water') return false;
    if (
      statusFilter === 'red' &&
      s.status !== 'Critical Wilting' &&
      s.status !== 'Damaged Guard' &&
      s.status !== 'Missing'
    ) {
      return false;
    }

    // Area filter
    if (selectedAreaId !== 'all') {
      const area = VIZAG_AREAS_DIRECTORY.find((a) => a.id === selectedAreaId);
      if (area) {
        // Distance check: within ~5km of area center or matching location text
        const dLat = (s.lat - area.lat) * 111;
        const dLng = (s.lng - area.lng) * 111 * Math.cos((area.lat * Math.PI) / 180);
        const distanceKm = Math.sqrt(dLat * dLat + dLng * dLng);
        const nameMatches =
          s.location.toLowerCase().includes(area.name.toLowerCase().split(' ')[0]) ||
          (s.wardNumber && area.wardNumbers.includes(String(s.wardNumber)));
        if (distanceKm > 5.5 && !nameMatches) {
          return false;
        }
      }
    }

    // Search query filter (checks ID, species, location, team, ward)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.id.toLowerCase().includes(q) ||
        s.species.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.team.toLowerCase().includes(q) ||
        (s.wardNumber && `ward ${s.wardNumber}`.includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Greater Visakhapatnam center coordinates: 17.7297, 83.3130
      const map = L.map(mapContainerRef.current, {
        center: [17.7297, 83.3130],
        zoom: 13,
        zoomControl: false, // We'll position controls cleanly
        maxBounds: [
          [17.50, 82.90],
          [18.10, 83.60],
        ],
        minZoom: 10,
      });

      // Add zoom control at bottom right to stay clean on mobile
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark theme CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors & CartoDB',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Click-to-tag listener: click anywhere on the map in Visakhapatnam to drop a pin and tag a sapling!
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const nearest = findNearestVizagArea(lat, lng);

        // Remove old tap marker if any
        if (tapMarkerRef.current) {
          tapMarkerRef.current.remove();
        }

        // Create glowing animated target marker
        const tapIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 230, 118, 0.4); animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 20px; height: 20px; border-radius: 50%; background: #00E676; border: 3px solid #121212; box-shadow: 0 0 15px #00E676;"></div>
            </div>
          `,
          className: 'tapped-custom-pin',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const newTapMarker = L.marker([lat, lng], { icon: tapIcon }).addTo(map);
        tapMarkerRef.current = newTapMarker;

        setTappedLocation({
          lat,
          lng,
          nearestArea: nearest,
        });
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous sapling markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Custom marker icon generator
    const createCustomIcon = (status: HealthStatus) => {
      let color = '#00E676';
      let shadowColor = 'rgba(0, 230, 118, 0.45)';
      if (status === 'Needs Water') {
        color = '#FFD600';
        shadowColor = 'rgba(255, 214, 0, 0.45)';
      } else if (status === 'Critical Wilting' || status === 'Damaged Guard' || status === 'Missing') {
        color = '#FF5252';
        shadowColor = 'rgba(255, 82, 82, 0.45)';
      }

      const html = `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            position: absolute;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: ${shadowColor};
            animation: pulse 2s infinite;
          "></div>
          <div style="
            position: relative;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: #141414;
            border: 2.5px solid ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 12px ${color};
          ">
            <div style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${color};
            "></div>
          </div>
        </div>
      `;

      return L.divIcon({
        html,
        className: 'custom-tree-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // Add markers for filtered saplings
    filteredSaplings.forEach((sapling) => {
      const marker = L.marker([sapling.lat, sapling.lng], {
        icon: createCustomIcon(sapling.status),
      }).addTo(map);

      // Tooltip on hover
      marker.bindTooltip(
        `<div style="font-weight: bold; color: #fff;">${sapling.id} • ${sapling.species.split(' ')[0]}</div><div style="font-size: 10px; color: #aaa;">${sapling.location}</div>`,
        {
          direction: 'top',
          offset: [0, -12],
          className: 'leaflet-dark-tooltip',
        }
      );

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedTree(sapling);
        // Clear tap marker when inspecting an existing tree
        if (tapMarkerRef.current) {
          tapMarkerRef.current.remove();
          tapMarkerRef.current = null;
        }
        setTappedLocation(null);
      });

      markersRef.current.push(marker);
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [filteredSaplings]);

  // Handle flying to a chosen area
  const handleSelectArea = (areaId: string) => {
    setSelectedAreaId(areaId);
    setSelectedTree(null);

    if (!mapInstanceRef.current) return;

    if (areaId === 'all') {
      mapInstanceRef.current.fitBounds(VIZAG_BOUNDS, {
        padding: [30, 30],
        maxZoom: 13,
        animate: true,
      });
    } else {
      const area = VIZAG_AREAS_DIRECTORY.find((a) => a.id === areaId);
      if (area) {
        mapInstanceRef.current.flyTo([area.lat, area.lng], area.zoomLevel, {
          animate: true,
          duration: 1.2,
        });
      }
    }
  };

  // Reset to full panoramic view of Visakhapatnam Metropolitan region
  const handleResetToFullVizag = () => {
    setSelectedAreaId('all');
    setSelectedTree(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.fitBounds(VIZAG_BOUNDS, {
        padding: [30, 30],
        maxZoom: 13,
        animate: true,
      });
    }
  };

  // Geolocate user in Visakhapatnam
  const handleLocateUser = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingUser(false);
        const { latitude, longitude, accuracy } = position.coords;

        if (mapInstanceRef.current) {
          const map = mapInstanceRef.current;
          map.flyTo([latitude, longitude], 16, { animate: true, duration: 1.5 });

          // Remove previous user marker
          if (userMarkerRef.current) userMarkerRef.current.remove();
          if (userCircleRef.current) userCircleRef.current.remove();

          // Add user pin
          const userIcon = L.divIcon({
            html: `
              <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(0, 150, 255, 0.4); animation: ping 1.5s infinite;"></div>
                <div style="width: 16px; height: 16px; border-radius: 50%; background: #0091FF; border: 3px solid #fff; box-shadow: 0 0 10px #0091FF;"></div>
              </div>
            `,
            className: 'user-gps-pin',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
          userCircleRef.current = L.circle([latitude, longitude], {
            radius: Math.min(accuracy, 250),
            color: '#0091FF',
            fillColor: '#0091FF',
            fillOpacity: 0.15,
            weight: 1,
          }).addTo(map);

          const nearest = findNearestVizagArea(latitude, longitude);
          userMarkerRef.current.bindTooltip(
            `<b>You are here</b><br/>Nearest: ${nearest.name} (${nearest.wardNumbers})`,
            { permanent: true, direction: 'top', offset: [0, -14], className: 'leaflet-dark-tooltip' }
          ).openTooltip();
        }
      },
      (error) => {
        setIsLocatingUser(false);
        console.warn('Geolocation error:', error);
        setLocationError(
          'Could not retrieve live GPS coordinates. Please ensure location permissions are granted.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleFocusTree = (sapling: SaplingRecord) => {
    setSelectedTree(sapling);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([sapling.lat, sapling.lng], 16, { animate: true });
    }
  };

  // Tag sapling at tapped location
  const handleTagAtTappedLocation = () => {
    if (!tappedLocation) return;
    const { lat, lng, nearestArea } = tappedLocation;
    const locationName = `${nearestArea.name} (${nearestArea.wardNumbers})`;
    onOpenCapture('new', {
      lat,
      lng,
      locationName,
      ward: nearestArea.wardNum,
    });
    setTappedLocation(null);
  };

  // Selected area object
  const currentAreaInfo = VIZAG_AREAS_DIRECTORY.find((a) => a.id === selectedAreaId);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Control Console */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                GREATER VISAKHAPATNAM METRO (GVMC)
              </span>
              <span className="text-xs text-[#8E8E93]">• All 98 Wards & Corridors</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#00E676]" />
              <span>Visakhapatnam Sapling Ward Map</span>
            </h1>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Full interactive coverage across every Vizag area — from Bheemili to Steel Plant, Simhachalam to RK Beach
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Reset to Full Vizag */}
            <button
              onClick={handleResetToFullVizag}
              title="Reset zoom to full Visakhapatnam bounds"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-[#242424] hover:bg-[#303030] text-white border border-[#3A3A3A] transition-colors cursor-pointer"
            >
              <Globe2 className="w-4 h-4 text-[#00E676]" />
              <span>{language === 'te' ? 'పూర్తి వైజాగ్' : 'Full Vizag View'}</span>
            </button>

            {/* Locate Me */}
            <button
              onClick={handleLocateUser}
              disabled={isLocatingUser}
              title="Center map on your physical GPS position"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-[#242424] hover:bg-[#303030] text-white border border-[#3A3A3A] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 text-[#0091FF] ${isLocatingUser ? 'animate-spin' : ''}`} />
              <span>{isLocatingUser ? 'Locating...' : language === 'te' ? 'నా లొకేషన్' : 'My GPS'}</span>
            </button>

            {/* View All Areas Directory */}
            <button
              onClick={() => setIsAreasDirectoryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-[#242424] hover:bg-[#303030] text-white border border-[#3A3A3A] transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#FFD600]" />
              <span>{language === 'te' ? 'అన్ని ప్రాంతాలు (18+)' : 'Explore 18 Areas'}</span>
            </button>

            {/* Capture Live Photo Main Action */}
            <button
              onClick={() => onOpenCapture(selectedTree?.id)}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm bg-[#00E676] text-black shadow-[0_0_20px_rgba(0,230,118,0.35)] hover:bg-[#15f385] transition-all cursor-pointer whitespace-nowrap ml-auto sm:ml-0"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>{getTranslation(language, 'captureLivePhoto')}</span>
            </button>
          </div>
        </div>

        {/* Location error message if geolocation fails */}
        {locationError && (
          <div className="bg-[#2A1717] border border-[#FF5252]/40 rounded-xl p-3 text-xs text-[#FF5252] flex items-center justify-between">
            <span>{locationError}</span>
            <button onClick={() => setLocationError(null)} className="text-[#8E8E93] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Area Jump Horizontal Carousel */}
        <div className="space-y-1.5 pt-2 border-t border-[#252525]">
          <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Jump to Vizag Area:</span>
            </span>
            <span className="text-[10px] font-mono text-[#71717A]">
              Click any area to fly directly & view local saplings
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => handleSelectArea('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedAreaId === 'all'
                  ? 'bg-[#00E676] text-black font-bold shadow-[0_0_10px_rgba(0,230,118,0.4)]'
                  : 'bg-[#202020] text-[#A0A0A0] hover:text-white hover:bg-[#282828] border border-[#303030]'
              }`}
            >
              🌐 All Vizag Metro ({saplings.length} Trees)
            </button>

            {VIZAG_AREAS_DIRECTORY.map((area) => (
              <button
                key={area.id}
                onClick={() => handleSelectArea(area.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedAreaId === area.id
                    ? 'bg-[#00E676] text-black font-bold shadow-[0_0_10px_rgba(0,230,118,0.4)]'
                    : 'bg-[#202020] text-[#A0A0A0] hover:text-white hover:bg-[#282828] border border-[#303030]'
                }`}
              >
                <span>{language === 'te' ? area.teluguName.split(' ')[0] : area.name.split('&')[0].trim()}</span>
                <span className="text-[10px] opacity-70 font-mono">({area.wardNumbers.split(' ')[0]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-[#252525]">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Tree ID, Madhurawada, Bheemili, Neem, Ward 18..."
              className="w-full bg-[#121212] border border-[#333] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#00E676]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Area dropdown */}
          <div className="sm:col-span-3">
            <select
              value={selectedAreaId}
              onChange={(e) => handleSelectArea(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676] cursor-pointer"
            >
              <option value="all">📍 All Greater Vizag (98 Wards)</option>
              {VIZAG_AREAS_DIRECTORY.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} — {area.wardNumbers}
                </option>
              ))}
            </select>
          </div>

          {/* Red / Yellow / Green Zone Filter Buttons */}
          <div className="sm:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#222] text-[#8E8E93] hover:text-white'
              }`}
            >
              All ({saplings.length})
            </button>
            <button
              onClick={() => setStatusFilter('green')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                statusFilter === 'green'
                  ? 'bg-[#00E676] text-black font-bold'
                  : 'bg-[#18261E] text-[#00E676] border border-[#00E676]/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#00E676]" />
              <span>Healthy</span>
            </button>
            <button
              onClick={() => setStatusFilter('yellow')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                statusFilter === 'yellow'
                  ? 'bg-[#FFD600] text-black font-bold'
                  : 'bg-[#282414] text-[#FFD600] border border-[#FFD600]/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FFD600]" />
              <span>Thirsty</span>
            </button>
            <button
              onClick={() => setStatusFilter('red')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                statusFilter === 'red'
                  ? 'bg-[#FF5252] text-white font-bold'
                  : 'bg-[#281616] text-[#FF5252] border border-[#FF5252]/30'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF5252]" />
              <span>Critical</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map & Interactive Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-8 bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-xl flex flex-col h-[560px] relative">
          {/* Top Status Bar over Map */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#141414] border-b border-[#2A2A2A] text-xs gap-2 z-20">
            <div className="flex items-center gap-2 text-[#8E8E93]">
              <Compass className="w-4 h-4 text-[#00E676]" />
              <span>
                {currentAreaInfo
                  ? `Focusing on ${currentAreaInfo.name} (${currentAreaInfo.wardNumbers})`
                  : 'Click anywhere on map to tag a sapling at that exact GPS coordinate'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[#00E676] font-bold">
                {filteredSaplings.length} of {saplings.length} Pins Visible
              </span>
              <button
                onClick={handleResetToFullVizag}
                className="text-[11px] text-[#A0A0A0] hover:text-[#00E676] flex items-center gap-1 underline cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Reset View</span>
              </button>
            </div>
          </div>

          {/* Leaflet Canvas Container */}
          <div ref={mapContainerRef} className="flex-1 w-full h-full relative z-10" />

          {/* Floating Tap to Tag Banner on Map */}
          {tappedLocation && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-[#161616]/95 border-2 border-[#00E676] rounded-2xl p-4 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-md z-30 animate-fadeIn space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[#00E676] text-xs font-bold font-mono">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Point Tapped in Visakhapatnam</span>
                  </div>
                  <h4 className="font-extrabold text-white text-sm mt-0.5">
                    {tappedLocation.nearestArea.name}
                  </h4>
                  <p className="text-[11px] text-[#A0A0A0]">
                    {tappedLocation.nearestArea.wardNumbers} • GPS: {tappedLocation.lat.toFixed(4)},{' '}
                    {tappedLocation.lng.toFixed(4)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (tapMarkerRef.current) tapMarkerRef.current.remove();
                    setTappedLocation(null);
                  }}
                  className="text-[#8E8E93] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-[#2A2A2A] flex items-center gap-2">
                <button
                  onClick={handleTagAtTappedLocation}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#00E676] hover:bg-[#15f385] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,230,118,0.3)] transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tag Sapling Here with Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Tree Inspector Card / Sidebar */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {selectedTree ? (
            <div className="bg-[#181818] border-2 border-[#00E676]/60 rounded-2xl p-5 shadow-xl space-y-4 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      {selectedTree.id}
                    </span>
                    {selectedTree.isSample && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#252525] text-[#FFD600] border border-[#FFD600]/30">
                        Sample
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-lg text-white mt-0.5">
                    {selectedTree.species}
                  </h3>
                </div>

                {/* Health Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase ${
                    selectedTree.status === 'Healthy'
                      ? 'bg-[#18261E] text-[#00E676] border border-[#00E676]/40'
                      : selectedTree.status === 'Needs Water'
                      ? 'bg-[#282414] text-[#FFD600] border border-[#FFD600]/40'
                      : 'bg-[#281616] text-[#FF5252] border border-[#FF5252]/40'
                  }`}
                >
                  {selectedTree.status}
                </span>
              </div>

              {/* Sapling Photo */}
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-[#2F3336] relative">
                <img
                  src={selectedTree.photoUrl}
                  alt={selectedTree.species}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-white flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#FFD600]" />
                  <span>
                    {selectedTree.lat.toFixed(4)}, {selectedTree.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Metrics strip */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A]">
                  <span className="text-[#8E8E93] text-[10px] block">LAST AUDIT</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#00E676]" />
                    {selectedTree.lastAuditText}
                  </span>
                </div>
                <div className="bg-[#141414] p-2.5 rounded-xl border border-[#2A2A2A]">
                  <span className="text-[#8E8E93] text-[10px] block">HEALTH SCORE</span>
                  <span className="font-bold text-[#FFD600] font-mono text-sm mt-0.5 block">
                    {selectedTree.healthScore ?? 85}%
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#A0A0A0] space-y-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00E676] flex-shrink-0" />
                  <span className="font-semibold text-white">{selectedTree.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#8E8E93] flex-shrink-0" />
                  <span>Assigned: {selectedTree.team}</span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => onOpenCapture(selectedTree.id)}
                className="w-full py-3 rounded-xl bg-[#00E676] hover:bg-[#15f385] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,230,118,0.3)] transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>Log Monthly Photo Audit</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 text-center text-[#8E8E93] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#202020] mx-auto flex items-center justify-center text-[#00E676]">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-sm">Interactive Vizag Sapling Pins</h3>
              <p className="text-xs leading-relaxed">
                Click any GPS pin to inspect sapling telemetry, or click any spot on the map to tag a new tree in that Vizag ward.
              </p>
              <div className="pt-2 border-t border-[#252525] flex justify-center">
                <button
                  onClick={() => setIsAreasDirectoryOpen(true)}
                  className="text-xs text-[#00E676] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Browse all 18 Vizag zones & coverage</span>
                </button>
              </div>
            </div>
          )}

          {/* Filtered Area Saplings Quick List */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 space-y-2 flex-1 max-h-72 overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8E8E93] uppercase mb-2">
              <span>Saplings in Scope ({filteredSaplings.length})</span>
              <span className="text-[#00E676] text-[10px]">Select to Center</span>
            </div>
            {filteredSaplings.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#71717A]">
                No saplings found for this search or area filter. Try selecting "All Vizag Metro".
              </div>
            ) : (
              filteredSaplings.map((sapling) => (
                <div
                  key={sapling.id}
                  onClick={() => handleFocusTree(sapling)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                    selectedTree?.id === sapling.id
                      ? 'bg-[#1E2E24] border-[#00E676]'
                      : 'bg-[#141414] border-[#252525] hover:border-[#3A3A3A]'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{sapling.id}</span>
                      <span className="text-[#8E8E93]">•</span>
                      <span className="truncate">{sapling.species.split(' ')[0]}</span>
                    </div>
                    <div className="text-[11px] text-[#8E8E93] truncate">{sapling.location}</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        sapling.status === 'Healthy'
                          ? 'bg-[#00E676]'
                          : sapling.status === 'Needs Water'
                          ? 'bg-[#FFD600]'
                          : 'bg-[#FF5252]'
                      }`}
                    />
                    <ArrowRight className="w-3.5 h-3.5 text-[#666]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Visakhapatnam All Areas & Wards Directory Modal */}
      {isAreasDirectoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161616] border border-[#2E2E2E] rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                    GREATER VISAKHAPATNAM METROPOLITAN AREA
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-[#FFD600]" />
                  <span>Directory of Visakhapatnam Areas & Wards</span>
                </h2>
                <p className="text-xs text-[#8E8E93] mt-1">
                  18 municipal zones covering urban, coastal, suburban, and industrial corridors. Click any area to navigate directly on the map.
                </p>
              </div>
              <button
                onClick={() => setIsAreasDirectoryOpen(false)}
                className="w-9 h-9 rounded-full bg-[#222] hover:bg-[#333] flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Area Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VIZAG_AREAS_DIRECTORY.map((area) => (
                <div
                  key={area.id}
                  className="bg-[#121212] border border-[#2A2A2A] hover:border-[#00E676]/60 rounded-2xl p-4 transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#202020] text-[#00E676] border border-[#00E676]/20">
                        {area.wardNumbers}
                      </span>
                      <span className="text-[10px] text-[#8E8E93] font-mono">{area.zone}</span>
                    </div>

                    <h3 className="font-extrabold text-white text-base group-hover:text-[#00E676] transition-colors">
                      {area.name}
                    </h3>
                    <p className="text-xs text-[#00E676] font-medium">{area.teluguName}</p>
                    <p className="text-xs text-[#8E8E93] leading-relaxed line-clamp-2">
                      {area.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#222] space-y-2">
                    <div className="text-[11px] text-[#A0A0A0]">
                      <span className="text-[#71717A]">Active Team: </span>
                      <span className="font-semibold text-white">{area.activeTeam}</span>
                    </div>

                    <button
                      onClick={() => {
                        handleSelectArea(area.id);
                        setIsAreasDirectoryOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#222] hover:bg-[#00E676] text-white hover:text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Fly to {area.name.split('&')[0].trim()}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#252525] flex items-center justify-between text-xs text-[#8E8E93]">
              <span>Covering 98 GVMC Municipal Wards across Visakhapatnam</span>
              <button
                onClick={() => {
                  handleResetToFullVizag();
                  setIsAreasDirectoryOpen(false);
                }}
                className="py-2 px-4 rounded-xl bg-[#00E676] text-black font-extrabold hover:bg-[#15f385] cursor-pointer"
              >
                View All on Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
