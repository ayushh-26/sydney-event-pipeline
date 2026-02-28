import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Calendar, ExternalLink, CheckCircle, AlertCircle, Database, LayoutTemplate, ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const styles = {
    new: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 dot-emerald",
    updated: "bg-amber-500/10 text-amber-400 border-amber-500/20 dot-amber",
    inactive: "bg-red-500/10 text-red-400 border-red-500/20 dot-red",
    imported: "bg-blue-500/10 text-blue-400 border-blue-500/20 dot-blue"
  };

  const badgeStyle = styles[status] || styles.new;
  const dotColor = badgeStyle.match(/dot-(\w+)/)[1];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeStyle.split(' dot-')[0]}`}>
      <span className={`w-1.5 h-1.5 rounded-full bg-${dotColor}-500 shadow-[0_0_5px_currentColor]`} />
      {status || 'new'}
    </span>
  );
};

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Filters State
  const [keyword, setKeyword] = useState('');
  const [cityFilter, setCityFilter] = useState('Sydney');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Action State
  const [isImporting, setIsImporting] = useState(false);

  // Fetch Data based on filters
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let queryParams = `?city=${cityFilter}`;
        if (keyword) queryParams += `&keyword=${keyword}`;
        if (startDate) queryParams += `&startDate=${startDate}`;
        if (endDate) queryParams += `&endDate=${endDate}`;

        const res = await axios.get(`http://localhost:5000/api/admin/dashboard${queryParams}`, { withCredentials: true });
        setEvents(res.data);
      } catch (err) { console.error("Dashboard fetch error:", err); }
    };
    
    const delayDebounceFn = setTimeout(() => { fetchDashboardData(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [keyword, cityFilter, startDate, endDate]);

  const handleImport = async (id) => {
    setIsImporting(true);
    try {
      await axios.patch(`http://localhost:5000/api/admin/import/${id}`, {}, { withCredentials: true });
      setEvents(events.map(e => e._id === id ? { ...e, status: 'imported' } : e));
      setSelectedEvent({ ...selectedEvent, status: 'imported' });
    } catch (err) { 
      alert("Import failed. Ensure backend is running."); 
    } finally {
      setIsImporting(false);
    }
  };

  return (
    // FIX: calc(100vh - 5rem) explicitly accounts for the Navbar height!
    // overflow-hidden on the main wrapper completely kills all outside scrolling.
    <div className="h-[calc(100vh-5rem)] w-full bg-[#050505] text-white flex relative overflow-hidden font-sans">
      
      {/* Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Sidebar - Cleaned up, removed redundant User Info */}
      <aside className="w-64 border-r border-white/5 p-6 space-y-8 bg-[#0a0c10]/80 backdrop-blur-xl z-10 hidden md:flex flex-col h-full flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-white flex items-center gap-1 mb-1">
            PULSE<span className="text-emerald-500">.</span>SYD
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Admin Portal</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <div className="p-3 bg-white/5 rounded-xl font-bold flex items-center gap-3 text-emerald-400 border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Database size={18}/> Live Feed
          </div>
          <Link to="/" target="_blank" className="p-3 rounded-xl font-medium flex items-center justify-between group text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <div className="flex items-center gap-3">
              <LayoutTemplate size={18} className="group-hover:text-blue-400 transition-colors"/> Live Website
            </div>
            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full overflow-hidden z-10 relative min-w-0">
        
        {/* Top Filter Bar */}
        <header className="p-6 border-b border-white/5 bg-[#0a0c10]/60 backdrop-blur-xl flex flex-wrap gap-4 items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 w-full md:w-auto flex-1">
            <div className="relative flex-1 min-w-[250px] group">
              <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input 
                className="w-full bg-[#13161c] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-emerald-500 outline-none transition-all" 
                placeholder="Search event title or description..." 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 text-emerald-500" size={16} />
              <select 
                className="bg-[#13161c] border border-white/5 rounded-2xl pl-11 pr-8 py-3 text-sm font-bold appearance-none outline-none focus:border-emerald-500 text-white cursor-pointer"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="Sydney">Sydney, AU</option>
                <option value="Melbourne">Melbourne, AU</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#13161c] border border-white/5 rounded-2xl px-4 py-2">
            <Calendar size={16} className="text-gray-500" />
            <input type="date" className="bg-transparent text-xs font-medium outline-none text-gray-400 focus:text-white [&::-webkit-calendar-picker-indicator]:invert-[0.8]" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="text-gray-600 text-xs font-black">TO</span>
            <input type="date" className="bg-transparent text-xs font-medium outline-none text-gray-400 focus:text-white [&::-webkit-calendar-picker-indicator]:invert-[0.8]" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Table Area - Inner Scroll Only */}
          <div className="flex-1 overflow-y-auto p-6 overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/50">
            <div className="bg-[#0a0c10]/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#13161c] border-b border-white/5 sticky top-0 z-10">
                  <tr className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <th className="p-4 pl-6">Event Details</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Pipeline Status</th>
                    <th className="p-4 pr-6 text-right">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map(e => (
                    <tr 
                      key={e._id} 
                      onClick={() => setSelectedEvent(e)} 
                      className={`cursor-pointer group transition-colors ${selectedEvent?._id === e._id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                    >
                      <td className="p-4 pl-6">
                        <div className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{e.title}</div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">{e.venue}</div>
                      </td>
                      <td className="p-4 text-xs font-bold text-gray-400 whitespace-nowrap">{e.date ? new Date(e.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</td>
                      <td className="p-4"><StatusBadge status={e.status}/></td>
                      <td className="p-4 pr-6 text-right">
                        <a href={e.originalUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                          <ExternalLink size={14}/>
                        </a>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-12 text-gray-500 text-sm font-medium">No events found matching your criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* OVERLAY */}
          {selectedEvent && (
            <div 
              className="absolute inset-0 bg-black/20 backdrop-blur-[2px] z-20 md:hidden" 
              onClick={() => setSelectedEvent(null)}
            />
          )}

          {/* Preview Panel - Removed Notes, Cleaned UI */}
          <aside 
            className={`absolute right-0 top-0 h-full w-full max-w-[450px] border-l border-white/5 bg-[#0a0c10]/95 backdrop-blur-3xl p-6 overflow-y-auto transition-transform duration-300 shadow-[-30px_0_50px_rgba(0,0,0,0.6)] z-30 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/50 ${selectedEvent ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {selectedEvent && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-10">
                
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-xl group bg-[#13161c]">
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors backdrop-blur-md"
                  >
                    <X size={16} />
                  </button>
                  <img 
                    src={selectedEvent.imageUrl} 
                    alt={selectedEvent.title}
                    className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105" 
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${selectedEvent._id}/400/300`; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <StatusBadge status={selectedEvent.status}/>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-black mb-3 leading-snug">{selectedEvent.title}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed max-h-32 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {selectedEvent.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Source</p>
                    <p className="text-sm font-bold text-white truncate">{selectedEvent.sourceName}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Date</p>
                    <p className="text-sm font-bold text-white whitespace-nowrap">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Clean, Simple Import Button */}
                <div className="mt-8 pt-6 border-t border-white/5">
                  {selectedEvent.status !== 'imported' ? (
                    <div className="space-y-4 bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl text-center">
                      <p className="text-[11px] text-gray-400 font-medium mb-2">Review complete? Publish this event directly to the public platform.</p>
                      <button 
                        onClick={() => handleImport(selectedEvent._id)}
                        disabled={isImporting}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isImporting ? "Processing..." : <>Import to Live Platform <ArrowRight size={16} /></>}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full py-4 bg-white/5 border border-white/10 text-emerald-500 rounded-xl font-bold text-center flex flex-col items-center justify-center gap-2 text-sm">
                      <CheckCircle size={24} className="mb-1 text-emerald-400"/>
                      <span className="text-white font-black uppercase tracking-widest text-xs">Successfully Imported</span>
                      <span className="text-[10px] text-gray-500 font-medium">This event is now live on PULSE.SYD</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}