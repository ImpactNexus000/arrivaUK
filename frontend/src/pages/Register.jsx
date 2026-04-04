import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, getUniversities, sendOtp, verifyOtp } from '../api';
import AuthLayout from '../components/AuthLayout';

const STUDENT_TYPES = [
  { value: 'international', label: 'International Student', desc: 'Non-EU/EEA country', icon: '🌍' },
  { value: 'eu_eea', label: 'EU/EEA Student', desc: 'European Union or EEA', icon: '🇪🇺' },
  { value: 'uk_home', label: 'UK Home Student', desc: 'United Kingdom resident', icon: '🇬🇧' },
];

const ARRIVAL_OPTIONS = [
  { value: 'not_arrived', label: "Haven't Arrived", desc: 'Still preparing to travel', icon: '✈️' },
  { value: 'just_arrived', label: 'Just Arrived', desc: 'Recently landed in the UK', icon: '🛬' },
  { value: 'been_here', label: 'Been Here a While', desc: 'Already settled in', icon: '🏠' },
];

const STEP_LABELS = ['Account', 'Verify', 'Profile', 'Status', 'University', 'Arrival'];

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0-5
}

const STRENGTH_COLORS = ['bg-red-400', 'bg-ios-red', 'bg-ios-orange', 'bg-yellow-400', 'bg-ios-green', 'bg-emerald-400'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

export default function Register({ onAuth }) {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpToken, setOtpToken] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const otpRefs = useRef([]);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    student_type: '',
    university: '',
    arrival_status: '',
  });
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState(null);
  const [uniSearch, setUniSearch] = useState('');
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    getUniversities().then(setUniversities).catch(() => {});
  }, []);

  // OTP resend countdown
  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const t = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [otpResendTimer]);

  const filteredUnis = uniSearch
    ? universities.filter((u) => u.toLowerCase().includes(uniSearch.toLowerCase()))
    : universities;

  const strength = getPasswordStrength(form.password);
  const passwordsMatch = form.password && form.confirmPassword && form.password === form.confirmPassword;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const canProceed = [
    // Step 0: Account
    emailValid && form.password.length >= 6 && passwordsMatch,
    // Step 1: OTP Verify
    !!otpToken,
    // Step 2: Profile
    form.name.trim().length > 0,
    // Step 3: Student Type
    !!form.student_type,
    // Step 4: University
    !!form.university,
    // Step 5: Arrival Status
    !!form.arrival_status,
  ];

  function handlePictureSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPictureFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPicturePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  // Send OTP when moving from step 0 to step 1
  async function handleSendOtp() {
    setOtpSending(true);
    setError('');
    try {
      await sendOtp(form.email, 'register');
      setStep(1);
      setOtpResendTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setOtpSending(false);
    }
  }

  async function handleResendOtp() {
    setOtpSending(true);
    setError('');
    try {
      await sendOtp(form.email, 'register');
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

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits entered
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
      const res = await verifyOtp(form.email, code);
      setOtpToken(res.otp_token);
      // Auto-advance to next step
      setTimeout(() => setStep(2), 400);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpVerifying(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('name', form.name);
      fd.append('student_type', form.student_type);
      fd.append('university', form.university);
      fd.append('arrival_status', form.arrival_status);
      fd.append('otp_token', otpToken);
      if (pictureFile) fd.append('profile_picture', pictureFile);

      const res = await register(fd);
      localStorage.setItem('arrivauk_token', res.access_token);
      localStorage.setItem('arrivauk_user_id', res.user.id);
      localStorage.setItem('arrivauk_user_name', res.user.name);
      onAuth();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed');
      setSubmitting(false);
    }
  }

  function next() {
    if (step === 0) {
      handleSendOtp();
    } else if (step < 5) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  function back() {
    if (step > 0) {
      setError('');
      if (step === 1) {
        // Going back from OTP to account step
        setOtpDigits(['', '', '', '', '', '']);
        setOtpToken('');
      }
      setStep(step - 1);
    }
  }

  return (
    <AuthLayout>
    <div className="min-h-screen bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] lg:bg-ios-bg lg:from-ios-bg lg:via-ios-bg lg:to-ios-bg flex flex-col lg:justify-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute w-80 h-80 rounded-full border-[28px] border-white/[0.03] -top-24 -right-24 lg:hidden" />
      <div className="absolute w-48 h-48 rounded-full border-[18px] border-white/[0.03] bottom-40 -left-16 lg:hidden" />
      <div className="absolute w-24 h-24 rounded-full bg-ios-blue/10 top-1/3 right-8 blur-2xl lg:hidden" />

      {/* Step progress bar */}
      <div className="px-6 lg:px-12 lg:max-w-[480px] lg:mx-auto lg:w-full pt-14 lg:pt-10 pb-2 relative z-10">
        <div className="flex items-center gap-1">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1 lg:h-1.5 rounded-full overflow-hidden bg-white/10 lg:bg-black/[0.06]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    i < step ? 'bg-ios-green w-full' : i === step ? 'bg-ios-blue w-full' : 'w-0'
                  }`}
                  style={{ width: i <= step ? '100%' : '0%' }}
                />
              </div>
              <span className={`text-[10px] lg:text-[14px] font-medium transition-colors duration-300 ${
                i <= step ? 'text-white/70 lg:text-[#6b6b70]' : 'text-white/25 lg:text-[#AEAEB2]'
              }`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 lg:flex-none lg:px-12 lg:max-w-[480px] lg:mx-auto lg:w-full relative z-10 overflow-y-auto">
        {/* Step 0: Email + Password */}
        {step === 0 && (
          <div className="flex-1 lg:flex-none flex flex-col animate-fade-in">
            <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight mt-4">
              Create Your Account
            </h1>
            <p className="text-[15px] text-white/60 lg:text-[#6b6b70] mt-1.5 leading-relaxed">
              Start your UK journey with ArrivaUK
            </p>

            {/* Email */}
            <div className="mt-7 relative">
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] lg:bg-white text-white lg:text-black placeholder-white/30 lg:placeholder-[#AEAEB2] text-[16px] outline-none border border-white/[0.08] lg:border-black/[0.08] focus:border-white/25 lg:focus:border-ios-blue backdrop-blur-sm transition-all"
              />
              {form.email && (
                <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${emailValid ? 'bg-ios-green' : 'bg-ios-red/60'}`}>
                  {emailValid ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="mt-3 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

            {/* Password strength */}
            {form.password && (
              <div className="mt-2.5 px-1">
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

            {/* Confirm Password */}
            <div className="mt-3 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] lg:bg-white text-white lg:text-black placeholder-white/30 lg:placeholder-[#AEAEB2] text-[16px] outline-none border border-white/[0.08] lg:border-black/[0.08] focus:border-white/25 lg:focus:border-ios-blue backdrop-blur-sm transition-all"
              />
              {form.confirmPassword && (
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
              <p className="mt-3 text-ios-red text-[13px] bg-ios-red/10 px-4 py-2.5 rounded-xl">{error}</p>
            )}

            <p className="text-white/30 lg:text-[#AEAEB2] text-[13px] mt-5 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-ios-blue font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* Step 1: OTP Verification */}
        {step === 1 && (
          <div className="flex-1 lg:flex-none flex flex-col animate-fade-in">
            <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight mt-4">
              Verify Your Email
            </h1>
            <p className="text-[15px] text-white/60 lg:text-[#6b6b70] mt-1.5 leading-relaxed">
              We sent a 6-digit code to
            </p>
            <p className="text-[15px] text-ios-blue font-medium mt-0.5">{form.email}</p>

            {/* OTP success state */}
            {otpToken ? (
              <div className="mt-10 flex flex-col items-center gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-ios-green/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-ios-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white/70 text-[15px] font-medium">Email verified!</p>
              </div>
            ) : (
              <>
                {/* OTP input boxes */}
                <div className="mt-8 flex justify-center gap-2.5">
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

                {/* Verifying spinner */}
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

                {/* Resend */}
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
          </div>
        )}

        {/* Step 2: Name + Profile Picture */}
        {step === 2 && (
          <div className="flex-1 lg:flex-none flex flex-col animate-fade-in">
            <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight mt-4">
              Your Profile
            </h1>
            <p className="text-[15px] text-white/60 lg:text-[#6b6b70] mt-1.5 leading-relaxed">
              Add a photo and your name
            </p>

            {/* Profile picture upload */}
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="relative group"
              >
                <div className={`w-28 h-28 rounded-full overflow-hidden border-[3px] transition-all ${picturePreview ? 'border-ios-green' : 'border-white/20 group-hover:border-white/40'}`}>
                  {picturePreview ? (
                    <img src={picturePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/[0.08] flex items-center justify-center">
                      <svg className="w-10 h-10 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Camera overlay */}
                <div className="absolute bottom-0 right-0 w-9 h-9 bg-ios-blue rounded-full flex items-center justify-center border-[3px] border-[#1a4a7a] shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePictureSelect}
                  className="hidden"
                />
              </button>
            </div>
            <p className="text-center text-white/30 lg:text-[#AEAEB2] text-[12px] mt-2.5">Tap to add a photo (optional)</p>

            {/* Name input */}
            <div className="mt-7 relative">
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] lg:bg-white text-white lg:text-black placeholder-white/30 lg:placeholder-[#AEAEB2] text-[16px] outline-none border border-white/[0.08] lg:border-black/[0.08] focus:border-white/25 lg:focus:border-ios-blue backdrop-blur-sm transition-all"
              />
              {form.name.trim() && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-ios-green flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Student Type */}
        {step === 3 && (
          <div className="flex-1 lg:flex-none flex flex-col animate-fade-in">
            <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight mt-4">
              Student Status
            </h1>
            <p className="text-[15px] text-white/60 lg:text-[#6b6b70] mt-1.5 leading-relaxed">
              What type of student are you?
            </p>

            <div className="flex flex-col gap-3 mt-7">
              {STUDENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setForm({ ...form, student_type: type.value })}
                  className={`flex items-center gap-4 p-4.5 rounded-2xl border text-left transition-all duration-200 ${
                    form.student_type === type.value
                      ? 'bg-white/[0.15] lg:bg-ios-blue/[0.06] border-ios-blue/60 shadow-lg shadow-ios-blue/10'
                      : 'bg-white/[0.06] lg:bg-white border-white/[0.06] lg:border-black/[0.08] hover:bg-white/[0.1] lg:hover:bg-black/[0.02]'
                  }`}
                >
                  <span className="text-3xl">{type.icon}</span>
                  <div className="flex-1">
                    <p className="text-[15px] font-semibold text-white lg:text-black">{type.label}</p>
                    <p className="text-[12px] text-white/40 lg:text-[#AEAEB2] mt-0.5">{type.desc}</p>
                  </div>
                  {form.student_type === type.value && (
                    <div className="w-6 h-6 rounded-full bg-ios-blue flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: University */}
        {step === 4 && (
          <div className="flex-1 lg:flex-none flex flex-col animate-fade-in">
            <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight mt-4">
              Your University
            </h1>
            <p className="text-[15px] text-white/60 lg:text-[#6b6b70] mt-1.5 leading-relaxed">
              Which university are you attending?
            </p>

            <input
              type="text"
              placeholder="Search universities..."
              value={uniSearch}
              onChange={(e) => setUniSearch(e.target.value)}
              className="mt-6 w-full px-4 py-3.5 rounded-2xl bg-white/[0.08] lg:bg-white text-white lg:text-black placeholder-white/30 lg:placeholder-[#AEAEB2] text-[16px] outline-none border border-white/[0.08] lg:border-black/[0.08] focus:border-white/25 lg:focus:border-ios-blue backdrop-blur-sm transition-all"
            />

            <div className="mt-4 flex flex-col gap-1.5 overflow-y-auto max-h-[42vh] pr-1">
              {filteredUnis.map((uni) => (
                <button
                  key={uni}
                  onClick={() => setForm({ ...form, university: uni })}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                    form.university === uni
                      ? 'bg-white/[0.15] lg:bg-ios-blue/[0.06] border border-ios-blue/60'
                      : 'bg-white/[0.06] lg:bg-white border border-white/[0.06] lg:border-black/[0.08] hover:bg-white/[0.1] lg:hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/[0.1] lg:bg-[#F2F2F7] flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px]">🎓</span>
                  </div>
                  <p className="text-[14px] font-medium text-white lg:text-black flex-1">{uni}</p>
                  {form.university === uni && (
                    <div className="w-6 h-6 rounded-full bg-ios-blue flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Arrival Status */}
        {step === 5 && (
          <div className="flex-1 lg:flex-none flex flex-col animate-fade-in">
            <h1 className="text-[28px] font-bold text-white lg:text-black tracking-tight mt-4">
              Your Arrival Status
            </h1>
            <p className="text-[15px] text-white/60 lg:text-[#6b6b70] mt-1.5 leading-relaxed">
              Where are you in your journey to the UK?
            </p>

            <div className="flex flex-col gap-3 mt-7">
              {ARRIVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, arrival_status: opt.value })}
                  className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all duration-200 ${
                    form.arrival_status === opt.value
                      ? 'bg-white/[0.15] lg:bg-ios-blue/[0.06] border-ios-blue/60 shadow-lg shadow-ios-blue/10'
                      : 'bg-white/[0.06] lg:bg-white border-white/[0.06] lg:border-black/[0.08] hover:bg-white/[0.1] lg:hover:bg-black/[0.02]'
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div className="flex-1">
                    <p className="text-[16px] font-semibold text-white lg:text-black">{opt.label}</p>
                    <p className="text-[13px] text-white/40 lg:text-[#AEAEB2] mt-0.5">{opt.desc}</p>
                  </div>
                  {form.arrival_status === opt.value && (
                    <div className="w-6 h-6 rounded-full bg-ios-blue flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-ios-red text-[13px] bg-ios-red/10 px-4 py-2.5 rounded-xl">{error}</p>
            )}
          </div>
        )}

        {/* Bottom navigation */}
        <div className="mt-auto lg:mt-6 pb-10 lg:pb-6 pt-4 flex gap-3">
          {step > 0 && step !== 1 && (
            <button
              onClick={back}
              className="px-6 py-4 rounded-2xl bg-white/[0.08] lg:bg-[#F2F2F7] text-white lg:text-black text-base font-semibold hover:bg-white/[0.12] lg:hover:bg-black/[0.08] transition-colors"
            >
              Back
            </button>
          )}
          {step !== 1 && (
            <button
              onClick={next}
              disabled={!canProceed[step] || submitting || otpSending}
              className={`flex-1 py-4 rounded-2xl text-white text-base font-semibold tracking-tight disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 ${
                step === 5 ? 'bg-ios-green hover:bg-ios-green/90' : 'bg-ios-blue hover:bg-ios-blue/90'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : otpSending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending code...
                </span>
              ) : step === 5 ? "Let's Go!" : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
    </AuthLayout>
  );
}
