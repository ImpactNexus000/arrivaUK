import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { getMe, updateProfile, getUploadUrl } from '../api';

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

export default function Profile({ onLogout }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
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

  function handleLogout() {
    localStorage.removeItem('arrivauk_token');
    localStorage.removeItem('arrivauk_user_id');
    localStorage.removeItem('arrivauk_user_name');
    onLogout();
    navigate('/login');
  }

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

  return (
    <div className="min-h-screen pb-24 bg-ios-bg">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] relative overflow-hidden">
        {/* Decorative rings */}
        <div className="absolute w-60 h-60 rounded-full border-[20px] border-white/[0.03] -top-16 -right-16" />
        <div className="absolute w-32 h-32 rounded-full border-[12px] border-white/[0.03] bottom-8 -left-8" />

        {/* Back button */}
        <div className="relative z-10 px-4 pt-14 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/70 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span className="text-[15px]">Back</span>
          </button>

          {/* Profile picture + name */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => fileRef.current?.click()}
              className="relative group"
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

            <h1 className="text-[24px] font-bold text-white mt-4 tracking-tight">{user.name}</h1>
            <p className="text-[14px] text-white/50 mt-0.5">{user.email}</p>
            <p className="text-[12px] text-white/30 mt-1">Member since {memberSince}</p>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="px-4 -mt-1">
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

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="mt-5 w-full py-3.5 rounded-2xl bg-white border border-black/[0.06] text-ios-red text-[15px] font-semibold shadow-sm hover:bg-ios-red/5 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
