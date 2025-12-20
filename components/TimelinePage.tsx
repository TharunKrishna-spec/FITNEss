
import React, { useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { Event, EventStatus } from '../types';
import { ChevronRight, Calendar, MapPin, Zap, Flame, Clock, Globe, X, Info } from 'lucide-react';

interface Props {
  events: Event[];
  config?: Record<string, string>;
}

const TimelinePage: React.FC<Props> = ({ events, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const allEventsSorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // High-fidelity scroll tracking for the spine
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 40%", "end 60%"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="relative max-w-7xl mx-auto px-6 py-12 md:py-20 overflow-hidden">
      {/* Page Header */}
      <div className="mb-20 md:mb-32 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center space-x-3 text-emerald-500 mb-4 font-black uppercase tracking-[0.6em] text-[10px]"
        >
          <div className="w-10 h-px bg-emerald-500/30" />
          <span>Operational Roadmap</span>
        </motion.div>
        <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter italic leading-[0.85] text-white">
          {config?.events_title || 'LIVE FEED.'}
        </h2>
      </div>

      {/* The Spine - Refined to prevent "extra length" lines */}
      <div className="absolute left-1/2 -translate-x-1/2 top-64 bottom-32 w-[2px] z-0 hidden md:block">
        <div className="absolute inset-0 bg-white/5" />
        <motion.div 
          className="absolute top-0 w-full bg-gradient-to-b from-emerald-500 via-emerald-400 to-emerald-600 shadow-[0_0_20px_#10b981]"
          style={{ 
            height: '100%', 
            scaleY, 
            originY: 0,
            opacity: useTransform(scrollYProgress, [0, 0.01], [0, 1])
          }}
        />
        {/* Glow point that follows the scroll */}
        <motion.div 
          style={{ 
            top: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
            opacity: useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0])
          }}
          className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-400 blur-sm rounded-full z-10"
        />
      </div>

      <div className="relative z-10 space-y-32 md:space-y-48">
        {allEventsSorted.map((event, idx) => {
          const isCompleted = event.status === EventStatus.COMPLETED;
          const isOngoing = event.status === EventStatus.ONGOING || event.status === EventStatus.REGISTRATION_OPEN;
          const isEven = idx % 2 === 0;
          
          return (
            <div key={event.id} className="relative flex flex-col md:flex-row items-center justify-between group">
              {/* Central Timeline Node */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-30">
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className={`w-12 h-12 rounded-2xl border-[3px] border-slate-950 rotate-45 flex items-center justify-center transition-all duration-700 ${
                    isOngoing 
                      ? 'bg-emerald-500 shadow-[0_0_25px_#10b981] ring-4 ring-emerald-500/20' 
                      : 'bg-slate-900 border-white/10 group-hover:border-emerald-500/50'
                  }`}
                >
                   <div className="-rotate-45">
                     {isCompleted ? (
                       <Zap size={16} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                     ) : (
                       <Flame size={18} className={`${isOngoing ? 'text-black animate-pulse' : 'text-slate-600'}`} />
                     )}
                   </div>
                </motion.div>
              </div>

              {/* Card Container - Normalized Height */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? -60 : 60, scale: 0.95 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
                className={`flex-1 w-full md:w-auto ${isEven ? 'md:pr-16' : 'md:pl-16 md:order-2'}`}
              >
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="glass-card rounded-[40px] p-8 md:p-10 border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group/card shadow-2xl relative overflow-hidden"
                >
                  {/* Subtle hover glow */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[80px] rounded-full group-hover/card:bg-emerald-500/10 transition-all duration-1000" />
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm ${
                        isOngoing 
                          ? 'bg-emerald-500 text-black border-emerald-400' 
                          : 'bg-white/5 text-slate-500 border-white/10'
                      }`}>
                        {event.status}
                      </span>
                      {isOngoing && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600 group-hover/card:text-slate-400 transition-colors">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 group-hover/card:text-emerald-500 transition-all leading-none italic">
                    {event.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-2 h-10 mb-8 opacity-80 group-hover/card:opacity-100 transition-opacity">
                    {event.description}
                  </p>

                  <div className="flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex items-center space-x-3 text-slate-600 group-hover/card:text-emerald-400 transition-colors">
                      <div className="p-2 bg-white/5 rounded-lg group-hover/card:bg-emerald-500/10">
                        <MapPin size={14} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">Campus Ground</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-500 opacity-0 group-hover/card:opacity-100 translate-x-4 group-hover/card:translate-x-0 transition-all">
                      <span className="text-[9px] font-black uppercase">Inspect</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Media Block - Standardized Aspect */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: isEven ? 60 : -60 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`flex-1 hidden md:block ${isEven ? 'md:order-2 md:pl-16' : 'md:pr-16'}`}
              >
                <div 
                  onClick={() => setSelectedEvent(event)}
                  className="aspect-[16/10] rounded-[40px] overflow-hidden border border-white/5 relative group/img cursor-pointer shadow-2xl"
                >
                  <img 
                    src={event.banner} 
                    className="w-full h-full object-cover grayscale opacity-40 group-hover/img:grayscale-0 group-hover/img:opacity-80 group-hover/img:scale-105 transition-all duration-1000 ease-in-out" 
                    alt={event.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Visual ID Tag */}
                  <div className="absolute bottom-10 left-10">
                    <div className="flex items-center space-x-3 text-[9px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-1">
                      <div className="w-6 h-[1px] bg-emerald-500" />
                      <span>SECURE_DATA</span>
                    </div>
                    <p className="text-xl font-black text-white uppercase italic tracking-tighter opacity-40">CYCLE_ID_0{idx + 1}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Spacing Refinement at Bottom */}
      <div className="h-32" />

      {/* Modal Detail Engine */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl" 
              onClick={() => setSelectedEvent(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 30 }} 
              className="relative w-full max-w-5xl h-full lg:h-auto max-h-[90vh] glass-card rounded-[48px] border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.6)] flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedEvent(null)} 
                className="absolute top-8 right-8 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all z-30 backdrop-blur-md"
              >
                <X size={24} />
              </button>
              
              <div className="w-full md:w-5/12 h-64 md:h-auto relative overflow-hidden">
                <img src={selectedEvent.banner} className="w-full h-full object-cover grayscale brightness-50" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 lg:bottom-16 lg:left-16">
                  <div className="p-3 bg-emerald-500 rounded-2xl w-fit mb-6 shadow-xl shadow-emerald-500/20">
                    <Zap size={24} className="text-black" fill="currentColor" />
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-none italic text-white">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>

              <div className="flex-1 p-10 lg:p-16 bg-slate-900/40 space-y-10 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 pb-10 border-b border-white/5">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Schedule</p>
                    <div className="flex items-center space-x-2 text-white">
                      <Calendar size={14} className="text-emerald-500" />
                      <span className="text-lg font-black uppercase tracking-tight">{new Date(selectedEvent.date).toDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Operation Status</p>
                    <div className="flex items-center space-x-2 text-emerald-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-lg font-black uppercase tracking-tight">{selectedEvent.status}</span>
                    </div>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Clearance</p>
                    <div className="flex items-center space-x-2 text-blue-500">
                      <Globe size={14} />
                      <span className="text-lg font-black uppercase tracking-tight">Open Deck</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <Info size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Event Brief</span>
                  </div>
                  <p className="text-xl text-slate-300 leading-relaxed font-medium">
                    {selectedEvent.description}
                  </p>
                </div>

                <div className="pt-8">
                  <button className="group w-full py-6 bg-emerald-500 text-black rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-emerald-500/20 flex items-center justify-center space-x-3">
                    <span>Enlist Interest</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
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
