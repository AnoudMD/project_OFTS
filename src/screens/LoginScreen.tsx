'use client';

import { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, LogIn, ChevronDown } from 'lucide-react';
import { LeafLogo } from '@/src/components/LeafLogo';
import { AppButton } from '@/src/components/AppButton';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/Toast';
import { MOCK_USERS, MOCK_PASSWORD } from '@/src/data/mockData';
import type { UserRole } from '@/src/types';

// ─── Demo accounts ─────────────────────────────────────────────────────────────
const ROLE_OPTIONS: { value: UserRole; label: string; desc: string; email: string }[] = [
  { value: 'producer',    label: 'Producer',    desc: 'Create and manage product batches',    email: 'producer@ofts.com' },
  { value: 'certifier',   label: 'Certifier',   desc: 'Review and certify organic batches',   email: 'certifier@ofts.com' },
  { value: 'distributor', label: 'Distributor', desc: 'Manage logistics and shipments',       email: 'distributor@ofts.com' },
  { value: 'retailer',    label: 'Retailer',    desc: 'Track and sell organic products',      email: 'retailer@ofts.com' },
];

interface LoginScreenProps {
  onNavigate: (screen: string, params?: Record<string, string>) => void;
}

export function LoginScreen({ onNavigate }: LoginScreenProps) {
  const { login } = useApp();
  const { showToast } = useToast();

  const [role, setRole]         = useState<UserRole | ''>('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!role)         e.role     = 'Please select your role.';
    if (!email.trim()) e.email    = 'Email is required.';
    if (!password)     e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Mock login — always works offline ─────────────────────────────────────
  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);

    // Simulate a short network delay for realism
    setTimeout(() => {
      // Find mock user by email OR by role (demo buttons pre-fill email)
      const mockUser =
        MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ??
        MOCK_USERS.find((u) => u.role === role);

      if (!mockUser) {
        setErrors({ email: 'No account found. Use a demo account below.' });
        setLoading(false);
        return;
      }

      if (password !== MOCK_PASSWORD) {
        setErrors({ password: `Wrong password. Demo password: ${MOCK_PASSWORD}` });
        setLoading(false);
        return;
      }

      // Successful mock login
      login(mockUser);
      showToast('success', `Welcome, ${mockUser.name}!`, `Signed in as ${mockUser.role}`);
      onNavigate(`${mockUser.role}-dashboard`);
    }, 600);
  };

  // ── Fill demo credentials ──────────────────────────────────────────────────
  const fillDemo = (r: UserRole) => {
    const user = MOCK_USERS.find((u) => u.role === r);
    if (user) {
      setRole(r);
      setEmail(user.email);
      setPassword(MOCK_PASSWORD);
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Green header */}
      <div className="bg-green-700 pt-12 pb-8 px-5">
        <button
          onClick={() => onNavigate('welcome')}
          className="flex items-center gap-1 text-green-200 hover:text-white transition mb-6"
        >
          <ChevronLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-4">
          <LeafLogo size={52} />
          <div>
            <h1 className="text-xl font-extrabold text-white">Supply Chain Login</h1>
            <p className="text-green-200 text-xs mt-0.5">OFTS Partner Portal</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pt-6 pb-8 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => { setRole(e.target.value as UserRole); setErrors((p) => ({ ...p, role: '' })); }}
                className={`w-full appearance-none rounded-xl border text-sm px-3 py-2.5 pr-9 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
                  errors.role ? 'border-red-400 bg-red-50' : 'border-gray-200'
                } ${!role ? 'text-gray-400' : 'text-gray-800'}`}
              >
                <option value="" disabled>Select your role...</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
              placeholder="your@email.com"
              className={inputCls(!!errors.email)}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                placeholder="Enter password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className={`${inputCls(!!errors.password)} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <AppButton
            fullWidth
            size="lg"
            loading={loading}
            onClick={handleLogin}
            leftIcon={<LogIn size={18} />}
            className="mt-2"
          >
            Sign In
          </AppButton>
        </div>

        {/* Quick Demo Login */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-700 mb-1">Quick Demo Login</p>
          <p className="text-[11px] text-gray-400 mb-3">
            Password for all accounts: <span className="font-mono font-semibold text-gray-600">{MOCK_PASSWORD}</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => fillDemo(r.value)}
                className="flex flex-col items-start p-3 rounded-xl border border-gray-200 hover:border-green-400 hover:bg-green-50 transition text-left group"
              >
                <span className="text-xs font-bold text-gray-800 group-hover:text-green-700 capitalize">{r.label}</span>
                <span className="text-[10px] font-mono text-green-600 mt-0.5">{r.email}</span>
                <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-[11px] text-green-700 font-medium text-center leading-relaxed">
            This is a demo app. All data is stored locally and resets on refresh.
          </p>
        </div>
      </div>
    </div>
  );
}

function inputCls(hasError: boolean): string {
  return [
    'w-full rounded-xl border text-sm px-3 py-2.5 bg-white text-gray-800 placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition',
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200',
  ].join(' ');
}
