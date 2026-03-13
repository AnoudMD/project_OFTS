'use client';

import { useState } from 'react';
import {
  ShoppingBag, Package, Plus, List, MapPin,
  LogOut, CheckCircle, Clock, TrendingUp, Tag
} from 'lucide-react';
import { AppCard } from '@/src/components/AppCard';
import { StatCard } from '@/src/components/StatCard';
import { BatchCard } from '@/src/components/BatchCard';
import { AppButton } from '@/src/components/AppButton';
import { BottomNav, type NavItem } from '@/src/components/BottomNav';
import { LeafLogo } from '@/src/components/LeafLogo';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/Toast';
import { BatchListScreen } from './BatchListScreen';
import { BatchDetailScreen } from './BatchDetailScreen';
import { AddSupplyChainEventScreen } from './AddSupplyChainEventScreen';

type Tab = 'dashboard' | 'inventory' | 'add-event';

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: ShoppingBag },
  { key: 'inventory', label: 'Inventory', icon: List },
  { key: 'add-event', label: 'Add Event', icon: Plus },
];

interface RetailerDashboardProps {
  onNavigate: (screen: string, params?: Record<string, string>) => void;
}

export function RetailerDashboard({ onNavigate }: RetailerDashboardProps) {
  const { state, logout } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [addEventForBatch, setAddEventForBatch] = useState<string | undefined>(undefined);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const { user, batches } = state;

  // Retailer sees all certified batches
  const certifiedBatches = batches.filter(
    (b) => b.certificationStatus === 'Approved' || b.certificationStatus === 'Certified'
  );
  const distributedBatches = certifiedBatches.filter((b) =>
    b.events.some((e) => e.eventType === 'Distribution')
  );
  const inTransitBatches = certifiedBatches.filter(
    (b) =>
      b.events.some((e) => e.eventType === 'Shipment') &&
      !b.events.some((e) => e.eventType === 'Distribution')
  );

  // Category breakdown
  const categoryCount: Record<string, number> = {};
  certifiedBatches.forEach((b) => {
    categoryCount[b.category] = (categoryCount[b.category] ?? 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const handleLogout = () => {
    logout();
    showToast('info', 'Logged out successfully');
    onNavigate('welcome');
  };

  // Add event screen
  if (showAddEvent || tab === 'add-event') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <AddSupplyChainEventScreen
          onBack={() => {
            setShowAddEvent(false);
            setTab('dashboard');
            setAddEventForBatch(undefined);
          }}
          prefillBatchId={addEventForBatch}
        />
        {tab === 'add-event' && (
          <BottomNav items={NAV_ITEMS} active={tab} onSelect={(k) => setTab(k as Tab)} />
        )}
      </div>
    );
  }

  // Batch detail
  if (selectedBatchId) {
    return (
      <BatchDetailScreen
        batchId={selectedBatchId}
        onBack={() => setSelectedBatchId(null)}
        onNavigate={onNavigate}
        role="retailer"
        onAddEvent={() => {
          setAddEventForBatch(selectedBatchId);
          setSelectedBatchId(null);
          setShowAddEvent(true);
        }}
      />
    );
  }

  // Inventory tab
  if (tab === 'inventory') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <BatchListScreen
          batches={batches}
          onSelectBatch={(id) => setSelectedBatchId(id)}
          role="retailer"
          title="Inventory"
        />
        <BottomNav items={NAV_ITEMS} active={tab} onSelect={(k) => setTab(k as Tab)} />
      </div>
    );
  }

  // ── Dashboard tab ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-green-700 pt-10 pb-5 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LeafLogo size={44} />
            <div>
              <p className="text-green-200 text-xs font-medium">Retailer Portal</p>
              <h1 className="text-white font-bold text-base leading-tight">
                {user?.name ?? 'Retailer'}
              </h1>
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
          <StatCard
            label="Total Batches"
            value={batches.length}
            icon={Package}
          />
          <StatCard
            label="Certified"
            value={certifiedBatches.length}
            icon={CheckCircle}
            color="#166534"
            bgColor="#dcfce7"
          />
          <StatCard
            label="In Transit"
            value={inTransitBatches.length}
            icon={TrendingUp}
            color="#1e40af"
            bgColor="#dbeafe"
          />
          <StatCard
            label="In Store"
            value={distributedBatches.length}
            icon={ShoppingBag}
            color="#065f46"
            bgColor="#d1fae5"
          />
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
              onClick={() => setTab('add-event')}
            >
              Log Retail Event
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              leftIcon={<List size={15} />}
              fullWidth
              onClick={() => setTab('inventory')}
            >
              View Inventory
            </AppButton>
          </div>
        </AppCard>

        {/* Product Categories */}
        {topCategories.length > 0 && (
          <AppCard>
            <div className="flex items-center gap-2 mb-3">
              <Tag size={15} className="text-green-700" />
              <h3 className="text-sm font-bold text-gray-800">Product Categories</h3>
            </div>
            <div className="space-y-2.5">
              {topCategories.map(([cat, count]) => {
                const pct = Math.round((count / certifiedBatches.length) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{cat}</span>
                      <span className="text-xs text-gray-500">
                        {count} batch{count !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </AppCard>
        )}

        {/* Inventory overview */}
        <AppCard>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={15} className="text-green-700" />
            <h3 className="text-sm font-bold text-gray-800">Stock Overview</h3>
          </div>
          <div className="space-y-2.5">
            {[
              {
                label: 'Pending Arrival',
                count: certifiedBatches.filter(
                  (b) => !b.events.some((e) => e.eventType === 'Shipment')
                ).length,
                color: 'bg-yellow-400',
              },
              {
                label: 'In Transit',
                count: inTransitBatches.length,
                color: 'bg-blue-400',
              },
              {
                label: 'In Store',
                count: distributedBatches.length,
                color: 'bg-green-500',
              },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                <span className="text-xs text-gray-600 flex-1">{label}</span>
                <span className="text-xs font-bold text-gray-800">{count}</span>
              </div>
            ))}
          </div>
        </AppCard>

        {/* Recent certified batches */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-bold text-gray-800">Certified Products</h3>
            <button
              onClick={() => setTab('inventory')}
              className="text-xs text-green-700 font-semibold"
            >
              View all
            </button>
          </div>

          {certifiedBatches.length === 0 ? (
            <AppCard>
              <div className="flex flex-col items-center py-5 text-center">
                <Clock size={28} className="text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-500">No certified products yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Products will appear once they are certified.
                </p>
              </div>
            </AppCard>
          ) : (
            <div className="space-y-2.5">
              {certifiedBatches.slice(0, 3).map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={batch}
                  onClick={() => setSelectedBatchId(batch.batchId)}
                  showRole
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav
        items={NAV_ITEMS}
        active={tab}
        onSelect={(k) => setTab(k as Tab)}
      />
    </div>
  );
}
