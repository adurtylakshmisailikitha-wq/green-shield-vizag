/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { CampusAuditFeed } from './components/CampusAuditFeed';
import { LiveTreeTagMap } from './components/LiveTreeTagMap';
import { CSRImpactExporter } from './components/CSRImpactExporter';
import { ReachableNGOsTab } from './components/ReachableNGOsTab';
import { ComplaintQueryTab } from './components/ComplaintQueryTab';
import { AboutScreen } from './components/AboutScreen';
import { CaptureModal } from './components/CaptureModal';
import {
  SaplingRecord,
  CareTask,
  AuditLog,
  VolunteerStreak,
  InspectionResult,
  Language,
  ComplaintTicket,
  ScreenType,
} from './types';
import {
  loadSaplings,
  saveSaplings,
  loadTasks,
  saveTasks,
  loadAudits,
  saveAudits,
  loadStreaks,
  loadComplaints,
  saveComplaints,
  resetAllData,
} from './utils/storage';
import { getTranslation } from './utils/i18n';
import { ShieldCheck, Heart, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [language, setLanguage] = useState<Language>('en');
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState<boolean>(false);
  const [preselectedTreeId, setPreselectedTreeId] = useState<string | undefined>(undefined);
  const [preselectedLocation, setPreselectedLocation] = useState<{
    lat: number;
    lng: number;
    locationName: string;
    ward?: number;
  } | undefined>(undefined);
  const [prefillQuery, setPrefillQuery] = useState<string | undefined>(undefined);

  // App Data States
  const [saplings, setSaplings] = useState<SaplingRecord[]>([]);
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [audits, setAudits] = useState<AuditLog[]>([]);
  const [streaks, setStreaks] = useState<VolunteerStreak[]>([]);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Initial Data Load
  useEffect(() => {
    setSaplings(loadSaplings());
    setTasks(loadTasks());
    setAudits(loadAudits());
    setStreaks(loadStreaks());
    setComplaints(loadComplaints());
  }, []);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleOpenCapture = (
    treeId?: string,
    initialLocation?: { lat: number; lng: number; locationName: string; ward?: number }
  ) => {
    setPreselectedTreeId(treeId);
    setPreselectedLocation(initialLocation);
    setIsCaptureModalOpen(true);
  };

  const handleSaveAudit = (
    treeId: string,
    result: InspectionResult,
    photoDataUrl: string,
    locationData: { lat: number; lng: number; locationName: string; ward: number },
    species: string
  ) => {
    const isNew = treeId === 'new';
    const newTreeId = isNew ? `Tree #${String(saplings.length + 1).padStart(3, '0')}` : treeId;

    // Map result status
    let mappedStatus: SaplingRecord['status'] = 'Healthy';
    if (result.healthScore < 35 || result.statusLabel.toLowerCase().includes('critical')) {
      mappedStatus = 'Critical Wilting';
    } else if (result.healthScore < 60 || result.statusLabel.toLowerCase().includes('water')) {
      mappedStatus = 'Needs Water';
    } else if (result.statusLabel.toLowerCase().includes('guard')) {
      mappedStatus = 'Damaged Guard';
    }

    let updatedSaplings: SaplingRecord[];

    if (isNew) {
      const newSapling: SaplingRecord = {
        id: newTreeId,
        species,
        location: locationData.locationName,
        lat: locationData.lat,
        lng: locationData.lng,
        status: mappedStatus,
        team: result.assignedTeam || 'AU NSS Team B',
        lastAuditDaysAgo: 0,
        lastAuditText: 'Just Now',
        healthScore: result.healthScore,
        wardNumber: locationData.ward,
        plantedDate: new Date().toISOString().split('T')[0],
        photoUrl: photoDataUrl,
        isSample: false,
      };
      updatedSaplings = [newSapling, ...saplings];
    } else {
      updatedSaplings = saplings.map((s) => {
        if (s.id === treeId) {
          return {
            ...s,
            status: mappedStatus,
            healthScore: result.healthScore,
            photoUrl: photoDataUrl || s.photoUrl,
            lastAuditDaysAgo: 0,
            lastAuditText: 'Just Now',
            team: result.assignedTeam || s.team,
          };
        }
        return s;
      });
    }

    setSaplings(updatedSaplings);
    saveSaplings(updatedSaplings);

    // Save Audit Log
    const newAuditLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      treeId: newTreeId,
      timestamp: new Date().toISOString(),
      photoUrl: photoDataUrl,
      healthScore: result.healthScore,
      statusLabel: result.statusLabel,
      diagnosis: result.diagnosis,
      leafCondition: result.leafCondition,
      soilDryness: result.soilDryness,
      recommendedAction: result.recommendedAction,
      assignedTeam: result.assignedTeam,
      waterRequiredLiters: result.waterRequiredLiters,
      auditorName: 'Field NSS Auditor',
    };

    const updatedAudits = [newAuditLog, ...audits];
    setAudits(updatedAudits);
    saveAudits(updatedAudits);

    // If Urgent or Needs Water, automatically generate care task
    if (result.urgentAlert || mappedStatus === 'Needs Water' || mappedStatus === 'Critical Wilting') {
      const newTask: CareTask = {
        id: `TASK-${Date.now().toString().slice(-4)}`,
        treeId: newTreeId,
        title: `${result.waterRequiredLiters}L Hydration & ${result.diagnosis}`,
        location: locationData.locationName,
        assignedTeam: result.assignedTeam,
        priority: result.healthScore < 40 ? 'Urgent' : 'High',
        dueDate: 'Within 24 Hours',
        isCompleted: false,
        type: 'watering',
      };
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
    }

    showToast(`Audit for ${newTreeId} logged successfully! Automated care task dispatched.`);
  };

  const handleCompleteTask = (taskId: string) => {
    const updatedTasks = tasks.map((t) => (t.id === taskId ? { ...t, isCompleted: true } : t));
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    showToast('Task marked completed! Field attendance verified.');
  };

  const handleAddComplaint = (ticket: ComplaintTicket) => {
    const updated = [ticket, ...complaints];
    setComplaints(updated);
    saveComplaints(updated);
    showToast(`Complaint ticket #${ticket.id} filed successfully! Field review dispatched.`);
  };

  const handleUpdateComplaintStatus = (ticketId: string, newStatus: ComplaintTicket['status']) => {
    const updated = complaints.map((c) =>
      c.id === ticketId
        ? {
            ...c,
            status: newStatus,
            resolutionNote:
              newStatus === 'Volunteer Dispatched'
                ? 'Field volunteer team arrived on site to inspect sapling / tree guard.'
                : newStatus === 'Resolved'
                ? 'Issue remediated by ground team. Sapling stabilized and care log recorded.'
                : c.resolutionNote,
          }
        : c
    );
    setComplaints(updated);
    saveComplaints(updated);
    showToast(`Ticket #${ticketId} status updated to: ${newStatus}`);
  };

  const handleNavigateToQuery = (prefillSubject?: string) => {
    setPrefillQuery(prefillSubject);
    setCurrentScreen('complaints');
  };

  const handleClearData = () => {
    if (window.confirm(getTranslation(language, 'clearConfirm'))) {
      resetAllData();
      setSaplings(loadSaplings());
      setTasks(loadTasks());
      setAudits(loadAudits());
      setStreaks(loadStreaks());
      setComplaints(loadComplaints());
      showToast(getTranslation(language, 'dataCleared'), 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F5F5] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#00E676] selection:text-black">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md bg-[#18261E] border-2 border-[#00E676] text-[#00E676] p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-white">{toastMessage.text}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'en' ? 'te' : 'en')}
        onOpenCapture={() => handleOpenCapture()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentScreen === 'home' && (
          <HomeScreen
            saplings={saplings}
            onOpenCapture={handleOpenCapture}
            onSelectScreen={setCurrentScreen}
            language={language}
          />
        )}

        {currentScreen === 'feed' && (
          <CampusAuditFeed
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            streaks={streaks}
            saplings={saplings}
            onOpenCapture={handleOpenCapture}
            language={language}
          />
        )}

        {currentScreen === 'map' && (
          <LiveTreeTagMap
            saplings={saplings}
            onOpenCapture={handleOpenCapture}
            language={language}
          />
        )}

        {currentScreen === 'csr' && (
          <CSRImpactExporter
            saplings={saplings}
            audits={audits}
            onOpenCapture={() => handleOpenCapture()}
            onClearData={handleClearData}
            language={language}
          />
        )}

        {currentScreen === 'ngos' && (
          <ReachableNGOsTab
            onOpenCapture={() => handleOpenCapture()}
            onNavigateToQuery={handleNavigateToQuery}
            language={language}
          />
        )}

        {currentScreen === 'complaints' && (
          <ComplaintQueryTab
            complaints={complaints}
            onAddComplaint={handleAddComplaint}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
            saplings={saplings}
            onOpenCapture={() => handleOpenCapture()}
            prefillQuery={prefillQuery}
            language={language}
          />
        )}

        {currentScreen === 'about' && (
          <AboutScreen
            saplings={saplings}
            onOpenCapture={() => handleOpenCapture()}
            onClearData={handleClearData}
            language={language}
          />
        )}
      </main>

      {/* Capture Live Photo & Gemini Inspection Modal */}
      <CaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        saplings={saplings}
        onSaveAudit={handleSaveAudit}
        language={language}
        preselectedTreeId={preselectedTreeId}
        initialLocation={preselectedLocation}
      />

      {/* Footer */}
      <footer className="border-t border-[#222] bg-[#0E0E0E] py-8 text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00E676]/20 flex items-center justify-center text-[#00E676]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white">GREEN SHIELD VIZAG</span>
            <span>• Developed by volt vision</span>
          </div>

          <div className="text-center sm:text-right">
            <span>Visakhapatnam, Andhra Pradesh, India • </span>
            <span className="text-[#00E676]">Post-Plantation Sapling Audit Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
