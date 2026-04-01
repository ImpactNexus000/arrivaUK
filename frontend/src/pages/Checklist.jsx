import { useEffect, useState } from 'react';
import HeroHeader from '../components/HeroHeader';
import Badge from '../components/Badge';
import AddModal from '../components/AddModal';
import { getChecklist, createChecklistItem, toggleComplete } from '../api';

export default function Checklist() {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });

  const load = async () => {
    try {
      setItems(await getChecklist());
    } catch {
      // API not available
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id) => {
    await toggleComplete(id);
    load();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await createChecklistItem(form);
    setForm({ title: '', description: '' });
    setShowAdd(false);
    load();
  };

  const completed = items.filter((i) => i.completed).length;

  return (
    <div className="pb-24">
      <HeroHeader
        title="Checklist"
        subtitle={`${completed} of ${items.length} completed`}
      >
        {items.length > 0 && (
          <div className="mt-2">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-ios-green transition-all duration-300"
                style={{ width: `${items.length ? (completed / items.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}
      </HeroHeader>

      <div className="px-4 py-4">
        {/* Pending items */}
        {items.filter((i) => !i.completed).length > 0 && (
          <>
            <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider px-1 pt-2 pb-2">
              To Do
            </p>
            <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden">
              {items.filter((i) => !i.completed).map((item, idx, arr) => (
                <div key={item.id}>
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                    onClick={() => handleToggle(item.id)}
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-[#AEAEB2] flex items-center justify-center flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-black">{item.title}</p>
                      {item.description && (
                        <p className="text-[12px] text-[#AEAEB2] mt-0.5 truncate">{item.description}</p>
                      )}
                    </div>
                    <Badge variant="orange">Pending</Badge>
                  </div>
                  {idx < arr.length - 1 && <div className="h-px bg-black/[0.08] ml-[52px]" />}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Completed items */}
        {items.filter((i) => i.completed).length > 0 && (
          <>
            <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider px-1 pt-6 pb-2">
              Completed
            </p>
            <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden">
              {items.filter((i) => i.completed).map((item, idx, arr) => (
                <div key={item.id}>
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                    onClick={() => handleToggle(item.id)}
                  >
                    <div className="w-6 h-6 rounded-full bg-ios-green flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-[#AEAEB2] line-through">{item.title}</p>
                    </div>
                    <Badge variant="green">Done</Badge>
                  </div>
                  {idx < arr.length - 1 && <div className="h-px bg-black/[0.08] ml-[52px]" />}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px] text-[#AEAEB2]">No items yet</p>
          </div>
        )}

        {/* Add button */}
        <button
          onClick={() => setShowAdd(true)}
          className="w-full mt-4 py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight"
        >
          Add Item
        </button>
      </div>

      {/* Add modal */}
      <AddModal open={showAdd} onClose={() => setShowAdd(false)} title="New Checklist Item">
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
