import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

export default function Login({ onAuth }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await login(email, password);
      localStorage.setItem('arrivauk_token', res.access_token);
      localStorage.setItem('arrivauk_user_id', res.user.id);
      localStorage.setItem('arrivauk_user_name', res.user.name);
      onAuth();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] flex flex-col relative overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute w-80 h-80 rounded-full border-[28px] border-white/[0.03] -top-24 -right-24" />
      <div className="absolute w-48 h-48 rounded-full border-[18px] border-white/[0.03] bottom-40 -left-16" />

      <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/[0.1] rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/[0.08]">
            <span className="text-4xl">🇬🇧</span>
          </div>
          <h1 className="text-[32px] font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-[15px] text-white/50 mt-1">Sign in to your ArriveUK account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] text-white placeholder-white/30 text-[16px] outline-none border border-white/[0.08] focus:border-white/25 backdrop-blur-sm transition-all"
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] text-white placeholder-white/30 text-[16px] outline-none border border-white/[0.08] focus:border-white/25 backdrop-blur-sm transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </button>
          </div>

          {error && (
            <p className="text-ios-red text-[13px] bg-ios-red/10 px-4 py-2.5 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={!email || !password || submitting}
            className="mt-2 w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold tracking-tight disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ios-blue/90 transition-all"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-white/30 text-[14px] mt-6 text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-ios-blue font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
