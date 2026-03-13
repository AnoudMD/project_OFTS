'use client';

import { CheckCircle, XCircle, Clock, AlertTriangle, Package, MapPin, Calendar, FileText, ChevronRight, Leaf } from 'lucide-react';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { StatusBadge } from '@/src/components/StatusBadge';
import { EventTypeBadge } from '@/src/components/EventTypeBadge';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { useApp } from '@/src/context/AppContext';
import { formatDate, formatDateTime } from '@/src/utils';

interface TraceabilityResultScreenProps {
  batchId: string;
  onNavigate: (screen: string, params?: Record<string, string>) => void;
}

export function TraceabilityResultScreen({ batchId, onNavigate }: TraceabilityResultScreenProps) {
  const { getBatchById } = useApp();
  const batch = getBatchById(batchId);

  if (!batch) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScreenHeader title="Product Not Found" onBack={() => onNavigate('welcome')} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <XCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Batch Not Found</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            The batch ID <span className="font-mono font-semibold text-gray-700">{batchId}</span> could not be found in our system.
          </p>
          <AppButton variant="primary" onClick={() => onNavigate('welcome')}>
            Back to Search
          </AppButton>
        </div>
      </div>
    );
  }

  const certIcon = {
    Approved: <CheckCircle size={16} className="text-green-600" />,
    Certified: <CheckCircle size={16} className="text-green-600" />,
    Pending: <Clock size={16} className="text-yellow-500" />,
    'Under Review': <AlertTriangle size={16} className="text-blue-500" />,
    Rejected: <XCircle size={16} className="text-red-500" />,
  }[batch.certificationStatus];

  const isVerified = batch.certificationStatus === 'Approved' || batch.certificationStatus === 'Certified';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      <ScreenHeader
        title="Traceability Result"
        subtitle={batch.batchId}
        onBack={() => onNavigate('welcome')}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">

        {/* Verified Banner */}
        {isVerified && (
          <div className="bg-green-700 rounded-2xl p-4 flex items-center gap-3 shadow-md shadow-green-900/20">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Certified Organic</p>
              <p className="text-green-200 text-xs mt-0.5">This product has passed all organic certification checks.</p>
            </div>
          </div>
        )}
        {!isVerified && (
          <div
            className="rounded-2xl p-4 flex items-center gap-3"
            style={{
              backgroundColor: batch.certificationStatus === 'Rejected' ? '#fee2e2' : '#fef3c7',
            }}
          >
            <AlertTriangle
              size={20}
              className={batch.certificationStatus === 'Rejected' ? 'text-red-500' : 'text-yellow-600'}
            />
            <div>
              <p className={`font-bold text-sm ${batch.certificationStatus === 'Rejected' ? 'text-red-700' : 'text-yellow-800'}`}>
                {batch.certificationStatus === 'Rejected' ? 'Certification Rejected' : 'Certification Pending'}
              </p>
              <p className={`text-xs mt-0.5 ${batch.certificationStatus === 'Rejected' ? 'text-red-600' : 'text-yellow-700'}`}>
                {batch.certificationStatus === 'Rejected'
                  ? 'This batch did not pass certification. Avoid purchasing.'
                  : 'Certification is currently under review.'}
              </p>
            </div>
          </div>
        )}

        {/* Product Identity Card */}
        <AppCard>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-base font-bold text-gray-900 leading-tight flex-1">{batch.productName}</h2>
            <StatusBadge status={batch.certificationStatus} />
          </div>

          <div className="space-y-2.5">
            <InfoRow icon={<Package size={14} />} label="Batch ID" value={batch.batchId} mono />
            <InfoRow icon={<MapPin size={14} />} label="Farm" value={batch.farmName} />
            <InfoRow icon={<MapPin size={14} />} label="Origin" value={batch.origin} />
            <InfoRow icon={<Package size={14} />} label="Category" value={batch.category} />
            {batch.quantity && <InfoRow icon={<Package size={14} />} label="Quantity" value={batch.quantity} />}
            <InfoRow icon={<Calendar size={14} />} label="Production Date" value={formatDate(batch.productionDate)} />
            <InfoRow icon={<Calendar size={14} />} label="Expiry Date" value={formatDate(batch.expiryDate)} />

            {/* Certification */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-50 mt-1">
              {certIcon}
              <span className="text-xs font-semibold text-gray-600">Certification Status:</span>
              <StatusBadge status={batch.certificationStatus} size="sm" />
            </div>

            {batch.certifierNotes && (
              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                <FileText size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed">{batch.certifierNotes}</p>
              </div>
            )}
          </div>
        </AppCard>

        {/* Supply Chain Events Preview */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold text-gray-800">Supply Chain Events</h3>
            <span className="text-xs text-gray-400">{batch.events.length} recorded</span>
          </div>

          {batch.events.length === 0 ? (
            <AppCard>
              <p className="text-xs text-gray-400 text-center py-3">No events recorded yet.</p>
            </AppCard>
          ) : (
            <AppCard padding="none">
              <div className="divide-y divide-gray-50">
                {batch.events.slice(0, 4).map((event, i) => (
                  <div key={event.id} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <EventTypeBadge eventType={event.eventType} size="sm" />
                      <span className="text-[10px] text-gray-400">{formatDateTime(event.timestamp)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                      <p className="text-xs text-gray-600 truncate">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
              {batch.events.length > 4 && (
                <div className="px-4 py-2.5 border-t border-gray-50">
                  <p className="text-xs text-gray-400 text-center">+{batch.events.length - 4} more events</p>
                </div>
              )}
            </AppCard>
          )}
        </div>

        {/* View Full History Button */}
        <AppButton
          fullWidth
          variant="primary"
          rightIcon={<ChevronRight size={16} />}
          onClick={() => onNavigate('traceability-history', { batchId: batch.batchId })}
        >
          View Full Traceability History
        </AppButton>

        <AppButton
          fullWidth
          variant="outline"
          onClick={() => onNavigate('welcome')}
        >
          Search Another Product
        </AppButton>
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
      <span className="text-xs text-gray-500 flex-shrink-0 w-28">{label}</span>
      <span className={`text-xs text-gray-800 font-medium flex-1 min-w-0 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
