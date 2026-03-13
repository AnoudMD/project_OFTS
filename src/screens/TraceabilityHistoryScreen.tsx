'use client';

import { Package, MapPin, Calendar, Tag } from 'lucide-react';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StatusBadge } from '@/src/components/StatusBadge';
import { TraceabilityTimeline } from '@/src/components/TraceabilityTimeline';
import { AppCard } from '@/src/components/AppCard';
import { useApp } from '@/src/context/AppContext';
import { formatDate } from '@/src/utils';

interface TraceabilityHistoryScreenProps {
  batchId: string;
  onNavigate: (screen: string, params?: Record<string, string>) => void;
}

export function TraceabilityHistoryScreen({ batchId, onNavigate }: TraceabilityHistoryScreenProps) {
  const { getBatchById } = useApp();
  const batch = getBatchById(batchId);

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScreenHeader title="Traceability History" onBack={() => onNavigate('traceability-result', { batchId })} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Batch not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      <ScreenHeader
        title="Traceability History"
        subtitle={batch.batchId}
        onBack={() => onNavigate('traceability-result', { batchId: batch.batchId })}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4">

        {/* Batch Summary */}
        <AppCard>
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-gray-900 leading-tight">{batch.productName}</h2>
              <p className="text-[11px] text-green-700 font-mono mt-0.5">{batch.batchId}</p>
            </div>
            <StatusBadge status={batch.certificationStatus} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-y-2 gap-x-4">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Farm</p>
                <p className="text-xs text-gray-700 font-medium">{batch.farmName}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag size={12} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Category</p>
                <p className="text-xs text-gray-700 font-medium">{batch.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Production</p>
                <p className="text-xs text-gray-700 font-medium">{formatDate(batch.productionDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Expiry</p>
                <p className="text-xs text-gray-700 font-medium">{formatDate(batch.expiryDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin size={12} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Origin</p>
                <p className="text-xs text-gray-700 font-medium">{batch.origin}</p>
              </div>
            </div>
            {batch.quantity && (
              <div className="flex items-center gap-1.5">
                <Package size={12} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400">Quantity</p>
                  <p className="text-xs text-gray-700 font-medium">{batch.quantity}</p>
                </div>
              </div>
            )}
          </div>

          {batch.notes && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <p className="text-[10px] text-gray-400 mb-1">Batch Notes</p>
              <p className="text-xs text-gray-600 leading-relaxed">{batch.notes}</p>
            </div>
          )}
        </AppCard>

        {/* Journey Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Events', value: batch.events.length },
            { label: 'Actors', value: new Set(batch.events.map((e) => e.actorRole)).size },
            { label: 'Locations', value: new Set(batch.events.map((e) => e.location)).size },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
              <p className="text-xl font-bold text-green-700">{value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Full Timeline */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Complete Journey Timeline</h3>
          <TraceabilityTimeline events={batch.events} />
        </div>

        {/* Certifier Notes */}
        {batch.certifierNotes && (
          <AppCard>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={12} className="text-blue-600" />
              </div>
              <h4 className="text-xs font-bold text-gray-700">Certifier Notes</h4>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{batch.certifierNotes}</p>
            {batch.reviewedAt && (
              <p className="text-[10px] text-gray-400 mt-1.5">
                Reviewed on {formatDate(batch.reviewedAt)} by {batch.reviewedBy ?? 'Certifier'}
              </p>
            )}
          </AppCard>
        )}
      </div>
    </div>
  );
}
