import { useCallback, useEffect, useState } from 'react';
import type {
  ActivityEvent,
  AppNotification,
  CaseIncident,
  CaseStatus,
  EvidenceItem,
  IncidentFormInput,
  RecoverXState,
  RecoveryStageId,
  UserSettings,
} from '../types';
import { createDemoState, createEmptyState } from '../data/staticContent';
import {
  createInitialStages,
  deriveStatusFromStages,
  generateCaseId,
} from '../utils/caseLogic';
import {
  clearAllEvidenceBlobs,
  deleteEvidenceFileBlob,
  saveEvidenceFileBlob,
} from '../utils/indexedDb';

const STORAGE_KEY = 'recoverx_state_v1';

function loadInitialState(): RecoverXState {
  if (typeof window === 'undefined') return createDemoState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDemoState();
    const parsed = JSON.parse(raw) as Partial<RecoverXState>;
    if (!parsed || !Array.isArray(parsed.cases) || !parsed.settings) {
      return createDemoState();
    }
    return {
      cases: parsed.cases ?? [],
      evidence: parsed.evidence ?? [],
      emergencyChecklist: parsed.emergencyChecklist ?? {},
      safetyChecklist: parsed.safetyChecklist ?? [],
      activities: parsed.activities ?? [],
      notifications: parsed.notifications ?? [],
      settings: {
        displayName: parsed.settings.displayName ?? 'RecoverX User',
        email: parsed.settings.email ?? '',
        theme: parsed.settings.theme === 'light' ? 'light' : 'dark',
        notifications: {
          caseUpdates: parsed.settings.notifications?.caseUpdates ?? true,
          followUpReminders: parsed.settings.notifications?.followUpReminders ?? true,
          checklistReminders: parsed.settings.notifications?.checklistReminders ?? true,
          safetyTips: parsed.settings.notifications?.safetyTips ?? true,
        },
      },
      demoModeActive: Boolean(parsed.demoModeActive),
    };
  } catch {
    return createDemoState();
  }
}

