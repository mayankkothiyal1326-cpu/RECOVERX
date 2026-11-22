import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CheckSquare,
  Circle,
  Edit3,
  FilePlus2,
  FileText,
  FolderLock,
  GitCommitHorizontal,
  LayoutGrid,
  List,
  Plus,
  Save,
  Search,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import type {
  CaseIncident,
  CaseStatus,
  EvidenceItem,
  FraudCategoryId,
  NavSection,
  RecoveryStageId,
  TriStateAnswer,
} from '../../types';
import { EMERGENCY_SCENARIOS, FRAUD_CATEGORIES } from '../../data/staticContent';
import {
  FRAUD_CATEGORY_LABELS,
  RECOVERY_STAGE_ORDER,
  calculateRecoveryProgress,
  filterAndSortCases,
  formatCurrency,
  formatDisplayDate,
  formatRelativeTime,
} from '../../utils/caseLogic';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { StatusIndicator } from '../ui/StatusIndicator';

interface MyCasesViewProps {
  cases: CaseIncident[];
  evidence: EvidenceItem[];
  selectedCaseId: string | null;
  onSelectCase: (caseId: string | null) => void;
  onUpdateCase: (
    caseId: string,
    updates: Partial<
      Pick<
        CaseIncident,
        | 'title'
        | 'category'
        | 'amountInvolved'
        | 'incidentDate'
        | 'incidentTime'
        | 'platform'
        | 'transactionId'
        | 'suspiciousContact'
        | 'description'
        | 'bankContacted'
        | 'complaintFiled'
        | 'complaintReferenceNumber'
        | 'followUpDate'
        | 'status'
      >
    >,
    activityTitle?: string
  ) => void;
  onDeleteCase: (caseId: string) => void;
  onToggleStage: (caseId: string, stageId: RecoveryStageId) => void;
  onToggleEmergencyAction: (caseId: string, stepId: string) => void;
  onAddNote: (caseId: string, content: string) => void;
  onNavigate: (section: NavSection) => void;
  onOpenComplaintForCase: (caseId: string) => void;
  onOpenTrackerForCase: (caseId: string) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export function MyCasesView({
  cases,
  evidence,
  selectedCaseId,
  onSelectCase,
  onUpdateCase,
  onDeleteCase,
  onToggleStage,
  onToggleEmergencyAction,
  onAddNote,
  onNavigate,
  onOpenComplaintForCase,
  onOpenTrackerForCase,
  onToast,
}: MyCasesViewProps) {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [statusFilter, setStatusFilter] = useState<'All' | CaseStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail state
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Edit form fields
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<FraudCategoryId>('upi_payment');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPlatform, setEditPlatform] = useState('');
  const [editTxId, setEditTxId] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editBank, setEditBank] = useState<TriStateAnswer>('No');
  const [editFiled, setEditFiled] = useState<'Yes' | 'No'>('No');
  const [editStatus, setEditStatus] = useState<CaseStatus>('Active');

  const activeCase = useMemo(
    () => (selectedCaseId ? cases.find((c) => c.id === selectedCaseId) ?? null : null),
    [cases, selectedCaseId]
  );

  const filteredCases = useMemo(
    () => filterAndSortCases(cases, statusFilter, searchQuery),
    [cases, statusFilter, searchQuery]
  );

  const startEditing = (c: CaseIncident) => {
    setEditTitle(c.title);
    setEditCategory(c.category);
    setEditAmount(c.amountInvolved !== undefined ? String(c.amountInvolved) : '');
    setEditDate(c.incidentDate);
    setEditTime(c.incidentTime ?? '');
    setEditPlatform(c.platform);
    setEditTxId(c.transactionId ?? '');
    setEditContact(c.suspiciousContact ?? '');
    setEditDesc(c.description);
    setEditBank(c.bankContacted);
    setEditFiled(c.complaintFiled);
    setEditStatus(c.status);
    setEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;
    if (!editTitle.trim() || !editPlatform.trim() || !editDesc.trim()) {
      onToast('error', 'Missing required fields', 'Title, platform, and description are required.');
      return;
    }
    const parsedAmt =
      editAmount.trim() !== '' && !Number.isNaN(Number(editAmount))
        ? Number(editAmount)
        : undefined;

    onUpdateCase(
      activeCase.id,
      {
        title: editTitle.trim(),
        category: editCategory,
        amountInvolved: parsedAmt,
        incidentDate: editDate,
        incidentTime: editTime.trim() || undefined,
        platform: editPlatform.trim(),
        transactionId: editTxId.trim() || undefined,
        suspiciousContact: editContact.trim() || undefined,
        description: editDesc.trim(),
        bankContacted: editBank,
        complaintFiled: editFiled,
        status: editStatus,
      },
      'Incident details edited'
    );
    setEditing(false);
    onToast('success', 'Case updated', `Changes saved to ${activeCase.id}.`);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase || !noteText.trim()) return;
    onAddNote(activeCase.id, noteText);
    setNoteText('');
    onToast('success', 'Note saved', `Added note to ${activeCase.id}.`);
  };

  const handleConfirmDelete = () => {
    if (!activeCase) return;
    const deletedId = activeCase.id;
    onDeleteCase(deletedId);
    setConfirmDeleteOpen(false);
    onSelectCase(null);
    onToast('info', 'Case deleted', `${deletedId} was permanently removed.`);
  };

  // CASE DETAIL VIEW
  if (activeCase) {
    const progress = calculateRecoveryProgress(activeCase.stages);
    const stageStateMap = new Map(activeCase.stages.map((s) => [s.id, s]));
    const caseEvidence = evidence.filter((ev) => ev.caseId === activeCase.id);
    const catMeta = FRAUD_CATEGORIES.find((f) => f.id === activeCase.category);
    const matchedScenario =
      EMERGENCY_SCENARIOS.find((s) => s.id === catMeta?.recommendedScenarioId) ??
      EMERGENCY_SCENARIOS[0];

    return (
      <div className="space-y-6">
        {/* Top Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              onSelectCase(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)] whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Back to My Cases</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {!editing && (
              <button
                type="button"
                onClick={() => startEditing(activeCase)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)] whitespace-nowrap"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Edit Details</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenComplaintForCase(activeCase.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-[var(--bg-elevated)] whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Complaint Draft</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenTrackerForCase(activeCase.id)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
            >
              <GitCommitHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Recovery Tracker</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteOpen(true)}
              aria-label={`Delete case ${activeCase.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/15 whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Case Overview Header */}
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="font-mono font-semibold text-[var(--text-main)]">
                  {activeCase.id}
                </span>
                <span aria-hidden="true">·</span>
                <span>{FRAUD_CATEGORY_LABELS[activeCase.category]}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  Incident {formatDisplayDate(activeCase.incidentDate)}
                </span>
                {activeCase.isDemo && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400">DEMO DATA</span>
                  </>
                )}
              </div>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                {activeCase.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <StatusIndicator status={activeCase.status} />
              {activeCase.amountInvolved !== undefined && (
                <div className="text-right">
                  <span className="block text-[11px] text-[var(--text-muted)]">Amount Involved</span>
                  <span className="font-mono text-base font-bold text-[var(--text-main)] tabular-nums">
                    {formatCurrency(activeCase.amountInvolved, activeCase.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress.percentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="font-mono text-xs font-semibold text-[var(--text-main)] tabular-nums">
                {progress.percentage}%
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Current Stage:{' '}
              <strong className="text-[var(--text-main)]">{progress.currentStageLabel}</strong>
            </p>
          </div>
        </section>

        {/* Edit Form OR Detailed Breakdown */}
        {editing ? (
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <h3 className="text-base font-semibold text-[var(--text-main)]">
                Edit Incident Details
              </h3>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-main)]">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as FraudCategoryId)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                >
                  {FRAUD_CATEGORIES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as CaseStatus)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                >
                  <option value="Active">Active</option>
                  <option value="Pending Follow-up">Pending Follow-up</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">
                  Amount Involved (INR)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">Platform</label>
                <input
                  type="text"
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">Time</label>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">
                  Transaction / UTR ID
                </label>
                <input
                  type="text"
                  value={editTxId}
                  onChange={(e) => setEditTxId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">
                  Suspicious Contact / URL
                </label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">
                  Bank Contacted?
                </label>
                <select
                  value={editBank}
                  onChange={(e) => setEditBank(e.target.value as TriStateAnswer)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unsure">Unsure</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)]">
                  Complaint Filed?
                </label>
                <select
                  value={editFiled}
                  onChange={(e) => setEditFiled(e.target.value as 'Yes' | 'No')}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-main)]">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg border border-[var(--border-subtle)] px-4 py-2 text-xs font-medium text-[var(--text-main)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Left Column: Incident Details, Emergency Actions, Case Notes */}
            <div className="space-y-6 xl:col-span-7">
              {/* Incident Details */}
              <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                <h3 className="text-sm font-semibold text-[var(--text-main)]">Incident Details</h3>
                <dl className="mt-4 grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--text-muted)]">Platform / Service</dt>
                    <dd className="mt-1 font-medium text-[var(--text-main)]">
                      {activeCase.platform}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Date & Time</dt>
                    <dd className="mt-1 font-mono text-[var(--text-main)] tabular-nums">
                      {formatDisplayDate(activeCase.incidentDate)}
                      {activeCase.incidentTime ? ` · ${activeCase.incidentTime}` : ''}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Transaction / UTR ID</dt>
                    <dd className="mt-1 font-mono text-[var(--text-main)] break-all">
                      {activeCase.transactionId || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Suspicious Contact / URL</dt>
                    <dd className="mt-1 font-mono text-[var(--text-main)] break-all">
                      {activeCase.suspiciousContact || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Bank Contacted</dt>
                    <dd className="mt-1 font-medium text-[var(--text-main)]">
                      {activeCase.bankContacted}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--text-muted)]">Complaint Reference</dt>
                    <dd className="mt-1 font-mono text-[var(--text-main)]">
                      {activeCase.complaintReferenceNumber ||
                        (activeCase.complaintFiled === 'Yes' ? 'Filed (no ref saved)' : 'Not filed yet')}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[var(--text-muted)]">Description of Events</dt>
                    <dd className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-main)]">
                      {activeCase.description}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Emergency Actions for This Case */}
              <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-main)]">
                      Recommended Emergency Actions
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">{matchedScenario.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('emergency')}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                  >
                    Full Playbook
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {matchedScenario.immediateActions.map((step) => {
                    const checked = activeCase.emergencyActionsCompleted.includes(step.id);
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => onToggleEmergencyAction(activeCase.id, step.id)}
                        aria-pressed={checked}
                        className="flex w-full items-start gap-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3 text-left transition-colors hover:border-[var(--border-strong)]"
                      >
                        {checked ? (
                          <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Square className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            checked
                              ? 'line-through text-[var(--text-muted)]'
                              : 'text-[var(--text-main)]'
                          }`}
                        >
                          {step.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Case Notes */}
              <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                <h3 className="text-sm font-semibold text-[var(--text-main)]">Case Notes</h3>
                <form onSubmit={handleAddNoteSubmit} className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a call log, branch officer name, or follow-up note..."
                    aria-label="Add case note"
                    className="flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-xs text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Note</span>
                  </button>
                </form>

                <div className="mt-4 space-y-2.5">
                  {activeCase.notes.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)]">No notes added yet.</p>
                  ) : (
                    activeCase.notes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3"
                      >
                        <p className="text-xs leading-relaxed text-[var(--text-main)]">
                          {n.content}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Recovery Timeline & Associated Evidence */}
            <div className="space-y-6 xl:col-span-5">
              {/* Recovery Timeline Quick Toggle */}
              <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Recovery Timeline
                  </h3>
                  <button
                    type="button"
                    onClick={() => onOpenTrackerForCase(activeCase.id)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                  >
                    Manage Milestones
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {RECOVERY_STAGE_ORDER.map((stage) => {
                    const done = Boolean(stageStateMap.get(stage.id)?.completed);
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => onToggleStage(activeCase.id, stage.id)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2.5 text-left text-xs transition-colors hover:border-[var(--border-strong)]"
                      >
                        <span className="flex items-center gap-2.5 font-medium text-[var(--text-main)]">
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                          )}
                          <span>{stage.label}</span>
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {done ? 'Done' : 'Pending'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Associated Evidence */}
              <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Associated Evidence ({caseEvidence.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => onNavigate('evidence')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                  >
                    <FolderLock className="h-3.5 w-3.5" />
                    <span>Open Vault</span>
                  </button>
                </div>

                {caseEvidence.length === 0 ? (
                  <p className="mt-3 text-xs text-[var(--text-muted)]">
                    No evidence linked to this case yet. Add screenshots or transaction records in
                    the Evidence Vault.
                  </p>
                ) : (
                  <ul className="mt-3 divide-y divide-[var(--border-subtle)]">
                    {caseEvidence.map((ev) => (
                      <li key={ev.id} className="py-2.5 first:pt-1 last:pb-0">
                        <p className="text-xs font-semibold text-[var(--text-main)]">{ev.name}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                          {ev.category} · {formatDisplayDate(ev.dateAdded)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        <ConfirmDialog
          open={confirmDeleteOpen}
          title="Delete Fraud Case"
          description={`Delete ${activeCase.id} ("${activeCase.title}")? Linked evidence items will remain in your Evidence Vault as unassigned.`}
          confirmLabel="Delete Case"
          destructive
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteOpen(false)}
        />
      </div>
    );
  }

  // CASE LIST VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">My Cases</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage all reported fraud incidents, update progress, and inspect full case files.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('report')}
          className="inline-flex items-center gap-2 self-start sm:self-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0"
        >
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          <span>Report New Incident</span>
        </button>
      </div>

      {/* Filters, Search & View Mode */}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[var(--bg-main)] p-1">
          {(['All', 'Active', 'Pending Follow-up', 'Resolved'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, case ID, or category..."
              aria-label="Search cases"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] py-2 pl-9 pr-3 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div
            className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-0.5 shrink-0"
            role="group"
            aria-label="Case layout view"
          >
            <button
              type="button"
              onClick={() => setViewMode('card')}
              aria-label="Card view"
              aria-pressed={viewMode === 'card'}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'card'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              aria-pressed={viewMode === 'table'}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cases Content */}
      {filteredCases.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[var(--text-main)]">
            {cases.length === 0 ? 'No cases recorded yet' : 'No cases match your filters'}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {cases.length === 0
              ? 'Start by reporting a cyber fraud incident to create your first structured case.'
              : 'Clear your search or choose a different status tab.'}
          </p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredCases.map((item) => {
            const prog = calculateRecoveryProgress(item.stages);
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 transition-colors hover:border-blue-500/40"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[var(--text-main)]">
                        {item.id}
                      </span>
                      {item.isDemo && (
                        <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                          DEMO
                        </span>
                      )}
                    </div>
                    <StatusIndicator status={item.status} />
                  </div>

                  <h3 className="mt-2.5 text-base font-semibold text-[var(--text-main)]">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {FRAUD_CATEGORY_LABELS[item.category]} · {formatDisplayDate(item.incidentDate)}
                    {item.amountInvolved !== undefined
                      ? ` · ${formatCurrency(item.amountInvolved, item.currency)}`
                      : ''}
                  </p>

                  <div className="mt-4 flex items-center gap-2.5">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                      <div
                        className={`h-full rounded-full ${
                          prog.percentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                      {prog.percentage}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                  <span className="text-xs text-[var(--text-muted)] truncate">
                    {prog.currentStageLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectCase(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
                  >
                    <span>Open Case</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                <th className="px-4 py-3 font-semibold">Case ID</th>
                <th className="px-4 py-3 font-semibold">Incident</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Progress</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredCases.map((item) => {
                const prog = calculateRecoveryProgress(item.stages);
                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-[var(--bg-elevated)]/40"
                  >
                    <td className="px-4 py-3.5 font-mono font-medium text-[var(--text-main)] whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="max-w-[260px] truncate px-4 py-3.5 font-semibold text-[var(--text-main)]">
                      {item.title}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--text-muted)] whitespace-nowrap">
                      {FRAUD_CATEGORY_LABELS[item.category]}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--text-muted)] whitespace-nowrap tabular-nums">
                      {formatDisplayDate(item.incidentDate)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-medium text-[var(--text-main)] whitespace-nowrap tabular-nums">
                      {formatCurrency(item.amountInvolved, item.currency)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusIndicator status={item.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-[var(--text-main)] whitespace-nowrap tabular-nums">
                      {prog.percentage}%
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectCase(item.id)}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
