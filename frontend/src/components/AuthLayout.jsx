export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen lg:flex">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute w-[320px] h-[320px] rounded-full border-[24px] border-white/[0.05] -bottom-[96px] -right-[96px] pointer-events-none" />
        <div className="absolute w-[220px] h-[220px] rounded-full border-[18px] border-white/[0.04] -bottom-[66px] -right-[66px] pointer-events-none" />
        <div className="absolute w-[130px] h-[130px] rounded-full border-[12px] border-white/[0.03] -bottom-[39px] -right-[39px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-[380px]">
          {/* Logo */}
          <div className="w-[96px] h-[96px] rounded-[28px] bg-white/[0.12] backdrop-blur-sm border border-white/[0.15] flex items-center justify-center text-[52px] mx-auto mb-7">
            🇬🇧
          </div>
          <h2 className="text-[42px] font-bold text-white tracking-tight leading-tight">ArrivaUK</h2>
          <p className="text-[17px] text-white/50 mt-3 leading-relaxed">
            Your all-in-one guide to settling into student life in the United Kingdom.
          </p>

          {/* Feature list */}
          <div className="mt-10 flex flex-col gap-4 text-left">
            {[
              'Personalised arrival checklist',
              'Student deals & savings',
              'Budget tracker',
              'Document vault',
              'Local guide',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-ios-green/25 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-ios-green" fill="none" viewBox="0 0 10 8">
                    <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[15px] text-white/65">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
