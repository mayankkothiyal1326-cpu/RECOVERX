import React, { useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import type { AppNotification } from '../../types';
import { formatRelativeTime } from '../../utils/caseLogic';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onOpenCase: (caseId: string) => void;
}

export function NotificationPanel({
  open,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onOpenCase,
}: NotificationPanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="no-print fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Notification center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-main)]">Notifications</h2>
            <p className="text-xs text-[var(--text-muted)]">
              Local case updates, reminders, and checklist prompts
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications"
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-2.5 text-xs">
            <span className="text-[var(--text-muted)] tabular-nums">
              {unreadCount} unread of {notifications.length}
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1 font-medium text-[var(--text-muted)] hover:text-red-500 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear all</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                <Bell className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm font-medium text-[var(--text-main)]">
                No notifications right now
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                Updates appear here when you report an incident, add evidence, or schedule a case
                follow-up date.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`px-5 py-4 transition-colors ${
                  notif.read ? 'opacity-75' : 'bg-blue-500/[0.04]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-[var(--text-main)]">{notif.title}</p>
                  <span className="shrink-0 text-[11px] text-[var(--text-muted)] tabular-nums">
                    {formatRelativeTime(notif.timestamp)}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                  {notif.message}
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-xs">
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => onMarkRead(notif.id)}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                  {notif.caseId && (
                    <button
                      type="button"
                      onClick={() => {
                        onMarkRead(notif.id);
                        onOpenCase(notif.caseId!);
                        onClose();
                      }}
                      className="font-medium text-[var(--text-main)] hover:underline"
                    >
                      Open {notif.caseId}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
