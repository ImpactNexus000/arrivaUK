import { useEffect, useState } from 'react';
import HeroHeader from '../components/HeroHeader';
import Badge from '../components/Badge';
import AddModal from '../components/AddModal';
import { getChecklist, seedChecklist, createChecklistItem, toggleComplete, deleteChecklistItem } from '../api';

const URGENCY_SECTIONS = [
  { key: 'first_week', label: 'First Week', color: 'bg-ios-red', desc: 'Do these as soon as you arrive' },
  { key: 'first_month', label: 'First Month', color: 'bg-ios-orange', desc: 'Settle in within your first few weeks' },
  { key: 'when_settled', label: 'When Settled', color: 'bg-ios-blue', desc: 'Get to these once you\'re comfortable' },
];

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'essentials', label: 'Essentials' },
  { key: 'finance', label: 'Finance' },
  { key: 'transport', label: 'Transport' },
  { key: 'health', label: 'Health' },
  { key: 'housing', label: 'Housing' },
  { key: 'student_life', label: 'Student Life' },
];

const CATEGORY_COLORS = {
  essentials: 'blue',
  finance: 'green',
  transport: 'purple',
  health: 'red',
  housing: 'orange',
  student_life: 'gray',
};

const URGENCY_OPTIONS = [
  { value: 'first_week', label: 'First Week' },
  { value: 'first_month', label: 'First Month' },
  { value: 'when_settled', label: 'When Settled' },
];

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'essentials', urgency: 'first_week' });

  async function load() {
    try {
      setItems(await getChecklist());
    } catch {
      // API not available
    }
  }

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        let data = await getChecklist();
        if (!ignore && data.length === 0) {
          data = await seedChecklist();
        }
        if (!ignore) { setItems(data); setLoading(false); }
      } catch {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const handleToggle = async (id) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, completed: !i.completed } : i));
    try {
      await toggleComplete(id);
    } catch {
      load();
    }
  };

  const handleDelete = async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      await deleteChecklistItem(id);
    } catch {
      load();
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createChecklistItem(form);
    setForm({ title: '', description: '', category: 'essentials', urgency: 'first_week' });
    setShowAdd(false);
    load();
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);
  const total = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const pct = total ? Math.round((completedCount / total) * 100) : 0;

  const toggleCollapse = (key) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center pb-24">
        <svg className="w-8 h-8 animate-spin text-ios-blue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <HeroHeader title="Arrival Checklist" subtitle={`${completedCount} of ${total} tasks completed`}>
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-white/50">{pct}% complete</span>
            <span className="text-[12px] text-white/50">{total - completedCount} remaining</span>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-ios-green transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </HeroHeader>

      {/* Category filter chips */}
      <div className="px-4 pt-4 pb-1 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const active = filter === cat.key;
            const count = cat.key === 'all' ? items.length : items.filter((i) => i.category === cat.key).length;
            return (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                  active
                    ? 'bg-ios-blue text-white shadow-sm'
                    : 'bg-white text-[#6b6b70] border border-black/[0.06]'
                }`}
              >
                {cat.label}
                <span className={`ml-1.5 text-[11px] ${active ? 'text-white/70' : 'text-[#AEAEB2]'}`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgency sections */}
      <div className="px-4 py-3 flex flex-col gap-4">
        {URGENCY_SECTIONS.map((section) => {
          const sectionItems = filtered.filter((i) => i.urgency === section.key);
          if (sectionItems.length === 0) return null;

          const sectionCompleted = sectionItems.filter((i) => i.completed).length;
          const sectionPct = sectionItems.length ? Math.round((sectionCompleted / sectionItems.length) * 100) : 0;
          const isCollapsed = collapsed[section.key];
          const pending = sectionItems.filter((i) => !i.completed);
          const done = sectionItems.filter((i) => i.completed);
          const ordered = [...pending, ...done];

          return (
            <div key={section.key}>
              {/* Section header */}
              <button
                onClick={() => toggleCollapse(section.key)}
                className="w-full flex items-center gap-2.5 px-1 py-2"
              >
                <div className={`w-2 h-2 rounded-full ${section.color}`} />
                <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider flex-1 text-left">
                  {section.label}
                </p>
                <span className="text-[12px] text-[#AEAEB2] mr-1">
                  {sectionCompleted}/{sectionItems.length}
                </span>
                <svg
                  className={`w-4 h-4 text-[#AEAEB2] transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Section progress bar */}
              <div className="h-1 bg-black/[0.04] rounded-full overflow-hidden mb-2 mx-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${section.color}`}
                  style={{ width: `${sectionPct}%` }}
                />
              </div>

              {/* Section description */}
              {!isCollapsed && (
                <p className="text-[12px] text-[#AEAEB2] px-1 mb-2">{section.desc}</p>
              )}

              {/* Task list */}
              {!isCollapsed && (
                <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-sm">
                  {ordered.map((item, idx) => (
                    <div key={item.id}>
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggle(item.id)}
                          className="flex-shrink-0"
                        >
                          {item.completed ? (
                            <div className="w-6 h-6 rounded-full bg-ios-green flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-[#D1D1D6]" />
                          )}
                        </button>

                        {/* Icon */}
                        {item.icon && (
                          <span className="text-lg flex-shrink-0">{item.icon}</span>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-[15px] font-medium ${item.completed ? 'text-[#AEAEB2] line-through' : 'text-black'}`}>
                            {item.title}
                          </p>
                          {item.description && !item.completed && (
                            <p className="text-[12px] text-[#AEAEB2] mt-0.5 line-clamp-2">{item.description}</p>
                          )}
                        </div>

                        {/* Category badge + delete */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Badge variant={CATEGORY_COLORS[item.category] || 'gray'}>
                            {CATEGORIES.find((c) => c.key === item.category)?.label || item.category}
                          </Badge>
                          {!item.is_default && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="w-6 h-6 flex items-center justify-center text-[#AEAEB2] hover:text-ios-red transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      {idx < ordered.length - 1 && <div className="h-px bg-black/[0.04] ml-[52px]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state for filtered view */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[15px] text-[#AEAEB2]">No tasks in this category</p>
          </div>
        )}

        {/* Add custom task */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3.5 rounded-2xl bg-white border border-dashed border-black/[0.12] text-ios-blue text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-ios-blue/[0.03] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Custom Task
        </button>
      </div>

      {/* Add modal */}
      <AddModal open={showAdd} onClose={() => setShowAdd(false)} title="Add Custom Task">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Task title"
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

          {/* Category picker */}
          <div>
            <p className="text-[12px] font-medium text-[#6b6b70] uppercase tracking-wider mb-1.5 px-1">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.key })}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                    form.category === cat.key
                      ? 'bg-ios-blue text-white'
                      : 'bg-ios-bg text-[#6b6b70] border border-black/[0.06]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency picker */}
          <div>
            <p className="text-[12px] font-medium text-[#6b6b70] uppercase tracking-wider mb-1.5 px-1">Urgency</p>
            <div className="flex gap-2">
              {URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, urgency: opt.value })}
                  className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    form.urgency === opt.value
                      ? 'bg-ios-blue text-white'
                      : 'bg-ios-bg text-[#6b6b70] border border-black/[0.06]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!form.title.trim()}
            className="w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold tracking-tight mt-1 disabled:opacity-40"
          >
            Add Task
          </button>
        </form>
      </AddModal>
    </div>
  );
}
