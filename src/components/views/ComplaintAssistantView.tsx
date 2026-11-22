import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckSquare,
  Copy,
  Download,
  Info,
  Printer,
  RefreshCw,
  Save,
  Square,
} from 'lucide-react';
import type { CaseIncident, EvidenceItem, FraudCategoryId, TriStateAnswer } from '../../types';
import { FRAUD_CATEGORIES } from '../../data/staticContent';
import { generateComplaintDraft } from '../../utils/caseLogic';
import { OfficialResourcesPanel } from '../ui/OfficialResourcesPanel';
import { VisualHeaderCard } from '../ui/VisualHeaderCard';

const COMPLAINT_IMAGE = '/src/assets/images/visual_complaint_guide_1795363274175.jpg';

interface ComplaintAssistantViewProps {
  cases: CaseIncident[];
  evidence: EvidenceItem[];
  initialCaseId: string | null;
  onSaveDraftToCase: (caseId: string, draft: string) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

const REQUIRED_CHECKLIST = [
  'Full legal name, active phone number, and email address ready',
  'Exact incident date and approximate time verified against SMS/bank alerts',
  '12-digit UTR / RRN / Transaction reference numbers double-checked',
  'Screenshots of chats, payment receipts, and suspicious phone/URL records saved',
  'Government photo ID ready if requested by official cybercrime portal',
];

export function ComplaintAssistantView({
  cases,
  evidence,
  initialCaseId,
  onSaveDraftToCase,
  onToast,
}: ComplaintAssistantViewProps) {
  const [sourceMode, setSourceMode] = useState<'case' | 'manual'>(
    cases.length > 0 ? 'case' : 'manual'
  );
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialCaseId ?? cases[0]?.id ?? ''
  );

