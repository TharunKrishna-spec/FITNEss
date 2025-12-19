
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Achievement, PodiumPosition } from '../types';
import { Trophy, Star, Shield, Zap, Medal, Crown, TrendingUp, Filter } from 'lucide-react';

interface Props {
  hallOfFame: Achievement[];
}

const HallOfFamePage: React.FC<Props> = ({ hallOfFame }) => {
  // Group achievements by event name
  const groupedRecords = useMemo(() => {
    return hallOfFame.reduce((acc, rec) => {
      const event = rec.eventName;
      if (!acc[event]) acc[event] = [];
      acc[event].push(rec);
      return acc;
    }, {} as Record<string, Achievement[]>);
  }, [hallOfFame]);

  const sortedEvents = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  const getPositionColor = (pos: PodiumPosition) => {
    switch (pos) {
      case PodiumPosition.GOLD: return 'from-yellow-400 to-amber-600';
      case PodiumPosition.SILVER: return 'from-slate-300 to-slate-500';
      case PodiumPosition.BRONZE: return 'from-orange-400 to-orange-700';
      default: return 'from-emerald-400 to-emerald-600';
    }
  };

  const getMedalIcon = (pos: PodiumPosition) => {
    switch (pos) {
      case PodiumPosition.GOLD: return <Crown className="text-yellow-400" size={24} />;
      case PodiumPosition.SILVER: return <Medal className="text-slate-300" size={24} />;
      case PodiumPosition.BRONZE: return <Medal className="text-orange-500" size={24} />;
      default: return <Trophy className="text-emerald-500" size={24} />;
    }
  };

  return (
    <div className="w-full space-y-32 pb-40">
      {/* Header Section */}
      <section className="container mx-auto px-6 pt-20">
        <div className="max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 text-emerald-500 mb-8 font-black uppercase tracking-[0.6em] text-[9px]"
          >
            <Trophy size={14} fill="currentColor" />
            <span>Legacy Archive</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] italic mb-12"
          >
            HALL OF <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>CHAMPIONS.</span>
          </motion.h1>
          <p className="text-slate-500 text-xl font-medium max-w-xl leading-relaxed">
            Every drop of sweat, every personal best, every podium finish. We preserve the history of VIT Chennai's greatest strength achievements.
          </p>
        </div>
      </section>

      {/* Grouped Event Sections */}
      {sortedEvents.map((eventName, eIdx) => (
        <section key={eventName} className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-16 border-b border-white/5 pb-10"
          >
            <div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">{eventName}</h2>
              <div className="flex items-center space-x-4 mt-4">
                <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Official Event</span>
                <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Archive ID: {eventName.replace(/\s+/g, '-').toLowerCase()}</span>
              </div>
            </div>
            <TrendingUp className="text-white/5 hidden md:block" size={80} />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedRecords[eventName].sort((a, b) => {
              const order = { [PodiumPosition.GOLD]: 1, [PodiumPosition.SILVER]: 2, [PodiumPosition.BRONZE]: 3 };
              return (order[a.position] || 9) - (order[b.position] || 9);
            }).map((rec, rIdx) => (
              <motion.div 
                key={rec.id}
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: rIdx * 0.1 }}
                className="group relative h-[600px] rounded-[50px] overflow-hidden glass-card border-white/5 shadow-2xl"
              >
                {/* Winner Image Overlay */}
                <img 
                  src={rec.athleteImg || `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800`}
                  className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 group-hover:brightness-75 transition-all duration-1000"
                  alt={rec.athleteName}
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent`} />

                {/* Podium Badge */}
                <div className="absolute top-10 left-10">
                  <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-2xl backdrop-blur-3xl border border-white/10 bg-gradient-to-br ${getPositionColor(rec.position)} shadow-2xl`}>
                    <div className="text-black">{getMedalIcon(rec.position)}</div>
                    <span className="text-black text-[11px] font-black uppercase tracking-widest">{rec.position}</span>
                  </div>
                </div>

                {/* Winner Info */}
                <div className="absolute inset-12 flex flex-col justify-end">
                   <div className="space-y-4">
                      <p className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[9px]">{rec.category}</p>
                      <h3 className="text-5xl font-black uppercase tracking-tighter leading-[0.8] mb-2 group-hover:italic transition-all duration-500">
                        {rec.athleteName.split(' ')[0]} <br />
                        <span className="text-slate-400 group-hover:text-white transition-colors">{rec.athleteName.split(' ').slice(1).join(' ')}</span>
                      </h3>
                      
                      <div className="flex items-center justify-between pt-8 border-t border-white/10">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Winning Metric</span>
                            <span className="text-2xl font-black text-white italic">{rec.stat}</span>
                         </div>
                         <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-emerald-500 group-hover:bg-white/10 transition-all">
                            <Star size={20} fill="currentColor" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Card Glow Effect */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-colors pointer-events-none rounded-[50px]" />
              </motion.div>
            ))}
          </div>
        </section>
      ))}

      {/* Legend Call to Action */}
      <section className="container mx-auto px-6 py-20">
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="rounded-[60px] border-2 border-dashed border-white/10 p-24 text-center group cursor-pointer hover:border-emerald-500/30 transition-all bg-slate-900/10"
         >
            <div className="max-w-2xl mx-auto flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-10 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                <Shield size={40} />
              </div>
              <h3 className="text-5xl font-black uppercase tracking-tighter mb-6">READY FOR THE PODIUM?</h3>
              <p className="text-slate-500 text-lg font-medium mb-10 leading-relaxed">
                The next official event is just around the corner. Train hard, stay disciplined, and your name might just be etched into the Club Archives.
              </p>
              <button className="px-12 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all">
                Check Upcoming Events
              </button>
            </div>
         </motion.div>
      </section>
    </div>
  );
};

export default HallOfFamePage;