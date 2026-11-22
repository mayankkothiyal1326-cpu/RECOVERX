import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FilePlus2,
  FolderLock,
  GitCommitHorizontal,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';
import type { IncidentFormInput, NavSection, ToastMessage } from './types';
import { FRAUD_CATEGORIES } from './data/staticContent';
import { useRecoverXStore } from './store/useRecoverXStore';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { SearchModal } from './components/layout/SearchModal';
import { NotificationPanel } from './components/layout/NotificationPanel';
import { ToastContainer } from './components/ui/ToastContainer';
import { OverviewView } from './components/views/OverviewView';
import { ReportIncidentView } from './components/views/ReportIncidentView';
import { EmergencyResponseView } from './components/views/EmergencyResponseView';
import { EvidenceVaultView } from './components/views/EvidenceVaultView';
import { ComplaintAssistantView } from './components/views/ComplaintAssistantView';
import { RecoveryTrackerView } from './components/views/RecoveryTrackerView';
import { MyCasesView } from './components/views/MyCasesView';
import { SafetyCenterView } from './components/views/SafetyCenterView';
import { SettingsView } from './components/views/SettingsView';

const PAGE_TITLES: Record<NavSection, string> = {
  overview: 'Home',
  report: 'Report Fraud',
  emergency: 'Urgent Help',
  evidence: 'My Evidence',
  complaint: 'File a Complaint',
  tracker: 'Track My Case',
  cases: 'My Cases',
  safety: 'Safety Guide',
  settings: 'Settings',
};

const MOBILE_BOTTOM_NAV: {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'overview', label: 'Home', icon: LayoutDashboard },
  { id: 'report', label: 'Report', icon: FilePlus2 },
  { id: 'emergency', label: 'Urgent', icon: ShieldAlert },
  { id: 'evidence', label: 'Evidence', icon: FolderLock },
  { id: 'tracker', label: 'Track', icon: GitCommitHorizontal },
];

