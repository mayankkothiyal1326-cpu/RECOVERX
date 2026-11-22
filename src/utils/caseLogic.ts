import type {
  CaseIncident,
  CaseStatus,
  EvidenceCategory,
  EvidenceItem,
  FraudCategoryId,
  IncidentFormInput,
  RecoveryStageId,
  RecoveryStageState,
  TriStateAnswer,
  ValidationErrors,
} from '../types';

export const RECOVERY_STAGE_ORDER: { id: RecoveryStageId; label: string; description: string }[] = [
  {
    id: 'incident_reported',
    label: 'Incident Reported',
    description: 'Core incident details recorded and local case file opened.',
  },
  {
    id: 'immediate_safety',
    label: 'Immediate Safety Actions',
    description: 'Bank contacted, compromised credentials rotated, or unauthorized access blocked.',
  },
  {
    id: 'evidence_collected',
    label: 'Evidence Collected',
    description: 'Screenshots, transaction IDs, chats, and suspicious contact records organized.',
  },
  {
    id: 'complaint_submitted',
    label: 'Complaint Submitted',
    description: 'Official complaint filed via cybercrime.gov.in, helpline 1930, or local police.',
  },
  {
    id: 'followup_in_progress',
    label: 'Follow-up in Progress',
    description: 'Tracking acknowledgement number, bank dispute ticket, and scheduled check-ins.',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    description: 'Case closed with final bank, platform, or law enforcement outcome recorded.',
  },
];

export const FRAUD_CATEGORY_LABELS: Record<FraudCategoryId, string> = {
  upi_payment: 'UPI / Digital Payment Fraud',
  online_shopping: 'Online Shopping Fraud',
  investment_trading: 'Investment / Trading Fraud',
  digital_arrest: 'Digital Arrest / Impersonation',
  social_media_hack: 'Social Media Account Hacking',
  identity_theft: 'Identity Theft',
  job_internship: 'Job / Internship Fraud',
  card_fraud: 'Credit / Debit Card Fraud',
  otp_account_access: 'OTP / Account Access Fraud',
  other_cyber_fraud: 'Other Cyber Fraud',
};

export function createInitialStages(complaintFiled: 'Yes' | 'No', nowIso: string): RecoveryStageState[] {
  return RECOVERY_STAGE_ORDER.map((stage) => {
    if (stage.id === 'incident_reported') {
      return { id: stage.id, completed: true, completedAt: nowIso };
    }
    if (stage.id === 'complaint_submitted' && complaintFiled === 'Yes') {
      return { id: stage.id, completed: true, completedAt: nowIso };
    }
    return { id: stage.id, completed: false };
  });
}

export function generateCaseId(existingIds: string[], now = new Date()): string {
  const year = now.getFullYear();
  const existingSet = new Set(existingIds);
  let seq = existingIds.length + 101;
  while (existingSet.has(`RX-${year}-${String(seq).padStart(4, '0')}`)) {
    seq += 1;
  }
  return `RX-${year}-${String(seq).padStart(4, '0')}`;
}

export function validateIncidentForm(input: IncidentFormInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.category) {
    errors.category = 'Select a fraud category to continue.';
  }

  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) {
    errors.title = 'Enter a short, descriptive incident title.';
  } else if (trimmedTitle.length < 5) {
    errors.title = 'Incident title should be at least 5 characters.';
  }

  if (input.amountInvolved.trim() !== '') {
    const num = Number(input.amountInvolved);
    if (!Number.isFinite(num) || num < 0) {
      errors.amountInvolved = 'Enter a valid non-negative numeric amount.';
    }
  }

  if (!input.incidentDate.trim()) {
    errors.incidentDate = 'Provide the date when the incident occurred.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(input.incidentDate.trim())) {
    errors.incidentDate = 'Use a valid date format (YYYY-MM-DD).';
  }

  if (!input.platform.trim()) {
    errors.platform = 'Specify the app, website, bank, or platform involved.';
  }

  const trimmedDesc = input.description.trim();
  if (!trimmedDesc) {
    errors.description = 'Provide a brief factual description of what happened.';
  } else if (trimmedDesc.length < 15) {
    errors.description = 'Please include at least 15 characters describing the incident.';
  }

  return errors;
}

