import { useState, useEffect } from 'react';
import axios from 'axios';
import { EventCard } from '../components/EventCard';
import { TicketModal } from '../components/TicketModal';
import { Sparkles, Activity, Radar } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const cleanBaseUrl = API_BASE_URL.replace(/\/$/, ""); 
        const res = await axios.get(`${cleanBaseUrl}/api/public/events`);
        setEvents(res.data);
      } catch (err) { 
        console.error("Error fetching events:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-emerald-500/30 font-sans relative">
      
      {/* Premium Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Classy Gradient Ambient Glows */}
      <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-emerald-600/15 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Hero Section */}
      <header className="relative pt-40 pb-24 text-center px-4 z-10 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.1)]"
        >
          <Radar size={14} className="animate-[spin_4s_linear_infinite]" /> Live Aggregation Engine
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-7xl md:text-[9rem] font-black tracking-tighter mb-6 leading-[0.85] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/20"
        >
          PULSE<span className="text-emerald-500 drop-shadow-[0_0_25px_rgba(16,185,129,0.8)]">.</span>SYD
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-medium leading-relaxed"
        >
          Discover the heartbeat of Sydney. An automated, real-time curation of the city's most anticipated live experiences.
        </motion.p>
      </header>

      {/* Events Grid */}
      <main className="relative max-w-[1600px] mx-auto px-6 pb-32 z-10">
        
        {/* Sleek Grid Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-white/5 pb-6 gap-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3">
            <Sparkles className="text-emerald-500" size={18} /> Curated Experiences
          </h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Activity size={14} /> {events.length} Active Events
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 8].map(i => (
              <div key={i} className="aspect-[4/5] bg-white/[0.02] animate-pulse rounded-[2rem] border border-white/5" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {events.map((event, i) => (
              <motion.div 
                key={event._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                className="h-full"
              >
                <EventCard event={event} onGetTickets={(e) => setSelectedEvent(e)} />
              </motion.div>
            ))}
          </div>
        ) : (
          /* Premium Empty State */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-40 border border-dashed border-white/10 rounded-[2rem] bg-white/[0.01] backdrop-blur-sm"
          >
            <Radar size={48} className="mx-auto text-emerald-500/50 mb-4 animate-pulse" />
            <p className="text-gray-400 font-medium text-lg tracking-wide">Scanning the city for new events...</p>
          </motion.div>
        )}
      </main>

      <TicketModal event={selectedEvent} isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}