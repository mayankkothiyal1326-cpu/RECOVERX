import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  ShieldAlert,
  FolderLock,
  FileText,
  GitCommitHorizontal,
  Briefcase,
  ShieldCheck,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  PhoneCall,
  X,
} from 'lucide-react';
import type { NavSection } from '../../types';

export interface NavItemDef {
  id: NavSection;
  label: string;
  hint: string;
  group: 'start' | 'recovery' | 'more';
  icon: React.ComponentType<{ className?: string }>;
}

export const NAV_ITEMS: NavItemDef[] = [
  {
    id: 'overview',
    label: 'Home',
    hint: 'Dashboard & quick actions',
    group: 'start',
    icon: LayoutDashboard,
  },
  {
    id: 'report',
    label: 'Report Fraud',
    hint: 'Log a new incident',
    group: 'start',
    icon: FilePlus2,
  },
  {
    id: 'emergency',
    label: 'Urgent Help',
    hint: 'Immediate protection steps',
    group: 'start',
    icon: ShieldAlert,
  },
  {
    id: 'evidence',
    label: 'My Evidence',
    hint: 'Screenshots & receipts',
    group: 'recovery',
    icon: FolderLock,
  },
  {
    id: 'complaint',
    label: 'File a Complaint',
    hint: 'Prepare official letter',
    group: 'recovery',
    icon: FileText,
  },
  {
    id: 'tracker',
    label: 'Track My Case',
    hint: 'Progress & milestones',
    group: 'recovery',
    icon: GitCommitHorizontal,
  },
  {
    id: 'cases',
    label: 'My Cases',
    hint: 'All saved incidents',
    group: 'recovery',
    icon: Briefcase,
  },
  {
    id: 'safety',
    label: 'Safety Guide',
    hint: 'Checklists & scam guides',
    group: 'more',
    icon: ShieldCheck,
  },
  {
    id: 'settings',
    label: 'Settings',
    hint: 'Profile, theme & data',
    group: 'more',
    icon: Settings,
  },
];

const NAV_GROUPS: { key: NavItemDef['group']; label: string }[] = [
  { key: 'start', label: 'Start Here' },
  { key: 'recovery', label: 'My Recovery' },
  { key: 'more', label: 'Learn & Account' },
];

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  displayName: string;
  email: string;
  activeCaseCount: number;
}

function RecoverXMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="28" height="28" rx="7" className="fill-blue-600 dark:fill-blue-500" />
      <path
        d="M14 5.5L21 8.4V13.8C21 18.1 17.9 21.7 14 23C10.1 21.7 7 18.1 7 13.8V8.4L14 5.5Z"
        stroke="white"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M11.2 14.1L13.1 16L17.1 11.8"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Sidebar({
  activeSection,
  onSelectSection,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  displayName,
  email,
  activeCaseCount,
}: SidebarProps) {
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'RX';

  const navContent = (isMobileDrawer: boolean) => {
    const isCompact = !isMobileDrawer && collapsed;

    return (
      <div className="flex h-full flex-col bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)]">
        {/* Brand Header */}
        <div
          className={`flex h-14 items-center border-b border-[var(--border-subtle)] ${
            isCompact ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onSelectSection('overview');
              if (isMobileDrawer) onCloseMobile();
            }}
            className="flex items-center gap-2.5 text-left focus-visible:outline-2 rounded-lg"
            aria-label="RECOVERX Home"
          >
            <RecoverXMark />
            {!isCompact && (
              <div className="min-w-0">
                <span className="block text-sm font-bold tracking-tight text-[var(--text-main)] whitespace-nowrap">
                  RECOVERX
                </span>
                <span className="block text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                  From Fraud to Recovery
                </span>
              </div>
            )}
          </button>

          {isMobileDrawer ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]"
            >
              <X className="h-4 w-4" />
            </button>
          ) : !isCompact ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="rounded-lg p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Grouped Navigation Links */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {isCompact && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="mb-1 flex w-full items-center justify-center rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}

          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((i) => i.group === group.key);
            return (
              <div key={group.key}>
                {!isCompact && (
                  <p className="mb-1.5 px-2.5 text-[11px] font-semibold text-[var(--text-muted)]">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectSection(item.id);
                          if (isMobileDrawer) onCloseMobile();
                        }}
                        aria-current={active ? 'page' : undefined}
                        title={isCompact ? `${item.label} — ${item.hint}` : item.hint}
                        className={`group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                          isCompact ? 'justify-center' : 'justify-between'
                        } ${
                          active
                            ? 'bg-blue-600/12 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              active
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-[var(--text-muted)] group-hover:text-[var(--text-main)]'
                            }`}
                            aria-hidden="true"
                          />
                          {!isCompact && <span className="truncate">{item.label}</span>}
                        </span>
                        {!isCompact && item.id === 'cases' && activeCaseCount > 0 && (
                          <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
                            {activeCaseCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Emergency Help Shortcut & User Profile */}
        <div className="border-t border-[var(--border-subtle)] p-2.5 space-y-2">
          <button
            type="button"
            onClick={() => {
              onSelectSection('emergency');
              if (isMobileDrawer) onCloseMobile();
            }}
            title={isCompact ? 'Urgent Help — Call 1930 or 112' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-2 text-left text-xs font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-red-500/15 ${
              isCompact ? 'justify-center' : ''
            }`}
          >
            <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCompact && (
              <div className="min-w-0">
                <span className="block font-semibold whitespace-nowrap">Urgent Helpline</span>
                <span className="block text-[11px] opacity-85 whitespace-nowrap font-mono">
                  Call 1930 · Emergency 112
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectSection('settings');
              if (isMobileDrawer) onCloseMobile();
            }}
            title={isCompact ? `${displayName} — Settings` : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--bg-elevated)] ${
              isCompact ? 'justify-center' : ''
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)]">
              {initials}
            </div>
            {!isCompact && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[var(--text-main)]">
                  {displayName}
                </p>
                <p className="truncate text-[11px] text-[var(--text-muted)]">
                  {email || 'Saved on this device'}
                </p>
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={`no-print hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-[252px]'
        }`}
      >
        {navContent(false)}
      </aside>

      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[268px] max-w-[85vw]">{navContent(true)}</div>
        </div>
      )}
    </>
  );
}
