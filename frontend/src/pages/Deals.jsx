import { useEffect, useState } from 'react';
import Badge from '../components/Badge';
import { getDeals, seedDeals } from '../api';

const CATEGORIES = ['All', 'Entertainment', 'Food', 'Travel', 'Tech', 'Shopping', 'Finance', 'Health'];

const INITIAL_COUNT = 8;

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        let data = await getDeals();
        if (!ignore && data.length === 0) {
          data = await seedDeals();
        }
        if (!ignore) setDeals(data);
      } catch {
        // API not available
      }
    })();
    return () => { ignore = true; };
  }, []);

  const allFiltered = filter === 'All' ? deals : deals.filter((d) => d.category === filter);
  const filtered = showAll ? allFiltered : allFiltered.slice(0, INITIAL_COUNT);
  const hasMore = allFiltered.length > filtered.length;

  const categoryBadge = (cat) => {
    const map = {
      Entertainment: 'purple',
      Food: 'orange',
      Travel: 'blue',
      Tech: 'indigo',
      Shopping: 'green',
      Finance: 'green',
      Health: 'red',
    };
    return map[cat] || 'gray';
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.08] px-5 pb-4 pt-14">
        <h1 className="text-[26px] font-bold tracking-tight text-black">Student Deals</h1>
        <p className="text-[14px] text-[#6b6b70] mt-1">
          {deals.length} verified offers — save hundreds in your first month
        </p>

        {/* Filter chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setShowAll(false); }}
              className={`px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors ${
                filter === cat
                  ? 'bg-ios-blue text-white'
                  : 'bg-[#F2F2F7] text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px] text-[#AEAEB2]">No deals found</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-[18px] border border-black/[0.08] flex overflow-hidden"
            >
              {/* Left accent bar */}
              <div className="w-1.5 bg-navy flex-shrink-0" />

              <div className="p-3.5 flex-1 min-w-0">
                {/* Top row: icon + title + badge */}
                <div className="flex items-start gap-2.5">
                  {deal.icon && (
                    <span className="text-[22px] leading-none mt-0.5 flex-shrink-0">{deal.icon}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-black leading-tight">{deal.title}</p>
                        <p className="text-[12px] text-[#8E8E93] mt-0.5">{deal.provider}</p>
                      </div>
                      <Badge variant={categoryBadge(deal.category)}>{deal.category}</Badge>
                    </div>

                    {deal.description && (
                      <p className="text-[13px] text-[#3C3C43] mt-1.5 leading-relaxed">{deal.description}</p>
                    )}

                    {/* Savings pill */}
                    {deal.savings && (
                      <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-ios-green/10 text-ios-green text-[12px] font-bold">
                        {deal.savings}
                      </span>
                    )}

                    {/* How to claim */}
                    {deal.how_to_claim && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <span className="text-[11px] mt-px">📋</span>
                        <p className="text-[12px] text-[#6b6b70] leading-snug">{deal.how_to_claim}</p>
                      </div>
                    )}

                    {/* Claim link */}
                    {deal.link && (
                      <a
                        href={deal.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2.5 px-3.5 py-1.5 rounded-full bg-ios-blue text-white text-[12px] font-semibold"
                      >
                        Claim Deal
                        <span className="text-[11px]">↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-4 py-3.5 rounded-[14px] bg-[#F2F2F7] text-[14px] font-semibold text-[#6b6b70]"
          >
            Show All {allFiltered.length} Deals
          </button>
        )}
      </div>
    </div>
  );
}
