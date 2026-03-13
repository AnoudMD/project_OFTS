'use client';

import { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SearchBar } from '@/src/components/SearchBar';
import { FilterChips } from '@/src/components/FilterChips';
import { BatchCard } from '@/src/components/BatchCard';
import { EmptyState } from '@/src/components/EmptyState';
import { STATUS_FILTERS } from '@/src/constants';
import type { ProductBatch, StatusFilter, UserRole } from '@/src/types';

interface BatchListScreenProps {
  batches: ProductBatch[];
  onSelectBatch: (batchId: string) => void;
  role?: UserRole;
  title?: string;
  onBack?: () => void;
}

export function BatchListScreen({
  batches,
  onSelectBatch,
  role = 'producer',
  title = 'Product Batches',
  onBack,
}: BatchListScreenProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch =
        !search ||
        b.productName.toLowerCase().includes(search.toLowerCase()) ||
        b.batchId.toLowerCase().includes(search.toLowerCase()) ||
        b.farmName.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'All' || b.certificationStatus === statusFilter;

      const bDate = b.createdAt.split('T')[0];
      const matchStart = !startDate || bDate >= startDate;
      const matchEnd = !endDate || bDate <= endDate;

      return matchSearch && matchStatus && matchStart && matchEnd;
    });
  }, [batches, search, statusFilter, startDate, endDate]);

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { All: batches.length };
    batches.forEach((b) => {
      counts[b.certificationStatus] = (counts[b.certificationStatus] ?? 0) + 1;
    });
    return counts;
  }, [batches]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      <ScreenHeader
        title={title}
        subtitle={`${batches.length} batch${batches.length !== 1 ? 'es' : ''} total`}
        onBack={onBack}
        rightAction={
          <button
            onClick={() => setShowDateFilters((v) => !v)}
            className={`text-xs font-semibold px-2 py-1 rounded-lg transition ${
              showDateFilters ? 'bg-green-100 text-green-700' : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Filters
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
        {/* Search */}
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by product, batch ID, farm..."
        />

        {/* Date Filters */}
        {showDateFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 space-y-2.5 animate-in slide-in-from-top-1 duration-200">
            <p className="text-xs font-semibold text-gray-600">Date Range Filter</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-medium">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-gray-400 font-medium">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs border border-gray-200 rounded-xl px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
                />
              </div>
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear dates
              </button>
            )}
          </div>
        )}

        {/* Status Filters */}
        <FilterChips
          filters={STATUS_FILTERS as unknown as string[]}
          active={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          counts={countByStatus}
        />

        {/* Results count */}
        {filtered.length !== batches.length && (
          <p className="text-xs text-gray-500 font-medium">
            Showing {filtered.length} of {batches.length} batches
          </p>
        )}

        {/* Batch list */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No batches found"
            description={
              search || statusFilter !== 'All' || startDate || endDate
                ? 'No batches match your current filters. Try adjusting your search or filters.'
                : role === 'producer'
                  ? 'You have not created any batches yet. Use "New Batch" to get started.'
                  : 'No product batches are available.'
            }
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
                onClick={() => onSelectBatch(batch.batchId)}
                showRole={role === 'certifier' || role === 'distributor' || role === 'retailer'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
