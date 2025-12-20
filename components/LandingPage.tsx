
import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, Zap, Shield, Trophy, 
  ChevronDown, Activity, Flame, Calendar, 
  Camera, Megaphone, Laptop, PenTool, ArrowUpRight, Ticket,
  Quote, CheckCircle2, BarChart3, Users2, MapPin
} from 'lucide-react';
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
  config: Record<string, string>;
}

const LandingPage: React.FC<LandingPageProps> = ({ events, hallOfFame, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothYProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const heroTextY = useTransform(smoothYProgress, [0, 0.2], [0, -100]);
  const heroTextOpacity = useTransform(smoothYProgress, [0, 0.2], [1, 0]);
  const bgTextX = useTransform(smoothYProgress, [0, 0.4], [0, -300]);
  const dumbbellRotate = useTransform(smoothYProgress, [0, 0.6], [0, 1080]);

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
    e.status !== EventStatus.COMPLETED
  );

  return (
    <div ref={containerRef} className="w-full bg-[#020617]">
      {/* Hero Section - Condensed */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
        <div className="absolute top-[-5%] left-[-5%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[100px] rounded-full" />
        
        <motion.div style={{ x: bgTextX }} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="text-[25vw] font-black text-white/[0.01] uppercase leading-none whitespace-nowrap italic tracking-tighter">
            ELITE ELITE ELITE
          </span>
        </motion.div>

        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <motion.div style={{ y: heroTextY, opacity: heroTextOpacity }} className="lg:col-span-7">
              <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">VIT Chennai Official</span>
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 leading-[0.85] uppercase">
                {config.hero_title || 'FITNESS CLUB.'}
              </h1>
              
              <p className="text-base md:text-lg text-slate-400 max-w-lg mb-8 font-medium leading-relaxed">
                {config.hero_subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="px-8 py-4 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-tight transition-all hover:scale-105 shadow-xl shadow-emerald-500/20 flex items-center justify-center">
                  Join Now <ArrowRight className="ml-2" size={18} />
                </Link>
                <button onClick={() => document.getElementById('upcoming')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase tracking-tight hover:bg-white/5 transition-all">
                  Browse Events
                </button>
              </div>
            </motion.div>

            <div className="lg:col-span-5 relative hidden lg:block">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden border border-white/10 relative group shadow-2xl">
                <img src={config.hero_image} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-1000" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protocol Section - Condensed */}
      <section className="py-16 relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <div className="flex items-center space-x-3 text-emerald-500 font-black uppercase tracking-[0.5em] text-[9px]">
                <Activity size={14} />
                <span>The Protocol</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] italic">
                BEYOND <br /><span className="text-emerald-500">LIMITS.</span>
              </h2>
              <p className="text-base text-slate-400 font-medium leading-relaxed max-w-lg">
                {config.about_description}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { title: 'Scientific', icon: BarChart3 },
                  { title: 'Peer-Led', icon: Users2 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-white font-black uppercase tracking-widest text-[10px]">
                    <div className="p-2 bg-white/5 rounded-lg text-emerald-500"><item.icon size={14} /></div>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="aspect-[16/10] rounded-[32px] overflow-hidden border border-white/10 shadow-xl">
              <img src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=1200" className="w-full h-full object-cover grayscale brightness-75" alt="Action" />
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events - Standardized Cards */}
      <section id="upcoming" className="py-16 bg-white/[0.01]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">LIVE FEED.</h2>
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">REAL-TIME CAMPUS OPS</p>
            </div>
            <Link to="/timeline" className="text-emerald-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform mb-2">
              Full Roadmap <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.slice(0, 3).map((event) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group">
                <div className="aspect-[16/10] rounded-[28px] overflow-hidden border border-white/5 relative mb-4 shadow-xl">
                  <img src={event.banner} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt={event.title} />
                  <div className="absolute top-4 left-4 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                    {event.status}
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2 group-hover:text-emerald-500 transition-colors truncate">{event.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8 mb-4 opacity-80">{event.description}</p>
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <MapPin size={12} className="text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{new Date(event.date).toDateString()}</span>
                  </div>
                  <Ticket size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Units - Condensed */}
      <section id="departments" className="py-16">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="mb-10">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">CORE UNITS.</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Architects of High Performance</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEPARTMENTS.map((dept) => (
              <div key={dept.id} className="group relative aspect-[16/9] rounded-[28px] overflow-hidden border border-white/5 p-8 flex flex-col justify-end shadow-xl">
                <img src={dept.img} className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.25] group-hover:scale-105 transition-transform duration-700" alt={dept.name} />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500 rounded-lg text-black"><dept.icon size={16} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">{dept.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs mb-4 line-clamp-2 font-medium">{dept.desc}</p>
                  <div className="flex gap-2">
                    {dept.scope.slice(0, 2).map((s, i) => (
                      <span key={i} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 rounded-md text-slate-500">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hall of Fame - Featured */}
      <section className="py-16 bg-slate-900/10 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex justify-between items-end mb-10">
            <div>
               <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">CHAMPIONS.</h2>
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500 mt-2">ELITE ATHLETIC RECORD</p>
            </div>
            <Link to="/hall-of-fame" className="text-yellow-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all mb-2">
              All Records <Trophy size={14} />
            </Link>
          </div>
          <HallOfFamePage hallOfFame={hallOfFame.filter(h => h.featured)} config={config} />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
