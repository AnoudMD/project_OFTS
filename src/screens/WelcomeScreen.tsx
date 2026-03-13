'use client';

import { useState } from 'react';
import { QrCode, Search, LogIn, ScanLine, AlertCircle, Clock } from 'lucide-react';
import { LeafLogo } from '@/src/components/LeafLogo';
import { AppButton } from '@/src/components/AppButton';
import { useApp } from '@/src/context/AppContext';
import { VALID_BATCH_IDS } from '@/src/data/mockData';
import { generateId } from '@/src/utils';
import type { ScanRecord } from '@/src/types';

interface WelcomeScreenProps {
  onNavigate: (screen: string, params?: Record<string, string>) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  const { state, addScanRecord } = useApp();
  const [code, setCode]         = useState('');
  const [error, setError]       = useState('');
  const [scanning, setScanning] = useState(false);

  // ── Search / manual lookup ─────────────────────────────────────────────────
  const handleSearch = () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter a batch ID or QR code.');
      return;
    }

    const batch = state.batches.find((b) => b.batchId === trimmed);
    if (!batch) {
      setError(`No product found for "${trimmed}". Try: OT-2025-001234`);
      return;
    }

    setError('');
    const record: ScanRecord = {
      id: generateId(),
      batchId: batch.batchId,
      scannedAt: new Date().toISOString(),
      productName: batch.productName,
      farmName: batch.farmName,
      certificationStatus: batch.certificationStatus,
    };
    addScanRecord(record);
    onNavigate('traceability-result', { batchId: batch.batchId });
  };

  // ── Simulated QR scan ──────────────────────────────────────────────────────
  const handleMockScan = () => {
    if (scanning) return;
    setScanning(true);
    setError('');

    // Always pick the first (featured) batch for a reliable demo
    const targetId = VALID_BATCH_IDS[0]; // OT-2025-001234

    setTimeout(() => {
      const batch = state.batches.find((b) => b.batchId === targetId);
      if (batch) {
        const record: ScanRecord = {
          id: generateId(),
          batchId: batch.batchId,
          scannedAt: new Date().toISOString(),
          productName: batch.productName,
          farmName: batch.farmName,
          certificationStatus: batch.certificationStatus,
        };
        addScanRecord(record);
        setCode(batch.batchId);
        setScanning(false);
        onNavigate('traceability-result', { batchId: batch.batchId });
      } else {
        setScanning(false);
      }
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 via-green-600 to-green-800 flex flex-col">

      {/* Hero */}
      <div className="flex-shrink-0 pt-14 pb-8 px-6 flex flex-col items-center text-center">
        <LeafLogo size={80} className="mb-5 shadow-lg" />
        <h1 className="text-2xl font-extrabold text-white leading-tight">
          Organic Food Traceability
        </h1>
        <p className="text-xl font-extrabold text-green-200 leading-tight">System</p>
        <p className="text-green-100 text-sm mt-3 leading-relaxed opacity-90 max-w-xs">
          Verify the authenticity and journey of your organic food — from farm to table.
        </p>
      </div>

      {/* White card */}
      <div className="flex-1 bg-white rounded-t-3xl px-5 pt-7 pb-8 shadow-2xl">

        {/* Scan QR button */}
        <button
          onClick={handleMockScan}
          disabled={scanning}
          className="w-full bg-green-700 hover:bg-green-800 active:scale-[0.98] text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-base shadow-md shadow-green-900/20 transition-all duration-150 disabled:opacity-70"
        >
          {scanning ? (
            <>
              <ScanLine size={22} className="animate-pulse" />
              Scanning QR Code...
            </>
          ) : (
            <>
              <QrCode size={22} />
              Scan QR Code
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or enter manually</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Manual entry */}
        <div className="space-y-3">
          <div className="relative">
            <QrCode size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. OT-2025-001234"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition font-mono ${
                error ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <AppButton
            fullWidth
            size="md"
            variant="secondary"
            onClick={handleSearch}
            leftIcon={<Search size={16} />}
          >
            Search Product
          </AppButton>
        </div>

        {/* Sample batch IDs */}
        <div className="mt-5 bg-green-50 rounded-xl p-3.5 border border-green-100">
          <p className="text-xs font-bold text-green-700 mb-2">Try these sample batch IDs:</p>
          <div className="flex flex-wrap gap-1.5">
            {VALID_BATCH_IDS.slice(0, 3).map((id) => (
              <button
                key={id}
                onClick={() => { setCode(id); setError(''); }}
                className="text-[11px] font-mono bg-white border border-green-200 text-green-700 rounded-lg px-2 py-1 hover:bg-green-100 transition"
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">supply chain partners</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Supply Chain Login */}
        <button
          onClick={() => onNavigate('login')}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-green-700 text-green-700 font-bold text-sm hover:bg-green-50 active:scale-[0.98] transition-all duration-150"
        >
          <LogIn size={18} />
          Supply Chain Login
        </button>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => onNavigate('scan-history')}
            className="flex items-center gap-1.5 text-xs text-green-600 font-semibold hover:underline"
          >
            <Clock size={13} />
            Scan History
          </button>
          <p className="text-[11px] text-gray-400">OFTS v1.0</p>
        </div>
      </div>
    </div>
  );
}
