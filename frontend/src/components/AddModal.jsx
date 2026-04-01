export default function AddModal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#AEAEB2] rounded-full mx-auto mb-4" />

        <h2 className="text-[17px] font-semibold text-black mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
