import { useEffect } from 'react';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', variant = 'danger' }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const confirmClass = variant === 'danger'
    ? 'bg-ios-red text-white'
    : 'bg-ios-blue text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-fade-backdrop" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 text-center">
          <h3 className="text-[17px] font-semibold text-black">{title}</h3>
          <p className="text-[14px] text-[#6b6b70] mt-1.5 leading-relaxed">{message}</p>
        </div>
        <div className="border-t border-black/[0.08] flex">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-[15px] font-medium text-ios-blue border-r border-black/[0.08] hover:bg-black/[0.02] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3.5 text-[15px] font-semibold ${confirmClass} hover:opacity-90 transition-opacity`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
