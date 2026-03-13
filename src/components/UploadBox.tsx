'use client';

import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { useRef } from 'react';

interface UploadBoxProps {
  fileName?: string;
  onFileSelect: (name: string) => void;
  onClear: () => void;
  accept?: string;
  error?: string;
}

export function UploadBox({ fileName, onFileSelect, onClear, accept = '.pdf,.png,.jpg,.jpeg', error }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file.name);
  };

  if (fileName) {
    return (
      <div className={`rounded-xl border-2 border-green-300 bg-green-50 p-4 ${error ? 'border-red-300 bg-red-50' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{fileName}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <CheckCircle size={11} className="text-green-600" />
              <p className="text-xs text-green-600">Document attached</p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-green-100 transition"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-2 transition hover:bg-gray-50 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          <Upload size={20} className="text-green-700" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">Upload Certification Document</p>
          <p className="text-xs text-gray-400 mt-0.5">Tap to browse — PDF, PNG, JPG accepted</p>
        </div>
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
