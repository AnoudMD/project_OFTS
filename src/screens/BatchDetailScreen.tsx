'use client';

import { useState } from 'react';
import {
  Package, MapPin, Calendar, FileText, ChevronRight,
  Tag, Download, Plus, User, Leaf
} from 'lucide-react';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StatusBadge } from '@/src/components/StatusBadge';
import { EventTypeBadge } from '@/src/components/EventTypeBadge';
import { TraceabilityTimeline } from '@/src/components/TraceabilityTimeline';
import { AppCard } from '@/src/components/AppCard';
import { AppButton } from '@/src/components/AppButton';
import { useApp } from '@/src/context/AppContext';
import { formatDate, formatDateTime } from '@/src/utils';
import type { UserRole } from '@/src/types';

interface BatchDetailScreenProps {
  batchId: string;
  onBack: () => void;
  onNavigate?: (screen: string, params?: Record<string, string>) => void;
  role?: UserRole;
  onAddEvent?: () => void;
  onReview?: () => void;
}

type DetailTab = 'overview' | 'timeline' | 'documents';

export function BatchDetailScreen({
  batchId,
  onBack,
  onNavigate,
  role = 'consumer',
  onAddEvent,
  onReview,
}: BatchDetailScreenProps) {
  const { getBatchById } = useApp();
  const [tab, setTab] = useState<DetailTab>('overview');
  const batch = getBatchById(batchId);

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScreenHeader title="Batch Detail" onBack={onBack} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Batch not found.</p>
        </div>
      </div>
    );
  }

  const canAddEvent = role === 'distributor' || role === 'retailer' || role === 'producer';
  const canReview = role === 'certifier';
  const isVerified = batch.certificationStatus === 'Approved' || batch.certificationStatus === 'Certified';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      <ScreenHeader
        title="Batch Detail"
        subtitle={batch.batchId}
        onBack={onBack}
      />

      {/* Product identity bar */}
      <div className="bg-green-700 px-4 pb-4 pt-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base leading-tight truncate">{batch.productName}</h2>
            <p className="text-green-200 text-xs mt-0.5">{batch.farmName} &bull; {batch.origin}</p>
          </div>
          <StatusBadge status={batch.certificationStatus} size="sm" className="flex-shrink-0 mt-0.5" />
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-3 bg-green-800/40 rounded-xl p-1">
          {(['overview', 'timeline', 'documents'] as DetailTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition capitalize ${
                tab === t ? 'bg-white text-green-800 shadow-sm' : 'text-green-200 hover:text-white'
              }`}
            >
              {t === 'timeline' ? 'Journey' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">

        {/* ── OVERVIEW TAB */}
        {tab === 'overview' && (
          <>
            {/* Certification banner */}
            {isVerified ? (
              <div className="bg-green-700 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Leaf size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Certified Organic</p>
                  <p className="text-green-200 text-xs">Passed all organic certification checks</p>
                </div>
              </div>
            ) : null}

            {/* Details grid */}
            <AppCard>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Product Info</h3>
              <div className="space-y-2.5">
                <InfoRow icon={<Package size={13} />} label="Batch ID" value={batch.batchId} mono />
                <InfoRow icon={<Tag size={13} />} label="Category" value={batch.category} />
                <InfoRow icon={<MapPin size={13} />} label="Farm" value={batch.farmName} />
                <InfoRow icon={<MapPin size={13} />} label="Origin" value={batch.origin} />
                {batch.quantity && <InfoRow icon={<Package size={13} />} label="Quantity" value={batch.quantity} />}
                <InfoRow icon={<Calendar size={13} />} label="Produced" value={formatDate(batch.productionDate)} />
                <InfoRow icon={<Calendar size={13} />} label="Expires" value={formatDate(batch.expiryDate)} />
                <InfoRow icon={<User size={13} />} label="Producer" value={batch.producerName} />
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <span className="text-xs text-gray-500">Certification:</span>
                  <StatusBadge status={batch.certificationStatus} size="sm" />
                </div>
              </div>
            </AppCard>

            {batch.notes && (
              <AppCard>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Batch Notes</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{batch.notes}</p>
              </AppCard>
            )}

            {batch.certifierNotes && (
              <AppCard>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Certifier Notes</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{batch.certifierNotes}</p>
              </AppCard>
            )}

            {/* Events preview */}
            <AppCard padding="none">
              <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-50">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Supply Chain Events</h3>
                <span className="text-xs font-semibold text-green-700">{batch.events.length}</span>
              </div>
              {batch.events.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No events recorded yet.</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {batch.events.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <EventTypeBadge eventType={ev.eventType} size="sm" />
                        <span className="text-xs text-gray-500 truncate">{ev.location}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDateTime(ev.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
              {batch.events.length > 3 && (
                <button
                  className="w-full text-xs text-green-700 font-semibold py-2.5 border-t border-gray-50 flex items-center justify-center gap-1 hover:bg-green-50 transition"
                  onClick={() => setTab('timeline')}
                >
                  View all {batch.events.length} events <ChevronRight size={13} />
                </button>
              )}
            </AppCard>

            {/* Actions */}
            <div className="space-y-2">
              {canAddEvent && (
                <AppButton
                  variant="secondary"
                  fullWidth
                  leftIcon={<Plus size={15} />}
                  onClick={onAddEvent}
                >
                  Add Supply Chain Event
                </AppButton>
              )}
              {canReview && (
                <AppButton
                  variant="primary"
                  fullWidth
                  leftIcon={<FileText size={15} />}
                  onClick={onReview}
                >
                  Review & Certify Batch
                </AppButton>
              )}
              {onNavigate && (
                <AppButton
                  variant="outline"
                  fullWidth
                  rightIcon={<ChevronRight size={15} />}
                  onClick={() => onNavigate('traceability-history', { batchId: batch.batchId })}
                >
                  Full Traceability View
                </AppButton>
              )}
            </div>
          </>
        )}

        {/* ── TIMELINE TAB */}
        {tab === 'timeline' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Events', value: batch.events.length },
                { label: 'Actors', value: new Set(batch.events.map((e) => e.actorRole)).size },
                { label: 'Locations', value: new Set(batch.events.map((e) => e.location)).size },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
                  <p className="text-xl font-bold text-green-700">{value}</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            <TraceabilityTimeline events={batch.events} />

            {canAddEvent && (
              <AppButton
                variant="secondary"
                fullWidth
                leftIcon={<Plus size={15} />}
                onClick={onAddEvent}
              >
                Add New Event
              </AppButton>
            )}
          </>
        )}

        {/* ── DOCUMENTS TAB */}
        {tab === 'documents' && (
          <>
            {batch.certificationDocuments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center text-center">
                <FileText size={32} className="text-gray-300 mb-3" />
                <p className="text-sm font-semibold text-gray-500">No documents uploaded</p>
                <p className="text-xs text-gray-400 mt-1">Certification documents will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {batch.certificationDocuments.map((doc) => (
                  <AppCard key={doc.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-400">{doc.type} &bull; {doc.size ?? 'Unknown size'}</p>
                          <p className="text-[11px] text-gray-400">Uploaded {formatDate(doc.uploadedAt)}</p>
                        </div>
                      </div>
                      <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-green-50 hover:bg-green-100 transition flex-shrink-0">
                        <Download size={14} className="text-green-700" />
                      </button>
                    </div>
                  </AppCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-green-600 flex-shrink-0">{icon}</span>
      <span className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</span>
      <span className={`text-xs text-gray-800 font-medium flex-1 min-w-0 truncate ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}