export function calculateRecoveryProgress(stages: RecoveryStageState[]): {
  completedCount: number;
  totalCount: number;
  percentage: number;
  currentStageId: RecoveryStageId;
  currentStageLabel: string;
} {
  const totalCount = RECOVERY_STAGE_ORDER.length;
  const stageMap = new Map(stages.map((s) => [s.id, s]));
  let completedCount = 0;
  let lastCompletedIndex = -1;

  RECOVERY_STAGE_ORDER.forEach((stage, idx) => {
    if (stageMap.get(stage.id)?.completed) {
      completedCount += 1;
      lastCompletedIndex = idx;
    }
  });

  const percentage = Math.round((completedCount / totalCount) * 100);
  const currentIndex =
    completedCount === totalCount
      ? totalCount - 1
      : Math.min(lastCompletedIndex + 1, totalCount - 1);

  const currentStage = RECOVERY_STAGE_ORDER[Math.max(0, currentIndex)];

  return {
    completedCount,
    totalCount,
    percentage,
    currentStageId: currentStage.id,
    currentStageLabel: currentStage.label,
  };
}

export function getNextRecommendedAction(incident: CaseIncident): string {
  const stageMap = new Map(incident.stages.map((s) => [s.id, s.completed]));

  if (incident.status === 'Resolved' || stageMap.get('resolved')) {
    return 'Keep a local archive of your complaint reference and closure communication for future records.';
  }
  if (!stageMap.get('immediate_safety')) {
    if (incident.bankContacted !== 'Yes' && incident.amountInvolved && incident.amountInvolved > 0) {
      return 'Contact your bank or payment service immediately via their official helpline to flag the unauthorized transaction.';
    }
    return 'Complete immediate safety steps: rotate affected passwords, enable 2FA, and review active sessions.';
  }
  if (!stageMap.get('evidence_collected')) {
    return 'Upload screenshots, transaction references, and suspicious contact details into the Evidence Vault.';
  }
  if (!stageMap.get('complaint_submitted')) {
    return 'Prepare your structured draft in Complaint Assistant and submit through cybercrime.gov.in or helpline 1930.';
  }
  if (!stageMap.get('followup_in_progress')) {
    return 'Record your official complaint acknowledgement number and set a follow-up reminder date.';
  }
  return 'Continue monitoring responses from your bank or investigating portal and log updates as milestones.';
}

export function deriveStatusFromStages(
  stages: RecoveryStageState[],
  currentStatus: CaseStatus
): CaseStatus {
  const map = new Map(stages.map((s) => [s.id, s.completed]));
  if (map.get('resolved')) {
    return 'Resolved';
  }
  if (map.get('complaint_submitted') || map.get('followup_in_progress')) {
    return currentStatus === 'Resolved' ? 'Pending Follow-up' : 'Pending Follow-up';
  }
  return 'Active';
}

export interface ComplaintDraftInput {
  caseId?: string;
  title: string;
  category: FraudCategoryId;
  incidentDate: string;
  incidentTime?: string;
  amountInvolved?: number;
  currency?: string;
  platform: string;
  transactionId?: string;
  suspiciousContact?: string;
  description: string;
  bankContacted: TriStateAnswer;
  complaintFiled: 'Yes' | 'No';
  complaintReferenceNumber?: string;
  evidenceList: string[];
  additionalActionsTaken?: string;
}

/**
 * Generates a strictly factual, neutral complaint draft using ONLY the
 * fields provided by the user. Never invents or extrapolates missing details.
 */
