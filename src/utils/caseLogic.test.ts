import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRecoveryProgress,
  computeDashboardStats,
  createInitialStages,
  deriveStatusFromStages,
  filterAndSortCases,
  filterAndSortEvidence,
  generateCaseId,
  generateComplaintDraft,
  getNextRecommendedAction,
  validateIncidentForm,
} from './caseLogic';
import type { CaseIncident, EvidenceItem } from '../types';

test('generateCaseId creates unique sequential case IDs for the current year', () => {
  const d = new Date('2026-05-10T10:00:00Z');
  const first = generateCaseId([], d);
  assert.equal(first, 'RX-2026-0101');

  const second = generateCaseId(['RX-2026-0101', 'RX-2026-0102'], d);
  assert.equal(second, 'RX-2026-0103');
});

test('validateIncidentForm catches missing required fields and invalid amounts', () => {
  const errs = validateIncidentForm({
    category: '',
    title: 'Hi',
    amountInvolved: '-500',
    incidentDate: '',
    incidentTime: '',
    platform: '',
    transactionId: '',
    suspiciousContact: '',
    description: 'short',
    bankContacted: 'No',
    complaintFiled: 'No',
  });

  assert.ok(errs.category);
  assert.ok(errs.title);
  assert.ok(errs.amountInvolved);
  assert.ok(errs.incidentDate);
  assert.ok(errs.platform);
  assert.ok(errs.description);

  const validErrs = validateIncidentForm({
    category: 'upi_payment',
    title: 'Unauthorized UPI debit',
    amountInvolved: '12500',
    incidentDate: '2026-11-20',
    incidentTime: '14:30',
    platform: 'Google Pay',
    transactionId: 'UTR123456',
    suspiciousContact: '+91 9000012345',
    description: 'Caller impersonated courier support and triggered a collect request.',
    bankContacted: 'Yes',
    complaintFiled: 'No',
  });

  assert.equal(Object.keys(validErrs).length, 0);
});

test('calculateRecoveryProgress computes percentage and current stage accurately', () => {
  const now = '2026-11-20T10:00:00.000Z';
  const stages = createInitialStages('No', now);
  const progress = calculateRecoveryProgress(stages);

  assert.equal(progress.completedCount, 1);
  assert.equal(progress.totalCount, 6);
  assert.equal(progress.percentage, 17);
  assert.equal(progress.currentStageId, 'immediate_safety');

  const allComplete = stages.map((s) => ({ ...s, completed: true }));
  const doneProgress = calculateRecoveryProgress(allComplete);
  assert.equal(doneProgress.percentage, 100);
  assert.equal(doneProgress.currentStageId, 'resolved');
});

test('deriveStatusFromStages maps stage completion to accurate case status', () => {
  const now = '2026-11-20T10:00:00.000Z';
  const initial = createInitialStages('No', now);
  assert.equal(deriveStatusFromStages(initial, 'Active'), 'Active');

  const submitted = initial.map((s) =>
    s.id === 'complaint_submitted' ? { ...s, completed: true } : s
  );
  assert.equal(deriveStatusFromStages(submitted, 'Active'), 'Pending Follow-up');

  const resolved = submitted.map((s) =>
    s.id === 'resolved' ? { ...s, completed: true } : s
  );
  assert.equal(deriveStatusFromStages(resolved, 'Pending Follow-up'), 'Resolved');
});

test('generateComplaintDraft remains strictly factual and omits invented details', () => {
  const draft = generateComplaintDraft({
    caseId: 'RX-2026-0101',
    title: 'Fake Job Deposit Demand',
    category: 'job_internship',
    incidentDate: '2026-11-18',
    platform: 'WhatsApp / Telegram',
    description: 'Received remote data entry offer and paid registration fee via UPI.',
    bankContacted: 'No',
    complaintFiled: 'No',
    evidenceList: ['Screenshot — Chat transcript'],
  });

  assert.match(draft, /RX-2026-0101/);
  assert.match(draft, /Job \/ Internship Fraud/);
  assert.match(draft, /Amount Involved: Not specified \/ Non-financial incident/);
  assert.match(draft, /Transaction \/ Reference ID: Not provided/);
  assert.match(draft, /Screenshot — Chat transcript/);
  assert.doesNotMatch(draft, /₹/);
});

test('filterAndSortCases and computeDashboardStats work consistently', () => {
  const baseCase: CaseIncident = {
    id: 'RX-2026-0101',
    title: 'UPI Refund Scam',
    category: 'upi_payment',
    amountInvolved: 9500,
    currency: 'INR',
    incidentDate: '2026-11-19',
    platform: 'PhonePe',
    description: 'Scammer sent QR code claiming refund.',
    bankContacted: 'Yes',
    complaintFiled: 'No',
    status: 'Active',
    stages: createInitialStages('No', '2026-11-19T10:00:00Z'),
    milestones: [],
    notes: [],
    emergencyActionsCompleted: [],
    createdAt: '2026-11-19T10:00:00Z',
    updatedAt: '2026-11-19T10:00:00Z',
  };

  const resolvedCase: CaseIncident = {
    ...baseCase,
    id: 'RX-2026-0102',
    title: 'Instagram Hijack',
    category: 'social_media_hack',
    status: 'Resolved',
    createdAt: '2026-11-20T10:00:00Z',
  };

  const ev: EvidenceItem[] = [
    {
      id: 'ev-1',
      name: 'UPI Receipt',
      category: 'Transaction Record',
      caseId: 'RX-2026-0101',
      dateAdded: '2026-11-19T11:00:00Z',
      notes: 'UTR screenshot',
    },
  ];

  const stats = computeDashboardStats([baseCase, resolvedCase], ev);
  assert.deepEqual(stats, {
    totalIncidents: 2,
    activeCases: 1,
    evidenceItemsSaved: 1,
    resolvedIncidents: 1,
  });

  const filtered = filterAndSortCases([baseCase, resolvedCase], 'Active', 'phonepe');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'RX-2026-0101');

  const evFiltered = filterAndSortEvidence(ev, {
    searchQuery: 'utr',
    category: 'Transaction Record',
    caseId: 'RX-2026-0101',
    sortOrder: 'newest',
  });
  assert.equal(evFiltered.length, 1);

  const nextAction = getNextRecommendedAction(baseCase);
  assert.ok(nextAction.length > 10);
});
