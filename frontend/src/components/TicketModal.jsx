import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export const TicketModal = ({ event, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/public/tickets', {
        email,
        eventId: event._id,
        consent
      });
      window.open(event.originalUrl, '_blank');
      onClose();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-[#0f1115] border border-white/10 p-8 rounded-[2rem] max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Decorative Top Gradient Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="text-center mb-8 mt-2">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3 hover:rotate-0 transition-transform duration-300">
              <Mail className="text-emerald-400" size={28} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Secure Your Spot</h2>
            <p className="text-gray-400 text-sm mt-2 font-medium">Enter your email to proceed to <span className="text-white">{event.sourceName}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="email" 
                required
                placeholder="hello@example.com"
                className="w-full bg-[#16191f] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white font-medium placeholder:text-gray-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group bg-[#16191f] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="relative flex items-center mt-0.5">
                <input 
                  type="checkbox" 
                  required
                  className="peer w-5 h-5 appearance-none border border-white/20 rounded-md checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <ShieldCheck size={14} className="absolute inset-0 m-auto text-black opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-[11px] leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors font-medium">
                I agree to receive event updates and allow sharing my info with the organizer. 
                <span className="text-emerald-400 ml-1 hover:underline">Privacy Policy</span>
              </span>
            </label>

            <button 
              disabled={loading}
              className="w-full py-4 bg-white text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] font-black tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="animate-pulse">PROCESSING...</span>
              ) : (
                <>PROCEED TO TICKETS <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-black">
            <Lock size={12} className="text-gray-400" /> Secure 256-bit Redirect
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};