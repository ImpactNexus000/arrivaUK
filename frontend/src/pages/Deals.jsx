import { useEffect, useState } from 'react';
import Badge from '../components/Badge';
import AddModal from '../components/AddModal';
import { getDeals, createDeal } from '../api';

const CATEGORIES = ['All', 'Travel', 'Finance', 'Housing', 'Shopping', 'Other'];

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: '', link: '' });

  const load = async () => {
    try {
      setDeals(await getDeals());
    } catch {
      // API not available
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createDeal({ ...form, category: form.category || null, link: form.link || null });
    setForm({ title: '', description: '', category: '', link: '' });
    setShowAdd(false);
    load();
  };

  const filtered = filter === 'All' ? deals : deals.filter((d) => d.category === filter);

  const categoryBadge = (cat) => {
    const map = { Travel: 'blue', Finance: 'green', Housing: 'purple', Shopping: 'orange' };
    return map[cat] || 'gray';
  };

  return (
    <div className="pb-24">
      {/* White header */}
      <div className="bg-white border-b border-black/[0.08] px-5 pb-4 pt-14">
        <h1 className="text-[26px] font-bold tracking-tight text-black">Deals</h1>
        <p className="text-[14px] text-[#6b6b70] mt-1">{deals.length} offers available</p>

        {/* Filter chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
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
              <div className="w-1.5 bg-navy flex-shrink-0" />
              <div className="p-3.5 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-black">{deal.title}</p>
                    {deal.description && (
                      <p className="text-[13px] text-[#3C3C43] mt-1 leading-relaxed">{deal.description}</p>
                    )}
                  </div>
                  {deal.category && <Badge variant={categoryBadge(deal.category)}>{deal.category}</Badge>}
                </div>
                {deal.link && (
                  <a
                    href={deal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-ios-blue mt-2 inline-block"
                  >
                    View Deal →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="w-full mt-4 py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight"
        >
          Add Deal
        </button>
      </div>

      <AddModal open={showAdd} onClose={() => setShowAdd(false)} title="New Deal">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue bg-white"
          >
            <option value="">Category (optional)</option>
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="url"
            placeholder="Link (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
          />
          <button
            type="submit"
            className="w-full py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight mt-1"
          >
            Add
          </button>
        </form>
      </AddModal>
    </div>
  );
}