export function generateComplaintDraft(input: ComplaintDraftInput): string {
  const categoryLabel = FRAUD_CATEGORY_LABELS[input.category] || 'Cyber Fraud';
  const lines: string[] = [];

  lines.push('CYBER FRAUD INCIDENT COMPLAINT DRAFT');
  lines.push('==================================================');
  lines.push('');
  lines.push('1. INCIDENT SUMMARY');
  if (input.caseId) {
    lines.push(`Local Reference ID: ${input.caseId}`);
  }
  lines.push(`Subject: ${input.title.trim() || '[Enter incident title]'}`);
  lines.push(`Fraud Category: ${categoryLabel}`);
  lines.push(
    `Date & Approximate Time: ${input.incidentDate || '[Not provided]'}${
      input.incidentTime ? ` at ${input.incidentTime}` : ' (Time not specified)'
    }`
  );

  lines.push('');
  lines.push('2. FINANCIAL & TRANSACTION DETAILS');
  if (
    typeof input.amountInvolved === 'number' &&
    !Number.isNaN(input.amountInvolved) &&
    input.amountInvolved > 0
  ) {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(input.amountInvolved);
    lines.push(`Amount Involved: ${input.currency || 'INR'} ${formattedAmount}`);
  } else {
    lines.push('Amount Involved: Not specified / Non-financial incident');
  }
  lines.push(`Platform / Service Involved: ${input.platform.trim() || '[Not provided]'}`);
  if (input.transactionId?.trim()) {
    lines.push(`Transaction / Reference ID: ${input.transactionId.trim()}`);
  } else {
    lines.push('Transaction / Reference ID: Not provided');
  }

  lines.push('');
  lines.push('3. SUSPECTED CONTACT / PLATFORM IDENTIFIERS');
  if (input.suspiciousContact?.trim()) {
    lines.push(`Suspicious Phone / Email / Handle / URL: ${input.suspiciousContact.trim()}`);
  } else {
    lines.push('Suspicious Phone / Email / Handle / URL: Not provided');
  }

  lines.push('');
  lines.push('4. DESCRIPTION OF EVENTS');
  lines.push(
    input.description.trim() || '[Provide a chronological, factual account of the incident.]'
  );

  lines.push('');
  lines.push('5. EVIDENCE AVAILABLE');
  if (input.evidenceList.length > 0) {
    input.evidenceList.forEach((item, idx) => {
      lines.push(`  ${idx + 1}. ${item}`);
    });
  } else {
    lines.push(
      '  No evidence items listed yet. Attach relevant screenshots, bank statements, or communication records before submission.'
    );
  }

  lines.push('');
  lines.push('6. ACTIONS ALREADY TAKEN');
  lines.push(`- Bank / Payment Provider Contacted: ${input.bankContacted}`);
  lines.push(`- Prior Official Complaint Filed: ${input.complaintFiled}`);
  if (input.complaintReferenceNumber?.trim()) {
    lines.push(
      `- Existing Acknowledgement / Reference Number: ${input.complaintReferenceNumber.trim()}`
    );
  }
  if (input.additionalActionsTaken?.trim()) {
    lines.push(`- Additional Steps Taken: ${input.additionalActionsTaken.trim()}`);
  }

  lines.push('');
  lines.push('7. DECLARATION');
  lines.push(
    'I confirm that the above statement is true and factual to the best of my knowledge, and I request appropriate review and assistance under applicable cybercrime procedures.'
  );
  lines.push('');
  lines.push('Complainant Name: [Insert Full Legal Name]');
  lines.push('Contact Number: [Insert Phone Number]');
  lines.push('Email Address: [Insert Email Address]');
  lines.push('Date: [Insert Submission Date]');

  return lines.join('\n');
}

export function filterAndSortCases(
  cases: CaseIncident[],
  statusFilter: 'All' | CaseStatus,
  searchQuery: string
): CaseIncident[] {
  const q = searchQuery.trim().toLowerCase();
  return cases
    .filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (!q) return true;
      const catLabel = FRAUD_CATEGORY_LABELS[c.category]?.toLowerCase() ?? '';
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        catLabel.includes(q) ||
        c.platform.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function filterAndSortEvidence(
  items: EvidenceItem[],
  opts: {
    searchQuery: string;
    category: 'All' | EvidenceCategory;
    caseId: 'All' | string;
    sortOrder: 'newest' | 'oldest';
  }
): EvidenceItem[] {
  const q = opts.searchQuery.trim().toLowerCase();
  return items
    .filter((item) => {
      if (opts.category !== 'All' && item.category !== opts.category) return false;
      if (opts.caseId !== 'All') {
        if (opts.caseId === 'unassigned') {
          if (item.caseId !== null) return false;
        } else if (item.caseId !== opts.caseId) {
          return false;
        }
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.suspiciousContact?.toLowerCase().includes(q) ?? false) ||
        (item.transactionDetails?.toLowerCase().includes(q) ?? false)
      );
    })
    .sort((a, b) => {
      const diff = new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      return opts.sortOrder === 'newest' ? diff : -diff;
    });
}

export function computeDashboardStats(cases: CaseIncident[], evidence: EvidenceItem[]) {
  const totalIncidents = cases.length;
  const activeCases = cases.filter((c) => c.status !== 'Resolved').length;
  const resolvedIncidents = cases.filter((c) => c.status === 'Resolved').length;
  const evidenceItemsSaved = evidence.length;
  return {
    totalIncidents,
    activeCases,
    evidenceItemsSaved,
    resolvedIncidents,
  };
}

export function formatCurrency(amount?: number, currency = 'INR'): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return '—';
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : `${currency} `;
  return `${symbol}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(amount)}`;
}

export function formatDisplayDate(isoOrYmd: string): string {
  if (!isoOrYmd) return '—';
  const d = new Date(isoOrYmd);
  if (Number.isNaN(d.getTime())) return isoOrYmd;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDisplayDate(iso);
}
