import { motion } from 'framer-motion';
import { ShieldCheck, Radar, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config'; 

export default function Login() {
  const handleGoogleLogin = () => {
    const cleanBaseUrl = API_BASE_URL.replace(/\/$/, "");
    window.location.href = `${cleanBaseUrl}/auth/google`;
  };

  return (
    // FIX: Height set to viewport minus navbar height to kill all scrolling
    <div className="h-[calc(100vh-5rem)] w-full bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Tech Grid Background (Matches Home & Dashboard) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Dynamic Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

      <motion.div 
        initial={{ y: 20, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-[#0a0c10]/60 backdrop-blur-3xl border border-white/10 p-12 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] text-center relative z-10 overflow-hidden"
      >
        {/* Top Neon Accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />

        <div className="mb-10 relative">
          {/* Pulsing Radar Icon */}
          <div className="w-20 h-20 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 relative group">
             <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
             <Radar className="text-emerald-400 animate-[spin_6s_linear_infinite] relative z-10" size={32} />
          </div>
          
          <h1 className="text-5xl font-black text-white tracking-tighter mb-3">
            PULSE<span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">.</span>SYD
          </h1>
          
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Internal Management
          </p>
        </div>

        {/* Auth Button */}
        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all duration-500 shadow-xl active:scale-[0.97] group"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Authenticate with Google
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          
          <p className="text-[10px] text-gray-600 font-medium">
            Single Sign-On (SSO) for authorized Sydney admins.
          </p>
        </div>

        {/* Security Footer */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" /> Secure Admin Access
          </div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Subtle Bottom Credits */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-700 font-bold uppercase tracking-[0.4em] pointer-events-none">
        Authorized Access Only
      </div>
    </div>
  );
}