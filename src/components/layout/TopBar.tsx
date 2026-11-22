import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import type { NavSection } from '../../types';

interface TopBarProps {
  pageTitle: string;
  breadcrumbSub?: string;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  onToggleNotifications: () => void;
  unreadCount: number;
  displayName: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onNavigate: (section: NavSection) => void;
  demoModeActive: boolean;
}

export function TopBar({
  pageTitle,
  breadcrumbSub,
  onOpenMobileMenu,
  onOpenSearch,
  onToggleNotifications,
  unreadCount,
  displayName,
  theme,
  onToggleTheme,
  onNavigate,
  demoModeActive,
}: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || 'RX';

  return (
    <header className="no-print sticky top-0 z-20 flex h-12 sm:h-14 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/95 px-4 sm:px-6 backdrop-blur-xs">
      {/* Left: Mobile Menu + Breadcrumb */}
      <div className="flex min-w-0 items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
          <span className="hidden sm:inline text-xs font-medium text-[var(--text-muted)] whitespace-nowrap">
            RECOVERX
          </span>
          <ChevronRight
            className="hidden sm:inline h-3.5 w-3.5 text-[var(--text-muted)] shrink-0"
            aria-hidden="true"
          />
          <h1 className="truncate text-sm font-semibold text-[var(--text-main)]">
            {pageTitle}
          </h1>
          {breadcrumbSub && (
            <>
              <ChevronRight
                className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0"
                aria-hidden="true"
              />
              <span className="truncate text-xs font-mono text-[var(--text-muted)]">
                {breadcrumbSub}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right: Date, Search, Notifications, Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {demoModeActive && (
          <span className="hidden md:inline-block text-xs font-mono font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
            DEMO DATA
          </span>
        )}

        <span className="hidden xl:inline-block text-xs text-[var(--text-muted)] tabular-nums whitespace-nowrap">
          {todayFormatted}
        </span>

        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search cases, evidence, and safety guides"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-2.5 sm:px-3 text-xs text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-main)] whitespace-nowrap"
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden md:inline font-mono text-[10px] text-[var(--text-muted)] opacity-80">
            Ctrl K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onToggleNotifications}
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-main)]"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-600 px-1 font-mono text-[10px] font-semibold text-white tabular-nums">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Open profile menu"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:border-[var(--border-strong)]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600/15 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              {initials}
            </span>
            <span className="hidden md:inline max-w-[110px] truncate">{displayName}</span>
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1.5 shadow-xl"
            >
              <div className="border-b border-[var(--border-subtle)] px-3 py-2">
                <p className="truncate text-xs font-semibold text-[var(--text-main)]">
                  {displayName}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">Local Browser Workspace</p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onToggleTheme();
                  setProfileOpen(false);
                }}
                className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>Switch to Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span>Switch to Dark Theme</span>
                  </>
                )}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onNavigate('cases');
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
              >
                <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>My Cases</span>
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onNavigate('settings');
                  setProfileOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
              >
                <Settings className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Settings & Privacy</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
