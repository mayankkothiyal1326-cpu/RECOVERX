import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  File,
  FileImage,
  FileText,
  FolderLock,
  Info,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { CaseIncident, EvidenceCategory, EvidenceItem } from '../../types';
import { EVIDENCE_CATEGORIES } from '../../data/staticContent';
import { filterAndSortEvidence, formatDisplayDate } from '../../utils/caseLogic';
import { getEvidenceFileBlob } from '../../utils/indexedDb';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { VisualHeaderCard } from '../ui/VisualHeaderCard';

const EVIDENCE_IMAGE = '/src/assets/images/visual_evidence_vault_1795363273143.jpg';

interface EvidenceVaultViewProps {
  evidence: EvidenceItem[];
  cases: CaseIncident[];
  onAddEvidence: (
    item: Omit<EvidenceItem, 'id' | 'dateAdded' | 'hasLocalBlob'>,
    file?: File | null
  ) => Promise<{ item: EvidenceItem; storedInIndexedDb: boolean }>;
  onDeleteEvidence: (id: string) => Promise<void>;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function EvidenceVaultView({
  evidence,
  cases,
  onAddEvidence,
  onDeleteEvidence,
  onToast,
}: EvidenceVaultViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | EvidenceCategory>('All');
  const [caseFilter, setCaseFilter] = useState<'All' | string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<EvidenceCategory>('Screenshot');
  const [caseId, setCaseId] = useState<string>('');
  const [transactionDetails, setTransactionDetails] = useState('');
  const [suspiciousContact, setSuspiciousContact] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<EvidenceItem | null>(null);
  const [previewItem, setPreviewItem] = useState<EvidenceItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      filterAndSortEvidence(evidence, {
        searchQuery,
        category: categoryFilter,
        caseId: caseFilter,
        sortOrder,
      }),
    [evidence, searchQuery, categoryFilter, caseFilter, sortOrder]
  );

  const caseMap = useMemo(() => new Map(cases.map((c) => [c.id, c])), [cases]);

  useEffect(() => {
    let active = true;
    let createdObjectUrl: string | null = null;

    async function loadBlob() {
      if (!previewItem) {
        setPreviewUrl(null);
        setPreviewText(null);
        return;
      }
      if (!previewItem.hasLocalBlob) {
        setPreviewUrl(null);
        setPreviewText(null);
        return;
      }
      setPreviewLoading(true);
      const record = await getEvidenceFileBlob(previewItem.id);
      if (!active) return;
      setPreviewLoading(false);
      if (!record) {
        setPreviewUrl(null);
        setPreviewText(null);
        return;
      }
      if (record.type.startsWith('text/') || record.name.endsWith('.txt') || record.name.endsWith('.csv')) {
        const txt = await record.blob.text();
        if (active) setPreviewText(txt.slice(0, 8000));
      } else {
        createdObjectUrl = URL.createObjectURL(record.blob);
        setPreviewUrl(createdObjectUrl);
      }
    }

    loadBlob();

    return () => {
      active = false;
      if (createdObjectUrl) {
        URL.revokeObjectURL(createdObjectUrl);
      }
    };
  }, [previewItem]);

  const resetForm = () => {
    setSelectedFile(null);
    setName('');
    setCategory('Screenshot');
    setCaseId(cases[0]?.id ?? '');
    setTransactionDetails('');
    setSuspiciousContact('');
    setNotes('');
    setFormError('');
  };

  const openModalWithFile = (file?: File) => {
    resetForm();
    if (file) {
      setSelectedFile(file);
      setName(file.name.replace(/\.[^/.]+$/, ''));
      if (file.type.startsWith('image/')) {
        setCategory('Screenshot');
      } else {
        setCategory('Document');
      }
    }
    setAddModalOpen(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      openModalWithFile(file);
    }
  };

