import { SaplingRecord, CareTask, AuditLog, VolunteerStreak, ComplaintTicket } from '../types';
import { INITIAL_SAPLINGS, INITIAL_TASKS, INITIAL_STREAKS, INITIAL_COMPLAINTS } from '../data/sampleData';

const STORAGE_KEYS = {
  SAPLINGS: 'gsv_saplings_v1',
  TASKS: 'gsv_tasks_v1',
  AUDITS: 'gsv_audits_v1',
  STREAKS: 'gsv_streaks_v1',
  COMPLAINTS: 'gsv_complaints_v1',
};

export function loadSaplings(): SaplingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAPLINGS);
    if (!raw) {
      saveSaplings(INITIAL_SAPLINGS);
      return INITIAL_SAPLINGS;
    }
    const stored: SaplingRecord[] = JSON.parse(raw);
    // If stored array doesn't have the expanded area saplings, merge missing initial saplings
    const storedIds = new Set(stored.map((s) => s.id));
    const missingInitials = INITIAL_SAPLINGS.filter((init) => !storedIds.has(init.id));
    if (missingInitials.length > 0) {
      const merged = [...stored, ...missingInitials];
      saveSaplings(merged);
      return merged;
    }
    return stored;
  } catch (e) {
    console.error('Error loading saplings:', e);
    return INITIAL_SAPLINGS;
  }
}

export function saveSaplings(saplings: SaplingRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SAPLINGS, JSON.stringify(saplings));
  } catch (e) {
    console.error('Error saving saplings:', e);
  }
}

export function loadTasks(): CareTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading tasks:', e);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: CareTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

export function loadAudits(): AuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDITS);
    if (!raw) {
      // Create some initial audit logs based on samples
      const initialAudits: AuditLog[] = [
        {
          id: 'AUD-901',
          treeId: 'Tree #001',
          timestamp: '2026-11-03T10:30:00Z',
          photoUrl: INITIAL_SAPLINGS[0].photoUrl,
          healthScore: 92,
          statusLabel: 'Healthy',
          diagnosis: 'Optimal Foliage Density',
          leafCondition: 'Lush dark green leaves, no signs of infestation',
          soilDryness: 'Moist red soil with coconut husk mulch',
          recommendedAction: 'Maintain current weekly watering cycle',
          assignedTeam: 'AU NSS Team A',
          waterRequiredLiters: 10,
          auditorName: 'Sai Kumar Varma',
        },
        {
          id: 'AUD-902',
          treeId: 'Tree #002',
          timestamp: '2026-10-28T08:15:00Z',
          photoUrl: INITIAL_SAPLINGS[1].photoUrl,
          healthScore: 48,
          statusLabel: 'Needs Water',
          diagnosis: 'Early Moisture Deficit',
          leafCondition: 'Lower leaves drooping, slight edge necrosis',
          soilDryness: 'Dry, surface crusting formed',
          recommendedAction: 'Schedule deep root watering within 24 hours',
          assignedTeam: 'AU NSS Team B',
          waterRequiredLiters: 15,
          auditorName: 'Ananya Reddy',
        },
      ];
      saveAudits(initialAudits);
      return initialAudits;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading audits:', e);
    return [];
  }
}

export function saveAudits(audits: AuditLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
  } catch (e) {
    console.error('Error saving audits:', e);
  }
}

export function loadStreaks(): VolunteerStreak[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(INITIAL_STREAKS));
      return INITIAL_STREAKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_STREAKS;
  }
}

export function loadComplaints(): ComplaintTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
    if (!raw) {
      saveComplaints(INITIAL_COMPLAINTS);
      return INITIAL_COMPLAINTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading complaints:', e);
    return INITIAL_COMPLAINTS;
  }
}

export function saveComplaints(complaints: ComplaintTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
  } catch (e) {
    console.error('Error saving complaints:', e);
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SAPLINGS);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.AUDITS);
  localStorage.removeItem(STORAGE_KEYS.STREAKS);
  localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
}

export function calculateMetrics(saplings: SaplingRecord[]) {
  const total = saplings.length;
  if (total === 0) {
    return {
      total: 0,
      monthlyActiveSaplings: 0,
      survivalRatePercent: 0,
      retentionRatePercent: 88,
      healthyCount: 0,
      needsWaterCount: 0,
      criticalCount: 0,
    };
  }

  // Monthly active = audited within last 30 days
  const monthlyActiveSaplings = saplings.filter((s) => s.lastAuditDaysAgo <= 30).length;

  // Survival rate = Healthy + Needs Water + Damaged Guard (non-dead/non-missing)
  const surviving = saplings.filter((s) => s.status !== 'Missing' && s.status !== 'Critical Wilting');
  const healthyCount = saplings.filter((s) => s.status === 'Healthy').length;
  const needsWaterCount = saplings.filter((s) => s.status === 'Needs Water').length;
  const criticalCount = saplings.filter((s) => s.status === 'Critical Wilting' || s.status === 'Damaged Guard').length;

  const survivalRatePercent = Math.round((surviving.length / total) * 100);

  // Volunteer retention is steady high for active collegiate cells
  const retentionRatePercent = 86;

  return {
    total,
    monthlyActiveSaplings,
    survivalRatePercent,
    retentionRatePercent,
    healthyCount,
    needsWaterCount,
    criticalCount,
  };
}
