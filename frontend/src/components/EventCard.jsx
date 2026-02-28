import { Calendar, MapPin, ArrowUpRight, Ticket, Activity } from "lucide-react";

export const EventCard = ({ event, onGetTickets }) => {
  let eventDate = new Date(event.date);
  const now = new Date();
  
  if (isNaN(eventDate.getTime())) {
    eventDate = now;
  }

  // LOGIC FIX: Check if we recently touched this event in the database
  const scrapeTime = event.lastScrapedAt || event.updatedAt || Date.now();
  const isRecentScrape = new Date(scrapeTime) > new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // It is ONLY 'Live Now' if the start date is in the past AND it was recently scraped
  const isOngoing = eventDate < now && isRecentScrape;

  const month = isOngoing ? "LIVE" : eventDate.toLocaleString("en-AU", { month: "short" }).toUpperCase();
  const day = isOngoing ? "NOW" : eventDate.toLocaleString("en-AU", { day: "2-digit" });

  return (
    <div className="group flex flex-col bg-[#0f1115] border border-white/10 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all duration-500 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] h-full relative">
      
      {/* Top Image Section */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0f1115]" />
        
        {/* SMART Date Badge */}
        <div className="absolute top-4 right-4 bg-[#0f1115]/80 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col items-center justify-center p-2.5 min-w-[3.5rem] shadow-xl">
          {isOngoing ? (
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-black tracking-widest text-red-500 uppercase">{month}</span>
            </div>
          ) : (
            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-0.5">{month}</span>
          )}
          <span className="text-white text-xl font-black leading-none">{day}</span>
        </div>

        {/* Source Badge */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-gray-300 tracking-widest uppercase flex items-center gap-1.5">
          <Ticket size={12} className={event.sourceName === "Eventbrite" ? "text-orange-500" : "text-blue-400"}/> 
          {event.sourceName}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1 z-10 relative">
        <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-emerald-400 transition-colors line-clamp-2">
          {event.title}
        </h3>
        
        <p className="text-sm text-gray-400 mb-6 line-clamp-2 flex-1 leading-relaxed">
          {event.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
          <div className="flex items-center gap-2 text-gray-500 max-w-[55%]">
            <MapPin size={14} className="shrink-0 text-emerald-500" />
            <span className="text-xs font-medium truncate group-hover:text-gray-300 transition-colors">{event.venue}</span>
          </div>
          
          <button
            onClick={() => onGetTickets(event)}
            className="group/btn flex items-center gap-2 text-[11px] font-black text-black bg-white hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] px-5 py-2.5 rounded-full transition-all duration-300 active:scale-95"
          >
            GET TICKETS 
            <ArrowUpRight size={14} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};