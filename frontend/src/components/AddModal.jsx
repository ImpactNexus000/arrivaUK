import { useEffect } from 'react';

export default function AddModal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center animate-fade-backdrop" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="relative w-full lg:max-w-[480px] bg-white rounded-t-2xl lg:rounded-2xl p-5 pb-20 lg:pb-5 animate-slide-up lg:animate-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle — mobile only */}
        <div className="w-10 h-1 bg-[#AEAEB2] rounded-full mx-auto mb-4 lg:hidden" />

        <h2 className="text-[17px] font-semibold text-black mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
