'use client';

import { Package, Plus, List, CheckCircle, Clock, XCircle, AlertCircle, LogOut } from 'lucide-react';
import { AppCard } from '@/src/components/AppCard';
import { StatCard } from '@/src/components/StatCard';
import { BatchCard } from '@/src/components/BatchCard';
import { AppButton } from '@/src/components/AppButton';
import { BottomNav, type NavItem } from '@/src/components/BottomNav';
import { LeafLogo } from '@/src/components/LeafLogo';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/Toast';
import { useState } from 'react';
import { CreateBatchScreen } from './CreateBatchScreen';
import { BatchListScreen } from './BatchListScreen';
import { BatchDetailScreen } from './BatchDetailScreen';

type Tab = 'dashboard' | 'create' | 'batches';

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Package },
  { key: 'create', label: 'New Batch', icon: Plus },
  { key: 'batches', label: 'My Batches', icon: List },
];

interface ProducerDashboardProps {
  onNavigate: (screen: string, params?: Record<string, string>) => void;
}

export function ProducerDashboard({ onNavigate }: ProducerDashboardProps) {
  const { state, logout } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const { user } = state;
  const myBatches = state.batches.filter((b) => b.producerId === user?.id);

  const stats = {
    total: myBatches.length,
    approved: myBatches.filter((b) => b.certificationStatus === 'Approved').length,
    pending: myBatches.filter((b) => b.certificationStatus === 'Pending').length,
    rejected: myBatches.filter((b) => b.certificationStatus === 'Rejected').length,
  };

  const handleLogout = () => {
    logout();
    showToast('info', 'Logged out successfully');
    onNavigate('welcome');
  };

  if (selectedBatchId) {
    return (
      <BatchDetailScreen
        batchId={selectedBatchId}
        onBack={() => setSelectedBatchId(null)}
        onNavigate={onNavigate}
        role="producer"
      />
    );
  }

  if (tab === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <CreateBatchScreen onNavigate={onNavigate} onSuccess={() => setTab('batches')} />
        <BottomNav items={NAV_ITEMS} active={tab} onSelect={(k) => setTab(k as Tab)} />
      </div>
    );
  }

  if (tab === 'batches') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <BatchListScreen
          batches={myBatches}
          onSelectBatch={(id) => setSelectedBatchId(id)}
          role="producer"
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
              <p className="text-green-200 text-xs font-medium">Producer Portal</p>
              <h1 className="text-white font-bold text-base leading-tight">{user?.name ?? 'Producer'}</h1>
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
          <StatCard label="Total Batches" value={stats.total} icon={Package} />
          <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="#166534" bgColor="#dcfce7" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="#92400e" bgColor="#fef3c7" />
          <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="#991b1b" bgColor="#fee2e2" />
        </div>

        {/* Quick Actions */}
        <AppCard>
          <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <AppButton
              variant="primary"
              size="sm"
              leftIcon={<Plus size={15} />}
              fullWidth
              onClick={() => setTab('create')}
            >
              Create Batch
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              leftIcon={<List size={15} />}
              fullWidth
              onClick={() => setTab('batches')}
            >
              View Batches
            </AppButton>
          </div>
        </AppCard>

        {/* Recent Batches */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold text-gray-800">Recent Batches</h3>
            <button onClick={() => setTab('batches')} className="text-xs text-green-700 font-semibold">
              View all
            </button>
          </div>
          {myBatches.length === 0 ? (
            <AppCard>
              <div className="flex flex-col items-center py-5 text-center">
                <Package size={32} className="text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">No batches yet</p>
                <p className="text-xs text-gray-400 mt-1">Create your first batch to get started.</p>
              </div>
            </AppCard>
          ) : (
            <div className="space-y-2.5">
              {myBatches.slice(0, 3).map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onClick={() => setSelectedBatchId(batch.batchId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Certification Alert */}
        {stats.rejected > 0 && (
          <AppCard>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={16} className="text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Action Required</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {stats.rejected} batch{stats.rejected !== 1 ? 'es' : ''} {stats.rejected !== 1 ? 'have' : 'has'} been rejected. Please review and resubmit with required documentation.
                </p>
                <button
                  onClick={() => setTab('batches')}
                  className="text-xs text-red-600 font-semibold mt-2"
                >
                  Review rejected batches
                </button>
              </div>
            </div>
          </AppCard>
        )}
      </div>

      <BottomNav items={NAV_ITEMS} active={tab} onSelect={(k) => setTab(k as Tab)} />
    </div>
  );
}
