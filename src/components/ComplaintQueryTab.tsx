import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  Send,
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  Phone,
  FileText,
  User,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ComplaintTicket, ComplaintType, SaplingRecord, Language } from '../types';
import { getTranslation } from '../utils/i18n';

interface ComplaintQueryTabProps {
  complaints: ComplaintTicket[];
  onAddComplaint: (ticket: ComplaintTicket) => void;
  onUpdateComplaintStatus: (ticketId: string, newStatus: ComplaintTicket['status']) => void;
  saplings: SaplingRecord[];
  onOpenCapture: () => void;
  prefillQuery?: string;
  language: Language;
}

export const ComplaintQueryTab: React.FC<ComplaintQueryTabProps> = ({
  complaints,
  onAddComplaint,
  onUpdateComplaintStatus,
  saplings,
  onOpenCapture,
  prefillQuery,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'track'>('file');

  // Form Fields
  const [ticketType, setTicketType] = useState<ComplaintType>('Illegal Tree Felling / Cutting');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Siripuram Circle (Ward 18)');
  const [ward, setWard] = useState('Ward 18');
  const [selectedTreeId, setSelectedTreeId] = useState<string>('none');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal'>('Urgent');

  // Validation & Submission States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefillQuery) {
      setTitle(prefillQuery);
      setTicketType('Volunteer Enrollment Inquiry');
      setDescription(`Inquiry initiated through Reachable NGOs directory regarding: ${prefillQuery}`);
      setActiveTab('file');
    }
  }, [prefillQuery]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 1000;
          const maxHeight = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            setPhotoUrl(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            setPhotoUrl(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!title.trim()) {
      setErrorMessage('Please enter a clear summary or subject for your complaint/query.');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setErrorMessage('Please provide detailed information (at least 10 characters) regarding the location and issue.');
      return;
    }
    if (!reporterName.trim()) {
      setErrorMessage('Please provide your name.');
      return;
    }
    if (!reporterPhone.trim() || reporterPhone.trim().length < 8) {
      setErrorMessage('Please provide a valid contact phone number so our volunteer team can follow up.');
      return;
    }

    const newTicketId = `GSV-TKT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: ComplaintTicket = {
      id: newTicketId,
      type: ticketType,
      title: title.trim(),
      location: location.trim(),
      ward,
      treeId: selectedTreeId !== 'none' ? selectedTreeId : undefined,
      description: description.trim(),
      photoUrl: photoUrl || undefined,
      reporterName: reporterName.trim(),
      reporterPhone: reporterPhone.trim(),
      reporterEmail: reporterEmail.trim() || undefined,
      status: 'Under Field Review',
      createdAt: new Date().toISOString(),
      priority,
      resolutionNote: `Assigned to ${ward} Field Volunteer Unit. Initial triage pending.`,
    };

    onAddComplaint(newTicket);
    setSubmittedTicketId(newTicketId);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00E676', '#FFD600', '#FF5252'],
      });
    } catch (e) {
      // ignore
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setPhotoUrl('');
    setActiveTab('track');
  };

  const filteredTickets = complaints.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.reporterName.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#261A1A] border border-[#FF5252]/40 text-[#FF5252] text-xs font-mono font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>VIZAG CIVIC SAPLING GRIEVANCE & QUERY CELL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            File Complaint or Volunteer Inquiry
          </h1>
          <p className="text-sm text-[#A0A0A0]">
            Report illegal tree cutting along Vizag highway corridors, request urgent sapling watering, report damaged metal tree guards, or submit CSR/volunteer inquiries.
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

      {/* Official Civic Notice & GVMC Helpline Card */}
      <div className="bg-[#17201B] border border-[#00E676]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#00E676]/20 text-[#00E676] flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-[#FFD600]" />
          </div>
          <div className="text-xs text-[#A0A0A0] space-y-1">
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>GVMC Centralized Helpline Integration</span>
              <span className="font-mono text-[#00E676] bg-[#121212] px-2 py-0.5 rounded border border-[#282828]">
                1800-4250-0009
              </span>
            </div>
            <p>
              Grievances logged here receive photo geo-audits from University NSS volunteer patrols and are cross-referenced with Greater Visakhapatnam Municipal Corporation ward engineering cells.
            </p>
          </div>
        </div>

        <a
          href="https://downrightnow.in/helpline/gvmc-vizag"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#00E676] hover:underline flex items-center gap-1 font-semibold flex-shrink-0 self-start sm:self-center bg-[#121212] px-3 py-2 rounded-xl border border-[#2A2A2A]"
        >
          <span>GVMC Civic Helpline Info</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Tab Switcher: File New vs Track Existing */}
      <div className="flex items-center gap-2 border-b border-[#2A2A2A] pb-3">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
            activeTab === 'file'
              ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
              : 'bg-[#181818] text-[#8E8E93] hover:text-white border border-[#2A2A2A]'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>File New Grievance / Query</span>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
            activeTab === 'track'
              ? 'bg-[#00E676] text-black shadow-[0_0_15px_rgba(0,230,118,0.3)]'
              : 'bg-[#181818] text-[#8E8E93] hover:text-white border border-[#2A2A2A]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Live Grievance Tracker ({complaints.length})</span>
        </button>
      </div>

      {/* TAB 1: FILE NEW GRIEVANCE / QUERY FORM */}
      {activeTab === 'file' && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-5 sm:p-8 space-y-6 shadow-xl"
        >
          {errorMessage && (
            <div className="bg-[#2B1717] border border-[#FF5252]/40 p-4 rounded-xl text-xs text-[#FF8585] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#FF5252]" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category / Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-[#8E8E93]">
                Issue Category:
              </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as ComplaintType)}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                <option value="Illegal Tree Felling / Cutting">
                  Illegal Tree Felling / Road Widening Damage (Urgent)
                </option>
                <option value="Urgent Watering Needed">
                  Severe Moisture Deficit / Parched Saplings
                </option>
                <option value="Broken / Vandalized Tree Guard">
                  Broken / Collapsed Metal Tree Guard
                </option>
                <option value="Missing Sapling">Missing / Stolen Sapling</option>
                <option value="Volunteer Enrollment Inquiry">
                  Student Volunteer / Green Club Enrollment
                </option>
                <option value="CSR Sponsorship Query">
                  Corporate CSR ₹30,000 Package Sponsorship
                </option>
                <option value="General Civic Query">General Inquiry for volt vision</option>
              </select>
            </div>

            {/* Priority Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-[#8E8E93]">
                Priority Level:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                <option value="Urgent">Urgent (Immediate Volunteer Response Required)</option>
                <option value="High">High (Within 24-48 Hours)</option>
                <option value="Normal">Normal Inquiry / Routine Schedule</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-[#8E8E93]">
              Subject / Short Title:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3 Neem saplings dying without water near Maddilapalem flyover..."
              className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
            />
          </div>

          {/* Location & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-[#8E8E93]">
                Specific Location / Street Landmark:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Near Resapuvanipalem Junction, Opp. RTC Bus Depot"
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-[#8E8E93]">
                Vizag Municipal Ward:
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                <option value="Ward 14">Ward 14 (Maddilapalem)</option>
                <option value="Ward 18">Ward 18 (Siripuram Circle)</option>
                <option value="Ward 8">Ward 8 (MVP Colony Sector 4)</option>
                <option value="Ward 21">Ward 21 (RK Beach Corridor)</option>
                <option value="Ward 65">Ward 65 (Gajuwaka Main Junction)</option>
                <option value="Ward 16">Ward 16 (Lawsons Bay Colony)</option>
                <option value="Ward 10">Ward 10 (Kailasagiri Foothills)</option>
                <option value="Ward 28">Ward 28 (Akkayyapalem Highway)</option>
                <option value="Ward 52">Ward 52 (NAD Junction Flyover)</option>
              </select>
            </div>
          </div>

          {/* Optional Linked Tree ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-[#8E8E93]">
              Link to Existing Sapling ID (Optional):
            </label>
            <select
              value={selectedTreeId}
              onChange={(e) => setSelectedTreeId(e.target.value)}
              className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
            >
              <option value="none">-- Not linked to specific tracked sapling --</option>
              {saplings.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.species} ({s.location})
                </option>
              ))}
            </select>
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-[#8E8E93]">
              Detailed Grievance / Query Description:
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, what happened, how many saplings are affected, or what information you need..."
              className="w-full bg-[#121212] border border-[#333] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#00E676]"
            />
          </div>

          {/* Photo Evidence Upload */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-[#8E8E93] block">
              Photo Evidence / Image (Optional):
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-4 rounded-xl bg-[#222] hover:bg-[#2A2A2A] text-white text-xs font-semibold border border-[#333] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#00E676]" />
                <span>Upload Incident Photo</span>
              </button>
              {photoUrl && (
                <span className="text-xs text-[#00E676] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Photo Attached
                </span>
              )}
            </div>
            {photoUrl && (
              <div className="w-32 h-24 rounded-lg overflow-hidden border border-[#333] mt-2">
                <img src={photoUrl} alt="Evidence preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Reporter Contact Information */}
          <div className="border-t border-[#2A2A2A] pt-4 space-y-3">
            <div className="text-xs font-mono font-bold uppercase text-[#8E8E93]">
              Complainant / Citizen Contact Details:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#8E8E93] block mb-1">Your Full Name *</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. S. Venkat Rao"
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8E8E93] block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 98480 XXXXX"
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8E8E93] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full bg-[#121212] border border-[#333] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] text-black font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,230,118,0.4)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>Submit Ticket & Dispatch Field Review</span>
          </button>
        </form>
      )}

      {/* TAB 2: LIVE GRIEVANCE & QUERY TRACKER */}
      {activeTab === 'track' && (
        <div className="space-y-6">
          {submittedTicketId && (
            <div className="bg-[#18261E] border-2 border-[#00E676] p-4 rounded-2xl text-xs text-white flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#00E676] flex-shrink-0" />
                <div>
                  <div className="font-bold text-sm text-[#00E676]">
                    Ticket {submittedTicketId} Registered!
                  </div>
                  <p className="text-[#A0A0A0]">
                    Your grievance has been dispatched to the volunteer ward unit and logged into the public tracking registry.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSubmittedTicketId(null)}
                className="text-[#8E8E93] hover:text-white font-mono text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Search & Status Filter Controls */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID, title, ward, or complainant..."
                className="w-full bg-[#121212] border border-[#333] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#00E676]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-black'
                    : 'bg-[#222] text-[#8E8E93] hover:text-white'
                }`}
              >
                All Tickets
              </button>
              <button
                onClick={() => setStatusFilter('Under Field Review')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === 'Under Field Review'
                    ? 'bg-[#FFD600] text-black font-bold'
                    : 'bg-[#282414] text-[#FFD600]'
                }`}
              >
                Under Review
              </button>
              <button
                onClick={() => setStatusFilter('Volunteer Dispatched')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === 'Volunteer Dispatched'
                    ? 'bg-[#00E676] text-black font-bold'
                    : 'bg-[#18261E] text-[#00E676]'
                }`}
              >
                Dispatched
              </button>
              <button
                onClick={() => setStatusFilter('Resolved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === 'Resolved'
                    ? 'bg-[#38BDF8] text-black font-bold'
                    : 'bg-[#1A2633] text-[#38BDF8]'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Tickets List */}
          {filteredTickets.length === 0 ? (
            <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-8 text-center text-[#8E8E93]">
              <FileText className="w-8 h-8 mx-auto text-[#00E676] mb-2" />
              <p className="text-sm font-semibold text-white">No tickets match current filter</p>
              <p className="text-xs mt-1">Switch status to 'All Tickets' or file a new grievance.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-[#181818] border border-[#2A2A2A] hover:border-[#3E3E3E] rounded-2xl p-5 shadow-lg space-y-3 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-[#00E676]">
                        {ticket.id}
                      </span>
                      <span className="text-[#555]">•</span>
                      <span className="text-xs font-bold text-[#FFD600]">{ticket.type}</span>
                      {ticket.treeId && (
                        <span className="text-[10px] font-mono bg-[#222] px-2 py-0.5 rounded text-[#D1D1D6]">
                          {ticket.treeId}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          ticket.status === 'Resolved'
                            ? 'bg-[#1A2633] text-[#38BDF8] border border-[#38BDF8]/40'
                            : ticket.status === 'Volunteer Dispatched'
                            ? 'bg-[#18261E] text-[#00E676] border border-[#00E676]/40'
                            : 'bg-[#282414] text-[#FFD600] border border-[#FFD600]/40'
                        }`}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-[10px] text-[#8E8E93]">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-white">{ticket.title}</h3>

                  <p className="text-xs text-[#A0A0A0] leading-relaxed">{ticket.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#8E8E93] pt-2 border-t border-[#252525]">
                    <div className="flex items-center gap-1.5 text-white">
                      <MapPin className="w-3.5 h-3.5 text-[#FFD600]" />
                      <span>{ticket.location} ({ticket.ward})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Reported by: {ticket.reporterName}</span>
                    </div>
                    {ticket.photoUrl && (
                      <span className="text-[#00E676] font-semibold flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" /> Photo Attached
                      </span>
                    )}
                  </div>

                  {ticket.resolutionNote && (
                    <div className="bg-[#121212] p-3 rounded-xl border border-[#262626] text-xs text-[#D1D1D6] flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[#00E676] flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Field Triage Update: </strong>
                        <span>{ticket.resolutionNote}</span>
                      </div>
                    </div>
                  )}

                  {/* Status Toggle Quick Simulation for testing */}
                  <div className="flex items-center justify-end gap-2 pt-1 text-xs">
                    <span className="text-[10px] text-[#71717A]">Simulate Field Action:</span>
                    {ticket.status !== 'Volunteer Dispatched' && (
                      <button
                        onClick={() => onUpdateComplaintStatus(ticket.id, 'Volunteer Dispatched')}
                        className="px-2.5 py-1 rounded-lg bg-[#18261E] hover:bg-[#203328] text-[#00E676] text-[11px] font-semibold border border-[#00E676]/30"
                      >
                        Dispatch Volunteer
                      </button>
                    )}
                    {ticket.status !== 'Resolved' && (
                      <button
                        onClick={() => onUpdateComplaintStatus(ticket.id, 'Resolved')}
                        className="px-2.5 py-1 rounded-lg bg-[#1A2633] hover:bg-[#223344] text-[#38BDF8] text-[11px] font-semibold border border-[#38BDF8]/30"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
