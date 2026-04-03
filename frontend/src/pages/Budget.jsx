import { useEffect, useState } from 'react';
import HeroHeader from '../components/HeroHeader';
import AddModal from '../components/AddModal';
import { useToast } from '../components/Toast';
import { getBudgetEntries, createBudgetEntry, deleteBudgetEntry, getBudgetLimits, setBudgetLimit } from '../api';

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent & Bills', icon: '🏠', color: '#5856D6' },
  { value: 'groceries', label: 'Groceries', icon: '🛒', color: '#34C759' },
  { value: 'transport', label: 'Transport', icon: '🚌', color: '#007AFF' },
  { value: 'eating_out', label: 'Eating Out', icon: '🍽️', color: '#FF9500' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#AF52DE' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#FF2D55' },
  { value: 'health', label: 'Health', icon: '💊', color: '#FF3B30' },
  { value: 'education', label: 'Education', icon: '📚', color: '#0A2342' },
  { value: 'other', label: 'Other', icon: '📎', color: '#8E8E93' },
];

const INCOME_CATEGORIES = [
  { value: 'student_loan', label: 'Student Loan', icon: '🎓' },
  { value: 'part_time', label: 'Part-time Job', icon: '💼' },
  { value: 'family', label: 'Family Support', icon: '👨‍👩‍👧' },
  { value: 'scholarship', label: 'Scholarship', icon: '🏅' },
  { value: 'other_income', label: 'Other', icon: '📎' },
];

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

