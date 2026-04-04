export default function HeroHeader({ title, subtitle, children }) {
  return (
    <div className="relative bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] px-5 pb-7 pt-14 lg:px-10 lg:pt-10 lg:pb-10 overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute w-44 h-44 rounded-full border-[18px] border-white/[0.05] -top-12 -right-12" />
      <div className="absolute w-28 h-28 rounded-full border-[12px] border-white/[0.04] bottom-4 -left-8" />

      <h1 className="text-[26px] lg:text-[32px] font-bold tracking-tight text-white relative z-10">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[14px] text-white/70 mt-1 relative z-10">{subtitle}</p>
      )}
      {children && <div className="relative z-10 mt-4">{children}</div>}
    </div>
  );
}
