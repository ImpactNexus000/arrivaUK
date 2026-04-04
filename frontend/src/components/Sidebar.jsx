import { NavLink, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMe, getUploadUrl } from '../api';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Home',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      </svg>
    ),
  },
  {
    to: '/checklist',
    label: 'Checklist',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 11l3 3L22 4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    to: '/deals',
    label: 'Deals',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 2l2.79 5.65 6.21.9-4.5 4.38 1.06 6.19L12.5 16.2l-5.56 2.92 1.06-6.19-4.5-4.38 6.21-.9L12.5 2z" />
      </svg>
    ),
  },
  {
    to: '/budget',
    label: 'Budget',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
      </svg>
    ),
  },
  {
    to: '/documents',
    label: 'Documents',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    to: '/community',
    label: 'Community',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    to: '/guide',
    label: 'Local Guide',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="10" r="3" />
        <path d="M12 2a8 8 0 00-8 8c0 5.4 7.05 11.5 7.35 11.76a1 1 0 001.3 0C12.95 21.5 20 15.4 20 10a8 8 0 00-8-8z" />
      </svg>
    ),
  },
  {
    to: '/more',
    label: 'More',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe().then(setUser).catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex w-[240px] flex-shrink-0 bg-navy flex-col h-screen sticky top-0 relative overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute w-[300px] h-[300px] rounded-full border-[30px] border-white/[0.03] -top-[120px] -right-[120px] pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] rounded-full border-[20px] border-white/[0.04] -top-[80px] -right-[80px] pointer-events-none" />

      {/* Logo */}
      <div className="px-6 pt-8 pb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-[38px] h-[38px] rounded-xl bg-white/[0.12] border border-white/[0.15] flex items-center justify-center text-xl flex-shrink-0">
            🇬🇧
          </div>
          <div>
            <div className="text-[17px] font-bold text-white tracking-tight">ArrivaUK</div>
            <div className="text-[10px] text-white/40 tracking-widest uppercase">Student Companion</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 flex flex-col gap-0.5">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-white/30 px-3 pb-2">
          Menu
        </div>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl no-underline transition-all duration-150 group ${
                isActive
                  ? 'bg-white/[0.14]'
                  : 'hover:bg-white/[0.07]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-white' : 'text-white/45'}>
                  {item.icon}
                </span>
                <span className={`text-[14px] tracking-tight ${
                  isActive ? 'font-semibold text-white' : 'font-normal text-white/50'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ios-blue" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* User profile card */}
      <div className="px-4 pb-7 pt-5">
        <Link
          to="/profile"
          className="bg-white/[0.08] border border-white/[0.08] rounded-[14px] px-3.5 py-3 flex items-center gap-2.5 no-underline hover:bg-white/[0.12] transition-colors"
        >
          {user ? (
            <>
              <div className="w-9 h-9 rounded-xl bg-[#E5F0FF] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.profile_picture ? (
                  <img src={getUploadUrl(user.profile_picture)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[13px] font-bold text-[#1558B0]">
                    {user.name.charAt(0).toUpperCase()}{user.name.split(' ')[1]?.charAt(0).toUpperCase() || ''}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">{user.name}</div>
                <div className="text-[11px] text-white/40 truncate">{user.university}</div>
              </div>
            </>
          ) : (
            <div className="text-[13px] text-white/50">Loading...</div>
          )}
        </Link>
      </div>
    </aside>
  );
}
