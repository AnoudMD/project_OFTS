'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle size={18} className="text-green-600" />,
    error: <XCircle size={18} className="text-red-500" />,
    warning: <AlertCircle size={18} className="text-yellow-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 left-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm mx-auto">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto bg-white rounded-xl shadow-lg border border-gray-100 border-l-4 ${borderColors[t.type]} p-3.5 flex items-start gap-3 animate-in slide-in-from-top-2 duration-200`}
          >
            <span className="flex-shrink-0 mt-0.5">{icons[t.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{t.title}</p>
              {t.message && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{t.message}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
