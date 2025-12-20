import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Circle, User, Zap } from 'lucide-react';

interface CoreUnit {
  id: string;
  name: string;
  icon: any;
  desc: string;
  scope: string[];
  color: string;
  glow: string;
  img: string;
}

interface CoreUnitsCarouselProps {
  units: CoreUnit[];
  config: Record<string, string>;
  getLeadName: (leadId: string) => string | null;
}

const CoreUnitsCarousel: React.FC<CoreUnitsCarouselProps> = ({ units, config, getLeadName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = units.length - 1;
      if (nextIndex >= units.length) nextIndex = 0;
      return nextIndex;
    });
  };

  // Auto-play
  useEffect(() => {
    if (!isPaused && units.length > 1) {
      const timer = setInterval(() => {
        paginate(1);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentIndex, isPaused, units.length]);

  const currentUnit = units[currentIndex];
  const overrideImg = config[`core_unit_${currentUnit.id.toLowerCase()}_img`];
  const leadId = config[`core_unit_${currentUnit.id.toLowerCase()}_lead_id`];
  const leadName = getLeadName(leadId || '');
  const imgSrc = overrideImg || currentUnit.img;

  // Get lead profile for display
  const leadProfile = leadId ? {
    name: leadName || 'Unknown',
    img: config[`profile_${leadId}_img`] || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400'
  } : null;

  return (
    <section 
      id="departments" 
      className="py-32 bg-white/[0.01] border-y border-white/5 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-24 top-10 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute right-[-10%] top-1/3 w-[600px] h-[600px] bg-blue-500/8 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            rotate: [0, 360]
          }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 bottom-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full" 
        />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-6"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-black uppercase tracking-[0.3em] text-[10px]">Elite Divisions</span>
            </div>
          </motion.div>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic mb-6 bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
            {config.core_units_title || 'CORE UNITS.'}
          </h2>
          <p className="text-slate-400 text-lg font-bold uppercase tracking-widest">
            {config.core_units_subtitle || 'Architects of High Performance'}
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="relative h-[600px] md:h-[500px] perspective-[2000px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  rotateY: { duration: 0.6 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                  {/* Image Side */}
                  <motion.div 
                    className="relative rounded-[50px] overflow-hidden border border-white/10 shadow-2xl group h-full"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={imgSrc} 
                      className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.35] group-hover:scale-110 group-hover:brightness-[0.45] group-hover:grayscale-0 transition-all duration-1000" 
                      alt={currentUnit.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {/* Lead Profile Badge */}
                    {leadProfile && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute top-8 left-8 flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 pr-8"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50 animate-pulse" />
                          <img 
                            src={leadProfile.img}
                            className="relative w-12 h-12 rounded-full object-cover border-2 border-emerald-400/50"
                            alt={leadProfile.name}
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black animate-pulse" />
                        </div>
                        <div>
                          <div className="text-[8px] uppercase tracking-[0.3em] text-emerald-400 font-black">Unit Lead</div>
                          <div className="text-sm font-black text-white">{leadProfile.name}</div>
                        </div>
                      </motion.div>
                    )}

                    {/* Unit Counter */}
                    <div className="absolute bottom-8 left-8 flex items-center gap-3">
                      <div className="text-7xl font-black text-white/10 leading-none">
                        {String(currentIndex + 1).padStart(2, '0')}
                      </div>
                      <div className="h-16 w-px bg-white/20" />
                      <div className="text-3xl font-black text-white/30 leading-none">
                        {String(units.length).padStart(2, '0')}
                      </div>
                    </div>
                  </motion.div>

                  {/* Content Side */}
                  <div className="flex flex-col justify-center space-y-8 p-8">
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 12 }}
                          className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-black shadow-2xl shadow-emerald-500/40"
                        >
                          <currentUnit.icon size={32} />
                        </motion.div>
                        <div>
                          <div className="text-[9px] uppercase tracking-[0.4em] text-emerald-400 font-black mb-1">Core Unit</div>
                          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                            {currentUnit.name}
                          </h3>
                        </div>
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg text-slate-300 font-medium leading-relaxed"
                    >
                      {currentUnit.desc}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="text-[9px] uppercase tracking-[0.4em] text-slate-500 font-black">Key Responsibilities</div>
                      <div className="grid grid-cols-2 gap-3">
                        {currentUnit.scope.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            whileHover={{ scale: 1.05, x: 5 }}
                            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 hover:bg-emerald-500/20 hover:border-emerald-400/60 transition-all cursor-default"
                          >
                            <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400" />
                            {s}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(-1)}
              className="p-4 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/60 rounded-2xl transition-all group"
            >
              <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
            </motion.button>

            {/* Dots Indicator */}
            <div className="flex gap-3">
              {units.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  whileHover={{ scale: 1.2 }}
                  className={`transition-all ${
                    index === currentIndex
                      ? 'w-12 h-3 bg-emerald-500 rounded-full'
                      : 'w-3 h-3 bg-white/20 hover:bg-white/40 rounded-full'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(1)}
              className="p-4 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-400/60 rounded-2xl transition-all group"
            >
              <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
            </motion.button>
          </div>

          {/* Auto-play indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isPaused ? 0.5 : 1 }}
            className="text-center mt-6 text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black"
          >
            {isPaused ? 'Paused' : 'Auto-playing'}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CoreUnitsCarousel;
