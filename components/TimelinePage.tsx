
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Event, EventStatus } from '../types';
import { ChevronRight, Calendar, MapPin, Zap, Flame, Clock, Globe, X, ExternalLink, Info } from 'lucide-react';

interface Props {
  events: Event[];
}

const TimelinePage: React.FC<Props> = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const allEventsSorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-24 overflow-hidden">
      {/* Dynamic Background Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-emerald-500 via-emerald-500/20 to-transparent" />
      </div>

      <div className="relative z-10 space-y-40 lg:space-y-48">
        {allEventsSorted.map((event, idx) => {
          const isCompleted = event.status === EventStatus.COMPLETED;
          const isOngoing = event.status === EventStatus.ONGOING || event.status === EventStatus.REGISTRATION_OPEN;
          
          return (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, y: 60, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col md:flex-row items-center gap-12 lg:gap-28 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Central Timeline Node */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-30">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                  className={`w-14 h-14 rounded-2xl border-[3px] border-slate-950 rotate-45 flex items-center justify-center transition-all duration-700 ${
                    isOngoing 
                      ? 'bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)]' 
                      : 'bg-slate-900 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                  }`}
                >
                   <div className="-rotate-45">
                     {isCompleted ? <Zap size={20} className="text-slate-400" /> : <Flame size={20} className="text-black animate-pulse" />}
                   </div>
                </motion.div>
              </div>

              {/* Enhanced Content Card */}
              <div className="flex-1 w-full group">
                <motion.div 
                  onClick={() => setSelectedEvent(event)}
                  whileHover={{ 
                    y: -12,
                    scale: 1.02,
                    borderColor: "rgba(16, 185, 129, 0.3)"
                  }}
                  className="glass-card rounded-[48px] p-10 md:p-14 border-white/5 hover:bg-white/[0.03] transition-all duration-500 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                  {/* Glowing Highlight */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[60px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />

                  {/* Top Meta Info */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                    <div className="flex items-center space-x-3">
                      <motion.span 
                        animate={isOngoing ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`text-[9px] font-black uppercase tracking-[0.25em] px-6 py-2.5 rounded-full border shadow-sm ${
                          isOngoing 
                            ? 'bg-emerald-500 text-black border-emerald-400 font-black' 
                            : 'bg-white/5 text-slate-500 border-white/10'
                        }`}
                      >
                        {event.status}
                      </motion.span>
                      {isOngoing && (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-5">
                       <div className="flex items-center space-x-2.5 text-slate-500 group-hover:text-emerald-400 transition-colors">
                          <Calendar size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {new Date(event.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="space-y-6">
                    <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none italic group-hover:not-italic group-hover:text-emerald-500 transition-all duration-700">
                      {event.title}
                    </h3>
                    
                    <p className="text-slate-400 leading-relaxed text-lg font-medium max-w-xl group-hover:text-slate-300 transition-colors line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Refined Footer Grid */}
                  <div className="mt-12 pt-12 border-t border-white/5 flex flex-wrap items-center justify-between gap-8">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                          <MapPin size={18} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Location</p>
                          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Outdoor Stadium, VIT-C</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                          <Globe size={18} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Access</p>
                          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Open to All Students</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-emerald-500 font-black text-[9px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Details</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Visual Component - Immersive Frame */}
              <div className="flex-1 w-full hidden md:block">
                 <motion.div 
                   onClick={() => setSelectedEvent(event)}
                   whileHover={{ scale: 1.03 }}
                   className="relative aspect-[16/11] rounded-[48px] overflow-hidden border border-white/10 group cursor-pointer shadow-2xl"
                 >
                    <img 
                      src={event.banner} 
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" 
                      alt={event.title} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    
                    {/* Floating Accent Badge */}
                    <div className="absolute top-8 right-8">
                       <div className="p-4 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-white/10 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                          <Clock className="text-emerald-500" size={24} />
                       </div>
                    </div>

                    {/* Centered Interaction Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                       <div className="bg-emerald-500 text-black p-8 rounded-full shadow-[0_0_60px_rgba(16,185,129,0.5)] scale-75 group-hover:scale-100 transition-transform">
                          <Zap size={36} fill="currentColor" />
                       </div>
                    </div>

                    {/* Bottom Label */}
                    <div className="absolute bottom-10 left-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-1">Press Ready</p>
                      <p className="text-xl font-black text-white uppercase italic">ARCHIVE_V2.0</p>
                    </div>
                 </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl" 
              onClick={() => setSelectedEvent(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-6xl h-full lg:h-auto max-h-[90vh] glass-card rounded-[60px] border-white/10 overflow-hidden shadow-2xl flex flex-col lg:flex-row"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all z-20 backdrop-blur-md"
              >
                <X size={24} />
              </button>

              {/* Banner Area */}
              <div className="w-full lg:w-1/2 h-64 lg:h-auto relative overflow-hidden">
                <img 
                  src={selectedEvent.banner} 
                  className="w-full h-full object-cover grayscale brightness-50"
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 lg:bottom-16 lg:left-16">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-emerald-500 rounded-2xl text-black">
                      <Zap size={24} fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Official Club Event</span>
                  </div>
                  <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-none italic text-white">{selectedEvent.title}</h2>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-10 lg:p-20 overflow-y-auto bg-slate-900/40">
                <div className="space-y-12">
                  <div className="flex flex-wrap gap-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Event Date</span>
                      <div className="flex items-center space-x-2 text-white">
                        <Calendar size={16} className="text-emerald-500" />
                        <span className="text-xl font-black uppercase tracking-tight">{new Date(selectedEvent.date).toDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Access Type</span>
                      <div className="flex items-center space-x-2 text-white">
                        <Globe size={16} className="text-blue-500" />
                        <span className="text-xl font-black uppercase tracking-tight">Open Entry</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</span>
                      <div className="flex items-center space-x-2 text-emerald-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xl font-black uppercase tracking-tight">{selectedEvent.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <div className="flex items-center space-x-3 text-slate-400 mb-4">
                      <Info size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Brief Overview</span>
                    </div>
                    <p className="text-2xl text-slate-300 leading-relaxed font-medium">
                      {selectedEvent.description}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-8 rounded-[40px] space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Department Guidelines</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-emerald-500 border border-white/5">
                           <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">Report Time</p>
                          <p className="text-xs text-slate-400">Please arrive 30 mins early for briefings.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-blue-500 border border-white/5">
                           <MapPin size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">Venue Check</p>
                          <p className="text-xs text-slate-400">Indoor Sports Complex, Main Floor.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button className="w-full py-6 bg-white text-black rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl">
                      Register Interest
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimelinePage;