
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, PodiumPosition } from '../types';
import { Trophy, Star, Shield, Zap, Medal, Crown, TrendingUp, Search, Filter, ArrowUpRight, Award, Dumbbell } from 'lucide-react';

interface Props {
  hallOfFame: Achievement[];
  config?: Record<string, string>;
}

const HallOfFamePage: React.FC<Props> = ({ hallOfFame, config }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { delay: 0.05 * i, type: 'spring' as const, stiffness: 120, damping: 18 },
    }),
  };

  const hallTitle = config?.hall_title || 'HALL OF CHAMPIONS.';

  const categories = useMemo(() => {
    const cats = new Set(hallOfFame.map(h => h.category));
    return ['All', ...Array.from(cats)];
  }, [hallOfFame]);

  const filteredRecords = useMemo(() => {
    return hallOfFame.filter(rec => {
      const matchesSearch = rec.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           rec.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || rec.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [hallOfFame, searchQuery, selectedCategory]);

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
        icon: <Crown className="text-yellow-500" size={20} />
      };
      case PodiumPosition.SILVER: return {
        bg: 'from-slate-300/10 to-slate-500/10',
        border: 'border-slate-400/20',
        text: 'text-slate-300',
        icon: <Medal className="text-slate-300" size={18} />
      };
      case PodiumPosition.BRONZE: return {
        bg: 'from-orange-400/10 to-orange-700/10',
        border: 'border-orange-500/20',
        text: 'text-orange-500',
        icon: <Medal className="text-orange-500" size={18} />
      };
      default: return {
        bg: 'from-emerald-400/10 to-emerald-600/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-500',
        icon: <Award className="text-emerald-500" size={18} />
      };
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#020617] pt-24 pb-20 relative overflow-hidden">
      <div className="absolute -left-32 top-10 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute right-[-15%] top-1/3 w-[520px] h-[520px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute left-1/3 bottom-10 w-80 h-80 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <section className="mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-3 text-yellow-500 mb-6 font-black uppercase tracking-[0.6em] text-[10px]">
            <Trophy size={14} fill="currentColor" />
            <span>Legacy Archives</span>
          </motion.div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic mb-4">{hallTitle}</h1>
              <p className="text-slate-500 text-base max-w-lg font-medium leading-relaxed">
                The certified high-performance roster of Fitness Club VIT Chennai.
              </p>
            </div>
            <div className="flex flex-col gap-4 w-full lg:w-auto">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search athletes or events..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 hover:border-emerald-500/30 focus:border-emerald-500/50 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold focus:outline-none w-full lg:w-72 transition-all backdrop-blur-xl"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    ✕
                  </motion.button>
                )}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2"
              >
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <AnimatePresence mode="wait">
          {sortedEvents.length > 0 ? (
            <div className="space-y-24">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-8"
              >
                Found <span className="text-emerald-500 font-black">{filteredRecords.length}</span> record{filteredRecords.length !== 1 ? 's' : ''} {searchQuery && `for "${searchQuery}"`}
              </motion.div>
              {sortedEvents.map((eventName) => (
                <div key={eventName}>
                  <div className="flex items-end justify-between mb-8 border-b border-white/5 pb-6">
                    <h2 className="text-4xl font-black uppercase tracking-tighter italic">{eventName}</h2>
                  </div>
                  {Object.entries(groupedByEventAndCategory[eventName]).map(([category, athletes]) => (
                    <div key={category} className="mb-12 last:mb-0">
                      <div className="flex items-center space-x-4 mb-8">
                        <div className="w-8 h-[2px] bg-emerald-500" />
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 italic">{category}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(athletes as Achievement[]).map((rec, idx) => {
                          const styles = getPositionStyles(rec.position);
                          return (
                            <motion.div 
                              key={rec.id} 
                              className={`relative h-96 rounded-[32px] overflow-hidden border border-white/5 shadow-xl group ${styles.border}`}
                              variants={cardVariants}
                              initial="hidden"
                              whileInView="show"
                              viewport={{ once: true, margin: '-50px' }}
                              custom={idx}
                              whileHover={{ y: -8, scale: 1.01 }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                              <img src={rec.athleteImg} className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={rec.athleteName} />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                              <div className="absolute top-6 left-6 z-20">
                                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl backdrop-blur-3xl border ${styles.border} bg-white/5`}>
                                  {styles.icon}
                                  <span className={`font-black uppercase tracking-widest text-[9px] ${styles.text}`}>{rec.position}</span>
                                </div>
                              </div>
                              <div className="absolute bottom-8 left-8 right-8 z-20">
                                <h4 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">{rec.athleteName}</h4>
                                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                  <span className="text-2xl font-black italic text-white">{rec.stat}</span>
                                  <span className="text-[10px] font-black text-slate-500 uppercase">{rec.year}</span>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500 uppercase tracking-widest font-black text-xs">No records indexed.</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HallOfFamePage;
