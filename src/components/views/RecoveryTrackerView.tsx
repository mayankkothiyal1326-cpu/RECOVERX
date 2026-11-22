import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Compass,
  FilePlus2,
  Info,
  Plus,
  Save,
} from 'lucide-react';
import type { CaseIncident, CaseStatus, NavSection, RecoveryStageId } from '../../types';
import {
  FRAUD_CATEGORY_LABELS,
  RECOVERY_STAGE_ORDER,
  calculateRecoveryProgress,
  formatDisplayDate,
  getNextRecommendedAction,
} from '../../utils/caseLogic';
import { StatusIndicator } from '../ui/StatusIndicator';

interface RecoveryTrackerViewProps {
  cases: CaseIncident[];
  initialCaseId: string | null;
  onToggleStage: (caseId: string, stageId: RecoveryStageId) => void;
  onUpdateCase: (
    caseId: string,
    updates: Partial<Pick<CaseIncident, 'status' | 'complaintReferenceNumber' | 'followUpDate'>>,
    activityTitle?: string
  ) => void;
  onAddMilestone: (caseId: string, title: string, note: string, date: string) => void;
  onNavigate: (section: NavSection) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export function RecoveryTrackerView({
  cases,
  initialCaseId,
  onToggleStage,
  onUpdateCase,
  onAddMilestone,
  onNavigate,
  onToast,
}: RecoveryTrackerViewProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId ?? cases[0]?.id ?? ''
  );

  useEffect(() => {
    if (initialCaseId && cases.some((c) => c.id === initialCaseId)) {
      setSelectedCaseId(initialCaseId);
    } else if (!cases.some((c) => c.id === selectedCaseId) && cases.length > 0) {
      setSelectedCaseId(cases[0].id);
    }
  }, [initialCaseId, cases, selectedCaseId]);

