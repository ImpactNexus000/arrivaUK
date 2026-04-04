import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import AddModal from '../components/AddModal';
import { getMe, updateProfile, getUploadUrl, getUniversities, getChecklist, getDocuments, getBudgetEntries, getPosts } from '../api';

const STUDENT_LABELS = {
  international: 'International Student',
  eu_eea: 'EU/EEA Student',
  uk_home: 'UK Home Student',
};

const ARRIVAL_LABELS = {
  not_arrived: "Haven't Arrived Yet",
  just_arrived: 'Just Arrived',
  been_here: 'Been Here a While',
};

const STUDENT_ICONS = {
  international: '🌍',
  eu_eea: '🇪🇺',
  uk_home: '🇬🇧',
};

const ARRIVAL_ICONS = {
  not_arrived: '✈️',
  just_arrived: '🛬',
  been_here: '🏠',
};

const STUDENT_TYPES = [
  { value: 'international', label: 'International Student' },
  { value: 'eu_eea', label: 'EU/EEA Student' },
  { value: 'uk_home', label: 'UK Home Student' },
];

const ARRIVAL_OPTIONS = [
  { value: 'not_arrived', label: "Haven't Arrived Yet" },
  { value: 'just_arrived', label: 'Just Arrived' },
  { value: 'been_here', label: 'Been Here a While' },
];

