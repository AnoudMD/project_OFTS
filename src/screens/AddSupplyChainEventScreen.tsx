'use client';

import { useState } from 'react';
import { MapPin, Calendar, AlignLeft, ChevronDown, CheckCircle, Hash, Plus } from 'lucide-react';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { EventTypeBadge } from '@/src/components/EventTypeBadge';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/Toast';
import { generateId } from '@/src/utils';
import { EVENT_TYPES } from '@/src/constants';
import type { EventType, SupplyChainEvent } from '@/src/types';

interface AddSupplyChainEventScreenProps {
  onBack: () => void;
  prefillBatchId?: string;
}

interface FormData {
  batchId: string;
  eventType: EventType | '';
  location: string;
  timestamp: string;
  notes: string;
}

interface FormErrors {
  batchId?: string;
  eventType?: string;
  location?: string;
  timestamp?: string;
}

const EVENT_DESCRIPTIONS: Record<EventType, string> = {
  Harvest:         'Initial crop or product harvest from the farm',
  Processing:      'Processing, milling, or manufacturing step',
  'Quality Check': 'Quality inspection or certification audit',
  Packaging:       'Packaging, labeling, or sealing',
  Shipment:        'Dispatch or transport to distribution',
  Distribution:    'Receipt and stocking at distribution point',
  Retail:          'Product received at retail location',
};

