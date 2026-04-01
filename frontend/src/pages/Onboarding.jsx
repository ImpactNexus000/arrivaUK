import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../api';

const UNIVERSITIES = [
  'University of Hertfordshire',
  'University of London',
  'University of Manchester',
  'University of Birmingham',
  'University of Leeds',
  'University of Edinburgh',
  'University of Glasgow',
  'University of Bristol',
  'University of Warwick',
  'University of Sheffield',
  'University of Nottingham',
  'University of Southampton',
  'University of Liverpool',
  'University of Leicester',
  'University of Sussex',
  'University of East London',
  'University of Westminster',
  'University of Greenwich',
  'Coventry University',
  'De Montfort University',
];

const STUDENT_TYPES = [
  {
    value: 'international',
    label: 'International Student',
    desc: 'Non-EU/EEA country',
    icon: '🌍',
  },
  {
    value: 'eu_eea',
    label: 'EU/EEA Student',
    desc: 'European Union or EEA',
    icon: '🇪🇺',
  },
  {
    value: 'uk_home',
    label: 'UK Home Student',
    desc: 'United Kingdom resident',
    icon: '🇬🇧',
  },
];

const ARRIVAL_OPTIONS = [
  {
    value: 'not_arrived',
    label: "Haven't Arrived",
    desc: 'Still preparing to travel',
    icon: '✈️',
  },
  {
    value: 'just_arrived',
    label: 'Just Arrived',
    desc: 'Recently landed in the UK',
    icon: '🛬',
  },
  {
    value: 'been_here',
    label: 'Been Here a While',
    desc: 'Already settled in',
    icon: '🏠',
  },
];

export default function Onboarding({ onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    student_type: '',
    university: '',
    arrival_status: '',
  });
  const [uniSearch, setUniSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredUnis = UNIVERSITIES.filter((u) =>
    u.toLowerCase().includes(uniSearch.toLowerCase())
  );

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const user = await createUser(form);
      localStorage.setItem('arrivauk_user_id', user.id);
      onComplete();
      navigate('/');
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2342] via-[#1a4a7a] to-[#1e5a96] flex flex-col relative overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute w-72 h-72 rounded-full border-[24px] border-white/[0.04] -top-20 -right-20" />
      <div className="absolute w-40 h-40 rounded-full border-[16px] border-white/[0.03] bottom-32 -left-12" />

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-14 pb-6 relative z-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? 'w-8 bg-white' : i < step ? 'w-4 bg-white/60' : 'w-4 bg-white/20'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col px-5 relative z-10">
        {/* Step 0: Name + Student Type */}
        {step === 0 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-[28px] font-bold text-white tracking-tight">
              Welcome to ArriveUK
            </h1>
            <p className="text-[15px] text-white/70 mt-2 leading-relaxed">
              Let's personalise your experience. What's your name and student status?
            </p>

            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-6 w-full px-4 py-3.5 rounded-[14px] bg-white/15 text-white placeholder-white/40 text-[16px] outline-none border border-white/10 focus:border-white/30"
            />

            <div className="flex flex-col gap-2.5 mt-5">
              {STUDENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setForm({ ...form, student_type: type.value })}
                  className={`flex items-center gap-3.5 p-4 rounded-[16px] border text-left transition-all ${
                    form.student_type === type.value
                      ? 'bg-white/20 border-white/40'
                      : 'bg-white/8 border-white/10'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{type.label}</p>
                    <p className="text-[12px] text-white/50">{type.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto pb-10">
              <button
                onClick={() => setStep(1)}
                disabled={!form.name.trim() || !form.student_type}
                className="w-full py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 1: University */}
        {step === 1 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-[28px] font-bold text-white tracking-tight">
              Your University
            </h1>
            <p className="text-[15px] text-white/70 mt-2 leading-relaxed">
              Which university are you attending?
            </p>

            <input
              type="text"
              placeholder="Search universities..."
              value={uniSearch}
              onChange={(e) => setUniSearch(e.target.value)}
              className="mt-6 w-full px-4 py-3.5 rounded-[14px] bg-white/15 text-white placeholder-white/40 text-[16px] outline-none border border-white/10 focus:border-white/30"
            />

            <div className="mt-4 flex flex-col gap-1.5 overflow-y-auto max-h-[45vh] pr-1">
              {filteredUnis.map((uni) => (
                <button
                  key={uni}
                  onClick={() => setForm({ ...form, university: uni })}
                  className={`flex items-center gap-3 px-4 py-3 rounded-[14px] text-left transition-all ${
                    form.university === uni
                      ? 'bg-white/20 border border-white/40'
                      : 'bg-white/8 border border-white/10'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[14px]">🎓</span>
                  </div>
                  <p className="text-[14px] font-medium text-white">{uni}</p>
                  {form.university === uni && (
                    <svg className="w-5 h-5 text-ios-green ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-auto pb-10 flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="px-6 py-4 rounded-[14px] bg-white/10 text-white text-base font-semibold"
              >
                Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!form.university}
                className="flex-1 py-4 rounded-[14px] bg-ios-blue text-white text-base font-semibold tracking-tight disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Arrival Status */}
        {step === 2 && (
          <div className="flex-1 flex flex-col">
            <h1 className="text-[28px] font-bold text-white tracking-tight">
              Your Arrival Status
            </h1>
            <p className="text-[15px] text-white/70 mt-2 leading-relaxed">
              Where are you in your journey to the UK?
            </p>

            <div className="flex flex-col gap-3 mt-6">
              {ARRIVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setForm({ ...form, arrival_status: opt.value })}
                  className={`flex items-center gap-4 p-5 rounded-[18px] border text-left transition-all ${
                    form.arrival_status === opt.value
                      ? 'bg-white/20 border-white/40'
                      : 'bg-white/8 border-white/10'
                  }`}
                >
                  <span className="text-3xl">{opt.icon}</span>
                  <div>
                    <p className="text-[16px] font-semibold text-white">{opt.label}</p>
                    <p className="text-[13px] text-white/50 mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto pb-10 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-[14px] bg-white/10 text-white text-base font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!form.arrival_status || submitting}
                className="flex-1 py-4 rounded-[14px] bg-ios-green text-white text-base font-semibold tracking-tight disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Setting up...' : "Let's Go!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
