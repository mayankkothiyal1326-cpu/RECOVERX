import React from 'react';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import type { CaseStatus } from '../../types';

interface StatusIndicatorProps {
  status: CaseStatus;
}

/**
 * Clean unboxed semantic status indicator pairing explicit icon + text label
 * (no color-only signaling, no pill badge clutter).
 */
export function StatusIndicator({ status }: StatusIndicatorProps) {
  if (status === 'Resolved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Resolved</span>
      </span>
    );
  }

  if (status === 'Pending Follow-up') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>Pending Follow-up</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
      <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>Active</span>
    </span>
  );
}

export function UrgencyText({ urgency }: { urgency: 'Urgent' | 'High Priority' | 'Precautionary' }) {
  const colorClass =
    urgency === 'Urgent'
      ? 'text-red-600 dark:text-red-400'
      : urgency === 'High Priority'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-sky-600 dark:text-sky-400';

  return <span className={`text-xs font-semibold whitespace-nowrap ${colorClass}`}>{urgency}</span>;
}
