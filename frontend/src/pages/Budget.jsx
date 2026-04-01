import { useEffect, useState } from 'react';
import HeroHeader from '../components/HeroHeader';
import Badge from '../components/Badge';
import AddModal from '../components/AddModal';
import { getBudgetEntries, createBudgetEntry, deleteBudgetEntry } from '../api';

export default function Budget() {
  const [entries, setEntries] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ label: '', amount: '', entry_type: 'expense' });

  const load = async () => {
    try {
      setEntries(await getBudgetEntries());
    } catch {
      // API not available
    }
  };

  useEffect(() => { load(); }, []);

  const income = entries.filter((e) => e.entry_type === 'income').reduce((s, e) => s + e.amount, 0);
  const expenses = entries.filter((e) => e.entry_type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = income - expenses;
  const spendRatio = income > 0 ? Math.min((expenses / income) * 100, 100) : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.amount) return;
    await createBudgetEntry({ ...form, amount: parseFloat(form.amount) });
    setForm({ label: '', amount: '', entry_type: 'expense' });
    setShowAdd(false);
    load();
  };

  const handleDelete = async (id) => {
    await deleteBudgetEntry(id);
    load();
  };

  return (
    <div className="pb-24">
      <HeroHeader title="Budget" subtitle="Track your finances">
        <div className="flex gap-3 mt-2">
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-[18px] font-bold text-ios-green">£{income.toFixed(0)}</p>
            <p className="text-[11px] text-white/60">Income</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-[18px] font-bold text-ios-red">£{expenses.toFixed(0)}</p>
            <p className="text-[11px] text-white/60">Expenses</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className={`text-[18px] font-bold ${balance >= 0 ? 'text-white' : 'text-ios-red'}`}>
              £{balance.toFixed(0)}
            </p>
            <p className="text-[11px] text-white/60">Balance</p>
          </div>
        </div>

        {/* Progress bar */}
        {income > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-white/60 mb-1">
              <span>Spent</span>
              <span>{spendRatio.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${spendRatio > 80 ? 'bg-ios-red' : 'bg-ios-green'}`}
                style={{ width: `${spendRatio}%` }}
              />
            </div>
          </div>
        )}
      </HeroHeader>

      <div className="px-4 py-4">
        {/* Income section */}
        {entries.filter((e) => e.entry_type === 'income').length > 0 && (
          <>
            <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider px-1 pt-2 pb-2">
              Income
            </p>
            <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden">
              {entries.filter((e) => e.entry_type === 'income').map((entry, idx, arr) => (
                <div key={entry.id}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-9 h-9 bg-[#E8F9EE] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-black">{entry.label}</p>
                    </div>
                    <p className="text-[15px] font-semibold text-[#1A7A3A]">+£{entry.amount.toFixed(2)}</p>
                    <button onClick={() => handleDelete(entry.id)} className="ml-1 text-[#AEAEB2]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {idx < arr.length - 1 && <div className="h-px bg-black/[0.08] ml-[52px]" />}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Expenses section */}
        {entries.filter((e) => e.entry_type === 'expense').length > 0 && (
          <>
            <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider px-1 pt-6 pb-2">
              Expenses
            </p>
            <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden">
              {entries.filter((e) => e.entry_type === 'expense').map((entry, idx, arr) => (
                <div key={entry.id}>
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-9 h-9 bg-[#FFEAEA] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#C0392B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-black">{entry.label}</p>
                    </div>
                    <p className="text-[15px] font-semibold text-[#C0392B]">-£{entry.amount.toFixed(2)}</p>
                    <button onClick={() => handleDelete(entry.id)} className="ml-1 text-[#AEAEB2]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {idx < arr.length - 1 && <div className="h-px bg-black/[0.08] ml-[52px]" />}
                </div>
              ))}
            </div>
          </>
        )}

        {entries.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[15px] text-[#AEAEB2]">No entries yet</p>
          </div>
        )}

        <button
          onClick={() => setShowAdd(true)}
          className="w-full mt-4 py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight"
        >
          Add Entry
        </button>
      </div>

      <AddModal open={showAdd} onClose={() => setShowAdd(false)} title="New Budget Entry">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Label"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount (£)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, entry_type: 'expense' })}
              className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-colors ${
                form.entry_type === 'expense'
                  ? 'bg-ios-red text-white'
                  : 'bg-[#F2F2F7] text-black'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, entry_type: 'income' })}
              className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-colors ${
                form.entry_type === 'income'
                  ? 'bg-ios-green text-white'
                  : 'bg-[#F2F2F7] text-black'
              }`}
            >
              Income
            </button>
          </div>
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
