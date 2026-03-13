'use client';

import { useState } from 'react';
import {
  CheckCircle, XCircle, Clock, Package, MapPin,
  Calendar, AlignLeft, FileText, ChevronLeft, Award,
} from 'lucide-react';
import { AppCard } from '@/src/components/AppCard';
import { AppButton } from '@/src/components/AppButton';
import { StatusBadge } from '@/src/components/StatusBadge';
import { TraceabilityTimeline } from '@/src/components/TraceabilityTimeline';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/Toast';
import { formatDate } from '@/src/utils';
import type { CertificationStatus } from '@/src/types';

interface ReviewBatchScreenProps {
  batchId: string;
  onBack: () => void;
}

export function ReviewBatchScreen({ batchId, onBack }: ReviewBatchScreenProps) {
  const { getBatchById, updateBatch, state } = useApp();
  const { showToast } = useToast();
  const batch = getBatchById(batchId);

  const [decision, setDecision] = useState<'Approved' | 'Rejected' | ''>('');
  const [notes, setNotes]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [section, setSection]   = useState<'details' | 'timeline' | 'documents'>('details');

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-green-700 pt-10 pb-4 px-4">
          <button onClick={onBack} className="flex items-center gap-1 text-green-200 mb-4">
            <ChevronLeft size={18} /> Back
          </button>
          <h1 className="text-white font-bold text-lg">Review Batch</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Batch not found.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!decision) {
      showToast('warning', 'Please select Approve or Reject.');
      return;
    }
    setLoading(true);

    setTimeout(() => {
      updateBatch({
        ...batch,
        certificationStatus: decision as CertificationStatus,
        certifierNotes: notes.trim() || undefined,
        reviewedAt: new Date().toISOString(),
        reviewedBy: state.user?.name ?? 'Certifier',
      });
      setLoading(false);
      setDone(true);
      showToast(
        decision === 'Approved' ? 'success' : 'error',
        `Batch ${decision}`,
        `${batch.productName} has been ${decision.toLowerCase()}.`
      );
    }, 700);
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-green-700 pt-10 pb-4 px-4">
          <h1 className="text-white font-bold text-lg">Review Complete</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${
            decision === 'Approved' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {decision === 'Approved'
              ? <CheckCircle size={40} className="text-green-600" />
              : <XCircle size={40} className="text-red-500" />}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Batch {decision}
          </h2>
          <p className="text-sm text-gray-500 mb-2">{batch.productName}</p>
          <p className="text-xs font-mono text-green-700 mb-6">{batch.batchId}</p>
          <AppButton variant="primary" fullWidth onClick={onBack} className="max-w-xs">
            Back to Dashboard
          </AppButton>
        </div>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      {/* Header */}
      <div className="bg-green-700 pt-10 pb-4 px-4">
        <button onClick={onBack} className="flex items-center gap-1 text-green-200 hover:text-white transition mb-3">
          <ChevronLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Review Batch</h1>
            <p className="text-green-200 text-xs mt-0.5 font-mono">{batch.batchId}</p>
          </div>
          <StatusBadge status={batch.certificationStatus} size="sm" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 bg-green-800/40 rounded-xl p-1">
          {(['details', 'timeline', 'documents'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${
                section === s ? 'bg-white text-green-800 shadow-sm' : 'text-green-200 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4">

        {/* ── DETAILS ── */}
        {section === 'details' && (
          <>
            <AppCard>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Product Information</h3>
              <p className="text-base font-bold text-gray-900 mb-3">{batch.productName}</p>
              <div className="space-y-2">
                <IR icon={<Package size={13} />}  label="Batch ID"  value={batch.batchId}       mono />
                <IR icon={<MapPin size={13} />}   label="Farm"      value={batch.farmName} />
                <IR icon={<MapPin size={13} />}   label="Origin"    value={batch.origin} />
                <IR icon={<Package size={13} />}  label="Category"  value={batch.category} />
                {batch.quantity && <IR icon={<Package size={13} />} label="Quantity" value={batch.quantity} />}
                <IR icon={<Calendar size={13} />} label="Produced"  value={formatDate(batch.productionDate)} />
                <IR icon={<Calendar size={13} />} label="Expires"   value={formatDate(batch.expiryDate)} />
                <IR icon={<Package size={13} />}  label="Producer"  value={batch.producerName} />
              </div>
            </AppCard>

            {batch.notes && (
              <AppCard>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Batch Notes</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{batch.notes}</p>
              </AppCard>
            )}

            <AppCard>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Supply Chain Events</h3>
              <p className="text-2xl font-bold text-green-700">{batch.events.length}</p>
              <p className="text-xs text-gray-500">events across {new Set(batch.events.map((e) => e.location)).size} locations</p>
              <button className="text-xs text-green-700 font-semibold mt-2 hover:underline" onClick={() => setSection('timeline')}>
                View full timeline
              </button>
            </AppCard>
          </>
        )}

        {/* ── TIMELINE ── */}
        {section === 'timeline' && (
          <TraceabilityTimeline events={batch.events} />
        )}

        {/* ── DOCUMENTS ── */}
        {section === 'documents' && (
          batch.certificationDocuments.length === 0 ? (
            <AppCard>
              <div className="flex flex-col items-center py-6 text-center">
                <FileText size={28} className="text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">No documents uploaded</p>
                <p className="text-xs text-gray-400 mt-1">The producer has not attached any certification files.</p>
              </div>
            </AppCard>
          ) : (
            <div className="space-y-2.5">
              {batch.certificationDocuments.map((doc) => (
                <AppCard key={doc.id}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.type} &bull; {doc.size ?? 'Unknown size'}</p>
                    </div>
                  </div>
                </AppCard>
              ))}
            </div>
          )
        )}

        {/* ── DECISION PANEL (always shown) ── */}
        <AppCard className="border-2 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
              <Award size={15} className="text-green-700" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Certification Decision</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button onClick={() => setDecision('Approved')}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition ${
                decision === 'Approved' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'
              }`}>
              <CheckCircle size={22} className={decision === 'Approved' ? 'text-green-600' : 'text-gray-400'} />
              <span className={`text-sm font-bold ${decision === 'Approved' ? 'text-green-700' : 'text-gray-600'}`}>Approve</span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">Grant organic certification</span>
            </button>
            <button onClick={() => setDecision('Rejected')}
              className={`flex flex-col items-center gap-1.5 p-3.5 rounded-xl border-2 transition ${
                decision === 'Rejected' ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-red-300'
              }`}>
              <XCircle size={22} className={decision === 'Rejected' ? 'text-red-500' : 'text-gray-400'} />
              <span className={`text-sm font-bold ${decision === 'Rejected' ? 'text-red-600' : 'text-gray-600'}`}>Reject</span>
              <span className="text-[10px] text-gray-400 text-center leading-tight">Deny certification</span>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <AlignLeft size={12} />
              Certifier Notes {decision === 'Rejected' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                decision === 'Approved' ? 'Optional: Add notes about the approval...'
                : decision === 'Rejected' ? 'Required: Explain why the batch was rejected...'
                : 'Add notes about your decision...'
              }
              rows={3}
              className="w-full rounded-xl border border-gray-200 text-sm px-3 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none leading-relaxed transition"
            />
          </div>
        </AppCard>

        {/* Submit */}
        <div className="flex gap-2 pb-2">
          <AppButton variant="outline" fullWidth onClick={onBack} disabled={loading}>
            Cancel
          </AppButton>
          <AppButton
            variant={decision === 'Rejected' ? 'danger' : 'primary'}
            fullWidth
            loading={loading}
            disabled={!decision}
            onClick={handleSubmit}
            leftIcon={
              decision === 'Approved' ? <CheckCircle size={15} />
              : decision === 'Rejected' ? <XCircle size={15} />
              : <Clock size={15} />
            }
          >
            {decision ? `${decision} Batch` : 'Select Decision'}
          </AppButton>
        </div>
      </div>
    </div>
  );
}

function IR({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-green-600 flex-shrink-0">{icon}</span>
      <span className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</span>
      <span className={`text-xs text-gray-800 font-medium flex-1 min-w-0 truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
