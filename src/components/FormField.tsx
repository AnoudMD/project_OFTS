'use client';

import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface FieldWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldWrapper({ label, error, required, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

// ─── Text Input ───────────────────────────────────────────────────────────────

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
}

export function AppInput({ label, error, leftIcon, className = '', ...props }: AppInputProps) {
  return (
    <FieldWrapper label={label} error={error} required={props.required}>
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span>
        )}
        <input
          {...props}
          className={`w-full rounded-xl border text-sm px-3 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200'
          } ${leftIcon ? 'pl-9' : ''} ${className}`}
        />
      </div>
    </FieldWrapper>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function AppTextarea({ label, error, className = '', ...props }: AppTextareaProps) {
  return (
    <FieldWrapper label={label} error={error} required={props.required}>
      <textarea
        {...props}
        rows={props.rows ?? 3}
        className={`w-full rounded-xl border text-sm px-3 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200'
        } ${className}`}
      />
    </FieldWrapper>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function AppSelect({ label, error, options, placeholder, className = '', ...props }: AppSelectProps) {
  return (
    <FieldWrapper label={label} error={error} required={props.required}>
      <div className="relative">
        <select
          {...props}
          className={`w-full appearance-none rounded-xl border text-sm px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition pr-9 ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200'
          } ${!props.value ? 'text-gray-400' : ''} ${className}`}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </FieldWrapper>
  );
}
