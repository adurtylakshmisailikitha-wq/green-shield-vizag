export type HealthStatus = 'Healthy' | 'Needs Water' | 'Critical Wilting' | 'Damaged Guard' | 'Missing';

export interface SaplingRecord {
  id: string; // e.g., 'Tree #001'
  species: string; // e.g., 'Neem'
  location: string; // e.g., 'Maddilapalem Ward 14'
  lat: number;
  lng: number;
  status: HealthStatus;
  team: string; // e.g., 'AU NSS Team A'
  lastAuditDaysAgo: number;
  lastAuditText: string; // e.g., '2 Days Ago'
  photoUrl: string;
  isSample?: boolean;
  healthScore?: number;
  wardNumber?: number;
  plantedDate?: string;
  waterUrgency?: 'Low' | 'Medium' | 'High' | 'Immediate';
}

export interface AuditLog {
  id: string;
  treeId: string;
  timestamp: string;
  photoUrl: string;
  healthScore: number;
  statusLabel: string;
  diagnosis: string;
  leafCondition: string;
  soilDryness: string;
  recommendedAction: string;
  assignedTeam: string;
  waterRequiredLiters: number;
  auditorName: string;
  notes?: string;
}

export interface CareTask {
  id: string;
  treeId: string;
  title: string;
  location: string;
  assignedTeam: string;
  priority: 'High' | 'Urgent' | 'Normal';
  dueDate: string;
  isCompleted: boolean;
  type: 'watering' | 'guard_repair' | 'weeding' | 'soil_aeration';
}

export interface VolunteerStreak {
  name: string;
  institution: string; // e.g., 'Andhra University NSS', 'GITAM Green Club'
  streakDays: number;
  auditsLogged: number;
  badge: string;
}

export interface InspectionResult {
  healthScore: number;
  statusLabel: string;
  diagnosis: string;
  leafCondition: string;
  soilDryness: string;
  recommendedAction: string;
  assignedTeam: string;
  urgentAlert: boolean;
  waterRequiredLiters: number;
  notes?: string;
}

export interface NGOContact {
  id: string;
  name: string;
  category: 'University NSS/NCC' | 'Registered Environmental NGO' | 'Youth Green Club' | 'Civic Conservation';
  zone: string; // e.g., 'Central Vizag', 'Beach Corridor', 'North Vizag', 'Industrial / South'
  headquarters: string;
  wardsCovered: string[];
  phone: string;
  email: string;
  leadCoordinator: string;
  activeVolunteerCount: number;
  saplingsMaintained: number;
  keyInitiatives: string[];
  operatingHours: string;
  verifiedStatus: boolean;
}

export type ComplaintType =
  | 'Illegal Tree Felling / Cutting'
  | 'Urgent Watering Needed'
  | 'Broken / Vandalized Tree Guard'
  | 'Missing Sapling'
  | 'Volunteer Enrollment Inquiry'
  | 'CSR Sponsorship Query'
  | 'General Civic Query';

export type TicketStatus = 'Under Field Review' | 'Volunteer Dispatched' | 'Escalated to Ward Cell' | 'Resolved';

export interface ComplaintTicket {
  id: string;
  type: ComplaintType;
  title: string;
  location: string;
  ward: string;
  lat?: number;
  lng?: number;
  treeId?: string;
  description: string;
  photoUrl?: string;
  reporterName: string;
  reporterPhone: string;
  reporterEmail?: string;
  status: TicketStatus;
  createdAt: string;
  priority: 'Urgent' | 'High' | 'Normal';
  resolutionNote?: string;
}

export type ScreenType = 'home' | 'feed' | 'map' | 'csr' | 'ngos' | 'complaints' | 'about';

export type Language = 'en' | 'te';