export function AddSupplyChainEventScreen({ onBack, prefillBatchId }: AddSupplyChainEventScreenProps) {
  const { state, addEvent } = useApp();
  const { showToast } = useToast();
  const { user, batches } = state;

  const eligibleBatches = batches.filter((b) => b.certificationStatus !== 'Rejected');

  const [form, setForm] = useState<FormData>({
    batchId:   prefillBatchId ?? '',
    eventType: '',
    location:  '',
    timestamp: new Date().toISOString().slice(0, 16),
    notes:     '',
  });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key: keyof FormData) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const selectedBatch = batches.find((b) => b.batchId === form.batchId);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.batchId)           e.batchId    = 'Please select a batch.';
    if (!form.eventType)         e.eventType  = 'Please select an event type.';
    if (!form.location.trim())   e.location   = 'Location is required.';
    if (!form.timestamp)         e.timestamp  = 'Date and time is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !user) return;
    setLoading(true);

    setTimeout(() => {
      const event: SupplyChainEvent = {
        id:        generateId(),
        batchId:   form.batchId,
        eventType: form.eventType as EventType,
        location:  form.location.trim(),
        timestamp: new Date(form.timestamp).toISOString(),
        notes:     form.notes.trim() || undefined,
        actorRole: user.role,
        actorName: user.name,
      };
      addEvent(form.batchId, event);
      setLoading(false);
      setSuccess(true);
      showToast('success', 'Event Saved!', `${form.eventType} recorded for ${form.batchId}`);
    }, 700);
  };

  const handleReset = () => {
    setForm({
      batchId:   prefillBatchId ?? '',
      eventType: '',
      location:  '',
      timestamp: new Date().toISOString().slice(0, 16),
      notes:     '',
    });
    setErrors({});
    setSuccess(false);
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScreenHeader title="Event Recorded" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event Recorded!</h2>
          <p className="text-sm text-gray-500 mb-1">Supply chain event successfully added.</p>
          {selectedBatch && (
            <p className="text-sm font-semibold text-green-700 mb-6">{selectedBatch.productName}</p>
          )}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6 w-full max-w-xs text-left space-y-1.5">
            <Row label="Batch"    value={form.batchId}    mono />
            <Row label="Event"    value={form.eventType} />
            <Row label="Location" value={form.location} />
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <AppButton variant="primary"  fullWidth onClick={onBack}>Back to Dashboard</AppButton>
            <AppButton variant="outline"  fullWidth onClick={handleReset}>Add Another Event</AppButton>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      <ScreenHeader
        title="Add Supply Chain Event"
        subtitle="Record a new step in the product journey"
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4">

        {/* Batch Selection */}
        <AppCard>
          <SH icon={<Hash size={15} className="text-green-700" />} title="Select Batch" />
          <FF label="Batch" required error={errors.batchId}>
            <div className="relative">
              <select value={form.batchId} onChange={(e) => set('batchId')(e.target.value)}
                className={`w-full appearance-none rounded-xl border text-sm px-3 py-2.5 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.batchId ? 'border-red-400 bg-red-50' : 'border-gray-200'
                } ${!form.batchId ? 'text-gray-400' : 'text-gray-800'}`}>
                <option value="" disabled>Select a batch...</option>
                {eligibleBatches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>{b.batchId} — {b.productName}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FF>
          {selectedBatch && (
            <div className="mt-2.5 bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-xs font-semibold text-green-800">{selectedBatch.productName}</p>
              <p className="text-[11px] text-green-600 mt-0.5">{selectedBatch.farmName} &bull; {selectedBatch.origin}</p>
            </div>
          )}
        </AppCard>

        {/* Event Type */}
        <AppCard>
          <SH icon={<ChevronDown size={15} className="text-green-700" />} title="Event Type" />
          <FF label="Event Type" required error={errors.eventType}>
            <div className="relative">
              <select value={form.eventType} onChange={(e) => set('eventType')(e.target.value)}
                className={`w-full appearance-none rounded-xl border text-sm px-3 py-2.5 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.eventType ? 'border-red-400 bg-red-50' : 'border-gray-200'
                } ${!form.eventType ? 'text-gray-400' : 'text-gray-800'}`}>
                <option value="" disabled>Select event type...</option>
                {EVENT_TYPES.map((et) => <option key={et} value={et}>{et}</option>)}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </FF>
          {form.eventType && (
            <div className="mt-2.5 flex items-start gap-2.5">
              <EventTypeBadge eventType={form.eventType as EventType} />
              <p className="text-xs text-gray-500 leading-relaxed flex-1">
                {EVENT_DESCRIPTIONS[form.eventType as EventType]}
              </p>
            </div>
          )}
          {/* Quick-select chips */}
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 font-medium mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-1.5">
              {EVENT_TYPES.map((et) => (
                <button key={et}
                  onClick={() => { set('eventType')(et); setErrors((e) => ({ ...e, eventType: undefined })); }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition ${
                    form.eventType === et
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700'
                  }`}>
                  {et}
                </button>
              ))}
            </div>
          </div>
        </AppCard>

        {/* Location & Time */}
        <AppCard>
          <SH icon={<MapPin size={15} className="text-green-700" />} title="Location & Time" />
          <div className="space-y-3.5">
            <FF label="Location" required error={errors.location}>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="text" value={form.location} onChange={(e) => set('location')(e.target.value)}
                  placeholder="e.g. EcoRoute Logistics Hub, Manila"
                  className={`w-full rounded-xl border text-sm pl-9 pr-3 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.location ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`} />
              </div>
            </FF>
            <FF label="Date & Time" required error={errors.timestamp}>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="datetime-local" value={form.timestamp} onChange={(e) => set('timestamp')(e.target.value)}
                  className={`w-full rounded-xl border text-sm pl-9 pr-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                    errors.timestamp ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`} />
              </div>
            </FF>
          </div>
        </AppCard>

        {/* Notes */}
        <AppCard>
          <SH icon={<AlignLeft size={15} className="text-green-700" />} title="Notes (optional)" />
          <textarea value={form.notes} onChange={(e) => set('notes')(e.target.value)}
            placeholder="Add details about this event..." rows={3}
            className="w-full rounded-xl border border-gray-200 text-sm px-3 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none leading-relaxed transition" />
        </AppCard>

        {/* Actor info */}
        {user && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-green-800">{user.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-800">{user.name}</p>
              <p className="text-[11px] text-green-600 capitalize">{user.role} &bull; {user.organization}</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2 pb-2">
          <AppButton variant="outline" fullWidth onClick={onBack} disabled={loading}>Cancel</AppButton>
          <AppButton variant="primary" fullWidth loading={loading} onClick={handleSave} leftIcon={<Plus size={16} />}>
            Save Event
          </AppButton>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function SH({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">{icon}</div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
  );
}

function FF({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold text-gray-800 text-right max-w-[160px] truncate ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
