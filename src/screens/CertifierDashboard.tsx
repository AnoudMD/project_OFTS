'use client';

import { useState } from 'react';
import {
  Award, CheckCircle, XCircle, Clock, List,
  LogOut, AlertCircle, ChevronRight
} from 'lucide-react';
import { AppCard } from '@/src/components/AppCard';
import { StatCard } from '@/src/components/StatCard';
import { BatchCard } from '@/src/components/BatchCard';
import { AppButton } from '@/src/components/AppButton';
import { BottomNav, type NavItem } from '@/src/components/BottomNav';
import { LeafLogo } from '@/src/components/LeafLogo';
import { StatusBadge } from '@/src/components/StatusBadge';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/Toast';
import { BatchListScreen } from './BatchListScreen';
import { BatchDetailScreen } from './BatchDetailScreen';
import { ReviewBatchScreen } from './ReviewBatchScreen';

type Tab = 'dashboard' | 'pending' | 'all';

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Award },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'all', label: 'All Batches', icon: List },
];

interface CertifierDashboardProps {
  onNavigate: (screen: string, params?: Record<string, string>) => void;
}

export function CertifierDashboard({ onNavigate }: CertifierDashboardProps) {
  const { state, logout } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [reviewBatchId, setReviewBatchId] = useState<string | null>(null);

  const { user, batches } = state;

  const stats = {
    total: batches.length,
    pending: batches.filter((b) => b.certificationStatus === 'Pending').length,
    approved: batches.filter((b) => b.certificationStatus === 'Approved').length,
    rejected: batches.filter((b) => b.certificationStatus === 'Rejected').length,
  };

  const pendingBatches = batches.filter((b) => b.certificationStatus === 'Pending');

  const handleLogout = () => {
    logout();
    showToast('info', 'Logged out successfully');
    onNavigate('welcome');
  };

  // Review screen
  if (reviewBatchId) {
    return (
      <ReviewBatchScreen
        batchId={reviewBatchId}
        onBack={() => setReviewBatchId(null)}
      />
    );
  }

  // Batch detail
  if (selectedBatchId) {
    return (
      <BatchDetailScreen
        batchId={selectedBatchId}
        onBack={() => setSelectedBatchId(null)}
        onNavigate={onNavigate}
        role="certifier"
        onReview={() => {
          setReviewBatchId(selectedBatchId);
          setSelectedBatchId(null);
        }}
      />
    );
  }

  // Pending tab
  if (tab === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <BatchListScreen
          batches={pendingBatches}
          onSelectBatch={(id) => setSelectedBatchId(id)}
          role="certifier"
          title="Pending Certification"
        />
        <BottomNav items={NAV_ITEMS} active={tab} onSelect={(k) => setTab(k as Tab)} />
      </div>
    );
  }

  // All batches tab
  if (tab === 'all') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <BatchListScreen
          batches={batches}
          onSelectBatch={(id) => setSelectedBatchId(id)}
          role="certifier"
          title="All Batches"
        />
        <BottomNav items={NAV_ITEMS} active={tab} onSelect={(k) => setTab(k as Tab)} />
      </div>
    );
  }

  // Dashboard tab
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-green-700 pt-10 pb-5 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LeafLogo size={44} />
            <div>
              <p className="text-green-200 text-xs font-medium">Certifier Portal</p>
              <h1 className="text-white font-bold text-base leading-tight">{user?.name ?? 'Certifier'}</h1>
              <p className="text-green-200 text-[11px]">{user?.organization}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-500 transition"
          >
            <LogOut size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Total Batches" value={stats.total} icon={List} />
          <StatCard label="Pending Review" value={stats.pending} icon={Clock} color="#92400e" bgColor="#fef3c7" />
          <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="#166534" bgColor="#dcfce7" />
          <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="#991b1b" bgColor="#fee2e2" />
        </div>

        {/* Urgent Alert */}
        {stats.pending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle size={16} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">
                {stats.pending} Batch{stats.pending !== 1 ? 'es' : ''} Awaiting Review
              </p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Review pending batches and provide certification decisions.
              </p>
              <button
                onClick={() => setTab('pending')}
                className="text-xs text-amber-800 font-bold mt-2 flex items-center gap-1 hover:underline"
              >
                Review now <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <AppCard>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <AppButton
              variant="primary"
              size="sm"
              leftIcon={<Clock size={15} />}
              fullWidth
              onClick={() => setTab('pending')}
            >
              Pending ({stats.pending})
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              leftIcon={<List size={15} />}
              fullWidth
              onClick={() => setTab('all')}
            >
              All Batches
            </AppButton>
          </div>
        </AppCard>

        {/* Pending Batches */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold text-gray-800">Awaiting Certification</h3>
            {pendingBatches.length > 3 && (
              <button onClick={() => setTab('pending')} className="text-xs text-green-700 font-semibold">
                View all
              </button>
            )}
          </div>

          {pendingBatches.length === 0 ? (
            <AppCard>
              <div className="flex flex-col items-center py-5 text-center">
                <CheckCircle size={28} className="text-green-400 mb-2" />
                <p className="text-sm font-semibold text-gray-600">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending batches require review.</p>
              </div>
            </AppCard>
          ) : (
            <div className="space-y-2.5">
              {pendingBatches.slice(0, 3).map((batch) => (
                <div
                  key={batch.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
                  onClick={() => setSelectedBatchId(batch.batchId)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate leading-tight">{batch.productName}</p>
                      <p className="text-[11px] font-mono text-green-700 mt-0.5">{batch.batchId}</p>
                    </div>
                    <StatusBadge status={batch.certificationStatus} size="sm" />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{batch.farmName}</p>
                    <button
                      className="text-xs text-green-700 font-bold flex items-center gap-0.5 hover:underline"
                      onClick={(e) => { e.stopPropagation(); setReviewBatchId(batch.batchId); }}
                    >
                      Review <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Reviewed */}
        {stats.approved + stats.rejected > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2.5">Recently Reviewed</h3>
            <div className="space-y-2.5">
              {batches
                .filter((b) => b.certificationStatus === 'Approved' || b.certificationStatus === 'Rejected')
                .slice(0, 3)
                .map((batch) => (
                  <BatchCard
                    key={batch.id}
                    batch={batch}
                    onClick={() => setSelectedBatchId(batch.batchId)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav items={NAV_ITEMS} active={tab} onSelect={(k) => setTab(k as Tab)} />
    </div>
  );
}
