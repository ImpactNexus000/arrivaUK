import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendOtp, verifyOtp, resetPassword } from '../api';
import AuthLayout from '../components/AuthLayout';

const STRENGTH_COLORS = ['bg-red-400', 'bg-ios-red', 'bg-ios-orange', 'bg-yellow-400', 'bg-ios-green', 'bg-emerald-400'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=email, 1=otp, 2=new password, 3=success
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const otpRefs = useRef([]);

  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const t = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [otpResendTimer]);

  async function handleSendOtp() {
    setSubmitting(true);
    setError('');
    try {
      await sendOtp(email, 'reset');
      setStep(1);
      setOtpResendTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setOtpSending(true);
    setError('');
    try {
      await sendOtp(email, 'reset');
      setOtpResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setOtpSending(false);
    }
  }

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      verifyOtpCode(fullCode);
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    if (pasted.length === 6) {
      verifyOtpCode(pasted);
    } else {
      otpRefs.current[pasted.length]?.focus();
    }
  }

  async function verifyOtpCode(code) {
    setOtpVerifying(true);
    setError('');
    try {
      const res = await verifyOtp(email, code);
      setOtpToken(res.otp_token);
      setTimeout(() => setStep(2), 400);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpVerifying(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await resetPassword(email, otpToken, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
    <div className="min-h-screen bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] lg:bg-ios-bg lg:from-ios-bg lg:via-ios-bg lg:to-ios-bg flex flex-col relative overflow-hidden">
      <div className="absolute w-80 h-80 rounded-full border-[28px] border-white/[0.03] -top-24 -right-24 lg:hidden" />
      <div className="absolute w-48 h-48 rounded-full border-[18px] border-white/[0.03] bottom-40 -left-16 lg:hidden" />

      <div className="flex-1 flex flex-col justify-center px-6 lg:px-12 lg:max-w-[480px] lg:mx-auto lg:w-full relative z-10">

        {/* Step 0: Enter email */}
        {step === 0 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-white/[0.1] lg:bg-ios-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/[0.08] lg:border-ios-blue/20">
                <svg className="w-10 h-10 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
              </div>
              <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight">Reset Password</h1>
              <p className="text-[15px] text-white/50 lg:text-[#6b6b70] mt-1.5">Enter your email to receive a verification code</p>
            </div>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] lg:bg-white text-white lg:text-black placeholder-white/30 lg:placeholder-[#AEAEB2] text-[16px] outline-none border border-white/[0.08] lg:border-black/[0.08] focus:border-white/25 lg:focus:border-ios-blue backdrop-blur-sm transition-all"
            />

            {error && (
              <p className="mt-3 text-ios-red text-[13px] bg-ios-red/10 px-4 py-2.5 rounded-xl">{error}</p>
            )}

            <button
              onClick={handleSendOtp}
              disabled={!emailValid || submitting}
              className="mt-4 w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold tracking-tight disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ios-blue/90 transition-all"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending code...
                </span>
              ) : 'Send Verification Code'}
            </button>

            <p className="text-white/30 lg:text-[#AEAEB2] text-[14px] mt-6 text-center">
              Remember your password?{' '}
              <Link to="/login" className="text-ios-blue font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 1: OTP verification */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-white/[0.1] lg:bg-ios-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/[0.08] lg:border-ios-blue/20">
                <svg className="w-10 h-10 text-ios-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight">Verify Your Email</h1>
              <p className="text-[15px] text-white/50 lg:text-[#6b6b70] mt-1.5">Enter the 6-digit code sent to</p>
              <p className="text-[15px] text-ios-blue font-medium mt-0.5">{email}</p>
            </div>

            {otpToken ? (
              <div className="flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-ios-green/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-ios-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/70 text-[15px] font-medium">Email verified!</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-2.5">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className={`w-12 h-14 rounded-xl text-center text-[22px] font-bold outline-none transition-all duration-200 ${
                        digit
                          ? 'bg-white/[0.15] text-white border-ios-blue/60'
                          : 'bg-white/[0.08] text-white/80 border-white/[0.08]'
                      } border focus:border-ios-blue/80 focus:bg-white/[0.12] lg:bg-white lg:text-black lg:border-black/[0.08] lg:focus:border-ios-blue lg:focus:bg-white`}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {otpVerifying && (
                  <div className="mt-5 flex items-center justify-center gap-2 text-white/60 text-[14px]">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </div>
                )}

                {error && (
                  <p className="mt-4 text-ios-red text-[13px] bg-ios-red/10 px-4 py-2.5 rounded-xl text-center">{error}</p>
                )}

                <div className="mt-6 text-center">
                  {otpResendTimer > 0 ? (
                    <p className="text-white/30 text-[13px]">
                      Resend code in <span className="text-white/50 font-medium">{otpResendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={otpSending}
                      className="text-ios-blue text-[14px] font-medium hover:underline disabled:opacity-50"
                    >
                      {otpSending ? 'Sending...' : 'Resend Code'}
                    </button>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => { setStep(0); setError(''); setOtpDigits(['', '', '', '', '', '']); setOtpToken(''); }}
              className="mt-6 text-white/30 lg:text-[#AEAEB2] text-[13px] text-center hover:text-white/50 lg:hover:text-[#6b6b70] transition-colors w-full"
            >
              Use a different email
            </button>
          </div>
        )}

        {/* Step 2: New password */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-white/[0.1] lg:bg-ios-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-white/[0.08] lg:border-ios-blue/20">
                <svg className="w-10 h-10 text-ios-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight">New Password</h1>
              <p className="text-[15px] text-white/50 lg:text-[#6b6b70] mt-1.5">Choose a strong password for your account</p>
            </div>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] lg:bg-white text-white lg:text-black placeholder-white/30 lg:placeholder-[#AEAEB2] text-[16px] outline-none border border-white/[0.08] lg:border-black/[0.08] focus:border-white/25 lg:focus:border-ios-blue backdrop-blur-sm transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 lg:text-[#AEAEB2] hover:text-white/70 lg:hover:text-[#6b6b70] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>

              {newPassword && (
                <div className="px-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${i < strength ? STRENGTH_COLORS[strength] : ''}`}
                          style={{ width: i < strength ? '100%' : '0%' }} />
                      </div>
                    ))}
                  </div>
                  <p className={`text-[11px] mt-1 ${STRENGTH_COLORS[strength]?.replace('bg-', 'text-') || 'text-white/30'}`}>
                    {STRENGTH_LABELS[strength]}
                  </p>
                </div>
              )}

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] lg:bg-white text-white lg:text-black placeholder-white/30 lg:placeholder-[#AEAEB2] text-[16px] outline-none border border-white/[0.08] lg:border-black/[0.08] focus:border-white/25 lg:focus:border-ios-blue backdrop-blur-sm transition-all"
                />
                {confirmPassword && (
                  <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${passwordsMatch ? 'bg-ios-green' : 'bg-ios-red/60'}`}>
                    {passwordsMatch ? (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <p className="text-ios-red text-[13px] bg-ios-red/10 px-4 py-2.5 rounded-xl">{error}</p>
              )}

              <button
                type="submit"
                disabled={!passwordsMatch || newPassword.length < 6 || submitting}
                className="mt-2 w-full py-4 rounded-2xl bg-ios-green text-white text-base font-semibold tracking-tight disabled:opacity-30 disabled:cursor-not-allowed hover:bg-ios-green/90 transition-all"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Resetting...
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="animate-fade-in text-center">
            <div className="w-20 h-20 bg-ios-green/20 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-ios-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight">Password Reset!</h1>
            <p className="text-[15px] text-white/50 lg:text-[#6b6b70] mt-1.5 mb-8">Your password has been updated successfully</p>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 rounded-2xl bg-ios-blue text-white text-base font-semibold tracking-tight hover:bg-ios-blue/90 transition-all"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
    </AuthLayout>
  );
}