export default function Profile({ onLogout }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', student_type: '', university: '', arrival_status: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [uniSearch, setUniSearch] = useState('');
  const [activity, setActivity] = useState({ checklist: null, docs: null, budget: null, posts: null });
  const toast = useToast();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
    getUniversities().then(setUniversities).catch(() => {});

    // Load activity stats for desktop
    (async () => {
      const stats = {};
      try { const items = await getChecklist(); stats.checklist = { total: items.length, done: items.filter(i => i.completed).length }; } catch {}
      try { const docs = await getDocuments(); stats.docs = { total: docs.length, ready: docs.filter(d => d.status === 'ready').length }; } catch {}
      try {
        const entries = await getBudgetEntries();
        const income = entries.filter(e => e.entry_type === 'income').reduce((s, e) => s + e.amount, 0);
        const expenses = entries.filter(e => e.entry_type === 'expense').reduce((s, e) => s + e.amount, 0);
        stats.budget = { income, expenses, balance: income - expenses, transactions: entries.length };
      } catch {}
      try { const posts = await getPosts(); stats.posts = { total: posts.length }; } catch {}
      setActivity(stats);
    })();
  }, [navigate]);

  async function handlePictureChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('profile_picture', file);
      const updated = await updateProfile(fd);
      setUser(updated);
      toast('Profile picture updated', 'success');
    } catch {
      toast('Failed to upload picture', 'error');
    }
    setUploading(false);
  }

  function openEdit() {
    setEditForm({
      name: user.name,
      student_type: user.student_type,
      university: user.university,
      arrival_status: user.arrival_status,
    });
    setUniSearch('');
    setShowEdit(true);
  }

  async function handleEditSave(e) {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    setEditSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', editForm.name);
      fd.append('student_type', editForm.student_type);
      fd.append('university', editForm.university);
      fd.append('arrival_status', editForm.arrival_status);
      const updated = await updateProfile(fd);
      setUser(updated);
      localStorage.setItem('arrivauk_user_name', updated.name);
      toast('Profile updated', 'success');
      setShowEdit(false);
    } catch {
      toast('Failed to update profile', 'error');
    }
    setEditSubmitting(false);
  }

  function handleLogout() {
    localStorage.removeItem('arrivauk_token');
    localStorage.removeItem('arrivauk_user_id');
    localStorage.removeItem('arrivauk_user_name');
    onLogout();
    navigate('/login');
  }

  const filteredUnis = uniSearch
    ? universities.filter((u) => u.toLowerCase().includes(uniSearch.toLowerCase()))
    : universities;

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center">
        <svg className="w-8 h-8 animate-spin text-ios-blue" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!user) return null;

  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  const daysSinceJoined = Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000);

  const checklistPct = activity.checklist
    ? activity.checklist.total > 0 ? Math.round((activity.checklist.done / activity.checklist.total) * 100) : 0
    : null;

  const docsPct = activity.docs
    ? activity.docs.total > 0 ? Math.round((activity.docs.ready / activity.docs.total) * 100) : 0
    : null;

  return (
    <div className="min-h-screen pb-24 lg:pb-0 bg-ios-bg">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] relative overflow-hidden">
        <div className="absolute w-60 h-60 rounded-full border-[20px] border-white/[0.03] -top-16 -right-16" />
        <div className="absolute w-32 h-32 rounded-full border-[12px] border-white/[0.03] bottom-8 -left-8" />

        <div className="relative z-10 px-4 lg:px-10 pt-14 lg:pt-10 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-[15px]">Back</span>
          </button>

          {/* Profile picture + name — centered on mobile, left-aligned row on desktop */}
          <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-6">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative group flex-shrink-0"
              disabled={uploading}
            >
              <div className={`w-24 h-24 rounded-full overflow-hidden border-[3px] border-white/30 shadow-xl transition-all ${uploading ? 'opacity-60' : ''}`}>
                {user.profile_picture ? (
                  <img
                    src={getUploadUrl(user.profile_picture)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/15 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-ios-blue rounded-full flex items-center justify-center border-[2px] border-[#1a4a7a] group-hover:scale-110 transition-transform">
                {uploading ? (
                  <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
              />
            </button>

            <div className="text-center lg:text-left mt-4 lg:mt-0">
              <h1 className="text-[24px] lg:text-[28px] font-bold text-white tracking-tight">{user.name}</h1>
              <p className="text-[14px] text-white/50 mt-0.5">{user.email}</p>
              <p className="text-[12px] text-white/30 mt-1">Member since {memberSince}</p>
            </div>

            {/* Desktop header stat pills */}
            <div className="hidden lg:flex gap-3 ml-auto">
              <div className="bg-white/[0.13] backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/[0.12] text-center">
                <p className="text-[11px] text-white/50 uppercase tracking-wide font-medium">Days Active</p>
                <p className="text-[18px] font-bold text-white mt-0.5">{daysSinceJoined}</p>
              </div>
              <div className="bg-white/[0.13] backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/[0.12] text-center">
                <p className="text-[11px] text-white/50 uppercase tracking-wide font-medium">Student Type</p>
                <p className="text-[14px] font-bold text-white mt-0.5">{STUDENT_LABELS[user.student_type] || user.student_type}</p>
              </div>
              <div className="bg-white/[0.13] backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/[0.12] text-center">
                <p className="text-[11px] text-white/50 uppercase tracking-wide font-medium">Status</p>
                <p className="text-[14px] font-bold text-white mt-0.5">{ARRIVAL_LABELS[user.arrival_status] || user.arrival_status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content — single column on mobile, 2 columns on desktop */}
      <div className="px-4 lg:px-10 -mt-1 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start lg:mt-6">

        {/* Left column — Profile details + actions */}
        <div>
          <p className="hidden lg:block text-[11px] font-semibold text-[#6b6b70] uppercase tracking-widest px-1 mb-2.5">Profile Details</p>

          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            {/* University */}
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-black/[0.04]">
              <div className="w-10 h-10 bg-ios-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎓</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-wider">University</p>
                <p className="text-[15px] font-medium text-black mt-0.5 truncate">{user.university}</p>
              </div>
            </div>

            {/* Student Type */}
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-black/[0.04]">
              <div className="w-10 h-10 bg-ios-indigo/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{STUDENT_ICONS[user.student_type] || '📚'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-wider">Student Type</p>
                <p className="text-[15px] font-medium text-black mt-0.5">{STUDENT_LABELS[user.student_type] || user.student_type}</p>
              </div>
            </div>

            {/* Arrival Status */}
            <div className="flex items-center gap-3.5 px-4 py-4 border-b border-black/[0.04]">
              <div className="w-10 h-10 bg-ios-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{ARRIVAL_ICONS[user.arrival_status] || '📍'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-wider">Arrival Status</p>
                <p className="text-[15px] font-medium text-black mt-0.5">{ARRIVAL_LABELS[user.arrival_status] || user.arrival_status}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3.5 px-4 py-4">
              <div className="w-10 h-10 bg-ios-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-ios-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-[#AEAEB2] uppercase tracking-wider">Email</p>
                <p className="text-[15px] font-medium text-black mt-0.5 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Edit Profile button — desktop only (mobile buttons are at the very bottom) */}
          <button
            onClick={openEdit}
            className="hidden lg:block mt-4 w-full py-3.5 rounded-2xl bg-ios-blue text-white text-[15px] font-semibold shadow-sm hover:bg-ios-blue/90 transition-colors"
          >
            Edit Profile
          </button>

          {/* Logout button — desktop only */}
          <button
            onClick={() => setShowLogout(true)}
            className="hidden lg:block mt-3 w-full py-3.5 rounded-2xl bg-white border border-black/[0.06] text-ios-red text-[15px] font-semibold shadow-sm hover:bg-ios-red/5 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Right column — Activity & Progress (desktop only on right, below on mobile) */}
        <div className="mt-6 lg:mt-0 flex flex-col gap-4">
          <p className="hidden lg:block text-[11px] font-semibold text-[#6b6b70] uppercase tracking-widest px-1 mb-0.5">Your Progress</p>

          {/* Progress cards grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Checklist progress */}
            <Link to="/checklist" className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4 no-underline desktop-card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-ios-green/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg">✅</span>
                </div>
                {checklistPct !== null && (
                  <span className={`text-[22px] font-bold ${checklistPct === 100 ? 'text-ios-green' : 'text-black'}`}>{checklistPct}%</span>
                )}
              </div>
              <p className="text-[14px] font-semibold text-black">Checklist</p>
              {activity.checklist ? (
                <>
                  <p className="text-[12px] text-[#AEAEB2] mt-0.5">{activity.checklist.done} of {activity.checklist.total} done</p>
                  <div className="h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden mt-2.5">
                    <div className="h-full rounded-full bg-ios-green transition-all duration-500" style={{ width: `${checklistPct}%` }} />
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-[#AEAEB2] mt-0.5">Loading...</p>
              )}
            </Link>

            {/* Documents progress */}
            <Link to="/documents" className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4 no-underline desktop-card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-ios-red/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📂</span>
                </div>
                {docsPct !== null && (
                  <span className={`text-[22px] font-bold ${docsPct === 100 ? 'text-ios-green' : 'text-black'}`}>{docsPct}%</span>
                )}
              </div>
              <p className="text-[14px] font-semibold text-black">Documents</p>
              {activity.docs ? (
                <>
                  <p className="text-[12px] text-[#AEAEB2] mt-0.5">{activity.docs.ready} of {activity.docs.total} ready</p>
                  <div className="h-1.5 bg-[#F2F2F7] rounded-full overflow-hidden mt-2.5">
                    <div className="h-full rounded-full bg-ios-blue transition-all duration-500" style={{ width: `${docsPct}%` }} />
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-[#AEAEB2] mt-0.5">Loading...</p>
              )}
            </Link>

            {/* Budget summary */}
            <Link to="/budget" className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4 no-underline desktop-card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-ios-orange/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg">💷</span>
                </div>
              </div>
              <p className="text-[14px] font-semibold text-black">Budget</p>
              {activity.budget ? (
                <>
                  <p className={`text-[18px] font-bold mt-1 ${activity.budget.balance >= 0 ? 'text-ios-green' : 'text-ios-red'}`}>
                    {activity.budget.balance >= 0 ? '+' : '-'}£{Math.abs(activity.budget.balance).toFixed(0)}
                  </p>
                  <p className="text-[12px] text-[#AEAEB2] mt-0.5">{activity.budget.transactions} transactions</p>
                </>
              ) : (
                <p className="text-[12px] text-[#AEAEB2] mt-0.5">Loading...</p>
              )}
            </Link>

            {/* Community summary */}
            <Link to="/community" className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4 no-underline desktop-card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-ios-indigo/10 rounded-xl flex items-center justify-center">
                  <span className="text-lg">💬</span>
                </div>
              </div>
              <p className="text-[14px] font-semibold text-black">Community</p>
              {activity.posts ? (
                <>
                  <p className="text-[18px] font-bold mt-1 text-black">{activity.posts.total}</p>
                  <p className="text-[12px] text-[#AEAEB2] mt-0.5">tips shared</p>
                </>
              ) : (
                <p className="text-[12px] text-[#AEAEB2] mt-0.5">Loading...</p>
              )}
            </Link>
          </div>

          {/* Quick links card */}
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-black/[0.04]">
              <p className="text-[11px] font-semibold text-[#6b6b70] uppercase tracking-widest">Quick Links</p>
            </div>
            {[
              { to: '/checklist', icon: '✅', label: 'Arrival Checklist', desc: 'Track your to-do list' },
              { to: '/deals', icon: '🏷️', label: 'Student Deals', desc: 'Browse verified offers' },
              { to: '/guide', icon: '📍', label: 'Local Guide', desc: 'Services near campus' },
            ].map((link, idx) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3.5 px-4 py-3.5 no-underline hover:bg-black/[0.02] transition-colors ${
                  idx < 2 ? 'border-b border-black/[0.04]' : ''
                }`}
              >
                <div className="w-9 h-9 bg-[#F2F2F7] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-[16px]">{link.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-black">{link.label}</p>
                  <p className="text-[12px] text-[#AEAEB2] mt-0.5">{link.desc}</p>
                </div>
                <svg className="w-4 h-4 text-[#AEAEB2] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>

          {/* Account info card */}
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm p-4">
            <p className="text-[11px] font-semibold text-[#6b6b70] uppercase tracking-widest mb-3">Account</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b6b70]">Member since</span>
                <span className="text-[13px] font-medium text-black">{memberSince}</span>
              </div>
              <div className="h-px bg-black/[0.04]" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b6b70]">Days on platform</span>
                <span className="text-[13px] font-medium text-black">{daysSinceJoined} {daysSinceJoined === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="h-px bg-black/[0.04]" />
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[#6b6b70]">User ID</span>
                <span className="text-[13px] font-medium text-[#AEAEB2]">#{user.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-only action buttons at the bottom */}
      <div className="px-4 mt-6 lg:hidden">
        <button
          onClick={openEdit}
          className="w-full py-3.5 rounded-2xl bg-ios-blue text-white text-[15px] font-semibold shadow-sm hover:bg-ios-blue/90 transition-colors"
        >
          Edit Profile
        </button>
        <button
          onClick={() => setShowLogout(true)}
          className="mt-3 w-full py-3.5 rounded-2xl bg-white border border-black/[0.06] text-ios-red text-[15px] font-semibold shadow-sm hover:bg-ios-red/5 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Logout confirmation */}
      <ConfirmDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        message="You'll need to sign in again to access your account."
        confirmLabel="Sign Out"
      />

      {/* Edit Profile Modal */}
      <AddModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile">
        <form onSubmit={handleEditSave} className="flex flex-col gap-3">
          {/* Name */}
          <input
            type="text"
            placeholder="Your full name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[15px] outline-none focus:border-ios-blue"
          />

          {/* Student Type */}
          <div>
            <p className="text-[12px] font-medium text-[#6b6b70] uppercase tracking-wider mb-1.5 px-1">Student Type</p>
            <div className="flex flex-wrap gap-1.5">
              {STUDENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, student_type: type.value })}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-1 ${
                    editForm.student_type === type.value
                      ? 'bg-ios-blue text-white'
                      : 'bg-ios-bg text-[#6b6b70] border border-black/[0.06]'
                  }`}
                >
                  <span className="text-[12px]">{STUDENT_ICONS[type.value]}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Arrival Status */}
          <div>
            <p className="text-[12px] font-medium text-[#6b6b70] uppercase tracking-wider mb-1.5 px-1">Arrival Status</p>
            <div className="flex flex-wrap gap-1.5">
              {ARRIVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEditForm({ ...editForm, arrival_status: opt.value })}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-1 ${
                    editForm.arrival_status === opt.value
                      ? 'bg-ios-blue text-white'
                      : 'bg-ios-bg text-[#6b6b70] border border-black/[0.06]'
                  }`}
                >
                  <span className="text-[12px]">{ARRIVAL_ICONS[opt.value]}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* University */}
          <div>
            <p className="text-[12px] font-medium text-[#6b6b70] uppercase tracking-wider mb-1.5 px-1">University</p>
            <input
              type="text"
              placeholder="Search universities..."
              value={uniSearch}
              onChange={(e) => setUniSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] text-[14px] outline-none focus:border-ios-blue mb-2"
            />
            <div className="max-h-[120px] overflow-y-auto flex flex-col gap-1">
              {filteredUnis.slice(0, 20).map((uni) => (
                <button
                  key={uni}
                  type="button"
                  onClick={() => { setEditForm({ ...editForm, university: uni }); setUniSearch(''); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all ${
                    editForm.university === uni
                      ? 'bg-ios-blue/10 text-ios-blue font-medium'
                      : 'text-black hover:bg-black/[0.03]'
                  }`}
                >
                  {uni}
                </button>
              ))}
            </div>
            {editForm.university && !uniSearch && (
              <p className="text-[12px] text-ios-blue font-medium mt-1.5 px-1">Selected: {editForm.university}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!editForm.name.trim() || editSubmitting}
            className="w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold tracking-tight mt-1 disabled:opacity-40"
          >
            {editSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </AddModal>
    </div>
  );
}
