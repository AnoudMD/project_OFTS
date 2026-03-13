'use client';

import { useState, useCallback } from 'react';
import { AppProvider } from '@/src/context/AppContext';
import { ToastProvider } from '@/src/components/Toast';

// ── Screens ───────────────────────────────────────────────────────────────────
import { WelcomeScreen }           from '@/src/screens/WelcomeScreen';
import { LoginScreen }             from '@/src/screens/LoginScreen';
import { TraceabilityResultScreen }  from '@/src/screens/TraceabilityResultScreen';
import { TraceabilityHistoryScreen } from '@/src/screens/TraceabilityHistoryScreen';
import { ScanHistoryScreen }       from '@/src/screens/ScanHistoryScreen';
import { ProducerDashboard }       from '@/src/screens/ProducerDashboard';
import { CertifierDashboard }      from '@/src/screens/CertifierDashboard';
import { DistributorDashboard }    from '@/src/screens/DistributorDashboard';
import { RetailerDashboard }       from '@/src/screens/RetailerDashboard';

// ── Types ─────────────────────────────────────────────────────────────────────
type ScreenName =
  | 'welcome'
  | 'login'
  | 'traceability-result'
  | 'traceability-history'
  | 'scan-history'
  | 'producer-dashboard'
  | 'certifier-dashboard'
  | 'distributor-dashboard'
  | 'retailer-dashboard';

interface NavState {
  screen: ScreenName;
  params: Record<string, string>;
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function OFTSApp() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const [nav, setNav] = useState<NavState>({ screen: 'welcome', params: {} });

  const navigate = useCallback((screen: string, params: Record<string, string> = {}) => {
    setNav({ screen: screen as ScreenName, params });
  }, []);

  const { screen, params } = nav;

  return (
    <div className="min-h-screen bg-green-800 flex items-start justify-center">
      <div className="relative w-full max-w-[430px] min-h-screen bg-gray-50 shadow-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <ScreenRouter screen={screen} params={params} navigate={navigate} />
        </div>
      </div>
    </div>
  );
}

// ── Screen Router ─────────────────────────────────────────────────────────────
interface RouterProps {
  screen: ScreenName;
  params: Record<string, string>;
  navigate: (screen: string, params?: Record<string, string>) => void;
}

function ScreenRouter({ screen, params, navigate }: RouterProps) {
  switch (screen) {
    case 'welcome':
      return <WelcomeScreen onNavigate={navigate} />;

    case 'login':
      return <LoginScreen onNavigate={navigate} />;

    case 'traceability-result':
      return (
        <TraceabilityResultScreen
          batchId={params.batchId ?? ''}
          onNavigate={navigate}
        />
      );

    case 'traceability-history':
      return (
        <TraceabilityHistoryScreen
          batchId={params.batchId ?? ''}
          onNavigate={navigate}
        />
      );

    case 'scan-history':
      return <ScanHistoryScreen onNavigate={navigate} />;

    case 'producer-dashboard':
      return <ProducerDashboard onNavigate={navigate} />;

    case 'certifier-dashboard':
      return <CertifierDashboard onNavigate={navigate} />;

    case 'distributor-dashboard':
      return <DistributorDashboard onNavigate={navigate} />;

    case 'retailer-dashboard':
      return <RetailerDashboard onNavigate={navigate} />;

    default:
      return <WelcomeScreen onNavigate={navigate} />;
  }
}
