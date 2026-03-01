import { Link, useLocation } from "react-router-dom";
import {
  Home as HomeIcon,
  ShieldCheck,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth(); // Pulls the real auth state from your context
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0c10]/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 transition-all duration-300">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        {/* Animated Logo */}
        {/* Change this: */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter text-white flex items-center gap-1 group"
        >
          PULSE
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 group-hover:from-emerald-300 group-hover:to-blue-400 transition-all duration-300">
            .SYD
          </span>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Home Link (Hidden on Home Page for cleaner UI, visible elsewhere) */}
          {location.pathname !== "/" && (
            <Link
              to="/"
              className="text-sm font-bold text-gray-400 hover:text-emerald-400 flex items-center gap-2 transition-colors"
            >
              <HomeIcon size={16} /> Home
            </Link>
          )}

          {/* Dynamic Auth Buttons */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            {user ? (
              // ---- USER IS LOGGED IN ----
              <>
                {!isAdminRoute ? (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 active:scale-95"
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                ) : (
                  <a
                    href="http://localhost:5000/auth/logout"
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 active:scale-95"
                  >
                    <LogOut size={16} /> Logout
                  </a>
                )}

                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full border-2 border-white/10 overflow-hidden ml-2 shadow-lg hidden sm:block">
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.displayName}&background=10b981&color=fff`
                    }
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            ) : (
              // ---- USER IS NOT LOGGED IN ----
              <Link
                to="/login"
                className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white text-gray-300 hover:text-black border border-white/10 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 active:scale-95"
              >
                <ShieldCheck
                  size={16}
                  className="text-emerald-500 group-hover:text-black transition-colors"
                />{" "}
                Admin Access
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
