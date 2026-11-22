export type NavSection =
  | 'overview'
  | 'report'
  | 'emergency'
  | 'evidence'
  | 'complaint'
  | 'tracker'
  | 'cases'
  | 'safety'
  | 'settings';

export type FraudCategoryId =
  | 'upi_payment'
  | 'online_shopping'
  | 'investment_trading'
  | 'digital_arrest'
  | 'social_media_hack'
  | 'identity_theft'
  | 'job_internship'
  | 'card_fraud'
  | 'otp_account_access'
  | 'other_cyber_fraud';

export type CaseStatus = 'Active' | 'Pending Follow-up' | 'Resolved';

export type TriStateAnswer = 'Yes' | 'No' | 'Unsure';

export type RecoveryStageId =
  | 'incident_reported'
  | 'immediate_safety'
  | 'evidence_collected'
  | 'complaint_submitted'
  | 'followup_in_progress'
  | 'resolved';

export interface RecoveryStageState {
  id: RecoveryStageId;
  completed: boolean;
  completedAt?: string;
}

export interface RecoveryMilestone {
  id: string;
  date: string;
  title: string;
  note: string;
}

export interface CaseNote {
  id: string;
  createdAt: string;
  content: string;
}

export interface CaseIncident {
  id: string;
  title: string;
  category: FraudCategoryId;
  amountInvolved?: number;
  currency: string;
  incidentDate: string; // YYYY-MM-DD
  incidentTime?: string; // HH:mm
  platform: string;
  transactionId?: string;
  suspiciousContact?: string;
  description: string;
  bankContacted: TriStateAnswer;
  complaintFiled: 'Yes' | 'No';
  complaintReferenceNumber?: string;
  followUpDate?: string;
  status: CaseStatus;
  stages: RecoveryStageState[];
  milestones: RecoveryMilestone[];
  notes: CaseNote[];
  emergencyActionsCompleted: string[];
  savedComplaintDraft?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export type EvidenceCategory =
  | 'Screenshot'
  | 'Transaction Record'
  | 'Email'
  | 'Chat'
  | 'Phone Number'
  | 'Website / Link'
  | 'Document'
  | 'Other';

export interface EvidenceItem {
  id: string;
  name: string;
  category: EvidenceCategory;
  caseId: string | null;
  dateAdded: string;
  notes: string;
  transactionDetails?: string;
  suspiciousContact?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  hasLocalBlob?: boolean;
  isDemo?: boolean;
}

export interface ActivityEvent {
  id: string;
  type:
    | 'incident_created'
    | 'evidence_added'
    | 'status_updated'
    | 'complaint_saved'
    | 'emergency_action'
    | 'case_updated';
  title: string;
  detail: string;
  caseId?: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'case' | 'reminder' | 'evidence' | 'checklist' | 'tip';
  timestamp: string;
  read: boolean;
  caseId?: string;
  isDemo?: boolean;
}

export interface UserSettings {
  displayName: string;
  email: string;
  theme: 'dark' | 'light';
  notifications: {
    caseUpdates: boolean;
    followUpReminders: boolean;
    checklistReminders: boolean;
    safetyTips: boolean;
  };
}

export interface RecoverXState {
  cases: CaseIncident[];
  evidence: EvidenceItem[];
  emergencyChecklist: Record<string, string[]>; // scenarioId -> completed step IDs
  safetyChecklist: string[]; // completed safety item IDs
  activities: ActivityEvent[];
  notifications: AppNotification[];
  settings: UserSettings;
  demoModeActive: boolean;
}

export interface IncidentFormInput {
  category: FraudCategoryId | '';
  title: string;
  amountInvolved: string;
  incidentDate: string;
  incidentTime: string;
  platform: string;
  transactionId: string;
  suspiciousContact: string;
  description: string;
  bankContacted: TriStateAnswer;
  complaintFiled: 'Yes' | 'No';
}

export interface ValidationErrors {
  category?: string;
  title?: string;
  amountInvolved?: string;
  incidentDate?: string;
  platform?: string;
  description?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
}
