'use client';

import { useState, useRef } from 'react';
import {
  Plus, FileText, Upload, X, Calendar, Package,
  MapPin, Hash, AlignLeft, CheckCircle,
} from 'lucide-react';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/Toast';
import { generateBatchId, generateId } from '@/src/utils';
import type { ProductBatch, CertificationDocument } from '@/src/types';

const CATEGORIES = ['Coffee', 'Tea', 'Grains', 'Spices', 'Oils', 'Cacao', 'Fruits', 'Vegetables', 'Herbs', 'Other'];

interface CreateBatchScreenProps {
  onNavigate?: (screen: string, params?: Record<string, string>) => void;
  onSuccess?: () => void;
}

interface FormData {
  productName: string;
  farmName: string;
  category: string;
  origin: string;
  quantity: string;
  productionDate: string;
  expiryDate: string;
  notes: string;
}

interface FormErrors {
  productName?: string;
  farmName?: string;
  category?: string;
  origin?: string;
  productionDate?: string;
  expiryDate?: string;
}

interface UploadedFile {
  name: string;
  size: string;
}

export function CreateBatchScreen({ onSuccess }: CreateBatchScreenProps) {
  const { state, addBatch } = useApp();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    productName: '', farmName: '', category: '', origin: '',
    quantity: '', productionDate: '', expiryDate: '', notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const set = (key: keyof FormData) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.productName.trim()) e.productName = 'Product name is required.';
    if (!form.farmName.trim())    e.farmName    = 'Farm name is required.';
    if (!form.category)           e.category    = 'Please select a category.';
    if (!form.origin.trim())      e.origin      = 'Origin is required.';
    if (!form.productionDate)     e.productionDate = 'Production date is required.';
    if (!form.expiryDate)         e.expiryDate  = 'Expiry date is required.';
    if (form.productionDate && form.expiryDate && form.expiryDate <= form.productionDate)
      e.expiryDate = 'Expiry date must be after production date.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeLabel = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    setUploadedFile({ name: file.name, size: sizeLabel });
    e.target.value = '';
  };

  const handleCreate = () => {
    if (!validate()) return;
    setLoading(true);

    setTimeout(() => {
      const batchId = generateBatchId();
      const user = state.user!;

      const certDocs: CertificationDocument[] = uploadedFile
        ? [{
            id: generateId(),
            name: uploadedFile.name,
            type: uploadedFile.name.toLowerCase().endsWith('.pdf') ? 'PDF'
              : uploadedFile.name.toLowerCase().endsWith('.jpg') || uploadedFile.name.toLowerCase().endsWith('.jpeg') ? 'JPG' : 'PNG',
            size: uploadedFile.size,
            uploadedAt: new Date().toISOString(),
          }]
        : [];

      const newBatch: ProductBatch = {
        id: generateId(),
        batchId,
        productName: form.productName.trim(),
        farmName: form.farmName.trim(),
        producerName: user.name,
        producerId: user.id,
        category: form.category,
        origin: form.origin.trim(),
        productionDate: form.productionDate,
        expiryDate: form.expiryDate,
        quantity: form.quantity.trim() || undefined,
        notes: form.notes.trim() || undefined,
        certificationStatus: 'Pending',
        certificationDocuments: certDocs,
        events: [{
          id: generateId(),
          batchId,
          eventType: 'Harvest',
          location: form.farmName.trim(),
          timestamp: new Date(form.productionDate + 'T08:00:00').toISOString(),
          notes: 'Initial harvest — batch registered in OFTS',
          actorRole: 'producer',
          actorName: user.name,
        }],
        createdAt: new Date().toISOString(),
      };

      addBatch(newBatch);
      setSuccess(batchId);
      setLoading(false);
      showToast('success', 'Batch Created!', `ID: ${batchId}`);
    }, 900);
  };

  const handleReset = () => {
    setForm({ productName: '', farmName: '', category: '', origin: '', quantity: '', productionDate: '', expiryDate: '', notes: '' });
    setErrors({});
    setUploadedFile(null);
    setSuccess(null);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScreenHeader title="Batch Created" onBack={handleReset} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Batch Created Successfully!</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-2">
            Your product batch has been registered and submitted for certification review.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-6 w-full max-w-xs">
            <p className="text-xs text-green-600 font-semibold mb-1">Batch ID</p>
            <p className="text-lg font-mono font-bold text-green-800">{success}</p>
          </div>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <AppButton variant="primary" fullWidth onClick={() => onSuccess?.()}>View My Batches</AppButton>
            <AppButton variant="outline" fullWidth onClick={handleReset}>Create Another Batch</AppButton>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-6">
      <ScreenHeader
        title="Create Product Batch"
        subtitle="Register a new organic product"
        onBack={() => onSuccess?.()}
      />

      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4">

        {/* Product Details */}
        <AppCard>
          <SectionHeader icon={<Package size={15} className="text-green-700" />} title="Product Details" />
          <div className="space-y-3.5">
            <FormField label="Product Name" required error={errors.productName}>
              <div className="relative">
                <Package size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="text" value={form.productName} onChange={(e) => set('productName')(e.target.value)}
                  placeholder="e.g. Organic Arabica Coffee Beans" className={ic(!!errors.productName, true)} />
              </div>
            </FormField>

            <FormField label="Farm Name" required error={errors.farmName}>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="text" value={form.farmName} onChange={(e) => set('farmName')(e.target.value)}
                  placeholder="e.g. Green Valley Organic Farm" className={ic(!!errors.farmName, true)} />
              </div>
            </FormField>

            <FormField label="Category" required error={errors.category}>
              <div className="relative">
                <select value={form.category} onChange={(e) => set('category')(e.target.value)}
                  className={`${ic(!!errors.category, false)} appearance-none pr-8 ${!form.category ? 'text-gray-400' : 'text-gray-800'}`}>
                  <option value="" disabled>Select category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Hash size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </FormField>

            <FormField label="Origin (Region / Country)" required error={errors.origin}>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="text" value={form.origin} onChange={(e) => set('origin')(e.target.value)}
                  placeholder="e.g. Benguet, Philippines" className={ic(!!errors.origin, true)} />
              </div>
            </FormField>

            <FormField label="Quantity (optional)">
              <input type="text" value={form.quantity} onChange={(e) => set('quantity')(e.target.value)}
                placeholder="e.g. 500 kg" className={ic(false, false)} />
            </FormField>
          </div>
        </AppCard>

        {/* Dates */}
        <AppCard>
          <SectionHeader icon={<Calendar size={15} className="text-green-700" />} title="Dates" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Production Date" required error={errors.productionDate}>
              <input type="date" value={form.productionDate} onChange={(e) => set('productionDate')(e.target.value)}
                className={ic(!!errors.productionDate, false)} />
            </FormField>
            <FormField label="Expiry Date" required error={errors.expiryDate}>
              <input type="date" value={form.expiryDate} onChange={(e) => set('expiryDate')(e.target.value)}
                className={ic(!!errors.expiryDate, false)} />
            </FormField>
          </div>
        </AppCard>

        {/* Notes */}
        <AppCard>
          <SectionHeader icon={<AlignLeft size={15} className="text-green-700" />} title="Batch Notes (optional)" />
          <textarea value={form.notes} onChange={(e) => set('notes')(e.target.value)}
            placeholder="Add any relevant notes about this batch..." rows={3}
            className="w-full rounded-xl border border-gray-200 text-sm px-3 py-2.5 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none leading-relaxed transition" />
        </AppCard>

        {/* Document Upload */}
        <AppCard>
          <SectionHeader icon={<FileText size={15} className="text-green-700" />} title="Certification Document (optional)" />
          <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="hidden" />

          {uploadedFile ? (
            <div className="border border-green-200 bg-green-50 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-green-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{uploadedFile.name}</p>
                  <p className="text-[11px] text-gray-500">{uploadedFile.size}</p>
                </div>
              </div>
              <button onClick={() => setUploadedFile(null)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100 transition">
                <X size={12} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50 rounded-xl p-5 flex flex-col items-center gap-2 transition group">
              <div className="w-10 h-10 bg-gray-100 group-hover:bg-green-100 rounded-full flex items-center justify-center transition">
                <Upload size={18} className="text-gray-400 group-hover:text-green-600 transition" />
              </div>
              <p className="text-sm font-semibold text-gray-700 group-hover:text-green-700 transition">
                Upload Certification Document
              </p>
              <p className="text-xs text-gray-400">PDF, PNG, JPG — max 10 MB</p>
            </button>
          )}
        </AppCard>

        {/* Actions */}
        <div className="flex gap-2 pb-2">
          <AppButton variant="outline" fullWidth onClick={handleReset} disabled={loading}>Cancel</AppButton>
          <AppButton variant="primary" fullWidth loading={loading} onClick={handleCreate} leftIcon={<Plus size={16} />}>
            Create Batch
          </AppButton>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function ic(hasError: boolean, hasPaddingLeft: boolean): string {
  return [
    'w-full rounded-xl border text-sm py-2.5 bg-white text-gray-800 placeholder-gray-400',
    'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition',
    hasPaddingLeft ? 'pl-9 pr-3' : 'px-3',
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200',
  ].join(' ');
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">{icon}</div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
    </div>
  );
}

function FormField({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
