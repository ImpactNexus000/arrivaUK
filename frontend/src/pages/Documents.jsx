import { useEffect, useState } from 'react';
import HeroHeader from '../components/HeroHeader';
import AddModal from '../components/AddModal';
import { getDocuments, seedDocuments, updateDocumentStatus, createDocument, deleteDocument } from '../api';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'travel', label: 'Travel & Visa' },
  { key: 'university', label: 'University' },
  { key: 'financial', label: 'Financial' },
  { key: 'health', label: 'Health' },
  { key: 'housing', label: 'Housing' },
  { key: 'other', label: 'Other' },
];

const STATUS_CONFIG = {
  not_started: { label: 'Not Ready', color: 'bg-[#FF3B30]/10 text-[#FF3B30]', dot: 'bg-[#FF3B30]', next: 'in_progress' },
  in_progress: { label: 'In Progress', color: 'bg-[#FF9500]/10 text-[#FF9500]', dot: 'bg-[#FF9500]', next: 'ready' },
  ready: { label: 'Ready', color: 'bg-[#34C759]/10 text-[#34C759]', dot: 'bg-[#34C759]', next: 'not_started' },
};

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'other', tip: '' });

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        let data = await getDocuments();
        if (!ignore && data.length === 0) {
          data = await seedDocuments();
        }
        if (!ignore) { setDocs(data); setLoading(false); }
      } catch {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  async function reload() {
    try { setDocs(await getDocuments()); } catch {}
  }

  async function cycleStatus(doc) {
    const nextStatus = STATUS_CONFIG[doc.status].next;
    setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: nextStatus } : d));
    try {
      await updateDocumentStatus(doc.id, nextStatus);
    } catch {
      reload();
    }
  }

  async function handleDelete(id) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    try { await deleteDocument(id); } catch { reload(); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createDocument(form);
    setForm({ title: '', description: '', category: 'other', tip: '' });
    setShowAdd(false);
    reload();
  }

  const filtered = filter === 'all' ? docs : docs.filter((d) => d.category === filter);
  const readyCount = docs.filter((d) => d.status === 'ready').length;
  const total = docs.length;
  const pct = total ? Math.round((readyCount / total) * 100) : 0;

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
      <HeroHeader title="Documents" subtitle={`${readyCount} of ${total} documents ready`}>
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-white/50">{pct}% ready</span>
            <span className="text-[12px] text-white/50">{total - readyCount} remaining</span>
          </div>
          <div className="h-2 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-ios-green transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Status summary pills */}
        <div className="flex gap-2 mt-3">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = docs.filter((d) => d.status === key).length;
            return (
              <div key={key} className="bg-white/10 rounded-xl px-3 py-1.5 flex-1 text-center">
                <p className="text-[16px] font-bold text-white">{count}</p>
                <p className="text-[10px] text-white/50">{cfg.label}</p>
              </div>
            );
          })}
        </div>
      </HeroHeader>

      {/* Category filter */}
      <div className="px-4 pt-4 pb-1 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const active = filter === cat.key;
            const count = cat.key === 'all' ? docs.length : docs.filter((d) => d.category === cat.key).length;
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

      {/* Document list */}
      <div className="px-4 py-3 flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[15px] text-[#AEAEB2]">No documents in this category</p>
          </div>
        )}

        {filtered.map((doc) => {
          const cfg = STATUS_CONFIG[doc.status];
          const isExpanded = expandedId === doc.id;

          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden"
            >
              {/* Main row */}
              <div
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : doc.id)}
              >
                {/* Icon */}
                <span className="text-xl flex-shrink-0">{doc.icon || '📄'}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] font-medium ${doc.status === 'ready' ? 'text-[#AEAEB2]' : 'text-black'}`}>
                    {doc.title}
                  </p>
                  {doc.description && !isExpanded && (
                    <p className="text-[12px] text-[#AEAEB2] mt-0.5 truncate">{doc.description}</p>
                  )}
                </div>

                {/* Status badge — tap to cycle */}
                <button
                  onClick={(e) => { e.stopPropagation(); cycleStatus(doc); }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${cfg.color} transition-all active:scale-95`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </button>

                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-[#AEAEB2] flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0">
                  <div className="h-px bg-black/[0.04] mb-3" />

                  {doc.description && (
                    <p className="text-[13px] text-[#6b6b70] leading-relaxed">{doc.description}</p>
                  )}

                  {doc.tip && (
                    <div className="mt-3 bg-ios-blue/[0.06] rounded-xl px-3.5 py-3">
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">💡</span>
                        <p className="text-[12px] text-ios-blue leading-relaxed font-medium">{doc.tip}</p>
                      </div>
                    </div>
                  )}

                  {/* Status buttons */}
                  <div className="flex gap-2 mt-3">
                    {Object.entries(STATUS_CONFIG).map(([key, scfg]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: key } : d));
                          updateDocumentStatus(doc.id, key).catch(() => reload());
                        }}
                        className={`flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                          doc.status === key
                            ? `${scfg.color} ring-1 ring-current`
                            : 'bg-ios-bg text-[#6b6b70]'
                        }`}
                      >
                        {scfg.label}
                      </button>
                    ))}
                  </div>

                  {/* Delete for custom docs */}
                  {!doc.is_default && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="mt-3 w-full py-2 rounded-xl text-[13px] font-medium text-ios-red bg-ios-red/[0.06] hover:bg-ios-red/10 transition-colors"
                    >
                      Remove Document
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add custom document */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3.5 rounded-2xl bg-white border border-dashed border-black/[0.12] text-ios-blue text-[15px] font-medium flex items-center justify-center gap-2 hover:bg-ios-blue/[0.03] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Custom Document
        </button>
      </div>

      {/* Add modal */}
      <AddModal open={showAdd} onClose={() => setShowAdd(false)} title="Add Document">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Document name"
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
          <input
            type="text"
            placeholder="Tip or note (optional)"
            value={form.tip}
            onChange={(e) => setForm({ ...form, tip: e.target.value })}
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

          <button
            type="submit"
            disabled={!form.title.trim()}
            className="w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold tracking-tight mt-1 disabled:opacity-40"
          >
            Add Document
          </button>
        </form>
      </AddModal>
    </div>
  );
}