  // Manual entry state
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<FraudCategoryId>('upi_payment');
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualTime, setManualTime] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualPlatform, setManualPlatform] = useState('');
  const [manualTxId, setManualTxId] = useState('');
  const [manualContact, setManualContact] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualBank, setManualBank] = useState<TriStateAnswer>('No');
  const [manualFiled, setManualFiled] = useState<'Yes' | 'No'>('No');
  const [extraActions, setExtraActions] = useState('');

  const [draftText, setDraftText] = useState('');
  const [checkedReq, setCheckedReq] = useState<number[]>([]);

  const selectedCase = useMemo(
    () => cases.find((c) => c.id === selectedCaseId) ?? null,
    [cases, selectedCaseId]
  );

  const linkedEvidenceLabels = useMemo(() => {
    if (!selectedCase) return [];
    return evidence
      .filter((e) => e.caseId === selectedCase.id)
      .map((e) => `${e.category} — ${e.name}${e.transactionDetails ? ` (${e.transactionDetails})` : ''}`);
  }, [evidence, selectedCase]);

  const buildDraftFromCurrentSource = () => {
    if (sourceMode === 'case' && selectedCase) {
      return generateComplaintDraft({
        caseId: selectedCase.id,
        title: selectedCase.title,
        category: selectedCase.category,
        incidentDate: selectedCase.incidentDate,
        incidentTime: selectedCase.incidentTime,
        amountInvolved: selectedCase.amountInvolved,
        currency: selectedCase.currency,
        platform: selectedCase.platform,
        transactionId: selectedCase.transactionId,
        suspiciousContact: selectedCase.suspiciousContact,
        description: selectedCase.description,
        bankContacted: selectedCase.bankContacted,
        complaintFiled: selectedCase.complaintFiled,
        complaintReferenceNumber: selectedCase.complaintReferenceNumber,
        evidenceList: linkedEvidenceLabels,
        additionalActionsTaken: extraActions,
      });
    }

    const parsedAmount =
      manualAmount.trim() !== '' && !Number.isNaN(Number(manualAmount))
        ? Number(manualAmount)
        : undefined;

    return generateComplaintDraft({
      title: manualTitle,
      category: manualCategory,
      incidentDate: manualDate,
      incidentTime: manualTime,
      amountInvolved: parsedAmount,
      currency: 'INR',
      platform: manualPlatform,
      transactionId: manualTxId,
      suspiciousContact: manualContact,
      description: manualDesc,
      bankContacted: manualBank,
      complaintFiled: manualFiled,
      evidenceList: [],
      additionalActionsTaken: extraActions,
    });
  };

  useEffect(() => {
    if (initialCaseId && cases.some((c) => c.id === initialCaseId)) {
      setSelectedCaseId(initialCaseId);
      setSourceMode('case');
    }
  }, [initialCaseId, cases]);

  useEffect(() => {
    if (sourceMode === 'case' && selectedCase) {
      if (selectedCase.savedComplaintDraft) {
        setDraftText(selectedCase.savedComplaintDraft);
      } else {
        setDraftText(buildDraftFromCurrentSource());
      }
    } else if (sourceMode === 'manual') {
      setDraftText(buildDraftFromCurrentSource());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceMode, selectedCaseId]);

  const handleRegenerate = () => {
    setDraftText(buildDraftFromCurrentSource());
    onToast('info', 'Complaint draft refreshed', 'Updated strictly from current factual inputs.');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draftText);
      onToast('success', 'Copied to clipboard', 'Review and paste into your official submission.');
    } catch {
      onToast('error', 'Clipboard unavailable', 'Select the text in the editor to copy manually.');
    }
  };

  const handleDownloadTxt = () => {
    const filename =
      sourceMode === 'case' && selectedCase
        ? `RECOVERX_Complaint_${selectedCase.id}.txt`
        : `RECOVERX_Complaint_Draft_${new Date().toISOString().slice(0, 10)}.txt`;
    const blob = new Blob([draftText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onToast('success', 'Draft downloaded', `Saved as ${filename}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToCase = () => {
    if (!selectedCase) return;
    onSaveDraftToCase(selectedCase.id, draftText);
    onToast('success', 'Complaint draft saved', `Linked to case ${selectedCase.id}.`);
  };

  const toggleReq = (idx: number) => {
    setCheckedReq((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="no-print">
        <VisualHeaderCard
          eyebrow="Ready for official portals & banks"
          title="File a Complaint"
          description="Turn your case details into a clean, well-organized complaint letter. Review it, copy or download it, and submit it on cybercrime.gov.in or to your bank."
          imageSrc={COMPLAINT_IMAGE}
          imageAlt="Structured official report sheets with a blue verification checkmark seal"
          actions={
            <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-1">
              <button
                type="button"
                onClick={() => setSourceMode('case')}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  sourceMode === 'case'
                    ? 'bg-blue-600 text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Use a Saved Case
              </button>
              <button
                type="button"
                onClick={() => setSourceMode('manual')}
                className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  sourceMode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Type Details Manually
              </button>
            </div>
          }
        />
      </div>

      {/* Review Disclaimer */}
      <div className="no-print flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs text-[var(--text-muted)]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-[var(--text-main)]">Always check before sending:</strong> This
          draft uses only the facts you typed. Double-check dates, amounts, and transaction numbers
          before submitting on{' '}
          <a
            href="https://cybercrime.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-blue-600 dark:text-sky-400 hover:underline"
          >
            cybercrime.gov.in
          </a>{' '}
          or to your bank. RECOVERX does not send complaints automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left: Source Configuration & Editable Draft */}
        <div className="space-y-6 xl:col-span-8">
          {/* Source Selector Card */}
          <section className="no-print rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            {sourceMode === 'case' ? (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="complaint-case-select"
                    className="block text-xs font-semibold text-[var(--text-main)]"
                  >
                    Select Reported Incident
                  </label>
                  {cases.length === 0 ? (
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      No saved cases available yet. Switch to &ldquo;Enter Manually&rdquo; above or
                      report an incident first.
                    </p>
                  ) : (
                    <select
                      id="complaint-case-select"
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                    >
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} — {c.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="complaint-extra-actions"
                    className="block text-xs font-semibold text-[var(--text-main)]"
                  >
                    Additional Actions Taken (optional)
                  </label>
                  <input
                    id="complaint-extra-actions"
                    type="text"
                    value={extraActions}
                    onChange={(e) => setExtraActions(e.target.value)}
                    placeholder="e.g., Blocked debit card, reset UPI PIN, visited local branch"
                    className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={!selectedCase}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] hover:border-blue-500/40 disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Regenerate Structured Draft</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="m-title"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Incident Subject
                    </label>
                    <input
                      id="m-title"
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Short factual title"
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="m-cat"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Fraud Category
                    </label>
                    <select
                      id="m-cat"
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value as FraudCategoryId)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                    >
                      {FRAUD_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="m-platform"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Platform / Service
                    </label>
                    <input
                      id="m-platform"
                      type="text"
                      value={manualPlatform}
                      onChange={(e) => setManualPlatform(e.target.value)}
                      placeholder="e.g., PhonePe, WhatsApp"
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="m-date"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Date
                    </label>
                    <input
                      id="m-date"
                      type="date"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="m-time"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Time (optional)
                    </label>
                    <input
                      id="m-time"
                      type="time"
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="m-amount"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Amount in INR (optional)
                    </label>
                    <input
                      id="m-amount"
                      type="number"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="m-tx"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Transaction / UTR ID (optional)
                    </label>
                    <input
                      id="m-tx"
                      type="text"
                      value={manualTxId}
                      onChange={(e) => setManualTxId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="m-contact"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Suspected Contact / Website (optional)
                    </label>
                    <input
                      id="m-contact"
                      type="text"
                      value={manualContact}
                      onChange={(e) => setManualContact(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="m-desc"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Factual Description of Events
                    </label>
                    <textarea
                      id="m-desc"
                      rows={3}
                      value={manualDesc}
                      onChange={(e) => setManualDesc(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="m-bank"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Bank Contacted?
                    </label>
                    <select
                      id="m-bank"
                      value={manualBank}
                      onChange={(e) => setManualBank(e.target.value as TriStateAnswer)}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Unsure">Unsure</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="m-filed"
                      className="block text-xs font-semibold text-[var(--text-main)]"
                    >
                      Complaint Filed?
                    </label>
                    <select
                      id="m-filed"
                      value={manualFiled}
                      onChange={(e) => setManualFiled(e.target.value as 'Yes' | 'No')}
                      className="mt-1 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)]"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Generate Draft from Details</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Editable Draft Editor */}
          <section className="print-document rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-main)]">
                  Editable Complaint Draft
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Edit directly below before copying, downloading, or printing.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {sourceMode === 'case' && selectedCase && (
                  <button
                    type="button"
                    onClick={handleSaveToCase}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-main)] hover:border-blue-500/40 whitespace-nowrap"
                  >
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Save to Case</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-main)] hover:border-blue-500/40 whitespace-nowrap"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--text-main)] hover:border-blue-500/40 whitespace-nowrap"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Download TXT</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
                >
                  <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <textarea
              aria-label="Editable complaint draft text"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={24}
              className="no-print mt-4 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-4 font-mono text-xs leading-relaxed text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
            />
            <pre className="hidden print-only whitespace-pre-wrap font-mono text-xs leading-relaxed text-black">
              {draftText}
            </pre>
          </section>
        </div>

        {/* Right: Required Information Checklist + Official Resources */}
        <div className="no-print space-y-6 xl:col-span-4">
          <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              Required Information Checklist
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Confirm you have these items ready before opening the official portal.
            </p>
            <div className="mt-4 space-y-2.5">
              {REQUIRED_CHECKLIST.map((item, idx) => {
                const checked = checkedReq.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleReq(idx)}
                    aria-pressed={checked}
                    className="flex w-full items-start gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-[var(--bg-elevated)]/60"
                  >
                    {checked ? (
                      <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Square className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                    )}
                    <span
                      className={`text-xs leading-relaxed ${
                        checked
                          ? 'line-through text-[var(--text-muted)]'
                          : 'text-[var(--text-main)]'
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <OfficialResourcesPanel />
        </div>
      </div>
    </div>
  );
}
