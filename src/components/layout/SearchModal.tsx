import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Briefcase, FolderLock, Search, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import type { CaseIncident, EvidenceItem, NavSection } from '../../types';
import { CYBER_SAFETY_ARTICLES, EMERGENCY_SCENARIOS } from '../../data/staticContent';
import { FRAUD_CATEGORY_LABELS } from '../../utils/caseLogic';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  cases: CaseIncident[];
  evidence: EvidenceItem[];
  onOpenCase: (caseId: string) => void;
  onOpenEmergency: (scenarioId: string) => void;
  onOpenArticle: (articleId: string) => void;
  onNavigate: (section: NavSection) => void;
}

export function SearchModal({
  open,
  onClose,
  cases,
  evidence,
  onOpenCase,
  onOpenEmergency,
  onOpenArticle,
  onNavigate,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const q = query.trim().toLowerCase();

  const matchedCases = useMemo(
    () =>
      cases
        .filter(
          (c) =>
            !q ||
            c.id.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            (FRAUD_CATEGORY_LABELS[c.category] ?? '').toLowerCase().includes(q) ||
            c.platform.toLowerCase().includes(q)
        )
        .slice(0, 4),
    [cases, q]
  );

  const matchedEvidence = useMemo(
    () =>
      evidence
        .filter(
          (e) =>
            !q ||
            e.name.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            e.notes.toLowerCase().includes(q)
        )
        .slice(0, 3),
    [evidence, q]
  );

  const matchedScenarios = useMemo(
    () =>
      EMERGENCY_SCENARIOS.filter(
        (s) => !q || s.title.toLowerCase().includes(q) || s.summary.toLowerCase().includes(q)
      ).slice(0, 3),
    [q]
  );

  const matchedArticles = useMemo(
    () =>
      CYBER_SAFETY_ARTICLES.filter(
        (a) =>
          !q ||
          a.title.toLowerCase().includes(q) ||
          a.topic.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q)
      ).slice(0, 3),
    [q]
  );

  if (!open) return null;

  const hasResults =
    matchedCases.length > 0 ||
    matchedEvidence.length > 0 ||
    matchedScenarios.length > 0 ||
    matchedArticles.length > 0;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs p-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases, case IDs, evidence, emergency response, or safety guides..."
            aria-label="Search workspace"
            className="w-full bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {!hasResults ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-[var(--text-main)]">No matching records found</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Try searching by case ID (e.g., RX-2026), UPI, phishing, or digital arrest.
              </p>
            </div>
          ) : (
            <>
              {matchedCases.length > 0 && (
                <div>
                  <p className="px-2 pb-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    Cases
                  </p>
                  <div className="space-y-1">
                    {matchedCases.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onOpenCase(c.id);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-elevated)]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Briefcase className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-main)]">
                              {c.title}
                            </p>
                            <p className="truncate text-xs text-[var(--text-muted)]">
                              <span className="font-mono">{c.id}</span> · {FRAUD_CATEGORY_LABELS[c.category]}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
                          {c.status}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedScenarios.length > 0 && (
                <div>
                  <p className="px-2 pb-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    Emergency Playbooks
                  </p>
                  <div className="space-y-1">
                    {matchedScenarios.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          onOpenEmergency(s.id);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-elevated)]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-main)]">
                              {s.title}
                            </p>
                            <p className="truncate text-xs text-[var(--text-muted)]">{s.summary}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedEvidence.length > 0 && (
                <div>
                  <p className="px-2 pb-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    Evidence Vault
                  </p>
                  <div className="space-y-1">
                    {matchedEvidence.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => {
                          onNavigate('evidence');
                          onClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-elevated)]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <FolderLock className="h-4 w-4 shrink-0 text-sky-500" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-main)]">
                              {ev.name}
                            </p>
                            <p className="truncate text-xs text-[var(--text-muted)]">
                              {ev.category} {ev.caseId ? `· ${ev.caseId}` : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedArticles.length > 0 && (
                <div>
                  <p className="px-2 pb-1.5 text-xs font-semibold text-[var(--text-muted)]">
                    Safety Library
                  </p>
                  <div className="space-y-1">
                    {matchedArticles.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => {
                          onOpenArticle(art.id);
                          onClose();
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-elevated)]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-main)]">
                              {art.title}
                            </p>
                            <p className="truncate text-xs text-[var(--text-muted)]">
                              {art.topic} · {art.readTime}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
