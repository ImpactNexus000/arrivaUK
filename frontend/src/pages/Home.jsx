import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroHeader from '../components/HeroHeader';
import { getChecklist, getDeals, getBudgetEntries, getMe, getUploadUrl } from '../api';

const ARRIVAL_LABELS = {
  not_arrived: "Getting ready for the UK",
  just_arrived: "Welcome to the UK!",
  been_here: "Making the most of the UK",
};

const tiles = [
  {
    to: '/checklist',
    label: 'Arrival checklist',
    desc: 'Track your tasks',
    color: 'bg-ios-green',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/community',
    label: 'Community',
    desc: 'Tips from students',
    color: 'bg-ios-indigo',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    to: '/guide',
    label: 'Local Guide',
    desc: 'Nearby services',
    color: 'bg-ios-blue',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/deals',
    label: 'Deals',
    desc: 'Best offers',
    color: 'bg-ios-orange',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    to: '/documents',
    label: 'Documents',
    desc: 'Essential docs',
    color: 'bg-ios-red',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    to: '/budget',
    label: 'Budget',
    desc: 'Manage finances',
    color: 'bg-ios-orange',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ checklist: 0, deals: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profile = await getMe();
        setUser(profile);
        localStorage.setItem('arrivauk_user_name', profile.name);
      } catch {
        // Auth failed
      }
      try {
        const items = await getChecklist();
        setStats((s) => ({ ...s, checklist: items.filter((i) => !i.completed).length }));
      } catch {}
      try {
        const deals = await getDeals();
        setStats((s) => ({ ...s, deals: deals.length }));
      } catch {}
      try {
        const budget = await getBudgetEntries();
        const balance = budget.reduce(
          (sum, e) => sum + (e.entry_type === 'income' ? e.amount : -e.amount),
          0
        );
        setStats((s) => ({ ...s, balance }));
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const greeting = user
    ? `Welcome, ${user.name}!`
    : 'Welcome to ArriveUK';

  const subtitle = user
    ? ARRIVAL_LABELS[user.arrival_status] || user.university
    : 'Your UK arrival companion';

  if (loading) {
    return (
      <div className="min-h-screen pb-24 flex flex-col">
        <div className="bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] px-5 pt-14 pb-6">
          <div className="h-7 w-48 bg-white/15 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-white/10 rounded mt-2 animate-pulse" />
          <div className="flex gap-3 mt-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 rounded-xl h-16 flex-1 animate-pulse" />
            ))}
          </div>
        </div>
        <div className="px-4 py-4 flex-1">
          <div className="h-4 w-24 bg-black/[0.06] rounded mb-3 animate-pulse" />
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[18px] border border-black/[0.08] h-28 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <HeroHeader title={greeting} subtitle={subtitle}>
        {user && (
          <div className="flex items-center justify-between mt-1">
            <p className="text-[12px] text-white/50">{user.university}</p>
            <Link to="/profile" className="-mt-8">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                {user.profile_picture ? (
                  <img src={getUploadUrl(user.profile_picture)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}
        <div className="flex gap-3 mt-3">
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-[20px] font-bold text-white">{stats.checklist}</p>
            <p className="text-[11px] text-white/60">Tasks left</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-[20px] font-bold text-white">{stats.deals}</p>
            <p className="text-[11px] text-white/60">Deals</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-[20px] font-bold text-white">
              {stats.balance >= 0 ? '+' : ''}£{stats.balance.toFixed(0)}
            </p>
            <p className="text-[11px] text-white/60">Balance</p>
          </div>
        </div>
      </HeroHeader>

      <div className="px-4 py-4 flex-1 flex flex-col">
        <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider px-1 pt-2 pb-2">
          Quick Access
        </p>
        <div className="grid grid-cols-2 gap-2.5 flex-1">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              to={tile.to}
              className="bg-white rounded-[18px] border border-black/[0.08] p-4 shadow-sm no-underline flex flex-col justify-center"
            >
              <div className={`w-10 h-10 ${tile.color} rounded-xl flex items-center justify-center mb-2.5`}>
                {tile.icon}
              </div>
              <p className="text-[15px] font-semibold text-black">{tile.label}</p>
              <p className="text-[12px] text-[#AEAEB2] mt-0.5">{tile.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
