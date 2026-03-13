'use client';

import { useState } from 'react';
import { Clock, ChevronRight, Package } from 'lucide-react';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SearchBar } from '@/src/components/SearchBar';
import { FilterChips } from '@/src/components/FilterChips';
import { StatusBadge } from '@/src/components/StatusBadge';
import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { STATUS_FILTERS } from '@/src/constants';
import { formatDateTime } from '@/src/utils';
import type { StatusFilter } from '@/src/types';

interface ScanHistoryScreenProps {
  onNavigate: (screen: string, params?: Record<string, string>) => void;
}

export function ScanHistoryScreen({ onNavigate }: ScanHistoryScreenProps) {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const filtered = state.scanHistory.filter((s) => {
    const matchSearch =
      !search ||
      s.productName.toLowerCase().includes(search.toLowerCase()) ||
      s.batchId.toLowerCase().includes(search.toLowerCase()) ||
      s.farmName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.certificationStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      <ScreenHeader
        title="Scan History"
        subtitle={`${state.scanHistory.length} product${state.scanHistory.length !== 1 ? 's' : ''} scanned`}
        onBack={() => onNavigate('welcome')}
      />

      <div className="px-4 pt-4 space-y-3 flex-1 overflow-y-auto">
        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products or batch IDs..."
        />

        {/* Status Filters */}
        <FilterChips
          filters={STATUS_FILTERS as unknown as string[]}
          active={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
        />

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No scan records"
            description={
              search || statusFilter !== 'All'
                ? 'No records match your current filters.'
                : 'Scanned products will appear here.'
            }
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-150"
                onClick={() => onNavigate('traceability-result', { batchId: record.batchId })}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate leading-tight">{record.productName}</p>
                    <p className="text-[11px] font-mono text-green-700 mt-0.5">{record.batchId}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <StatusBadge status={record.certificationStatus} size="sm" />
                    <ChevronRight size={15} className="text-gray-400" />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Package size={11} className="text-green-600" />
                    {record.farmName}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} className="text-green-600" />
                    {formatDateTime(record.scannedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
