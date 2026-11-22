import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Check,
  CreditCard,
  Fingerprint,
  KeyRound,
  ShieldAlert,
  ShoppingBag,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { FraudCategoryId, IncidentFormInput, TriStateAnswer, ValidationErrors } from '../../types';
import { FRAUD_CATEGORIES } from '../../data/staticContent';
import { FRAUD_CATEGORY_LABELS, formatCurrency, validateIncidentForm } from '../../utils/caseLogic';

interface ReportIncidentViewProps {
  onCreateIncident: (input: IncidentFormInput, openEmergencyAfter: boolean) => void;
}

const CATEGORY_ICONS = {
  Smartphone,
  ShoppingBag,
  TrendingUp,
  ShieldAlert,
  Users,
  Fingerprint,
  Briefcase,
  CreditCard,
  KeyRound,
  AlertTriangle,
};

const TODAY_YMD = new Date().toISOString().slice(0, 10);

export function ReportIncidentView({ onCreateIncident }: ReportIncidentViewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [form, setForm] = useState<IncidentFormInput>({
    category: '',
    title: '',
    amountInvolved: '',
    incidentDate: TODAY_YMD,
    incidentTime: '',
    platform: '',
    transactionId: '',
    suspiciousContact: '',
    description: '',
    bankContacted: 'No',
    complaintFiled: 'No',
  });

  const updateField = <K extends keyof IncidentFormInput>(key: K, value: IncidentFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSelectCategory = (id: FraudCategoryId) => {
    updateField('category', id);
  };

  const goToStep2 = () => {
    if (!form.category) {
      setErrors({ category: 'Please select a fraud category to proceed.' });
      return;
    }
    setErrors({});
    setStep(2);
  };

  const goToStep3 = () => {
    const validationErrors = validateIncidentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setStep(3);
  };

  const handleFinalSubmit = (openEmergencyAfter: boolean) => {
    if (submitting) return;
    const validationErrors = validateIncidentForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStep(2);
      return;
    }
    setSubmitting(true);
    onCreateIncident(form, openEmergencyAfter);
  };

  const stepsMeta = [
    { num: 1 as const, label: '1. Type of Scam' },
    { num: 2 as const, label: '2. What Happened' },
    { num: 3 as const, label: '3. Review & Save' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header & Stepper */}
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-[var(--text-main)]">Report Fraud</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Tell us what happened in 3 quick steps. We will save a private case file on this device so
          you can organize proof, draft an official complaint, and track your recovery.
        </p>

        <ol className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Reporting progress">
          {stepsMeta.map((s) => {
            const isCurrent = step === s.num;
            const isDone = step > s.num;
            return (
              <li
                key={s.num}
                className={`flex items-center gap-3 rounded-lg border px-3.5 py-2.5 text-xs font-medium ${
                  isCurrent
                    ? 'border-blue-500/50 bg-blue-600/10 text-blue-600 dark:text-blue-400'
                    : isDone
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-muted)]'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isDone
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                  }`}
                >
                  {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                </span>
                <span className="truncate">{s.label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* STEP 1 — SELECT FRAUD CATEGORY */}
      {step === 1 && (
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-main)]">
                Step 1 — What kind of fraud happened?
              </h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Pick the option that best matches your situation. Don&apos;t worry if you aren&apos;t
                sure—you can choose &ldquo;Other Cyber Fraud&rdquo;.
              </p>
            </div>
          </div>

          {errors.category && (
            <p role="alert" className="mt-3 text-xs font-medium text-red-500">
              {errors.category}
            </p>
          )}

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FRAUD_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.iconName];
              const selected = form.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.id)}
                  aria-pressed={selected}
                  className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-colors ${
                    selected
                      ? 'border-blue-500 bg-blue-600/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-main)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-elevated)]/40'
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? 'bg-blue-600 text-white'
                        : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-main)]">{cat.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                      {cat.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-end border-t border-[var(--border-subtle)] pt-5">
            <button
              type="button"
              onClick={goToStep2}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
            >
              <span>Continue to Incident Details</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 2 — INCIDENT DETAILS */}
      {step === 2 && (
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              Step 2 — Share what happened
            </h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Fill in what you know right now (fields marked optional can be added later). Category:{' '}
              <span className="font-semibold text-[var(--text-main)]">
                {form.category ? FRAUD_CATEGORY_LABELS[form.category] : 'None'}
              </span>
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Title */}
            <div className="sm:col-span-2">
              <label
                htmlFor="incident-title"
                className="block text-xs font-semibold text-[var(--text-main)]"
              >
                Incident Title <span className="text-red-500">*</span>
              </label>
              <input
                id="incident-title"
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Unauthorized UPI debit during courier support call"
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
              />
              {errors.title && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="incident-amount"
                className="block text-xs font-semibold text-[var(--text-main)]"
              >
                Amount Involved in INR (optional)
              </label>
              <input
                id="incident-amount"
                type="number"
                min="0"
                step="any"
                value={form.amountInvolved}
                onChange={(e) => updateField('amountInvolved', e.target.value)}
                placeholder="e.g., 15000"
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 font-mono text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none tabular-nums"
              />
              {errors.amountInvolved && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.amountInvolved}
                </p>
              )}
            </div>

            {/* Platform */}
            <div>
              <label
                htmlFor="incident-platform"
                className="block text-xs font-semibold text-[var(--text-main)]"
              >
                Platform / Bank / App Involved <span className="text-red-500">*</span>
              </label>
              <input
                id="incident-platform"
                type="text"
                value={form.platform}
                onChange={(e) => updateField('platform', e.target.value)}
                placeholder="e.g., PhonePe, Google Pay, Instagram, SBI"
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
              />
              {errors.platform && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.platform}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label
                htmlFor="incident-date"
                className="block text-xs font-semibold text-[var(--text-main)]"
              >
                Incident Date <span className="text-red-500">*</span>
              </label>
              <input
                id="incident-date"
                type="date"
                value={form.incidentDate}
                onChange={(e) => updateField('incidentDate', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 font-mono text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none tabular-nums"
              />
              {errors.incidentDate && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.incidentDate}
                </p>
              )}
            </div>

            {/* Time */}
            <div>
              <label
                htmlFor="incident-time"
                className="block text-xs font-semibold text-[var(--text-main)]"
              >
                Approximate Time (optional)
              </label>
              <input
                id="incident-time"
                type="time"
                value={form.incidentTime}
                onChange={(e) => updateField('incidentTime', e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 font-mono text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none tabular-nums"
              />
            </div>

            {/* Transaction ID */}
            <div>
              <label
                htmlFor="incident-txid"
                className="block text-xs font-semibold text-[var(--text-main)]"
              >
                Transaction / UTR / Reference ID (optional)
              </label>
              <input
                id="incident-txid"
                type="text"
                value={form.transactionId}
                onChange={(e) => updateField('transactionId', e.target.value)}
                placeholder="e.g., UTR431982716254"
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 font-mono text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Suspicious contact */}
            <div>
              <label
                htmlFor="incident-contact"
                className="block text-xs font-semibold text-[var(--text-main)]"
              >
                Suspicious Phone, Email, UPI ID, or Website (optional)
              </label>
              <input
                id="incident-contact"
                type="text"
                value={form.suspiciousContact}
                onChange={(e) => updateField('suspiciousContact', e.target.value)}
                placeholder="e.g., +91 98XXXXXX10 or suspicious-link.example"
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="incident-description"
                className="block text-xs font-semibold text-[var(--text-main)]"
              >
                Brief Description of What Happened <span className="text-red-500">*</span>
              </label>
              <textarea
                id="incident-description"
                rows={4}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe chronologically how contact was made, what actions occurred, and what you observed."
                className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3.5 py-2.5 text-sm leading-relaxed text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
              />
              {errors.description && (
                <p role="alert" className="mt-1 text-xs text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Bank Contacted */}
            <div>
              <fieldset>
                <legend className="block text-xs font-semibold text-[var(--text-main)]">
                  Have you already contacted your bank or payment provider?
                </legend>
                <div className="mt-2 flex items-center gap-2">
                  {(['Yes', 'No', 'Unsure'] as TriStateAnswer[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('bankContacted', opt)}
                      aria-pressed={form.bankContacted === opt}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        form.bankContacted === opt
                          ? 'border-blue-500 bg-blue-600/12 text-blue-600 dark:text-blue-400'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Complaint Filed */}
            <div>
              <fieldset>
                <legend className="block text-xs font-semibold text-[var(--text-main)]">
                  Has an official complaint already been filed?
                </legend>
                <div className="mt-2 flex items-center gap-2">
                  {(['Yes', 'No'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('complaintFiled', opt)}
                      aria-pressed={form.complaintFiled === opt}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        form.complaintFiled === opt
                          ? 'border-blue-500 bg-blue-600/12 text-blue-600 dark:text-blue-400'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[var(--border-subtle)] pt-5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)] whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={goToStep3}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
            >
              <span>Review Summary</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 — REVIEW & CREATE CASE */}
      {step === 3 && (
        <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 sm:p-6">
          <h3 className="text-base font-semibold text-[var(--text-main)]">
            Step 3 — Review & Create Case
          </h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Confirm all factual details before saving this case to your local workspace.
          </p>

          <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-b border-[var(--border-subtle)] py-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Fraud Category</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--text-main)]">
                {form.category ? FRAUD_CATEGORY_LABELS[form.category] : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Incident Title</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--text-main)]">{form.title}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Date & Time</dt>
              <dd className="mt-1 font-mono text-sm text-[var(--text-main)] tabular-nums">
                {form.incidentDate}
                {form.incidentTime ? ` · ${form.incidentTime}` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Amount Involved</dt>
              <dd className="mt-1 font-mono text-sm text-[var(--text-main)] tabular-nums">
                {form.amountInvolved.trim() !== ''
                  ? formatCurrency(Number(form.amountInvolved), 'INR')
                  : 'Not specified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Platform Involved</dt>
              <dd className="mt-1 text-sm text-[var(--text-main)]">{form.platform}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Transaction / UTR ID</dt>
              <dd className="mt-1 font-mono text-sm text-[var(--text-main)]">
                {form.transactionId.trim() || 'Not provided'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Suspicious Contact / URL</dt>
              <dd className="mt-1 text-sm text-[var(--text-main)]">
                {form.suspiciousContact.trim() || 'Not provided'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--text-muted)]">Initial Actions Status</dt>
              <dd className="mt-1 text-sm text-[var(--text-main)]">
                Bank contacted: <strong>{form.bankContacted}</strong> · Complaint filed:{' '}
                <strong>{form.complaintFiled}</strong>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-[var(--text-muted)]">Description of Events</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-main)]">
                {form.description}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs leading-relaxed text-[var(--text-muted)]">
            Saving creates a private local case record in your browser. It does not automatically
            transmit a complaint to banks or police—use the Emergency Response Center or Complaint
            Assistant to submit through official channels.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)] whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back</span>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-2.5 text-sm font-semibold text-[var(--text-main)] transition-colors hover:border-blue-500/40 whitespace-nowrap disabled:opacity-50"
              >
                <span>Save Incident</span>
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleFinalSubmit(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap disabled:opacity-50"
              >
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                <span>Save & Get Help</span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
