import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroHeader from '../components/HeroHeader';
import { getChecklist, getDeals, getBudgetEntries } from '../api';

const tiles = [
  {
    to: '/checklist',
    label: 'Checklist',
    desc: 'Track your tasks',
    color: 'bg-ios-green',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/deals',
    label: 'Deals',
    desc: 'Best offers',
    color: 'bg-ios-blue',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
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
  {
    to: '/checklist',
    label: 'Documents',
    desc: 'Essential docs',
    color: 'bg-ios-indigo',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [stats, setStats] = useState({ checklist: 0, deals: 0, balance: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [items, deals, budget] = await Promise.all([
          getChecklist(),
          getDeals(),
          getBudgetEntries(),
        ]);
        const balance = budget.reduce(
          (sum, e) => sum + (e.entry_type === 'income' ? e.amount : -e.amount),
          0
        );
        setStats({
          checklist: items.filter((i) => !i.completed).length,
          deals: deals.length,
          balance,
        });
      } catch {
        // API not available yet
      }
    }
    load();
  }, []);

  return (
    <div className="pb-24">
      <HeroHeader title="ArriveUK" subtitle="Your UK arrival companion">
        <div className="flex gap-3 mt-2">
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

      <div className="px-4 py-4">
        <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider px-1 pt-2 pb-2">
          Quick Access
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              to={tile.to}
              className="bg-white rounded-[18px] border border-black/[0.08] p-4 shadow-sm no-underline"
            >
              <div className={`w-10 h-10 ${tile.color} rounded-xl flex items-center justify-center mb-3`}>
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
