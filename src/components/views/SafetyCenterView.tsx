import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckSquare,
  CreditCard,
  Lock,
  Search,
  ShieldCheck,
  Smartphone,
  Square,
  Users,
} from 'lucide-react';
import {
  CYBER_SAFETY_ARTICLES,
  PERSONAL_SAFETY_CHECKLIST,
  SAFETY_DOMAINS,
} from '../../data/staticContent';
import { OfficialResourcesPanel } from '../ui/OfficialResourcesPanel';
import { VisualHeaderCard } from '../ui/VisualHeaderCard';

const SAFETY_IMAGE = '/src/assets/images/visual_online_safety_1795363291646.jpg';

interface SafetyCenterViewProps {
  completedChecklist: string[];
  onToggleChecklistItem: (id: string) => void;
  selectedArticleId: string | null;
  onSelectArticle: (id: string | null) => void;
}

const DOMAIN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  account_security: Lock,
  banking_payments: CreditCard,
  device_security: Smartphone,
  social_media_security: Users,
};

export function SafetyCenterView({
  completedChecklist,
  onToggleChecklistItem,
  selectedArticleId,
  onSelectArticle,
}: SafetyCenterViewProps) {
  const [articleSearch, setArticleSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');

  const topics = useMemo(() => {
    const set = new Set(CYBER_SAFETY_ARTICLES.map((a) => a.topic));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredArticles = useMemo(() => {
    const q = articleSearch.trim().toLowerCase();
    return CYBER_SAFETY_ARTICLES.filter((a) => {
      if (topicFilter !== 'All' && a.topic !== topicFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.topic.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.whatItIs.toLowerCase().includes(q)
      );
    });
  }, [articleSearch, topicFilter]);

  const activeArticle =
    CYBER_SAFETY_ARTICLES.find((a) => a.id === selectedArticleId) ?? null;

  const totalChecklist = PERSONAL_SAFETY_CHECKLIST.length;
  const completedCount = PERSONAL_SAFETY_CHECKLIST.filter((i) =>
    completedChecklist.includes(i.id)
  ).length;
  const checklistPct = Math.round((completedCount / totalChecklist) * 100);

  if (activeArticle) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => onSelectArticle(null)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to Safety Center</span>
        </button>

        <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 space-y-6">
          <header className="border-b border-[var(--border-subtle)] pb-5">
            <p className="text-xs font-medium text-blue-600 dark:text-sky-400">
              {activeArticle.topic} · {activeArticle.readTime}
            </p>
            <h2 className="mt-1.5 text-2xl font-bold text-[var(--text-main)]">
              {activeArticle.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {activeArticle.summary}
            </p>
          </header>

          <section>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">What It Is</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {activeArticle.whatItIs}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">Warning Signs</h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--text-muted)] list-disc pl-5">
              {activeArticle.warningSigns.map((sign, i) => (
                <li key={i}>{sign}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              How to Protect Yourself
            </h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--text-muted)] list-disc pl-5">
              {activeArticle.howToProtect.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-blue-500/25 bg-blue-600/[0.05] p-5">
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              What to Do If Affected
            </h3>
            <ol className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--text-muted)] list-decimal pl-5">
              {activeArticle.whatToDoIfAffected.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </section>
        </article>

        <OfficialResourcesPanel compact />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <VisualHeaderCard
        eyebrow="Protect your accounts & devices"
        accent="emerald"
        title="Safety Guide"
        description="Simple steps to lock down your bank, email, phone, and social media accounts — plus plain-English guides to spot and recover from common online scams."
        imageSrc={SAFETY_IMAGE}
        imageAlt="Smartphone and laptop protected beneath a translucent sapphire-blue glass shield dome"
      />

      {/* Sections A–D: 4 Security Domains */}
      <section aria-label="Core Security Domains">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-[var(--text-main)]">
            4 Key Areas to Secure
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Quick, practical rules to protect your money, passwords, phone, and social accounts.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SAFETY_DOMAINS.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.id] ?? ShieldCheck;
            return (
              <div
                key={domain.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-main)]">
                      {domain.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">{domain.subtitle}</p>
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-xs leading-relaxed text-[var(--text-muted)] list-disc pl-4">
                  {domain.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section E: Interactive Personal Safety Checklist */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              Personal Safety Checklist
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Complete these protective measures to reduce future exposure after an incident.
            </p>
          </div>
          <div className="min-w-[200px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Completion Progress</span>
              <span
                data-testid="safety-checklist-progress"
                className="font-mono font-semibold text-[var(--text-main)] tabular-nums"
              >
                {completedCount}/{totalChecklist} ({checklistPct}%)
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${checklistPct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {PERSONAL_SAFETY_CHECKLIST.map((item) => {
            const checked = completedChecklist.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onToggleChecklistItem(item.id)}
                aria-pressed={checked}
                className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                  checked
                    ? 'border-emerald-500/35 bg-emerald-500/[0.05]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-[var(--border-strong)]'
                }`}
              >
                {checked ? (
                  <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Square className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[var(--text-muted)]">{item.domain}</p>
                  <p
                    className={`mt-0.5 text-xs font-semibold ${
                      checked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section F: Searchable Cyber Safety Library */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              Cyber Safety Library
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Practical field guides covering 10 common fraud patterns, warning signs, and recovery
              steps.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              placeholder="Search articles (e.g., UPI, Digital Arrest)..."
              aria-label="Search Cyber Safety Library"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] py-2 pl-9 pr-3 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Topic Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setTopicFilter(topic)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                topicFilter === topic
                  ? 'border-blue-500 bg-blue-600/12 text-blue-600 dark:text-blue-400'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] py-10 text-center text-xs text-[var(--text-muted)]">
            No articles matched &ldquo;{articleSearch}&rdquo;. Try another keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                type="button"
                onClick={() => onSelectArticle(article.id)}
                className="group flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 text-left transition-colors hover:border-blue-500/45 hover:bg-[var(--bg-elevated)]/40"
              >
                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="font-medium text-blue-600 dark:text-sky-400">
                      {article.topic}
                    </span>{' '}
                    · {article.readTime}
                  </p>
                  <h4 className="mt-2 text-sm font-semibold text-[var(--text-main)] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {article.title}
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                    {article.summary}
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Read guide</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