  const handleSaveEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      setFormError('Enter a clear name for this evidence item.');
      return;
    }
    if (!notes.trim() && !selectedFile && !transactionDetails.trim() && !suspiciousContact.trim()) {
      setFormError('Attach a file or provide notes, transaction details, or contact information.');
      return;
    }

    setSaving(true);
    try {
      const result = await onAddEvidence(
        {
          name: name.trim(),
          category,
          caseId: caseId || null,
          notes: notes.trim(),
          transactionDetails: transactionDetails.trim() || undefined,
          suspiciousContact: suspiciousContact.trim() || undefined,
        },
        selectedFile
      );

      if (selectedFile && !result.storedInIndexedDb) {
        onToast(
          'warning',
          'Metadata saved (file blob unavailable)',
          'Browser IndexedDB storage could not persist the binary attachment, but your evidence metadata was saved.'
        );
      } else {
        onToast('success', 'Evidence saved to Vault', `"${result.item.name}" has been added.`);
      }
      setAddModalOpen(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const deletedName = deleteTarget.name;
    await onDeleteEvidence(deleteTarget.id);
    setDeleteTarget(null);
    onToast('info', 'Evidence deleted', `"${deletedName}" was removed from local storage.`);
  };

  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <VisualHeaderCard
        eyebrow="Keep your proof in one place"
        title="My Evidence"
        description="Save payment receipts, chat screenshots, scammer phone numbers, and website links here so everything is ready when you talk to your bank or file a complaint."
        imageSrc={EVIDENCE_IMAGE}
        imageAlt="Organized dark glass folders holding a digital payment receipt with a protective blue padlock"
        actions={
          <button
            type="button"
            onClick={() => openModalWithFile()}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Evidence</span>
          </button>
        }
      />

      {/* Prototype Security Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-xs text-[var(--text-muted)]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" aria-hidden="true" />
        <p className="leading-relaxed">
          <strong className="text-[var(--text-main)]">Saved privately on this device:</strong> Your
          files and notes stay in this browser (using local storage and IndexedDB). Keep original
          bank statements safe too, as this prototype is not an encrypted cloud vault.
        </p>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-7 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-600/10'
            : 'border-[var(--border-strong)] bg-[var(--bg-card)]/60'
        }`}
      >
        <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        <p className="mt-2.5 text-sm font-medium text-[var(--text-main)]">
          Drop screenshots, bank receipts, or PDFs here
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Pick a file from your phone or computer, or log a phone number / transaction ID without a
          file.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3.5 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-elevated)] whitespace-nowrap"
          >
            Choose File
          </button>
          <button
            type="button"
            onClick={() => openModalWithFile()}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3.5 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 transition-colors hover:bg-[var(--bg-elevated)] whitespace-nowrap"
          >
            Save Note / Number Only
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          aria-label="Upload evidence file"
          className="hidden"
          accept="image/*,.pdf,.txt,.csv,.doc,.docx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) openModalWithFile(f);
            e.target.value = '';
          }}
        />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evidence by name, UTR, phone, URL, or notes..."
            aria-label="Search evidence"
            className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] py-2 pl-9 pr-3 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:flex lg:items-center">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as 'All' | EvidenceCategory)}
            aria-label="Filter by evidence category"
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-xs font-medium text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {EVIDENCE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={caseFilter}
            onChange={(e) => setCaseFilter(e.target.value)}
            aria-label="Filter by associated case"
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-xs font-medium text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
          >
            <option value="All">All Cases</option>
            <option value="unassigned">Unassigned</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title.slice(0, 28)}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            aria-label="Sort evidence by date"
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-xs font-medium text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Evidence Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 py-14 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)]">
            <FolderLock className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--text-main)]">
            {evidence.length === 0 ? 'No evidence items stored yet' : 'No matching evidence found'}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {evidence.length === 0
              ? 'Upload transaction screenshots, save UTR references, or record suspicious numbers to build a strong complaint.'
              : 'Try adjusting your search keywords or clearing active filters.'}
          </p>
          {evidence.length === 0 && (
            <button
              type="button"
              onClick={() => openModalWithFile()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Evidence Item</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const linkedCase = item.caseId ? caseMap.get(item.caseId) : null;
            const isImg = item.fileType?.startsWith('image/');
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-xs text-[var(--text-muted)]">
                      {isImg ? (
                        <FileImage className="h-4 w-4 shrink-0 text-sky-500" aria-hidden="true" />
                      ) : item.fileName ? (
                        <FileText className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
                      ) : (
                        <File className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                      )}
                      <span className="truncate font-medium text-[var(--text-main)]">
                        {item.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="whitespace-nowrap tabular-nums">
                        {formatDisplayDate(item.dateAdded)}
                      </span>
                    </div>
                    {item.isDemo && (
                      <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                        DEMO
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 text-sm font-semibold text-[var(--text-main)]">{item.name}</h3>

                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Case:{' '}
                    <span className="font-mono text-[var(--text-main)]">
                      {linkedCase ? linkedCase.id : 'Unassigned'}
                    </span>
                  </p>

                  {item.transactionDetails && (
                    <p className="mt-2 rounded-lg bg-[var(--bg-main)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--text-main)] break-all">
                      {item.transactionDetails}
                    </p>
                  )}

                  {item.suspiciousContact && (
                    <p className="mt-1.5 text-xs text-[var(--text-muted)] break-all">
                      Contact / URL:{' '}
                      <span className="font-mono text-[var(--text-main)]">
                        {item.suspiciousContact}
                      </span>
                    </p>
                  )}

                  {item.notes && (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--text-muted)]">
                      {item.notes}
                    </p>
                  )}

                  {item.fileName && (
                    <p className="mt-2.5 truncate font-mono text-[11px] text-blue-600 dark:text-sky-400">
                      {item.fileName} {item.fileSize ? `(${formatBytes(item.fileSize)})` : ''}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    aria-label={`Inspect ${item.name}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{item.hasLocalBlob ? 'Preview & Details' : 'View Details'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`Delete ${item.name}`}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-500 whitespace-nowrap"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add Evidence Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-evidence-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <h3 id="add-evidence-title" className="text-base font-semibold text-[var(--text-main)]">
                Add Evidence Item
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                aria-label="Close add evidence dialog"
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvidence} className="mt-4 space-y-4">
              {formError && (
                <p role="alert" className="text-xs font-medium text-red-500">
                  {formError}
                </p>
              )}

              <div>
                <label
                  htmlFor="ev-name"
                  className="block text-xs font-semibold text-[var(--text-main)]"
                >
                  Evidence Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="ev-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., UPI Payment Receipt Screenshot"
                  className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ev-category"
                    className="block text-xs font-semibold text-[var(--text-main)]"
                  >
                    Category
                  </label>
                  <select
                    id="ev-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EvidenceCategory)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                  >
                    {EVIDENCE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ev-case"
                    className="block text-xs font-semibold text-[var(--text-main)]"
                  >
                    Assign to Case
                  </label>
                  <select
                    id="ev-case"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} — {c.title.slice(0, 26)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="ev-file"
                  className="block text-xs font-semibold text-[var(--text-main)]"
                >
                  Attach Image or Document (optional, stored in local IndexedDB)
                </label>
                <input
                  id="ev-file"
                  type="file"
                  accept="image/*,.pdf,.txt,.csv,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setSelectedFile(f);
                    if (f && !name.trim()) {
                      setName(f.name.replace(/\.[^/.]+$/, ''));
                    }
                  }}
                  className="mt-1.5 block w-full text-xs text-[var(--text-muted)] file:mr-3 file:rounded-lg file:border file:border-[var(--border-subtle)] file:bg-[var(--bg-elevated)] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[var(--text-main)]"
                />
                {selectedFile && (
                  <p className="mt-1 font-mono text-[11px] text-blue-600 dark:text-sky-400">
                    Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="ev-tx"
                  className="block text-xs font-semibold text-[var(--text-main)]"
                >
                  Transaction Details / UTR / Account Reference (optional)
                </label>
                <input
                  id="ev-tx"
                  type="text"
                  value={transactionDetails}
                  onChange={(e) => setTransactionDetails(e.target.value)}
                  placeholder="e.g., UTR632419884512 · ₹12,000 · SBI"
                  className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 font-mono text-xs text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="ev-contact"
                  className="block text-xs font-semibold text-[var(--text-main)]"
                >
                  Suspicious Phone Number, Email, or URL (optional)
                </label>
                <input
                  id="ev-contact"
                  type="text"
                  value={suspiciousContact}
                  onChange={(e) => setSuspiciousContact(e.target.value)}
                  placeholder="e.g., +91 98XXXXXX10 or https://suspicious-site.example"
                  className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="ev-notes"
                  className="block text-xs font-semibold text-[var(--text-main)]"
                >
                  Evidence Notes
                </label>
                <textarea
                  id="ev-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Context, timestamps, or what this evidence demonstrates."
                  className="mt-1.5 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-main)] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-2 text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-elevated)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-evidence-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewItem(null);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <h3
                  id="preview-evidence-title"
                  className="text-base font-semibold text-[var(--text-main)]"
                >
                  {previewItem.name}
                </h3>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {previewItem.category} · Added {formatDisplayDate(previewItem.dateAdded)}
                  {previewItem.caseId ? ` · Case ${previewItem.caseId}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                aria-label="Close evidence preview"
                className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-main)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {previewLoading && (
                <p className="py-6 text-center text-xs text-[var(--text-muted)]">
                  Loading local file preview from IndexedDB...
                </p>
              )}

              {!previewLoading && previewUrl && previewItem.fileType?.startsWith('image/') && (
                <div className="overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-2">
                  <img
                    src={previewUrl}
                    alt={previewItem.name}
                    className="mx-auto max-h-[380px] rounded object-contain"
                  />
                </div>
              )}

              {!previewLoading && previewUrl && previewItem.fileType === 'application/pdf' && (
                <iframe
                  src={previewUrl}
                  title={previewItem.name}
                  className="h-[380px] w-full rounded-lg border border-[var(--border-subtle)] bg-white"
                />
              )}

              {!previewLoading && previewText !== null && (
                <pre className="max-h-[300px] overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-4 font-mono text-xs text-[var(--text-main)] whitespace-pre-wrap">
                  {previewText}
                </pre>
              )}

              {!previewLoading && previewUrl && !previewItem.fileType?.startsWith('image/') && previewItem.fileType !== 'application/pdf' && (
                <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-main)] p-4 text-xs text-[var(--text-muted)]">
                  Inline preview is not supported for this file format ({previewItem.fileType || 'unknown'}).{' '}
                  <a
                    href={previewUrl}
                    download={previewItem.fileName || 'evidence-file'}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Download local file
                  </a>
                </div>
              )}

              <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                {previewItem.transactionDetails && (
                  <div className="sm:col-span-2">
                    <dt className="text-[var(--text-muted)]">Transaction Details</dt>
                    <dd className="mt-1 font-mono text-[var(--text-main)]">
                      {previewItem.transactionDetails}
                    </dd>
                  </div>
                )}
                {previewItem.suspiciousContact && (
                  <div className="sm:col-span-2">
                    <dt className="text-[var(--text-muted)]">Suspicious Contact / URL</dt>
                    <dd className="mt-1 font-mono text-[var(--text-main)]">
                      {previewItem.suspiciousContact}
                    </dd>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <dt className="text-[var(--text-muted)]">Notes</dt>
                  <dd className="mt-1 whitespace-pre-wrap leading-relaxed text-[var(--text-main)]">
                    {previewItem.notes || 'No additional notes recorded.'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Evidence Item"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.name}" and any attached local file from your browser? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete Evidence"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