export function useRecoverXStore() {
  const [state, setState] = useState<RecoverXState>(loadInitialState);

  // Persist to localStorage on every state update
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [state]);

  // Sync theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.theme]);

  const addIncident = useCallback((input: IncidentFormInput): CaseIncident => {
    const nowIso = new Date().toISOString();
    let createdCase!: CaseIncident;

    setState((prev) => {
      const id = generateCaseId(prev.cases.map((c) => c.id));
      const parsedAmount =
        input.amountInvolved.trim() !== '' && !Number.isNaN(Number(input.amountInvolved))
          ? Number(input.amountInvolved)
          : undefined;

      const stages = createInitialStages(input.complaintFiled, nowIso);
      const status: CaseStatus = input.complaintFiled === 'Yes' ? 'Pending Follow-up' : 'Active';

      createdCase = {
        id,
        title: input.title.trim(),
        category: input.category || 'other_cyber_fraud',
        amountInvolved: parsedAmount,
        currency: 'INR',
        incidentDate: input.incidentDate,
        incidentTime: input.incidentTime.trim() || undefined,
        platform: input.platform.trim(),
        transactionId: input.transactionId.trim() || undefined,
        suspiciousContact: input.suspiciousContact.trim() || undefined,
        description: input.description.trim(),
        bankContacted: input.bankContacted,
        complaintFiled: input.complaintFiled,
        status,
        stages,
        milestones: [
          {
            id: `ms-${Date.now()}`,
            date: nowIso.slice(0, 10),
            title: 'Incident Recorded in RECOVERX',
            note: 'Initial incident details logged for recovery tracking.',
          },
        ],
        notes: [],
        emergencyActionsCompleted: [],
        createdAt: nowIso,
        updatedAt: nowIso,
        isDemo: false,
      };

      const activity: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'incident_created',
        title: 'Incident reported',
        detail: `Created case ${id} — ${createdCase.title}`,
        caseId: id,
        timestamp: nowIso,
      };

      const notifications = prev.settings.notifications.caseUpdates
        ? [
            {
              id: `notif-${Date.now()}`,
              title: `New Case Created: ${id}`,
              message: `"${createdCase.title}" has been saved. Review emergency steps or attach supporting evidence.`,
              category: 'case' as const,
              timestamp: nowIso,
              read: false,
              caseId: id,
            },
            ...prev.notifications,
          ]
        : prev.notifications;

      return {
        ...prev,
        cases: [createdCase, ...prev.cases],
        activities: [activity, ...prev.activities].slice(0, 50),
        notifications: notifications.slice(0, 40),
      };
    });

    return createdCase;
  }, []);

  const updateCase = useCallback(
    (
      caseId: string,
      updates: Partial<
        Pick<
          CaseIncident,
          | 'title'
          | 'category'
          | 'amountInvolved'
          | 'incidentDate'
          | 'incidentTime'
          | 'platform'
          | 'transactionId'
          | 'suspiciousContact'
          | 'description'
          | 'bankContacted'
          | 'complaintFiled'
          | 'complaintReferenceNumber'
          | 'followUpDate'
          | 'status'
          | 'savedComplaintDraft'
        >
      >,
      activityTitle?: string
    ) => {
      const nowIso = new Date().toISOString();
      setState((prev) => {
        const target = prev.cases.find((c) => c.id === caseId);
        if (!target) return prev;

        const updatedCases = prev.cases.map((c) => {
          if (c.id !== caseId) return c;
          let nextStages = c.stages;
          if (updates.status === 'Resolved') {
            nextStages = c.stages.map((s) =>
              s.id === 'resolved' ? { ...s, completed: true, completedAt: nowIso } : s
            );
          } else if (updates.status) {
            nextStages = c.stages.map((s) =>
              s.id === 'resolved' ? { ...s, completed: false, completedAt: undefined } : s
            );
          }
          return {
            ...c,
            ...updates,
            stages: nextStages,
            updatedAt: nowIso,
          };
        });

        const activity: ActivityEvent = {
          id: `act-${Date.now()}`,
          type: updates.savedComplaintDraft !== undefined ? 'complaint_saved' : 'case_updated',
          title: activityTitle ?? 'Case details updated',
          detail: `${caseId} — ${updates.title ?? target.title}`,
          caseId,
          timestamp: nowIso,
        };

        const notifications =
          updates.followUpDate && prev.settings.notifications.followUpReminders
            ? [
                {
                  id: `notif-${Date.now()}`,
                  title: `Follow-up Date Set for ${caseId}`,
                  message: `Reminder scheduled for ${updates.followUpDate} regarding "${target.title}".`,
                  category: 'reminder' as const,
                  timestamp: nowIso,
                  read: false,
                  caseId,
                },
                ...prev.notifications,
              ]
            : prev.notifications;

        return {
          ...prev,
          cases: updatedCases,
          activities: [activity, ...prev.activities].slice(0, 50),
          notifications: notifications.slice(0, 40),
        };
      });
    },
    []
  );

  const deleteCase = useCallback((caseId: string) => {
    setState((prev) => ({
      ...prev,
      cases: prev.cases.filter((c) => c.id !== caseId),
      evidence: prev.evidence.map((ev) =>
        ev.caseId === caseId ? { ...ev, caseId: null } : ev
      ),
      activities: prev.activities.filter((a) => a.caseId !== caseId),
      notifications: prev.notifications.filter((n) => n.caseId !== caseId),
    }));
  }, []);

  const toggleRecoveryStage = useCallback((caseId: string, stageId: RecoveryStageId) => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const target = prev.cases.find((c) => c.id === caseId);
      if (!target) return prev;

      let toggledTo = false;
      const updatedCases = prev.cases.map((c) => {
        if (c.id !== caseId) return c;
        const nextStages = c.stages.map((s) => {
          if (s.id !== stageId) return s;
          toggledTo = !s.completed;
          return {
            ...s,
            completed: toggledTo,
            completedAt: toggledTo ? nowIso : undefined,
          };
        });
        const nextStatus = deriveStatusFromStages(nextStages, c.status);
        return {
          ...c,
          stages: nextStages,
          status: nextStatus,
          updatedAt: nowIso,
        };
      });

      const activity: ActivityEvent = {
        id: `act-${Date.now()}`,
        type: 'status_updated',
        title: 'Recovery status updated',
        detail: `${caseId} — Stage ${stageId.replace(/_/g, ' ')} marked ${
          toggledTo ? 'completed' : 'incomplete'
        }`,
        caseId,
        timestamp: nowIso,
      };

      return {
        ...prev,
        cases: updatedCases,
        activities: [activity, ...prev.activities].slice(0, 50),
      };
    });
  }, []);

  const addCaseMilestone = useCallback(
    (caseId: string, title: string, note: string, date: string) => {
      const nowIso = new Date().toISOString();
      setState((prev) => {
        const target = prev.cases.find((c) => c.id === caseId);
        if (!target) return prev;
        const updatedCases = prev.cases.map((c) => {
          if (c.id !== caseId) return c;
          return {
            ...c,
            milestones: [
              {
                id: `ms-${Date.now()}`,
                date: date || nowIso.slice(0, 10),
                title: title.trim(),
                note: note.trim(),
              },
              ...c.milestones,
            ],
            updatedAt: nowIso,
          };
        });

        const activity: ActivityEvent = {
          id: `act-${Date.now()}`,
          type: 'status_updated',
          title: 'Recovery milestone logged',
          detail: `${caseId} — ${title.trim()}`,
          caseId,
          timestamp: nowIso,
        };

        return {
          ...prev,
          cases: updatedCases,
          activities: [activity, ...prev.activities].slice(0, 50),
        };
      });
    },
    []
  );

  const addCaseNote = useCallback((caseId: string, content: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      cases: prev.cases.map((c) =>
        c.id === caseId
          ? {
              ...c,
              notes: [
                {
                  id: `note-${Date.now()}`,
                  createdAt: nowIso,
                  content: content.trim(),
                },
                ...c.notes,
              ],
              updatedAt: nowIso,
            }
          : c
      ),
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'case_updated' as const,
          title: 'Case note added',
          detail: `${caseId} — Added case note`,
          caseId,
          timestamp: nowIso,
        },
        ...prev.activities,
      ].slice(0, 50),
    }));
  }, []);

  const toggleCaseEmergencyAction = useCallback((caseId: string, stepId: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      cases: prev.cases.map((c) => {
        if (c.id !== caseId) return c;
        const exists = c.emergencyActionsCompleted.includes(stepId);
        return {
          ...c,
          emergencyActionsCompleted: exists
            ? c.emergencyActionsCompleted.filter((id) => id !== stepId)
            : [...c.emergencyActionsCompleted, stepId],
          updatedAt: nowIso,
        };
      }),
    }));
  }, []);

  const addEvidence = useCallback(
    async (
      item: Omit<EvidenceItem, 'id' | 'dateAdded' | 'hasLocalBlob'>,
      file?: File | null
    ): Promise<{ item: EvidenceItem; storedInIndexedDb: boolean }> => {
      const id = `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const nowIso = new Date().toISOString();
      let storedInIndexedDb = false;

      if (file) {
        storedInIndexedDb = await saveEvidenceFileBlob(id, file);
      }

      const created: EvidenceItem = {
        ...item,
        id,
        dateAdded: nowIso,
        fileName: file?.name ?? item.fileName,
        fileType: file?.type ?? item.fileType,
        fileSize: file?.size ?? item.fileSize,
        hasLocalBlob: storedInIndexedDb,
        isDemo: false,
      };

      setState((prev) => {
        const activity: ActivityEvent = {
          id: `act-${Date.now()}`,
          type: 'evidence_added',
          title: 'Evidence added',
          detail: `${created.name} (${created.category})${
            created.caseId ? ` linked to ${created.caseId}` : ''
          }`,
          caseId: created.caseId ?? undefined,
          timestamp: nowIso,
        };

        const notifications = prev.settings.notifications.caseUpdates
          ? [
              {
                id: `notif-${Date.now()}`,
                title: 'Evidence Saved',
                message: `"${created.name}" was stored in your Evidence Vault.`,
                category: 'evidence' as const,
                timestamp: nowIso,
                read: false,
                caseId: created.caseId ?? undefined,
              },
              ...prev.notifications,
            ]
          : prev.notifications;

        return {
          ...prev,
          evidence: [created, ...prev.evidence],
          activities: [activity, ...prev.activities].slice(0, 50),
          notifications: notifications.slice(0, 40),
        };
      });

      return { item: created, storedInIndexedDb };
    },
    []
  );

  const deleteEvidence = useCallback(async (evidenceId: string) => {
    await deleteEvidenceFileBlob(evidenceId);
    setState((prev) => ({
      ...prev,
      evidence: prev.evidence.filter((e) => e.id !== evidenceId),
    }));
  }, []);

  const toggleEmergencyStep = useCallback((scenarioId: string, stepId: string, stepTitle: string) => {
    const nowIso = new Date().toISOString();
    setState((prev) => {
      const current = prev.emergencyChecklist[scenarioId] ?? [];
      const exists = current.includes(stepId);
      const next = exists ? current.filter((id) => id !== stepId) : [...current, stepId];

      const activities = !exists
        ? [
            {
              id: `act-${Date.now()}`,
              type: 'emergency_action' as const,
              title: 'Emergency action completed',
              detail: stepTitle,
              timestamp: nowIso,
            },
            ...prev.activities,
          ].slice(0, 50)
        : prev.activities;

      return {
        ...prev,
        emergencyChecklist: {
          ...prev.emergencyChecklist,
          [scenarioId]: next,
        },
        activities,
      };
    });
  }, []);

  const toggleSafetyChecklistItem = useCallback((itemId: string) => {
    setState((prev) => {
      const exists = prev.safetyChecklist.includes(itemId);
      return {
        ...prev,
        safetyChecklist: exists
          ? prev.safetyChecklist.filter((id) => id !== itemId)
          : [...prev.safetyChecklist, itemId],
      };
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState((prev) => ({
      ...prev,
      notifications: [],
    }));
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
        notifications: {
          ...prev.settings.notifications,
          ...(updates.notifications ?? {}),
        },
      },
    }));
  }, []);

  const removeDemoData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      cases: prev.cases.filter((c) => !c.isDemo),
      evidence: prev.evidence.filter((e) => !e.isDemo),
      activities: prev.activities.filter((a) => !a.isDemo),
      notifications: prev.notifications.filter((n) => !n.isDemo),
      demoModeActive: false,
    }));
  }, []);

  const restoreDemoData = useCallback(() => {
    setState((prev) => {
      const demo = createDemoState();
      const nonDemoCases = prev.cases.filter((c) => !c.isDemo);
      const nonDemoEvidence = prev.evidence.filter((e) => !e.isDemo);
      const nonDemoActivities = prev.activities.filter((a) => !a.isDemo);
      const nonDemoNotifications = prev.notifications.filter((n) => !n.isDemo);
      return {
        ...prev,
        cases: [...nonDemoCases, ...demo.cases],
        evidence: [...nonDemoEvidence, ...demo.evidence],
        activities: [...nonDemoActivities, ...demo.activities],
        notifications: [...nonDemoNotifications, ...demo.notifications],
        demoModeActive: true,
      };
    });
  }, []);

  const clearAllLocalData = useCallback(async () => {
    await clearAllEvidenceBlobs();
    setState((prev) => createEmptyState(prev.settings));
  }, []);

  const exportDataJson = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      application: 'RECOVERX',
      note: 'Local browser export. Uploaded binary files in IndexedDB are referenced by metadata only.',
      data: state,
    };
    return JSON.stringify(payload, null, 2);
  }, [state]);

  return {
    state,
    addIncident,
    updateCase,
    deleteCase,
    toggleRecoveryStage,
    addCaseMilestone,
    addCaseNote,
    toggleCaseEmergencyAction,
    addEvidence,
    deleteEvidence,
    toggleEmergencyStep,
    toggleSafetyChecklistItem,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
    updateSettings,
    removeDemoData,
    restoreDemoData,
    clearAllLocalData,
    exportDataJson,
  };
}
