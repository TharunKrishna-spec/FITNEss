
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, PodiumPosition } from '../types';
import { Trophy, Star, Shield, Zap, Medal, Crown, TrendingUp, Search, Filter, ArrowUpRight, Award, Dumbbell } from 'lucide-react';

interface Props {
  hallOfFame: Achievement[];
}

const HallOfFamePage: React.FC<Props> = ({ hallOfFame }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories for filtering
  const categories = useMemo(() => {
    const cats = new Set(hallOfFame.map(h => h.category));
    return ['All', ...Array.from(cats)];
  }, [hallOfFame]);

  // Filter records based on search and category
  const filteredRecords = useMemo(() => {
    return hallOfFame.filter(rec => {
      const matchesSearch = rec.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           rec.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || rec.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [hallOfFame, searchQuery, selectedCategory]);

  // Group filtered records by event AND category for a "Podium" view
  const groupedByEventAndCategory = useMemo(() => {
    const groups: Record<string, Record<string, Achievement[]>> = {};
    
    filteredRecords.forEach(rec => {
      if (!groups[rec.eventName]) groups[rec.eventName] = {};
      if (!groups[rec.eventName][rec.category]) groups[rec.eventName][rec.category] = [];
      groups[rec.eventName][rec.category].push(rec);
    });

    return groups;
  }, [filteredRecords]);

  const sortedEvents = Object.keys(groupedByEventAndCategory).sort((a, b) => b.localeCompare(a));

  const getPositionStyles = (pos: PodiumPosition) => {
    switch (pos) {
      case PodiumPosition.GOLD: return {
        bg: 'from-yellow-400/20 to-amber-600/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-500',
        glow: 'shadow-[0_0_40px_rgba(234,179,8,0.15)]',
        icon: <Crown className="text-yellow-500" size={28} />
      };
      case PodiumPosition.SILVER: return {
        bg: 'from-slate-300/10 to-slate-500/10',
        border: 'border-slate-400/20',
        text: 'text-slate-300',
        glow: 'shadow-[0_0_20px_rgba(148,163,184,0.1)]',
        icon: <Medal className="text-slate-300" size={24} />
      };
      case PodiumPosition.BRONZE: return {
        bg: 'from-orange-400/10 to-orange-700/10',
        border: 'border-orange-500/20',
        text: 'text-orange-500',
        glow: 'shadow-[0_0_20px_rgba(249,115,22,0.1)]',
        icon: <Medal className="text-orange-500" size={24} />
      };
      default: return {
        bg: 'from-emerald-400/10 to-emerald-600/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-500',
        glow: '',
        icon: <Award className="text-emerald-500" size={24} />
      };
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#020617] pt-32 pb-48 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-yellow-500/[0.02] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-emerald-500/[0.02] blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Header Section */}
        <section className="mb-24 lg:mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 text-yellow-500 mb-8 font-black uppercase tracking-[0.6em] text-[10px]"
          >
            <Trophy size={16} fill="currentColor" />
            <span>Legacy Archive V4.0</span>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-7xl md:text-[11rem] font-black uppercase tracking-tighter leading-[0.8] italic mb-12"
              >
                HALL OF <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}>CHAMPIONS.</span>
              </motion.h1>
              <p className="text-slate-500 text-xl font-medium max-w-xl leading-relaxed opacity-80">
                Preserving the standard of elite performance. We document the strength, grit, and podium finishes that define the Fitness Club at VIT Chennai.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative group flex-grow lg:w-72">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Find a Legend..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:border-yellow-500/50 outline-none transition-all"
                />
              </div>
              <div className="relative flex-shrink-0">
                <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-2xl pl-14 pr-12 py-4 text-sm font-black uppercase tracking-widest text-slate-400 focus:border-emerald-500/50 outline-none transition-all cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Content Grid */}
        <AnimatePresence mode="wait">
          {sortedEvents.length > 0 ? (
            <div className="space-y-40">
              {sortedEvents.map((eventName, eIdx) => (
                <motion.div 
                  key={eventName}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex items-end justify-between mb-16 border-b border-white/5 pb-10">
                    <div>
                      <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic">{eventName}</h2>
                      <div className="flex items-center space-x-4 mt-6">
                        <span className="bg-yellow-500/10 text-yellow-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">Premier Event</span>
                        <div className="h-1 w-1 rounded-full bg-slate-700" />
                        <span className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Verified Record</span>
                      </div>
                    </div>
                    <div className="hidden lg:flex items-center space-x-4 text-slate-800">
                       <Zap size={64} fill="currentColor" />
                       <TrendingUp size={64} />
                    </div>
                  </div>

                  {Object.entries(groupedByEventAndCategory[eventName]).map(([category, athletes], cIdx) => (
                    <div key={category} className="mb-20 last:mb-0">
                      <div className="flex items-center space-x-4 mb-10">
                        <div className="w-10 h-[2px] bg-emerald-500" />
                        <h3 className="text-xl font-black uppercase tracking-[0.2em] text-emerald-500 italic">{category}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Fix: Explicitly cast 'athletes' as Achievement[] to fix the 'unknown' type error during sort */}
                        {(athletes as Achievement[]).sort((a, b) => {
                          const order = { [PodiumPosition.GOLD]: 1, [PodiumPosition.SILVER]: 2, [PodiumPosition.BRONZE]: 3 };
                          return (order[a.position] || 9) - (order[b.position] || 9);
                        }).map((rec, rIdx) => {
                          const styles = getPositionStyles(rec.position);
                          const isGold = rec.position === PodiumPosition.GOLD;

                          return (
                            <motion.div 
                              key={rec.id}
                              whileHover={{ y: -10, scale: 1.02 }}
                              className={`group relative ${isGold ? 'h-[640px] md:col-span-2 lg:col-span-1' : 'h-[580px]'} rounded-[60px] overflow-hidden glass-card border-white/5 transition-all duration-700 ${styles.glow} ${styles.border}`}
                            >
                              <img 
                                src={rec.athleteImg || `https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800`}
                                className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-110 group-hover:brightness-75 transition-all duration-1000 ease-out"
                                alt={rec.athleteName}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                              {/* Podium Label */}
                              <div className="absolute top-10 left-10 z-20">
                                <motion.div 
                                  initial={{ x: -20, opacity: 0 }}
                                  whileInView={{ x: 0, opacity: 1 }}
                                  className={`inline-flex items-center space-x-3 px-6 py-3 rounded-2xl backdrop-blur-3xl border ${styles.border} bg-gradient-to-br ${styles.bg}`}
                                >
                                  {styles.icon}
                                  <span className={`font-black uppercase tracking-widest text-[11px] ${styles.text}`}>{rec.position}</span>
                                </motion.div>
                              </div>

                              {/* Featured Icon */}
                              {rec.featured && (
                                <div className="absolute top-10 right-10 z-20">
                                  <div className="p-4 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/10 text-yellow-500">
                                    <Star size={20} fill="currentColor" />
                                  </div>
                                </div>
                              )}

                              {/* Athlete Content */}
                              <div className="absolute inset-12 flex flex-col justify-end z-20">
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[0.85] mb-4 group-hover:italic transition-all duration-700">
                                      {rec.athleteName.split(' ')[0]} <br />
                                      <span className="text-slate-400 group-hover:text-white transition-colors">{rec.athleteName.split(' ').slice(1).join(' ')}</span>
                                    </h4>
                                    <div className="flex items-center space-x-3 text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">
                                      <span>Year of {rec.year}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-end justify-between pt-8 border-t border-white/10">
                                    <div>
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Winning Metric</p>
                                      <div className="flex items-baseline space-x-2">
                                        <span className={`text-4xl font-black italic leading-none ${isGold ? 'text-yellow-500' : 'text-white'}`}>{rec.stat || 'N/A'}</span>
                                      </div>
                                    </div>
                                    <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-emerald-500 group-hover:bg-white/10 group-hover:border-emerald-500/30 transition-all">
                                      <ArrowUpRight size={24} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Background Watermark for Rank */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                                <span className="text-[25rem] font-black uppercase italic -rotate-12 translate-y-12">
                                  {rec.position.charAt(0)}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-40 text-center"
            >
              <div className="inline-flex p-10 bg-white/5 rounded-full border border-white/10 mb-8 text-slate-700">
                <Dumbbell size={80} />
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight mb-4 italic">No Legends Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Adjust your search or filters to browse the Club Archives.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Record Call to Action */}
        <section className="mt-40">
           <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-[70px] border-2 border-dashed border-white/10 p-16 md:p-32 text-center group cursor-pointer hover:border-emerald-500/30 transition-all bg-slate-900/10 overflow-hidden"
           >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-blue-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="max-w-2xl mx-auto flex flex-col items-center relative z-10">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-12 group-hover:text-emerald-500 group-hover:scale-110 transition-all group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <Shield size={40} />
                </div>
                <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.9]">ETCH YOUR NAME <br /><span className="text-transparent" style={{ WebkitTextStroke: '1px white' }}>IN HISTORY.</span></h3>
                <p className="text-slate-500 text-xl font-medium mb-12 leading-relaxed max-w-lg opacity-80">
                  Think you have what it takes to join the elite? Our next campus-wide strength event is recruiting soon.
                </p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <button className="px-12 py-6 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-xl">
                    Check Eligibility
                  </button>
                  <button className="px-12 py-6 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all">
                    View Guidelines
                  </button>
                </div>
              </div>
           </motion.div>
        </section>
      </div>
    </div>
  );
};

export default HallOfFamePage;
