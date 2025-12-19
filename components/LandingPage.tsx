
import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, Zap, Target, Shield, Trophy, Dumbbell, 
  ChevronDown, Activity, Flame, Star, Calendar, 
  Camera, Megaphone, Laptop, PenTool, ArrowUpRight, Clock, MapPin, Ticket,
  Quote, CheckCircle2, BarChart3, Users2
} from 'lucide-react';
import TimelinePage from './TimelinePage';
import HallOfFamePage from './HallOfFamePage';
import { Event, Achievement, EventStatus } from '../types';

const DEPARTMENTS = [
  {
    id: 'TECH',
    name: 'Scientific Training',
    icon: Laptop,
    desc: 'The biomechanical core of our operations. We bridge the gap between sports science and practical application.',
    scope: ['Form Analysis', 'Periodization', 'Coaching Clinics', 'Nutrition Logic'],
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.3)',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800'
  },
  {
    id: 'MEDIA',
    name: 'Creative Narrative',
    icon: Camera,
    desc: 'The visual heartbeat of the club. We capture the raw, unedited intensity of high-performance athletics.',
    scope: ['Action Photography', 'Cinematic Edits', 'Visual Branding', 'Web Design'],
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(59, 130, 246, 0.3)',
    img: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800'
  },
  {
    id: 'LOGS',
    name: 'Event Architecture',
    icon: Calendar,
    desc: 'The masterminds behind VIT\'s biggest strength events. We turn campus arenas into professional stages.',
    scope: ['Campus Clash', 'Indoor Strength Open', 'Workshops', 'Logistics'],
    color: 'from-purple-500 to-fuchsia-600',
    glow: 'rgba(168, 85, 247, 0.3)',
    img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200'
  },
  {
    id: 'PR',
    name: 'Strategic Outreach',
    icon: Megaphone,
    desc: 'The voice that resonates across VIT Chennai. We manage the club’s public perception and industry links.',
    scope: ['Brand Relations', 'Campus PR', 'Member Relations', 'Sponsorships'],
    color: 'from-red-500 to-orange-600',
    glow: 'rgba(239, 68, 68, 0.3)',
    img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800'
  }
];

interface LandingPageProps {
  events: Event[];
  hallOfFame: Achievement[];
}