  const activeCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) ?? null,
    [cases, selectedCaseId]
  );

  const [refNumber, setRefNumber] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [msTitle, setMsTitle] = useState('');
  const [msNote, setMsNote] = useState('');
  const [msDate, setMsDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (activeCase) {
      setRefNumber(activeCase.complaintReferenceNumber ?? '');
      setFollowUpDate(activeCase.followUpDate ?? '');
    }
  }, [activeCase]);

  if (cases.length === 0 || !activeCase) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-16 text-center">
        <p className="text-base font-semibold text-[var(--text-main)]">
          No active incidents to track yet
        </p>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Report a cyber fraud incident first to unlock the 6-stage recovery timeline and milestone
          tracker.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('report')}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
        >
          <FilePlus2 className="h-4 w-4" />
          <span>Report an Incident</span>
        </button>
      </div>
    );
  }

  const progress = calculateRecoveryProgress(activeCase.stages);
  const nextAction = getNextRecommendedAction(activeCase);
  const stageStateMap = new Map(activeCase.stages.map((s) => [s.id, s]));

  const handleSaveTrackingMeta = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCase(
      activeCase.id,
      {
        complaintReferenceNumber: refNumber.trim() || undefined,
        followUpDate: followUpDate || undefined,
      },
      'Recovery tracking details saved'
    );
    onToast('success', 'Tracking details updated', `Saved reference and follow-up date for ${activeCase.id}.`);
  };

  const handleStatusChange = (status: CaseStatus) => {
    onUpdateCase(activeCase.id, { status }, `Case status updated to ${status}`);
    onToast('info', 'Case status updated', `${activeCase.id} is now marked ${status}.`);
  };

  const handleAddMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msTitle.trim()) {
      onToast('warning', 'Enter a milestone title', 'Describe the follow-up update or outcome.');
      return;
    }
    onAddMilestone(activeCase.id, msTitle, msNote, msDate);
    setMsTitle('');
    setMsNote('');
    onToast('success', 'Milestone added', 'Recorded on your recovery timeline.');
  };

  return (
    <div className="space-y-6">
      {/* Header & Case Picker */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-main)]">Track My Case</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Check off steps as you complete them, save your official complaint number, and log bank
            or police updates.
          </p>
        </div>

        <div className="w-full sm:w-80">
          <label htmlFor="tracker-case-select" className="sr-only">
            Select case to track
          </label>
          <select
            id="tracker-case-select"
            value={activeCase.id}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm font-medium text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Self-Reported Tracking Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-xs text-[var(--text-muted)]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" aria-hidden="true" />
        <p className="leading-relaxed">
          Your progress here is updated by you so everything stays organized in one place. RECOVERX
          does not connect to live bank, police, or government tracking systems.
        </p>
      </div>

      {/* Case Progress Summary Card */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="font-mono font-semibold text-[var(--text-main)]">{activeCase.id}</span>
              <span aria-hidden="true">·</span>
              <span>{FRAUD_CATEGORY_LABELS[activeCase.category]}</span>
              <span aria-hidden="true">·</span>
              <StatusIndicator status={activeCase.status} />
            </div>
            <h3 className="mt-1.5 text-lg font-bold text-[var(--text-main)]">{activeCase.title}</h3>
            <div className="mt-3 flex items-center gap-3 max-w-md">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress.percentage === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span
                data-testid="tracker-completion-pct"
                className="font-mono text-sm font-semibold text-[var(--text-main)] tabular-nums"
              >
                {progress.percentage}%
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[var(--text-muted)]">
              Current Stage:{' '}
              <span className="font-semibold text-[var(--text-main)]">
                {progress.currentStageLabel}
              </span>{' '}
              ({progress.completedCount} of {progress.totalCount} stages completed)
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label
              htmlFor="tracker-status-select"
              className="text-xs font-medium text-[var(--text-muted)] whitespace-nowrap"
            >
              Case Status:
            </label>
            <select
              id="tracker-status-select"
              value={activeCase.status}
              onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
              className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-xs font-semibold text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
            >
              <option value="Active">Active</option>
              <option value="Pending Follow-up">Pending Follow-up</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Next Recommended Action */}
        <div className="mt-5 flex items-start gap-2.5 border-t border-[var(--border-subtle)] pt-4">
          <Compass className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <div className="text-xs">
            <span className="font-semibold text-[var(--text-main)]">Next Recommended Action: </span>
            <span className="text-[var(--text-muted)]">{nextAction}</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* 6-Stage Interactive Timeline */}
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 xl:col-span-7">
          <h3 className="text-base font-semibold text-[var(--text-main)]">Recovery Stages</h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Click any stage to mark it complete or reopen it as your recovery progresses.
          </p>

          <ol className="mt-5 space-y-3">
            {RECOVERY_STAGE_ORDER.map((stage, idx) => {
              const st = stageStateMap.get(stage.id);
              const done = Boolean(st?.completed);
              return (
                <li key={stage.id}>
                  <button
                    type="button"
                    onClick={() => onToggleStage(activeCase.id, stage.id)}
                    aria-pressed={done}
                    className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-colors ${
                      done
                        ? 'border-emerald-500/35 bg-emerald-500/[0.06]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                      ) : (
                        <Circle className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--text-main)]">
                          {idx + 1}. {stage.label}
                        </p>
                        {st?.completedAt && (
                          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 tabular-nums">
                            Done {formatDisplayDate(st.completedAt)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                        {stage.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Right Column: Reference # & Follow-up Date + Milestones */}
        <div className="space-y-6 xl:col-span-5">
          {/* Official Reference & Follow-up Date */}
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Official Reference & Follow-up Schedule
            </h3>
            <form onSubmit={handleSaveTrackingMeta} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="complaint-ref-num"
                  className="block text-xs font-semibold text-[var(--text-main)]"
                >
                  Complaint Acknowledgement / Reference Number
                </label>
                <input
                  id="complaint-ref-num"
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="e.g., 31801260012345"
                  className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="followup-date"
                  className="block text-xs font-semibold text-[var(--text-main)]"
                >
                  Next Follow-up Reminder Date
                </label>
                <input
                  id="followup-date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none tabular-nums"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Save Tracking Details</span>
              </button>
            </form>
          </section>

          {/* Add Milestone & History */}
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Case Updates & Milestones
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Keep a dated record of bank calls, branch visits, or portal updates.
            </p>
            <form onSubmit={handleAddMilestoneSubmit} className="mt-3.5 space-y-3 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <label htmlFor="ms-title" className="block text-xs font-medium text-[var(--text-main)]">
                  Update Title
                </label>
                <input
                  id="ms-title"
                  type="text"
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  placeholder="e.g., Called bank fraud desk"
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-xs text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="ms-date" className="block text-xs font-medium text-[var(--text-main)]">
                  Date
                </label>
                <input
                  id="ms-date"
                  type="date"
                  value={msDate}
                  onChange={(e) => setMsDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:border-blue-500 focus:outline-none tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="ms-note" className="block text-xs font-medium text-[var(--text-main)]">
                  Notes (optional)
                </label>
                <textarea
                  id="ms-note"
                  rows={2}
                  value={msNote}
                  onChange={(e) => setMsNote(e.target.value)}
                  placeholder="Ticket number, officer name, or next steps..."
                  className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-xs text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2 text-xs font-semibold text-[var(--text-main)] hover:border-blue-500/40"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Add Update</span>
              </button>
            </form>

            <div className="mt-4 space-y-3">
              {activeCase.milestones.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)]">
                  No milestones recorded yet. Log calls with your bank or updates from cybercrime
                  authorities above.
                </p>
              ) : (
                activeCase.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--text-main)]">{m.title}</p>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--text-muted)] tabular-nums shrink-0">
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        {formatDisplayDate(m.date)}
                      </span>
                    </div>
                    {m.note && (
                      <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                        {m.note}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
