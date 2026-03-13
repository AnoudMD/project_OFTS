'use client';

import { ChevronRight, Package, Calendar } from 'lucide-react';
import type { ProductBatch } from '@/src/types';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/src/utils';

interface BatchCardProps {
  batch: ProductBatch;
  onClick?: () => void;
  showChevron?: boolean;
  /** Show the producer name as an extra detail row */
  showRole?: boolean;
}

export function BatchCard({ batch, onClick, showChevron = true, showRole = false }: BatchCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 ${
        onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-150' : ''
      }`}
      onClick={onClick}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">{batch.productName}</p>
          <p className="text-xs text-green-700 font-mono mt-0.5">{batch.batchId}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge status={batch.certificationStatus} size="sm" />
          {showChevron && <ChevronRight size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Details row */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
        <span className="flex items-center gap-1">
          <Package size={12} className="text-green-600" />
          {batch.farmName}
        </span>
        <span className="text-gray-300">|</span>
        <span className="flex items-center gap-1">
          <Calendar size={12} className="text-green-600" />
          {formatDate(batch.productionDate)}
        </span>
      </div>

      {/* Producer info (for certifier/distributor/retailer views) */}
      {showRole && (
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
          <span className="bg-green-50 text-green-700 rounded-full px-2 py-0.5 font-medium capitalize">
            {batch.producerName}
          </span>
          <span>&bull;</span>
          <span>{batch.origin}</span>
        </div>
      )}

      {/* Events count */}
      {batch.events.length > 0 && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <div className="flex -space-x-1">
            {batch.events.slice(0, 4).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full border border-white"
                style={{ backgroundColor: i % 2 === 0 ? '#166534' : '#22c55e' }}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">
            {batch.events.length} supply chain event{batch.events.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