const LandingPage: React.FC<LandingPageProps> = ({ events, hallOfFame }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothYProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const heroTextY = useTransform(smoothYProgress, [0, 0.2], [0, -150]);
  const heroTextOpacity = useTransform(smoothYProgress, [0, 0.2], [1, 0]);
  const bgTextX = useTransform(smoothYProgress, [0, 0.4], [0, -500]);
  const modelY = useTransform(smoothYProgress, [0, 0.4], [0, 100]);
  const dumbbellRotate = useTransform(smoothYProgress, [0, 0.6], [0, 1080]);
  const dumbbellScale = useTransform(smoothYProgress, [0, 0.15, 0.3], [1, 1.6, 0.8]);
  const dumbbellY = useTransform(smoothYProgress, [0, 0.4], [0, 300]);

  useEffect(() => {
    if (location.state && (location.state as any).scrollTo) {
      const anchorId = (location.state as any).scrollTo;
      const el = document.getElementById(anchorId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
          window.history.replaceState({}, document.title);
        }, 150);
      }
    }
  }, [location]);

  const upcomingEvents = events.filter(e => 
    e.status === EventStatus.UPCOMING || 
    e.status === EventStatus.REGISTRATION_OPEN || 
    e.status === EventStatus.ONGOING
  );

  return (
    <div ref={containerRef} className="w-full bg-[#020617] selection:bg-emerald-500 selection:text-black">
      {/* Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-10 mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[110vh] flex items-center justify-center overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 blur-[120px] rounded-full" />
        
        <motion.div 
          style={{ x: bgTextX }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
        >
          <span className="text-[30vw] font-black text-white/[0.02] uppercase leading-none whitespace-nowrap italic tracking-tighter">
            VIT CHENNAI VIT CHENNAI VIT CHENNAI
          </span>
        </motion.div>

        <div className="container mx-auto px-6 relative z-10 max-w-7xl h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            <motion.div 
              style={{ y: heroTextY, opacity: heroTextOpacity }}
              className="lg:col-span-7 flex flex-col items-start text-left"
            >
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full mb-8 backdrop-blur-xl"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">VIT CHENNAI OFFICIAL STUDENT CLUB</span>
              </motion.div>
              
              <h1 className="text-6xl md:text-[11rem] font-black tracking-tighter mb-2 leading-[0.8] uppercase">
                FITNESS <br />
                <span className="text-transparent stroke-white stroke-1 hover:text-white transition-all duration-500" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>CLUB.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-12 font-medium leading-relaxed mt-6">
                Representing the athletic pulse of VIT Chennai. We empower students to achieve professional-grade results through community and discipline.
              </p>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/contact" className="group relative px-12 py-6 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-tight transition-all hover:scale-105 shadow-[0_20px_40px_rgba(16,185,129,0.2)]">
                  <span className="relative z-10 flex items-center justify-center">
                    Join the Club <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </span>
                </Link>
                <button 
                  onClick={() => document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-12 py-6 border border-white/10 rounded-2xl font-black uppercase tracking-tight hover:bg-white/5 transition-all backdrop-blur-md flex items-center justify-center"
                >
                  See Events <ChevronDown size={20} className="ml-2" />
                </button>
              </div>
            </motion.div>

            <motion.div style={{ y: modelY }} className="lg:col-span-5 relative hidden lg:block">
              <div className="relative group">
                <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                <div className="relative aspect-[3/4] rounded-[60px] overflow-hidden border border-white/10 glass-card">
                  <img 
                    src="https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1200&auto=format&fit=crop" 
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                    alt="Campus Athlete"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-12 left-12">
                    <p className="text-emerald-500 font-black text-xs uppercase tracking-[0.4em] mb-2">Campus Athleticism</p>
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic text-white">CLUB ELITE</h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div 
          style={{ rotateZ: dumbbellRotate, scale: dumbbellScale, y: dumbbellY }} 
          className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 w-[300px] md:w-[600px] opacity-80"
        >
          <img 
            src="https://pngimg.com/uploads/dumbbell/dumbbell_PNG16382.png" 
            className="w-full h-auto drop-shadow-[0_80px_60px_rgba(16,185,129,0.4)] contrast-150 brightness-110 saturate-0"
            alt="3D Dumbbell"
          />
        </motion.div>
      </section>

      {/* Our Mission: What We Do */}
      <section className="py-48 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div>
                <div className="flex items-center space-x-3 text-emerald-500 mb-6 font-black uppercase tracking-[0.5em] text-[10px]">
                  <Activity size={16} />
                  <span>The Protocol</span>
                </div>
                <h2 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.8] mb-12 italic">
                  WHAT WE <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>EXECUTE.</span>
                </h2>
                <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
                  Fitness Club VIT Chennai isn’t just a gym community. We are a high-performance ecosystem dedicated to the science of physical transformation and the discipline of competitive athletics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'Data Driven', icon: BarChart3, desc: 'We track biomechanics and progress telemetry to ensure every lift is optimized.' },
                  { title: 'Peer Led', icon: Users2, desc: 'Mentorship by campus record-holders and seasoned student athletes.' },
                  { title: 'Standardized', icon: Shield, desc: 'Implementing international powerlifting and fitness standards in all meets.' },
                  { title: 'Peak Output', icon: Flame, desc: 'Pushing the boundaries of human potential through community grit.' }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center space-x-3 text-emerald-500 font-black uppercase tracking-widest text-[10px]">
                      <item.icon size={16} />
                      <span>{item.title}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 rounded-[60px] overflow-hidden border border-white/5 glass-card aspect-square lg:aspect-auto lg:h-[700px]"
              >
                <img 
                  src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1200" 
                  className="w-full h-full object-cover grayscale brightness-50 contrast-125"
                  alt="Philosophy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                <div className="absolute inset-12 flex flex-col justify-end">
                  <div className="p-8 backdrop-blur-3xl bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                    <Quote className="text-emerald-500/20" size={64} />
                    <p className="text-2xl font-black italic uppercase tracking-tighter leading-tight text-white">
                      "Success isn't always about greatness. It's about consistency. Consistent hard work gains success. Greatness will come."
                    </p>
                    <div className="h-px w-full bg-white/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Core Philosophy</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Fitness Club V4</span>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Geometric accent */}
              <div className="absolute -top-12 -right-12 w-64 h-64 border-4 border-dashed border-emerald-500/10 rounded-full animate-spin-slow pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="upcoming" className="py-48 relative overflow-hidden bg-slate-950/80">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 text-emerald-500 mb-6 font-black uppercase tracking-[0.6em] text-[9px]"
              >
                <div className="w-8 h-px bg-emerald-500/30" />
                <span>Live Feed</span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter italic leading-[0.8]"
              >
                LIVE & <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>UPCOMING.</span>
              </motion.h2>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-slate-500 font-black text-right text-xs uppercase tracking-widest mb-4">Current Active Cycles: {upcomingEvents.length}</p>
              <Link to="/timeline" className="flex items-center space-x-3 px-8 py-4 glass-card border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all">
                <span>View Full Roadmap</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-12 gap-8 no-scrollbar snap-x">
            {upcomingEvents.map((event, idx) => (
              <motion.div 
                key={event.id}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                whileInView={{ opacity: 1, scale: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                className="flex-shrink-0 w-[85vw] md:w-[600px] snap-center"
              >
                <div className="group relative aspect-[16/10] md:aspect-[1.8/1] rounded-[48px] overflow-hidden border border-white/5 glass-card shadow-2xl transition-all duration-700 hover:border-emerald-500/30">
                  <img src={event.banner} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Event Badges */}
                  <div className="absolute top-10 left-10 flex flex-wrap gap-4">
                    <div className={`flex items-center space-x-2 px-6 py-2 rounded-full border backdrop-blur-3xl font-black text-[10px] uppercase tracking-widest ${
                      event.status === EventStatus.REGISTRATION_OPEN 
                        ? 'bg-emerald-500 text-black border-emerald-400' 
                        : 'bg-white/5 text-emerald-400 border-white/10'
                    }`}>
                      {event.status === EventStatus.ONGOING && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-2" />}
                      {event.status}
                    </div>
                  </div>

                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="flex items-center space-x-4 mb-6 text-slate-400">
                      <div className="flex items-center space-x-2">
                        <Calendar size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date(event.date).toDateString()}</span>
                      </div>
                    </div>

                    <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-[0.8] mb-8 group-hover:italic transition-all">
                      {event.title}
                    </h3>

                    <div className="flex items-center justify-between">
                       <button className="flex items-center space-x-3 px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl">
                          <span>Register Now</span>
                          <Ticket size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-48 relative bg-slate-950/50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3 text-emerald-500 mb-6 font-black uppercase tracking-[0.6em] text-[9px]"
              >
                <PenTool size={14} />
                <span>The Engine Room</span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-6xl md:text-[9rem] font-black uppercase tracking-tighter italic leading-[0.8]"
              >
                CORE <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.1)' }}>UNITS.</span>
              </motion.h2>
            </div>
            <p className="text-slate-500 font-medium text-lg max-w-xs border-l border-white/10 pl-8 mb-4">
              Our operations are split into four high-performance units, each managing a critical pillar of our campus presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {DEPARTMENTS.map((dept, idx) => (
              <motion.div 
                key={dept.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="group relative min-h-[560px] lg:h-[600px] rounded-[50px] overflow-hidden glass-card border-white/5 cursor-pointer shadow-2xl"
              >
                <motion.img 
                  src={dept.img} 
                  className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all duration-1000 ease-out" 
                  alt={dept.name} 
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent group-hover:via-slate-950/20 transition-all duration-700`} />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                  <span className="text-[15rem] font-black uppercase rotate-[-90deg] text-white/[0.03] group-hover:text-white/[0.05] transition-all duration-700 tracking-tighter">
                    {dept.id}
                  </span>
                </div>

                <div className="absolute inset-10 lg:inset-12 flex flex-col justify-between z-10">
                  <div className="flex items-start justify-between">
                    <div 
                      className="p-6 rounded-3xl backdrop-blur-3xl border border-white/10 bg-white/5 transition-all duration-500 group-hover:scale-110"
                      style={{ boxShadow: `0 0 30px ${dept.glow}` }}
                    >
                      <dept.icon size={36} className="text-white" />
                    </div>
                    <ArrowUpRight className="text-white/20 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={36} />
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className={`text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none transition-all duration-500 group-hover:italic bg-gradient-to-r ${dept.color} bg-clip-text group-hover:text-transparent`}>
                        {dept.name}
                      </h3>
                      <p className="text-slate-400 font-medium max-w-sm group-hover:text-white transition-colors duration-500 leading-relaxed">
                        {dept.desc}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-100">
                      {dept.scope.map((s, si) => (
                        <div key={si} className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/70">
                          <CheckCircle2 size={10} className="text-emerald-500" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-48 bg-slate-900/10 relative">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
           <div className="flex flex-col items-center text-center mb-36">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                className="p-4 bg-emerald-500/10 rounded-full mb-8 text-emerald-500 border border-emerald-500/20"
              >
                <Calendar size={32} />
              </motion.div>
              <h3 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter leading-none mb-4">THE PATH.</h3>
              <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">Event Roadmap 2024</p>
           </div>
           <TimelinePage events={events} />
        </div>
      </section>

      {/* Wall of Fame Section */}
      <section className="py-48 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
           <div className="flex flex-col lg:flex-row justify-between items-end mb-36 gap-12">
              <div className="max-w-3xl">
                 <div className="flex items-center space-x-3 text-yellow-500 mb-6 font-black uppercase tracking-[0.4em] text-xs">
                    <Trophy size={18} fill="currentColor" />
                    <span>The Wall of Honor</span>
                 </div>
                 <h3 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85]">CAMPUS <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px #eab308' }}>LEGENDS.</span></h3>
              </div>
              <Link to="/hall-of-fame" className="px-10 py-5 glass-card border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 hover:text-black transition-all hover:scale-105">
                Full Records
              </Link>
           </div>
           <HallOfFamePage hallOfFame={hallOfFame} />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