function getCategoryMeta(value) {
  return ALL_CATEGORIES.find((c) => c.value === value) || { label: value, icon: '📎', color: '#8E8E93' };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function Budget() {
  const [entries, setEntries] = useState([]);
  const [limits, setLimits] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [showSetLimit, setShowSetLimit] = useState(null); // category string or null
  const [limitInput, setLimitInput] = useState('');
  const [form, setForm] = useState({ label: '', amount: '', entry_type: 'expense', category: 'groceries' });
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const load = async () => {
    try {
      const entryData = await getBudgetEntries();
      setEntries(entryData);
    } catch {
      // API not available
    }
    try {
      const limitData = await getBudgetLimits();
      const limMap = {};
      limitData.forEach((l) => { limMap[l.category] = l.amount; });
      setLimits(limMap);
    } catch {
      // Limits not available
    }
  };

  useEffect(() => { load(); }, []);

  const income = entries.filter((e) => e.entry_type === 'income').reduce((s, e) => s + e.amount, 0);
  const expenses = entries.filter((e) => e.entry_type === 'expense').reduce((s, e) => s + e.amount, 0);
  const totalBudget = Object.values(limits).reduce((s, v) => s + v, 0);
  const remaining = income - expenses;
  const spendRatio = income > 0 ? Math.min((expenses / income) * 100, 100) : 0;

  // Category breakdown
  const categoryTotals = entries
    .filter((e) => e.entry_type === 'expense')
    .reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {});

  // Merge: categories with spending OR a limit set
  const allExpenseCats = new Set([...Object.keys(categoryTotals), ...Object.keys(limits)]);
  const sortedCategories = [...allExpenseCats]
    .map((cat) => ({ cat, spent: categoryTotals[cat] || 0, limit: limits[cat] || null }))
    .sort((a, b) => b.spent - a.spent);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.amount || submitting) return;
    setSubmitting(true);
    try {
      await createBudgetEntry({
        label: form.label,
        amount: parseFloat(form.amount),
        entry_type: form.entry_type,
        category: form.category,
      });
      toast(`${form.entry_type === 'expense' ? 'Expense' : 'Income'} added`, 'success');
      setForm({ label: '', amount: '', entry_type: 'expense', category: 'groceries' });
      setShowAdd(false);
      load();
    } catch {
      toast('Failed to add transaction', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudgetEntry(id);
      toast('Transaction deleted', 'success');
      load();
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  const handleSetLimit = async () => {
    const val = parseFloat(limitInput);
    if (!val || val <= 0 || !showSetLimit) return;
    try {
      await setBudgetLimit(showSetLimit, val);
      toast('Budget limit saved', 'success');
      setShowSetLimit(null);
      setLimitInput('');
      load();
    } catch {
      toast('Failed to save limit', 'error');
    }
  };

  const currentCategories = form.entry_type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="pb-24">
      <HeroHeader title="Budget Tracker" subtitle="Track your monthly finances">
        {/* Summary cards */}
        <div className="flex gap-3 mt-2">
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-[18px] font-bold text-ios-green">£{income.toFixed(0)}</p>
            <p className="text-[11px] text-white/60">Income</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className="text-[18px] font-bold text-ios-red">£{expenses.toFixed(0)}</p>
            <p className="text-[11px] text-white/60">Spent</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center flex-1">
            <p className={`text-[18px] font-bold ${remaining >= 0 ? 'text-white' : 'text-ios-red'}`}>
              £{Math.abs(remaining).toFixed(0)}
            </p>
            <p className="text-[11px] text-white/60">{remaining >= 0 ? 'Remaining' : 'Over budget'}</p>
          </div>
        </div>

        {/* Overall progress */}
        {income > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-white/60 mb-1">
              <span>Spent of income</span>
              <span>{spendRatio.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${spendRatio > 90 ? 'bg-ios-red' : spendRatio > 70 ? 'bg-ios-orange' : 'bg-ios-green'}`}
                style={{ width: `${spendRatio}%` }}
              />
            </div>
          </div>
        )}
      </HeroHeader>

      <div className="px-4 py-4">
        {/* Category Breakdown */}
        {sortedCategories.length > 0 && (
          <>
            <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider px-1 pb-2">
              Spending by Category
            </p>
            <div className="bg-white rounded-2xl border border-black/[0.08] p-4 flex flex-col gap-4">
              {sortedCategories.map(({ cat, spent, limit }) => {
                const meta = getCategoryMeta(cat);
                const hasLimit = limit !== null && limit > 0;
                const barPct = hasLimit
                  ? Math.min((spent / limit) * 100, 100)
                  : expenses > 0 ? (spent / expenses) * 100 : 0;
                const overBudget = hasLimit && spent > limit;
                const nearLimit = hasLimit && spent > limit * 0.8 && !overBudget;

                let barColor = meta.color;
                if (overBudget) barColor = '#FF3B30';
                else if (nearLimit) barColor = '#FF9500';

                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">{meta.icon}</span>
                        <span className="text-[14px] font-medium text-black">{meta.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[14px] font-semibold ${overBudget ? 'text-ios-red' : 'text-black'}`}>
                          £{spent.toFixed(0)}
                        </span>
                        {hasLimit && (
                          <span className="text-[12px] text-[#8E8E93]">/ £{limit.toFixed(0)}</span>
                        )}
                        {!hasLimit && (
                          <button
                            onClick={() => { setShowSetLimit(cat); setLimitInput(''); }}
                            className="text-[11px] text-ios-blue font-medium ml-1"
                          >
                            Set limit
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-2 bg-[#F2F2F7] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barPct}%`, backgroundColor: barColor }}
                      />
                    </div>
                    {hasLimit && (
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[11px] font-medium ${overBudget ? 'text-ios-red' : nearLimit ? 'text-ios-orange' : 'text-[#8E8E93]'}`}>
                          {overBudget
                            ? `£${(spent - limit).toFixed(0)} over budget`
                            : `£${(limit - spent).toFixed(0)} left`}
                        </span>
                        <button
                          onClick={() => { setShowSetLimit(cat); setLimitInput(String(limit)); }}
                          className="text-[11px] text-ios-blue font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick set limits hint */}
            {Object.keys(limits).length === 0 && (
              <p className="text-[12px] text-[#8E8E93] text-center mt-2">
                Tap "Set limit" on any category to set a monthly budget
              </p>
            )}
          </>
        )}

        {/* Recent Transactions */}
        {entries.length > 0 && (
          <>
            <p className="text-[13px] font-semibold text-[#6b6b70] uppercase tracking-wider px-1 pt-6 pb-2">
              Recent Transactions
            </p>
            <div className="bg-white rounded-2xl border border-black/[0.08] overflow-hidden">
              {entries.map((entry, idx) => {
                const meta = getCategoryMeta(entry.category);
                const isExpense = entry.entry_type === 'expense';
                return (
                  <div key={entry.id}>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isExpense ? (meta.color + '18') : '#E8F9EE' }}
                      >
                        <span className="text-[16px]">{meta.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-black truncate">{entry.label}</p>
                        <p className="text-[11px] text-[#8E8E93]">{meta.label} · {timeAgo(entry.created_at)}</p>
                      </div>
                      <p className={`text-[15px] font-semibold ${isExpense ? 'text-[#C0392B]' : 'text-[#1A7A3A]'}`}>
                        {isExpense ? '-' : '+'}£{entry.amount.toFixed(2)}
                      </p>
                      <button onClick={() => handleDelete(entry.id)} className="ml-1 text-[#AEAEB2] active:text-ios-red">
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    {idx < entries.length - 1 && <div className="h-px bg-black/[0.06] ml-[52px]" />}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {entries.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[28px] mb-3">💰</p>
            <p className="text-[16px] font-semibold text-black">No transactions yet</p>
            <p className="text-[14px] text-[#6b6b70] mt-1">Add your income and expenses to start tracking</p>
          </div>
        )}

        <button
          onClick={() => setShowAdd(true)}
          className="w-full mt-4 py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight"
        >
          Add Transaction
        </button>
      </div>

      {/* Add Transaction Modal */}
      <AddModal open={showAdd} onClose={() => setShowAdd(false)} title="New Transaction">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, entry_type: 'expense', category: 'groceries' })}
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
              onClick={() => setForm({ ...form, entry_type: 'income', category: 'student_loan' })}
              className={`flex-1 py-3 rounded-xl text-[14px] font-semibold transition-colors ${
                form.entry_type === 'income'
                  ? 'bg-ios-green text-white'
                  : 'bg-[#F2F2F7] text-black'
              }`}
            >
              Income
            </button>
          </div>

          <input
            type="text"
            placeholder={form.entry_type === 'expense' ? 'e.g. Weekly groceries' : 'e.g. September loan'}
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Amount (£)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
          />

          {/* Category chips */}
          <div>
            <p className="text-[12px] font-medium text-[#6b6b70] mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {currentCategories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-1 ${
                    form.category === cat.value
                      ? 'bg-ios-blue text-white'
                      : 'bg-[#F2F2F7] text-[#6b6b70]'
                  }`}
                >
                  <span className="text-[12px]">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!form.label.trim() || !form.amount || submitting}
            className="w-full py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight mt-1 disabled:opacity-40"
          >
            {submitting ? 'Adding...' : `Add ${form.entry_type === 'expense' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </AddModal>

      {/* Set Budget Limit Modal */}
      <AddModal
        open={!!showSetLimit}
        onClose={() => { setShowSetLimit(null); setLimitInput(''); }}
        title={`Set Budget — ${showSetLimit ? getCategoryMeta(showSetLimit).label : ''}`}
      >
        <div className="flex flex-col gap-3">
          <p className="text-[13px] text-[#6b6b70]">
            Set a monthly spending limit for this category. You'll see warnings when you're close to or over budget.
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#8E8E93]">£</span>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 200"
              value={limitInput}
              onChange={(e) => setLimitInput(e.target.value)}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
              autoFocus
            />
          </div>
          <button
            onClick={handleSetLimit}
            disabled={!limitInput || parseFloat(limitInput) <= 0}
            className="w-full py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight disabled:opacity-40"
          >
            Save Limit
          </button>
        </div>
      </AddModal>
    </div>
  );
}
