import React, { useState } from 'react';
import {
  Database,
  Download,
  Moon,
  RotateCcw,
  Save,
  Shield,
  Sun,
  Trash2,
} from 'lucide-react';
import type { UserSettings } from '../../types';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { OfficialResourcesPanel } from '../ui/OfficialResourcesPanel';

interface SettingsViewProps {
  settings: UserSettings;
  demoModeActive: boolean;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  onRemoveDemoData: () => void;
  onRestoreDemoData: () => void;
  onExportJson: () => string;
  onClearAllData: () => Promise<void>;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export function SettingsView({
  settings,
  demoModeActive,
  onUpdateSettings,
  onRemoveDemoData,
  onRestoreDemoData,
  onExportJson,
  onClearAllData,
  onToast,
}: SettingsViewProps) {
  const [displayName, setDisplayName] = useState(settings.displayName);
  const [email, setEmail] = useState(settings.email);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = displayName.trim() || 'RecoverX User';
    onUpdateSettings({ displayName: cleanedName, email: email.trim() });
    setDisplayName(cleanedName);
    onToast('success', 'Profile saved', 'Your display preferences have been updated locally.');
  };

  const handleExport = () => {
    const json = onExportJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RECOVERX_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast('success', 'Data exported', 'Downloaded local RECOVERX JSON backup.');
  };

  const handleConfirmClear = async () => {
    await onClearAllData();
    setClearDialogOpen(false);
    onToast('info', 'Local data cleared', 'All cases, evidence, checklists, and logs were removed.');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-main)]">Settings & Profile</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage your profile, appearance theme, notification preferences, and local browser data.
        </p>
      </div>

      {/* Profile Details */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <h3 className="text-sm font-semibold text-[var(--text-main)]">Profile Details</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Stored strictly on this device to personalize your workspace.
        </p>

        <form onSubmit={handleSaveProfile} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settings-display-name"
              className="block text-xs font-semibold text-[var(--text-main)]"
            >
              Display Name
            </label>
            <input
              id="settings-display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="settings-email"
              className="block text-xs font-semibold text-[var(--text-main)]"
            >
              Contact Email (optional)
            </label>
            <input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </section>

      {/* Appearance Theme */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-main)]">Theme Preference</h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Choose between RECOVERX Dark (default) and Light workspace themes.
            </p>
          </div>

          <div
            className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-1 self-start"
            role="group"
            aria-label="Theme selection"
          >
            <button
              type="button"
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              aria-pressed={settings.theme === 'dark'}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                settings.theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ theme: 'light' })}
              aria-pressed={settings.theme === 'light'}
              className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                settings.theme === 'light'
                  ? 'bg-blue-600 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Light</span>
            </button>
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
        <h3 className="text-sm font-semibold text-[var(--text-main)]">Notification Preferences</h3>
        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
          Control which local workspace reminders appear in your Notification Center.
        </p>

        <div className="mt-4 divide-y divide-[var(--border-subtle)]">
          {(
            [
              {
                key: 'caseUpdates',
                label: 'Case & Evidence Updates',
                desc: 'Show local notifications when cases or evidence records are created.',
              },
              {
                key: 'followUpReminders',
                label: 'Follow-up Date Reminders',
                desc: 'Log a reminder whenever you schedule a follow-up date on a case.',
              },
              {
                key: 'checklistReminders',
                label: 'Checklist Reminders',
                desc: 'Keep Personal Safety Checklist reminders enabled.',
              },
              {
                key: 'safetyTips',
                label: 'Cyber Safety Tips',
                desc: 'Include periodic safety insights in workspace guidance.',
              },
            ] as const
          ).map((item) => {
            const enabled = settings.notifications[item.key];
            return (
              <div key={item.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-2 last:pb-0">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-main)]">{item.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={item.label}
                  onClick={() =>
                    onUpdateSettings({
                      notifications: {
                        ...settings.notifications,
                        [item.key]: !enabled,
                      },
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    enabled ? 'bg-blue-600' : 'bg-[var(--bg-elevated)] border border-[var(--border-strong)]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Data Management & Demo Mode */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[var(--text-main)]">
            Local Data & Demo Mode
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] hover:border-blue-500/40 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Export Data (JSON)</span>
          </button>

          {demoModeActive ? (
            <button
              type="button"
              onClick={() => {
                onRemoveDemoData();
                onToast('info', 'Demo data removed', 'Fictional sample entries have been cleared.');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/35 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Remove Demo Data</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onRestoreDemoData();
                onToast('info', 'Demo data loaded', 'Sample fictional cases are now visible.');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] hover:border-blue-500/40 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Load Demo Data</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setClearDialogOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/35 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/15 whitespace-nowrap"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Clear All Local Data</span>
          </button>
        </div>
      </section>

      {/* About, Privacy Notice, Disclaimer */}
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[var(--text-main)]">
            About RECOVERX, Privacy & Disclaimer
          </h3>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-[var(--text-muted)]">
          <p>
            <strong className="text-[var(--text-main)]">About RECOVERX:</strong> RECOVERX (&ldquo;From
            Fraud to Recovery&rdquo;) is a cyber fraud assistance, incident organization, evidence
            management, complaint drafting, and recovery tracking workspace built to help victims
            respond calmly and systematically.
          </p>
          <p>
            <strong className="text-[var(--text-main)]">Privacy Notice:</strong> In this version,
            all incident records, notes, checklists, and settings are stored locally in your web
            browser&apos;s <code className="font-mono">localStorage</code>, and uploaded evidence
            files are persisted locally in <code className="font-mono">IndexedDB</code>. No personal
            case data is transmitted to external servers by RECOVERX. Because local browser storage
            is not encrypted end-to-end, avoid storing unredacted passwords, PINs, or CVVs.
          </p>
          <p>
            <strong className="text-[var(--text-main)]">Important Disclaimer:</strong> RECOVERX is
            an independent guidance and documentation tool. It does <strong>not</strong> directly
            contact banks, freeze bank accounts, reverse transactions, notify law enforcement, file
            official cybercrime complaints automatically, or provide legal advice. Always report
            active financial fraud immediately through your bank and official government portals.
          </p>
        </div>
      </section>

      <OfficialResourcesPanel compact />

      <ConfirmDialog
        open={clearDialogOpen}
        title="Clear All Local Application Data"
        description="This permanently removes all reported cases, uploaded evidence files in IndexedDB, notes, checklists, and notifications from this browser. Consider exporting a JSON backup first."
        confirmLabel="Clear All Data"
        destructive
        onConfirm={handleConfirmClear}
        onCancel={() => setClearDialogOpen(false)}
      />
    </div>
  );
}
