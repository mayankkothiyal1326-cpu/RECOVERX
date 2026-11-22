import React from 'react';
import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  Ban,
  CheckSquare,
  FileArchive,
  FolderLock,
  ShieldAlert,
  Square,
} from 'lucide-react';
import { EMERGENCY_SCENARIOS } from '../../data/staticContent';
import type { NavSection } from '../../types';
import { OfficialResourcesPanel } from '../ui/OfficialResourcesPanel';
import { UrgencyText } from '../ui/StatusIndicator';
import { VisualHeaderCard } from '../ui/VisualHeaderCard';

const URGENT_HELP_IMAGE = '/src/assets/images/banner_urgent_help_1795363273003.jpg';

interface EmergencyResponseViewProps {
  selectedScenarioId: string | null;
  onSelectScenario: (scenarioId: string | null) => void;
  completedMap: Record<string, string[]>;
  onToggleStep: (scenarioId: string, stepId: string, stepTitle: string) => void;
  onNavigate: (section: NavSection) => void;
}

export function EmergencyResponseView({
  selectedScenarioId,
  onSelectScenario,
  completedMap,
  onToggleStep,
  onNavigate,
}: EmergencyResponseViewProps) {
  const activeScenario = EMERGENCY_SCENARIOS.find((s) => s.id === selectedScenarioId) ?? null;

  if (activeScenario) {
    const completedIds = completedMap[activeScenario.id] ?? [];
    const total = activeScenario.immediateActions.length;
    const completedCount = activeScenario.immediateActions.filter((a) =>
      completedIds.includes(a.id)
    ).length;
    const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelectScenario(null)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-elevated)] whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>All Emergency Situations</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('evidence')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-[var(--bg-elevated)] whitespace-nowrap"
          >
            <FolderLock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Open Evidence Vault</span>
          </button>
        </div>

        {/* 1. Urgency Header */}
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-[var(--text-muted)]">Urgency Level:</span>
                <UrgencyText urgency={activeScenario.urgency} />
              </div>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                {activeScenario.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-muted)]">
                {activeScenario.urgencyNote}
              </p>
            </div>

            <div className="min-w-[180px] rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)]">Actions Completed</span>
                <span className="font-mono font-semibold text-[var(--text-main)] tabular-nums">
                  {completedCount}/{total}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>

          <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-xs text-[var(--text-muted)]">
            <strong className="text-[var(--text-main)]">Important distinction:</strong> The steps
            below are actionable guidance for you to perform directly with your bank, platform, or
            authorities. Checking off a step tracks your personal progress in RECOVERX—it does not
            contact external agencies automatically.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* 2. Immediate Actions Checklist */}
          <div className="space-y-6 xl:col-span-7">
            <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6">
              <h3 className="text-base font-semibold text-[var(--text-main)]">
                Immediate Actions You Should Take
              </h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Work through each numbered step and mark it complete as you finish.
              </p>

              <div className="mt-4 space-y-3">
                {activeScenario.immediateActions.map((action, idx) => {
                  const checked = completedIds.includes(action.id);
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => onToggleStep(activeScenario.id, action.id, action.title)}
                      aria-pressed={checked}
                      className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-colors ${
                        checked
                          ? 'border-emerald-500/35 bg-emerald-500/[0.06]'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <span className="mt-0.5 shrink-0">
                        {checked ? (
                          <CheckSquare className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                        ) : (
                          <Square className="h-5 w-5 text-[var(--text-muted)]" aria-hidden="true" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            checked
                              ? 'line-through text-[var(--text-muted)]'
                              : 'text-[var(--text-main)]'
                          }`}
                        >
                          {idx + 1}. {action.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                          {action.detail}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: What to Avoid + Evidence to Preserve + Official Help */}
          <div className="space-y-6 xl:col-span-5">
            {/* 3. What to Avoid */}
            <section className="rounded-xl border border-red-500/25 bg-[var(--bg-card)] p-5">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-red-500 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[var(--text-main)]">What to Avoid</h3>
              </div>
              <ul className="mt-3 space-y-2.5">
                {activeScenario.whatToAvoid.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs leading-relaxed text-[var(--text-muted)]"
                  >
                    <AlertOctagon
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 4. Evidence to Preserve */}
            <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileArchive className="h-4 w-4 text-sky-500 shrink-0" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-[var(--text-main)]">
                    Evidence to Preserve
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('evidence')}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  Save to Vault
                </button>
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[var(--text-muted)] list-disc pl-4">
                {activeScenario.evidenceToPreserve.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </section>

            {/* 5. Official Help */}
            <OfficialResourcesPanel />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Urgent Help Header */}
      <VisualHeaderCard
        eyebrow="Immediate step-by-step help"
        accent="red"
        title="Take action. Stay calm. Protect what matters."
        description="Pick what happened to you below. We will walk you through what to do first, what to avoid, what proof to save, and which official helpline to contact."
        imageSrc={URGENT_HELP_IMAGE}
        imageAlt="Protective security shield with alert ring representing immediate cyber fraud response"
      />

      <div>
        <h3 className="text-sm font-semibold text-[var(--text-main)]">
          What happened to you?
        </h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Tap any situation below to open its simple step-by-step checklist.
        </p>
      </div>

      {/* Emergency Assistance Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {EMERGENCY_SCENARIOS.map((scenario) => {
          const doneCount = (completedMap[scenario.id] ?? []).length;
          const totalCount = scenario.immediateActions.length;

          return (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario.id)}
              className="group flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-left transition-colors hover:border-blue-500/45 hover:bg-[var(--bg-elevated)]/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <UrgencyText urgency={scenario.urgency} />
                  <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                    {doneCount}/{totalCount} done
                  </span>
                </div>
                <h3 className="mt-2.5 text-base font-semibold text-[var(--text-main)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {scenario.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                  {scenario.summary}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>Open response checklist</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Verified Official Resources */}
      <OfficialResourcesPanel />
    </div>
  );
}
