
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { Event, EventStatus } from '../types';
import { ChevronRight, Calendar, MapPin, Zap, Flame, X, Info } from 'lucide-react';

interface Props {
  events: Event[];
  config?: Record<string, string>;
}

const TimelinePage: React.FC<Props> = ({ events, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const allEventsSorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Targeted scroll tracking for the specific list container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 30%", "end 70%"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 overflow-hidden">
      {/* Page Header */}
      <div className="mb-24 relative z-10">
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

      {/* Timeline Wrapper - Acts as the constrained boundary for the line */}
      <div ref={containerRef} className="relative">
        {/* The Spine - Constraints applied to parent relative container */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] z-0 hidden md:block">
          <div className="absolute inset-0 bg-white/5" />
          <motion.div 
            className="absolute top-0 w-full bg-emerald-500 shadow-[0_0_20px_#10b981]"
            style={{ 
              height: '100%', 
              scaleY, 
              originY: 0
            }}
          />
        </div>

        <div className="relative z-10 space-y-32 md:space-y-48">
          {allEventsSorted.map((event, idx) => {
            const isCompleted = event.status === EventStatus.COMPLETED;
            const isOngoing = event.status === EventStatus.ONGOING || event.status === EventStatus.REGISTRATION_OPEN;
            const isEven = idx % 2 === 0;
            
            // Calculate relative progress point for this item to trigger node highlight
            const itemProgressStart = idx / allEventsSorted.length;

            return (
              <div key={event.id} className="relative flex flex-col md:flex-row items-center justify-between group">
                {/* Central Timeline Node */}
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center z-30">
                  <Node idx={idx} progress={scrollYProgress} isOngoing={isOngoing} isCompleted={isCompleted} total={allEventsSorted.length} />
                </div>

                {/* Card Container */}
                <motion.div 
                  initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.1 }}
                  className={`flex-1 w-full md:w-auto ${isEven ? 'md:pr-20' : 'md:pl-20 md:order-2'}`}
                >
                  <div 
                    onClick={() => setSelectedEvent(event)}
                    className="glass-card rounded-[40px] p-8 md:p-10 border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group/card shadow-2xl relative overflow-hidden h-full"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                        isOngoing ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-slate-500 border-white/10'
                      }`}>
                        {event.status}
                      </span>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Calendar size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(event.date).toDateString()}</span>
                      </div>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 group-hover/card:text-emerald-500 transition-colors leading-none italic">
                      {event.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm font-medium leading-relaxed line-clamp-2 h-10 mb-8 opacity-80">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between pt-8 border-t border-white/5">
                      <div className="flex items-center space-x-3 text-slate-600">
                        <MapPin size={14} className="text-emerald-500" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Campus Arena</span>
                      </div>
                      <ChevronRight size={18} className="text-emerald-500 opacity-0 group-hover/card:opacity-100 transition-all" />
                    </div>
                  </div>
                </motion.div>

                {/* Media Block */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: isEven ? 60 : -60 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex-1 hidden md:block ${isEven ? 'md:order-2 md:pl-20' : 'md:pr-20'}`}
                >
                  <div className="aspect-[16/10] rounded-[40px] overflow-hidden border border-white/5 relative group/img shadow-2xl">
                    <img 
                      src={event.banner} 
                      className="w-full h-full object-cover grayscale opacity-40 group-hover/img:grayscale-0 group-hover/img:opacity-100 transition-all duration-1000" 
                      alt="" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Engine */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl" onClick={() => setSelectedEvent(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-5xl glass-card rounded-[48px] border-white/10 overflow-hidden shadow-2xl flex flex-col md:flex-row">
              <button onClick={() => setSelectedEvent(null)} className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 z-20"><X size={24} /></button>
              <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                <img src={selectedEvent.banner} className="w-full h-full object-cover grayscale brightness-50" alt="" />
                <div className="absolute bottom-10 left-10">
                  <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter leading-none italic text-white">{selectedEvent.title}</h2>
                </div>
              </div>
              <div className="p-10 lg:p-16 md:w-1/2 bg-slate-900/40 space-y-10 overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-2 gap-8 border-b border-white/5 pb-10">
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Schedule</p>
                    <p className="text-lg font-black text-white">{new Date(selectedEvent.date).toDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</p>
                    <p className="text-lg font-black text-emerald-500 uppercase">{selectedEvent.status}</p>
                  </div>
                </div>
                <p className="text-xl text-slate-300 leading-relaxed font-medium">{selectedEvent.description}</p>
                <button className="w-full py-6 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all shadow-xl">Join the Event</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component for a scroll-reactive node
const Node = ({ idx, progress, isOngoing, isCompleted, total }: { idx: number, progress: any, isOngoing: boolean, isCompleted: boolean, total: number }) => {
  // Nodes activate slightly before their center position for a better feel
  const threshold = idx / (total - 1);
  const nodeActive = useTransform(progress, [threshold - 0.05, threshold + 0.05], [0, 1]);
  const nodeColor = useTransform(nodeActive, [0, 1], ["rgba(30, 41, 59, 1)", "rgba(16, 185, 129, 1)"]);
  const nodeScale = useTransform(nodeActive, [0, 1], [0.8, 1.2]);
  const glowOpacity = useTransform(nodeActive, [0, 1], [0, 0.5]);

  return (
    <motion.div 
      style={{ backgroundColor: nodeColor, scale: nodeScale }}
      className={`w-12 h-12 rounded-2xl border-[3px] border-slate-950 rotate-45 flex items-center justify-center transition-shadow duration-500`}
    >
       <motion.div style={{ opacity: glowOpacity }} className="absolute inset-[-8px] bg-emerald-500 blur-xl rounded-full pointer-events-none" />
       <div className="-rotate-45 relative z-10">
         {isCompleted ? <Zap size={16} className="text-slate-500" /> : <Flame size={18} className={isOngoing ? "text-black animate-pulse" : "text-slate-400"} />}
       </div>
    </motion.div>
  );
};

export default TimelinePage;
