import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  GitCommitHorizontal,
  Lightbulb,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import type { ActivityEvent, CaseIncident, EvidenceItem, NavSection } from '../../types';
import { CYBER_SAFETY_TIPS } from '../../data/staticContent';
import {
  FRAUD_CATEGORY_LABELS,
  calculateRecoveryProgress,
  computeDashboardStats,
  formatCurrency,
  formatDisplayDate,
  formatRelativeTime,
} from '../../utils/caseLogic';
import { StatusIndicator } from '../ui/StatusIndicator';
import { VisualHeaderCard } from '../ui/VisualHeaderCard';

const HERO_IMAGE = '/src/assets/images/hero_cyber_recovery_1795363279848.jpg';

interface OverviewViewProps {
  cases: CaseIncident[];
  evidence: EvidenceItem[];
  activities: ActivityEvent[];
  demoModeActive: boolean;
  onRemoveDemoData: () => void;
  onNavigate: (section: NavSection) => void;
  onOpenCase: (caseId: string) => void;
}

export function OverviewView({
  cases,
  evidence,
  activities,
  demoModeActive,
  onRemoveDemoData,
  onNavigate,
  onOpenCase,
}: OverviewViewProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const stats = useMemo(() => computeDashboardStats(cases, evidence), [cases, evidence]);

  const recentCases = useMemo(
    () =>
      [...cases]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3),
    [cases]
  );

  const currentTip = CYBER_SAFETY_TIPS[tipIndex % CYBER_SAFETY_TIPS.length];

  return (
    <div className="space-y-6">
      {/* Quiet Demo Mode Notice */}
      {demoModeActive && (
        <div className="flex flex-col gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-[var(--text-muted)]">
            <span className="mr-2 font-mono font-semibold text-amber-600 dark:text-amber-400">
              DEMO DATA
            </span>
            Sample cases are loaded so you can explore how RECOVERX works. You can remove them
            anytime.
          </p>
          <button
            type="button"
            onClick={onRemoveDemoData}
            className="self-start sm:self-center rounded-lg border border-amber-500/30 bg-[var(--bg-card)] px-3 py-1.5 text-xs font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-elevated)] whitespace-nowrap shrink-0"
          >
            Remove Demo Data
          </button>
        </div>
      )}

      {/* Visual Hero Header */}
      <VisualHeaderCard
        eyebrow="Step-by-step cyber fraud help"
        title="Your recovery starts here."
        description="Experienced a scam or account hack? Stay calm. RECOVERX helps you protect your accounts, organize proof, prepare an official complaint, and follow your recovery step by step."
        imageSrc={HERO_IMAGE}
        imageAlt="Translucent blue security shield resting beside a dark smartphone and glass security cards"
        actions={
          <>
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
            >
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
              <span>Report Fraud</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('emergency')}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/35 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/15 whitespace-nowrap"
            >
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <span>Get Urgent Help</span>
            </button>
          </>
        }
      />

      {/* 3 Clear Main Actions with Plain-English Explanations */}
      <section aria-label="Main actions">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-main)]">What do you need to do?</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Choose one of the three main steps below to get started right away.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="group flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-left transition-colors hover:border-blue-500/50 hover:bg-[var(--bg-elevated)]/40"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/12 text-blue-600 dark:text-blue-400">
                <FilePlus2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="mt-3.5 text-base font-semibold text-[var(--text-main)]">
                Report Fraud
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                Answer a few simple questions about what happened to create your private case file
                and checklist.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Start 3-step report</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('emergency')}
            className="group flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-left transition-colors hover:border-red-500/45 hover:bg-[var(--bg-elevated)]/40"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/12 text-red-600 dark:text-red-400">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="mt-3.5 text-base font-semibold text-[var(--text-main)]">
                Get Urgent Help
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                Just lost money or got hacked? Follow urgent step-by-step instructions to stop
                further loss right now.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
              <span>Open urgent steps</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('tracker')}
            className="group flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-left transition-colors hover:border-sky-500/50 hover:bg-[var(--bg-elevated)]/40"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/12 text-sky-600 dark:text-sky-400">
                <GitCommitHorizontal className="h-5 w-5" aria-hidden="true" />
              </div>
              <h4 className="mt-3.5 text-base font-semibold text-[var(--text-main)]">
                Track My Case
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                Check your recovery progress, save your official complaint number, and set follow-up
                reminders.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
              <span>View my progress</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>
      </section>

      {/* Calm, Clear Urgent Helpline Banner */}
      <section
        aria-label="Urgent financial fraud helpline"
        className="flex flex-col gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-[var(--text-main)]">
              Lost money just now? Call your bank immediately and report through official channels.
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Cyber Fraud Helpline:{' '}
              <a
                href="tel:1930"
                className="font-mono font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                1930
              </a>{' '}
              · Police / Emergency:{' '}
              <a
                href="tel:112"
                className="font-mono font-semibold text-[var(--text-main)] hover:underline"
              >
                112
              </a>{' '}
              · Official Portal:{' '}
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono font-medium text-blue-600 dark:text-sky-400 hover:underline"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('emergency')}
          className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-red-500/30 bg-[var(--bg-card)] px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/10 whitespace-nowrap shrink-0"
        >
          <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
          <span>See Urgent Steps</span>
        </button>
      </section>

      {/* Clean, Uncluttered Summary Bar */}
      <section
        aria-label="Your recovery summary"
        className="grid grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] lg:grid-cols-4"
      >
        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Total Cases</p>
          <p
            data-testid="kpi-total-incidents"
            className="mt-1.5 font-mono text-2xl font-semibold text-[var(--text-main)] tabular-nums"
          >
            {stats.totalIncidents}
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">In Progress</p>
          <p
            data-testid="kpi-active-cases"
            className="mt-1.5 font-mono text-2xl font-semibold text-blue-600 dark:text-blue-400 tabular-nums"
          >
            {stats.activeCases}
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Saved Evidence</p>
          <p
            data-testid="kpi-evidence-items"
            className="mt-1.5 font-mono text-2xl font-semibold text-sky-600 dark:text-sky-400 tabular-nums"
          >
            {stats.evidenceItemsSaved}
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-medium text-[var(--text-muted)]">Resolved</p>
          <p
            data-testid="kpi-resolved-incidents"
            className="mt-1.5 font-mono text-2xl font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums"
          >
            {stats.resolvedIncidents}
          </p>
        </div>
      </section>

      {/* Bottom 2-Column Content: Recent Cases + Helpful Side Panel */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Recent Cases */}
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] xl:col-span-8">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-main)]">Your Recent Cases</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Open any case to view details, upload proof, or update your recovery progress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('cases')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
            >
              <span>See all cases</span>
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {recentCases.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[var(--text-main)]">
                You haven&apos;t added a case yet
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Click &ldquo;Report Fraud&rdquo; above to log an incident and get a personalized
                recovery checklist.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('report')}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                <span>Report Fraud</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {recentCases.map((item) => {
                const prog = calculateRecoveryProgress(item.stages);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3.5 px-5 py-4 transition-colors hover:bg-[var(--bg-elevated)]/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)]">
                        <span className="font-mono font-medium text-[var(--text-main)]">
                          {item.id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{FRAUD_CATEGORY_LABELS[item.category]}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{formatDisplayDate(item.incidentDate)}</span>
                        {item.isDemo && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                              DEMO
                            </span>
                          </>
                        )}
                      </div>

                      <p className="mt-1 truncate text-sm font-semibold text-[var(--text-main)]">
                        {item.title}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-4">
                        <StatusIndicator status={item.status} />
                        <div className="flex items-center gap-2 min-w-[130px] flex-1 max-w-[200px]">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                prog.percentage === 100
                                  ? 'bg-emerald-500'
                                  : 'bg-blue-600 dark:bg-blue-500'
                              }`}
                              style={{ width: `${prog.percentage}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                            {prog.percentage}%
                          </span>
                        </div>
                        {item.amountInvolved !== undefined && (
                          <span className="font-mono text-xs font-medium text-[var(--text-main)] tabular-nums">
                            {formatCurrency(item.amountInvolved, item.currency)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenCase(item.id)}
                      className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:border-blue-500/40 hover:bg-[var(--bg-elevated)] whitespace-nowrap shrink-0"
                    >
                      <span>Open Case</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Side Column: Safety Tip & Recent Updates */}
        <div className="space-y-6 xl:col-span-4">
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[var(--text-main)]">Quick Safety Tip</h3>
              </div>
              <button
                type="button"
                onClick={() => setTipIndex((i) => (i + 1) % CYBER_SAFETY_TIPS.length)}
                aria-label="Show next safety tip"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)] whitespace-nowrap"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                <span>Next tip</span>
              </button>
            </div>

            <div className="mt-3">
              <p className="text-sm font-semibold text-[var(--text-main)]">{currentTip.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                {currentTip.body}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('safety')}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Read Safety Guide</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </section>

          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="border-b border-[var(--border-subtle)] px-5 py-4">
              <h3 className="text-sm font-semibold text-[var(--text-main)]">Recent Updates</h3>
              <p className="text-xs text-[var(--text-muted)]">Latest changes you made here</p>
            </div>

            {activities.length === 0 ? (
              <div className="px-5 py-8 text-center text-xs text-[var(--text-muted)]">
                No updates yet. Your reports, evidence uploads, and milestones will appear here.
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {activities.slice(0, 4).map((act) => (
                  <li key={act.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-[var(--text-main)]">{act.title}</p>
                      <span className="shrink-0 font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                        {formatRelativeTime(act.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                      {act.detail}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