export default function App() {
  const store = useRecoverXStore();
  const { state } = store;

  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [complaintCaseId, setComplaintCaseId] = useState<string | null>(null);
  const [trackerCaseId, setTrackerCaseId] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback(
    (type: ToastMessage['type'], title: string, description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = useCallback((section: NavSection) => {
    setActiveSection(section);
    if (section !== 'cases') setSelectedCaseId(null);
    if (section !== 'emergency') setSelectedScenarioId(null);
    if (section !== 'safety') setSelectedArticleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openCaseDetail = useCallback((caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveSection('cases');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openEmergencyScenario = useCallback((scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setActiveSection('emergency');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openSafetyArticle = useCallback((articleId: string) => {
    setSelectedArticleId(articleId);
    setActiveSection('safety');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCreateIncident = useCallback(
    (input: IncidentFormInput, openEmergencyAfter: boolean) => {
      const created = store.addIncident(input);
      pushToast(
        'success',
        `Case ${created.id} saved`,
        `"${created.title}" is now in My Cases.`
      );

      if (openEmergencyAfter) {
        const catMeta = FRAUD_CATEGORIES.find((c) => c.id === created.category);
        setSelectedScenarioId(catMeta?.recommendedScenarioId ?? 'money_transferred');
        setActiveSection('emergency');
      } else {
        setSelectedCaseId(created.id);
        setActiveSection('cases');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [store, pushToast]
  );

  const unreadNotifications = useMemo(
    () => state.notifications.filter((n) => !n.read).length,
    [state.notifications]
  );

  const activeCaseCount = useMemo(
    () => state.cases.filter((c) => c.status !== 'Resolved').length,
    [state.cases]
  );

  const breadcrumbSub =
    activeSection === 'cases' && selectedCaseId
      ? selectedCaseId
      : activeSection === 'emergency' && selectedScenarioId
        ? 'Action Steps'
        : activeSection === 'safety' && selectedArticleId
          ? 'Guide'
          : undefined;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={navigateTo}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        displayName={state.settings.displayName}
        email={state.settings.email}
        activeCaseCount={activeCaseCount}
      />

      <div
        className={`flex min-h-screen flex-col transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[68px]' : 'lg:pl-[252px]'
        }`}
      >
        <TopBar
          pageTitle={PAGE_TITLES[activeSection]}
          breadcrumbSub={breadcrumbSub}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onToggleNotifications={() => setNotificationsOpen((v) => !v)}
          unreadCount={unreadNotifications}
          displayName={state.settings.displayName}
          theme={state.settings.theme}
          onToggleTheme={() =>
            store.updateSettings({
              theme: state.settings.theme === 'dark' ? 'light' : 'dark',
            })
          }
          onNavigate={navigateTo}
          demoModeActive={state.demoModeActive}
        />

        <main className="flex-1 px-4 py-6 pb-20 sm:px-6 lg:px-8 lg:pb-10">
          <div className="mx-auto max-w-[1240px]">
            {activeSection === 'overview' && (
              <OverviewView
                cases={state.cases}
                evidence={state.evidence}
                activities={state.activities}
                demoModeActive={state.demoModeActive}
                onRemoveDemoData={() => {
                  store.removeDemoData();
                  pushToast(
                    'info',
                    'Demo data removed',
                    'Sample cases and evidence were cleared.'
                  );
                }}
                onNavigate={navigateTo}
                onOpenCase={openCaseDetail}
              />
            )}

            {activeSection === 'report' && (
              <ReportIncidentView onCreateIncident={handleCreateIncident} />
            )}

            {activeSection === 'emergency' && (
              <EmergencyResponseView
                selectedScenarioId={selectedScenarioId}
                onSelectScenario={setSelectedScenarioId}
                completedMap={state.emergencyChecklist}
                onToggleStep={store.toggleEmergencyStep}
                onNavigate={navigateTo}
              />
            )}

            {activeSection === 'evidence' && (
              <EvidenceVaultView
                evidence={state.evidence}
                cases={state.cases}
                onAddEvidence={store.addEvidence}
                onDeleteEvidence={store.deleteEvidence}
                onToast={pushToast}
              />
            )}

            {activeSection === 'complaint' && (
              <ComplaintAssistantView
                cases={state.cases}
                evidence={state.evidence}
                initialCaseId={complaintCaseId}
                onSaveDraftToCase={(caseId, draft) =>
                  store.updateCase(caseId, { savedComplaintDraft: draft }, 'Complaint draft saved')
                }
                onToast={pushToast}
              />
            )}

            {activeSection === 'tracker' && (
              <RecoveryTrackerView
                cases={state.cases}
                initialCaseId={trackerCaseId}
                onToggleStage={store.toggleRecoveryStage}
                onUpdateCase={store.updateCase}
                onAddMilestone={store.addCaseMilestone}
                onNavigate={navigateTo}
                onToast={pushToast}
              />
            )}

            {activeSection === 'cases' && (
              <MyCasesView
                cases={state.cases}
                evidence={state.evidence}
                selectedCaseId={selectedCaseId}
                onSelectCase={setSelectedCaseId}
                onUpdateCase={store.updateCase}
                onDeleteCase={store.deleteCase}
                onToggleStage={store.toggleRecoveryStage}
                onToggleEmergencyAction={store.toggleCaseEmergencyAction}
                onAddNote={store.addCaseNote}
                onNavigate={navigateTo}
                onOpenComplaintForCase={(id) => {
                  setComplaintCaseId(id);
                  setActiveSection('complaint');
                }}
                onOpenTrackerForCase={(id) => {
                  setTrackerCaseId(id);
                  setActiveSection('tracker');
                }}
                onToast={pushToast}
              />
            )}

            {activeSection === 'safety' && (
              <SafetyCenterView
                completedChecklist={state.safetyChecklist}
                onToggleChecklistItem={store.toggleSafetyChecklistItem}
                selectedArticleId={selectedArticleId}
                onSelectArticle={setSelectedArticleId}
              />
            )}

            {activeSection === 'settings' && (
              <SettingsView
                settings={state.settings}
                demoModeActive={state.demoModeActive}
                onUpdateSettings={store.updateSettings}
                onRemoveDemoData={store.removeDemoData}
                onRestoreDemoData={store.restoreDemoData}
                onExportJson={store.exportDataJson}
                onClearAllData={store.clearAllLocalData}
                onToast={pushToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Compact Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile quick navigation"
        className="no-print fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/95 px-2 backdrop-blur-xs lg:hidden"
      >
        {MOBILE_BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-[11px] font-medium transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        cases={state.cases}
        evidence={state.evidence}
        onOpenCase={openCaseDetail}
        onOpenEmergency={openEmergencyScenario}
        onOpenArticle={openSafetyArticle}
        onNavigate={navigateTo}
      />

      <NotificationPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={state.notifications}
        onMarkRead={store.markNotificationRead}
        onMarkAllRead={store.markAllNotificationsRead}
        onClearAll={store.clearNotifications}
        onOpenCase={openCaseDetail}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
