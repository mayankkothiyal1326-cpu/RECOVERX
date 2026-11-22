import React from 'react';
import { ExternalLink, PhoneCall, ShieldAlert } from 'lucide-react';
import { OFFICIAL_RESOURCES } from '../../data/staticContent';

interface OfficialResourcesPanelProps {
  compact?: boolean;
}

export function OfficialResourcesPanel({ compact = false }: OfficialResourcesPanelProps) {
  return (
    <section
      aria-label="Official Cyber Fraud Reporting Resources"
      className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-main)]">
            Official Reporting & Emergency Channels
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
            If money has been lost to cyber financial fraud, contact your bank or payment provider
            immediately and report through these official government channels.
          </p>
        </div>
        <ShieldAlert className="h-4 w-4 shrink-0 text-red-500 mt-0.5" aria-hidden="true" />
      </div>

      <div className={`mt-4 divide-y divide-[var(--border-subtle)] ${compact ? '' : 'space-y-0'}`}>
        {OFFICIAL_RESOURCES.map((res) => (
          <div key={res.name} className="flex flex-col gap-1.5 py-3 first:pt-1 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-main)]">{res.name}</p>
              {!compact && (
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                  {res.description}
                </p>
              )}
            </div>
            {res.isExternal ? (
              <a
                href={res.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-mono font-medium text-blue-600 dark:text-sky-400 transition-colors hover:border-blue-500/50 whitespace-nowrap shrink-0"
              >
                <span>cybercrime.gov.in</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : (
              <a
                href={res.href}
                className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-mono font-semibold text-[var(--text-main)] transition-colors hover:border-blue-500/50 whitespace-nowrap shrink-0 tabular-nums"
              >
                <PhoneCall className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
                <span>Dial {res.contact}</span>
              </a>
            )}
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-xs leading-relaxed text-[var(--text-muted)]">
        RECOVERX provides structured guidance and local documentation tools. It does not directly
        contact banks, freeze accounts, retrieve funds, notify police, or file complaints on your
        behalf.
      </p>
    </section>
  );
}
