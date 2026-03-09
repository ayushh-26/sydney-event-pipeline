import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Check, ArrowRight, Lock, KeyRound, RefreshCw, CheckCircle2, ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://sydney-event-api.onrender.com';

const Steps = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-6 mt-2">
    {['Email', 'Verify', 'Access'].map((label, i) => {
      const step = i + 1;
      const done = current > step;
      const active = current === step;
      return (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
              done ? 'bg-emerald-500 text-black' : active ? 'bg-white text-black' : 'bg-white/10 text-gray-400'
            }`}>
              {done ? <CheckCircle2 size={14} /> : step}
            </div>
            <span className={`text-[11px] font-bold uppercase tracking-widest ${active ? 'text-white' : 'text-gray-500'}`}>{label}</span>
          </div>
          {i < 2 && <div className={`w-6 h-px transition-all duration-500 ${current > step ? 'bg-emerald-500' : 'bg-white/10'}`} />}
        </div>
      );
    })}
  </div>
);

// ── OTP Input ────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    if (!val && e.target.value !== '') return;
    const next = [...digits];
    next[idx] = val;
    onChange(next.join(''));
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[idx]) {
        next[idx] = '';
        onChange(next.join(''));
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
        next[idx - 1] = '';
        onChange(next.join(''));
      }
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          className={`w-11 h-14 text-center text-xl font-black rounded-xl border transition-all outline-none bg-[#16191f]
            ${d ? 'border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'border-white/10 text-gray-400'}
            focus:border-emerald-400`}
        />
      ))}
    </div>
  );
};

const ConsentCheckbox = ({ checked, onChange }) => (
  <div
    role="checkbox"
    aria-checked={checked}
    tabIndex={0}
    onClick={() => onChange(!checked)}
    onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onChange(!checked)}
    className="flex items-start gap-3 cursor-pointer group p-4 rounded-2xl border transition-all duration-300 select-none outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
    style={{
      background: checked ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.03)',
      borderColor: checked ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.06)',
    }}
  >
    {/* Hidden input for form validity */}
    <input type="checkbox" required checked={checked} onChange={() => {}} className="sr-only" tabIndex={-1} />

    {/* Animated visual box */}
    <motion.div
      animate={{
        backgroundColor: checked ? '#10b981' : 'rgba(0,0,0,0.5)',
        borderColor: checked ? '#10b981' : 'rgba(255,255,255,0.2)',
        boxShadow: checked ? '0 0 14px rgba(16,185,129,0.4)' : '0 0 0px transparent',
      }}
      transition={{ duration: 0.15 }}
      className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center"
    >
      <motion.div
        initial={false}
        animate={
          checked
            ? { opacity: 1, scale: 1, rotate: 0 }
            : { opacity: 0, scale: 0.3, rotate: -60 }
        }
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      >
        <Check size={12} strokeWidth={4} color="#000" />
      </motion.div>
    </motion.div>

    <span className="text-[11px] leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors font-medium">
      I agree to receive updates and share my info with the organizer.{' '}
      <span className="text-emerald-400 hover:underline">Privacy Policy</span>
    </span>
  </div>
);

// ── Main Modal ───────────────────────────────────────────────────
export const TicketModal = ({ event, isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setTimeout(() => { setStep(1); setEmail(''); setOtp(''); setError(''); setConsent(false); }, 300);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/api/public/send-otp`, { email, eventId: event._id });
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length < 6) return setError('Enter the 6-digit code.');
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/api/public/verify-otp`, { email, otp, eventId: event._id, consent });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#0f1115] border border-white/10 p-8 rounded-[2rem] max-w-md w-full relative shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

          <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>

          <Steps current={step} />

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Email + Consent ──────────────────────── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="text-center mb-7">
                  <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform">
                    <Mail className="text-emerald-400" size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white">Secure Your Spot</h2>
                  <p className="text-gray-400 text-sm mt-2">Get a one-time code for <span className="text-white font-semibold">{event.sourceName}</span></p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      type="email" required placeholder="hello@example.com"
                      className="w-full bg-[#16191f] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white font-medium focus:border-emerald-500 outline-none transition-all placeholder:text-gray-600"
                      value={email} onChange={e => setEmail(e.target.value)}
                    />
                  </div>

                  <ConsentCheckbox checked={consent} onChange={setConsent} />

                  {error && <p className="text-red-400 text-xs text-center font-bold">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white text-black hover:bg-emerald-400 font-black tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50 mt-2"
                  >
                    {loading ? <span className="animate-pulse">SENDING...</span> : <>SEND OTP CODE <ArrowRight size={18} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 2: OTP ──────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-7">
                  <div className="w-16 h-16 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <KeyRound className="text-blue-400" size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white">Enter Code</h2>
                  <p className="text-gray-400 text-sm mt-2">Code sent to <span className="text-white font-semibold">{email}</span></p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <OtpInput value={otp} onChange={setOtp} />

                  {error && <p className="text-red-400 text-xs text-center font-bold">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-4 bg-white text-black hover:bg-emerald-400 font-black tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <span className="animate-pulse">VERIFYING...</span> : <>VERIFY & GET TICKETS <ArrowRight size={18} /></>}
                  </button>

                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider px-2">
                    <button type="button" onClick={() => setStep(1)} className="text-gray-500 hover:text-white transition-colors">← Edit Email</button>
                    <button type="button" disabled={countdown > 0} onClick={handleSendOtp} className="text-emerald-500 hover:text-emerald-400 disabled:text-gray-600 flex items-center gap-1 transition-colors">
                      <RefreshCw size={11} />
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3: Success + Ticket Link ────────────────── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
                  className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle2 className="text-emerald-400" size={40} />
                </motion.div>

                <div>
                  <h2 className="text-2xl font-black text-white">Verified!</h2>
                  <p className="text-gray-400 text-sm mt-2">
                    You're all set for <span className="text-white font-semibold">{event.sourceName}</span>
                  </p>
                </div>

                {/* Real <a> tag — direct user click, never popup-blocked */}
                <motion.a
                  href={event.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  onClick={onClose}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black tracking-widest text-xs uppercase rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <ExternalLink size={15} /> GET MY TICKETS
                </motion.a>

                <button onClick={onClose} className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors font-semibold">
                  Close this window
                </button>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-black">
            <Lock size={12} className="text-gray-400" /> OTP-Secured · 256-bit Redirect
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};