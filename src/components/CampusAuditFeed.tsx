import React from 'react';
import {
  AlertTriangle,
  Droplets,
  Flame,
  Award,
  ExternalLink,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  TreePine,
  ShieldCheck
} from 'lucide-react';
import { CareTask, VolunteerStreak, SaplingRecord, Language } from '../types';
import { STAT_CARDS_FACTS } from '../data/sampleData';
import { getTranslation } from '../utils/i18n';

interface CampusAuditFeedProps {
  tasks: CareTask[];
  onCompleteTask: (taskId: string) => void;
  streaks: VolunteerStreak[];
  saplings: SaplingRecord[];
  onOpenCapture: (treeId?: string) => void;
  language: Language;
}

export const CampusAuditFeed: React.FC<CampusAuditFeedProps> = ({
  tasks,
  onCompleteTask,
  streaks,
  saplings,
  onOpenCapture,
  language,
}) => {
  // Urgent watering alerts: Saplings with status 'Needs Water' or 'Critical Wilting'
  const urgentAlerts = saplings.filter(
    (s) => s.status === 'Critical Wilting' || s.status === 'Needs Water'
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner with Headline Promise */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#18261E] via-[#141C17] to-[#121212] border border-[#00E676]/30 p-6 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E3326] border border-[#00E676]/40 text-[#00E676] text-xs font-mono font-bold tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#00E676]" />
            <span>VISAKHAPATNAM POST-PLANTATION SAPLING AUDIT REGISTRY</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Turn one-off tree drives into{' '}
            <span className="text-[#00E676] drop-shadow-[0_0_20px_rgba(0,230,118,0.3)]">
              photo-verified sapling survival logs
            </span>{' '}
            across Visakhapatnam.
          </h1>

          <p className="text-sm sm:text-base text-[#B0B0B5] leading-relaxed">
            Built for Vizag NGO campaign leads and University NSS/NCC student clubs. We replace static municipal portals with hyper-local crowdsourced survival audits and automated watering dispatches.
          </p>

          {/* Primary Action Button: Prominent on Feed */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onOpenCapture()}
              className="py-4 px-6 rounded-2xl bg-[#00E676] text-black font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,230,118,0.5)] hover:bg-[#15f385] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Capture Live Camera Photo</span>
              <Sparkles className="w-4 h-4 animate-spin text-black/70" />
            </button>
            <div className="text-xs text-[#8E8E93] flex items-center gap-2 px-2">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-ping" />
              <span>10 Vizag Municipal Wards Monitored Today</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS: 3 High-Impact Fact Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-[#FFD600]" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {getTranslation(language, 'factsHeadline')}
            </h2>
          </div>
          <span className="text-xs font-mono text-[#8E8E93]">INVESTIGATIVE CITATIONS</span>
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

      {/* AUTOMATED WATERING & CARE ALERTS SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#FFD600]/20 text-[#FFD600]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {getTranslation(language, 'activeTasks')}
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Automated volunteer dispatch triggered by monthly health audits
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#241F14] text-[#FFD600] border border-[#FFD600]/30 text-xs font-mono font-bold">
            {urgentAlerts.length} Saplings In Moisture Deficit
          </span>
        </div>

        {/* Task Cards Grid */}
        {tasks.length === 0 ? (
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-8 text-center text-[#8E8E93]">
            <CheckCircle2 className="w-8 h-8 mx-auto text-[#00E676] mb-2" />
            <p className="text-sm font-semibold text-white">All care tasks completed!</p>
            <p className="text-xs mt-1">Capture a photo to log new sapling health status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all ${
                  task.isCompleted
                    ? 'bg-[#141815] border-[#00E676]/30 opacity-70'
                    : task.priority === 'Urgent'
                    ? 'bg-[#1C1616] border-[#FF5252]/40 shadow-[0_0_15px_rgba(255,82,82,0.15)]'
                    : 'bg-[#1A1A1A] border-[#2F3336]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'Urgent'
                          ? 'bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/30'
                          : 'bg-[#FFD600]/20 text-[#FFD600] border border-[#FFD600]/30'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <span className="text-xs font-mono text-[#8E8E93]">{task.treeId}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#A0A0A0]">
                    <Clock className="w-3.5 h-3.5 text-[#FFD600]" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>

                <h3
                  className={`text-base font-bold mb-1.5 ${
                    task.isCompleted ? 'line-through text-[#8E8E93]' : 'text-white'
                  }`}
                >
                  {task.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-[#A0A0A0] mb-4">
                  <MapPin className="w-3.5 h-3.5 text-[#00E676] flex-shrink-0" />
                  <span>{task.location}</span>
                  <span className="text-[#444]">•</span>
                  <Users className="w-3.5 h-3.5 text-[#8E8E93] flex-shrink-0" />
                  <span className="truncate">{task.assignedTeam}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#2A2A2A]">
                  {!task.isCompleted ? (
                    <>
                      <button
                        onClick={() => onCompleteTask(task.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#252525] hover:bg-[#303030] text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-[#3A3A3A] transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                        <span>{getTranslation(language, 'markWatered')}</span>
                      </button>
                      <button
                        onClick={() => onOpenCapture(task.treeId)}
                        className="py-2 px-3 rounded-xl bg-[#00E676]/20 hover:bg-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center gap-1.5 border border-[#00E676]/40 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Audit Photo</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-1.5 text-center text-xs font-mono text-[#00E676] flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Task Completed & Verified</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* STUDENT ATTENDANCE STREAKS & NSS LEADERBOARD */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#FF5252]" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {getTranslation(language, 'nssLeaderboard')}
            </h2>
          </div>
          <span className="text-xs text-[#8E8E93]">Weekly Vizag Student Ranking</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {streaks.map((streak, idx) => (
            <div
              key={idx}
              className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 text-2xl font-black font-mono text-[#252525] select-none">
                #{idx + 1}
              </div>
              <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#1F2922] border border-[#00E676]/40 flex items-center justify-center text-white font-bold text-xs">
                    {streak.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{streak.name}</h4>
                    <p className="text-[11px] text-[#8E8E93] truncate">{streak.institution}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="bg-[#121212] px-2.5 py-1.5 rounded-lg border border-[#282828] text-xs">
                    <span className="text-[#8E8E93] text-[10px] block">STREAK</span>
                    <span className="font-bold text-[#FF5252] flex items-center gap-1 font-mono">
                      <Flame className="w-3.5 h-3.5 fill-[#FF5252]" />
                      {streak.streakDays} Days
                    </span>
                  </div>
                  <div className="bg-[#121212] px-2.5 py-1.5 rounded-lg border border-[#282828] text-xs">
                    <span className="text-[#8E8E93] text-[10px] block">AUDITS</span>
                    <span className="font-bold text-[#00E676] font-mono">
                      {streak.auditsLogged} Logs
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#252525] flex items-center gap-1.5 text-[11px] text-[#FFD600]">
                <Award className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="font-medium truncate">{streak.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating Action Button for Mobile */}
      <div className="sm:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => onOpenCapture()}
          className="p-4 rounded-full bg-[#00E676] text-black shadow-[0_0_25px_rgba(0,230,118,0.7)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          aria-label="Capture live camera photo"
        >
          <Camera className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
