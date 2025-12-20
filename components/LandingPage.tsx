
import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  ArrowRight, Zap, Shield, Trophy, 
  ChevronDown, Activity, Flame, Calendar, 
  Camera, Megaphone, Laptop, PenTool, ArrowUpRight, Ticket,
  Quote, CheckCircle2, BarChart3, Users2, MapPin, Globe
} from 'lucide-react';
import { Profile } from '../types';
import HallOfFamePage from './HallOfFamePage';
import { Event, Achievement, EventStatus } from '../types';
import CoreUnitsCarousel from './CoreUnitsCarousel';

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
  profiles?: Profile[];
}

const LandingPage: React.FC<LandingPageProps> = ({ events, hallOfFame, config, profiles = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Parse dynamic core units from config
  const dynamicCoreUnits = (() => {
    try {
      const unitsList = config.core_units_list ? JSON.parse(config.core_units_list) : [];
      if (unitsList.length > 0) {
        return unitsList.map((unit: any) => ({
          id: unit.id,
          name: unit.name,
          icon: Activity,
          desc: unit.desc || 'Core unit',
          scope: unit.scope || [],
          color: 'from-emerald-500 to-teal-600',
          glow: 'rgba(16, 185, 129, 0.3)',
          img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800'
        }));
      }
    } catch {}
    return DEPARTMENTS;
  })();
  
  // Parse testimonials from config
  const testimonials = (() => {
    try {
      const testimonialsList = config.testimonials_list ? JSON.parse(config.testimonials_list) : [];
      if (testimonialsList.length > 0) {
        return testimonialsList;
      }
    } catch {}
    // Default testimonials
    return [
      {
        id: '1',
        name: 'Aryan Sharma',
        role: 'Club President 2023-24',
        text: 'Joining the Fitness Club transformed my college experience. I discovered leadership skills I never knew I had and built lifelong friendships.',
        img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400'
      },
      {
        id: '2',
        name: 'Priya Singh',
        role: 'Media Lead',
        text: "The creative freedom and professional growth here is unmatched. We're not just documenting events - we're telling stories that inspire.",
        img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400'
      },
      {
        id: '3',
        name: 'Karthik Iyer',
        role: 'Event Coordinator',
        text: 'From planning Campus Clash to organizing workshops, this club taught me project management skills that no classroom could.',
        img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400'
      }
    ];
  })();
  
  // Helper to get lead profile name from lead_id
  const getLeadName = (leadId: string): string | null => {
    if (!leadId) return null;
    const lead = profiles.find(p => p.id === leadId);
    return lead ? lead.name : null;
  };
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothYProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Hero parallax
  const heroTextY = useTransform(smoothYProgress, [0, 0.2], [0, -100]);
  const heroTextOpacity = useTransform(smoothYProgress, [0, 0.2], [1, 0]);
  const bgTextX = useTransform(smoothYProgress, [0, 0.4], [0, -300]);
  const heroImageScale = useTransform(smoothYProgress, [0, 0.2], [1, 1.1]);
  const heroImageY = useTransform(smoothYProgress, [0, 0.15], [0, 40]);

  // Who are we parallax
  const whoTextX = useTransform(smoothYProgress, [0.15, 0.35], [-100, 0]);
  const whoImageRotate = useTransform(smoothYProgress, [0.15, 0.35], [-5, 0]);

  // Departments parallax
  const deptY = useTransform(smoothYProgress, [0.4, 0.65], [100, -50]);

  // Champion section parallax  
  const championY = useTransform(smoothYProgress, [0.7, 0.95], [100, -30]);

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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12 bg-gradient-to-br from-slate-950 via-[#020617] to-emerald-950/20">
        <div className="absolute top-[-5%] left-[-5%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-500/8 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/5 via-transparent to-transparent" />
        
        <motion.div style={{ x: bgTextX }} className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span className="text-[25vw] font-black text-white/[0.01] uppercase leading-none whitespace-nowrap italic tracking-tighter">
            ATHLETIC ATHLETIC ATHLETIC
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
                <Link to="/join" className="px-8 py-4 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-tight transition-all hover:scale-105 shadow-xl shadow-emerald-500/20 flex items-center justify-center">
                  Join Now <ArrowRight className="ml-2" size={18} />
                </Link>
                <button onClick={() => document.getElementById('who-are-we')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase tracking-tight hover:bg-white/5 transition-all">
                  Who Are We?
                </button>
              </div>
            </motion.div>

            <div className="lg:col-span-5 relative hidden lg:block">
              <motion.div style={{ scale: heroImageScale, y: heroImageY }} className="aspect-[4/5] rounded-[40px] overflow-hidden border border-white/10 relative group shadow-2xl">
                <img src={config.hero_image} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 transition-all duration-1000" alt="Hero" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Who Are We Section */}
      <section id="who-are-we" className="py-24 relative overflow-hidden border-y border-white/5 bg-gradient-to-b from-slate-950/50 via-slate-900/30 to-slate-950/50">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[150px] rounded-full" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div style={{ x: whoTextX }} className="relative">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8 relative z-10">
                <motion.div initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center space-x-3 text-emerald-500 font-black uppercase tracking-[0.5em] text-[10px]">
                  <Globe size={14} />
                  <span>The Origin Story</span>
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] italic">
                  {config.who_are_we_title || 'WHO\nARE\nWE?'}
                </motion.h2>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-6">
                  <p className="text-lg text-slate-300 font-medium leading-relaxed">
                    {config.who_are_we_subtitle || 'Fitness Club VIT Chennai is the premier athletic high-command on campus. We bridge the gap between casual training and scientific performance.'}
                  </p>
                  <p className="text-slate-400 leading-relaxed italic">
                    From organizing the legendary 'Campus Clash' to providing biomechanical feedback for FFCS members, we are the architects of physical excellence.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-8 pt-4">
                  <div className="group">
                    <p className="text-3xl font-black text-white group-hover:text-emerald-500 transition-colors">500+</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active Members</p>
                  </div>
                  <div className="group">
                    <p className="text-3xl font-black text-emerald-500 group-hover:scale-110 transition-transform origin-left">10+</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Annual Events</p>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div style={{ rotate: whoImageRotate }} className="relative">
               <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="aspect-square rounded-[60px] overflow-hidden border border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                  <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200" className="w-full h-full object-cover grayscale brightness-50 hover:grayscale-0 transition-all duration-700" alt="Culture" />
               </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Units Carousel */}
      <CoreUnitsCarousel units={dynamicCoreUnits} config={config} getLeadName={getLeadName} />

      {/* Hall of Fame Featured */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-yellow-950/10 via-slate-900/20 to-amber-950/10 border-y border-yellow-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 blur-[100px] rounded-full" />
        <motion.div style={{ y: championY }} className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="flex justify-between items-end mb-16">
            <div>
               <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic">CHAMPIONS.</h2>
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500 mt-2">ELITE ATHLETIC RECORD</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} className="text-yellow-500 font-black uppercase text-[11px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all mb-4 border-b-2 border-yellow-500/20 pb-1 cursor-pointer">
              <Link to="/hall-of-fame" className="flex items-center gap-2">
                All Records <Trophy size={16} />
              </Link>
            </motion.div>
          </motion.div>
          <HallOfFamePage hallOfFame={hallOfFame.filter(h => h.featured)} config={config} />
        </motion.div>
      </section>

      {/* Announcements */}
      <section id="announcements" className="py-24 relative overflow-hidden bg-gradient-to-tr from-slate-950 via-emerald-950/10 to-slate-950">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,#10b98108_50%,transparent_52%)] bg-[size:32px_32px]" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="mb-12">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">{config.announcements_title || 'ANNOUNCEMENTS.'}</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">{config.announcements_subtitle || 'Club News & Updates'}</p>
          </motion.div>
          {(() => {
            try {
              const announcements = config.announcements_list ? JSON.parse(config.announcements_list) : [];
              if (announcements.length === 0) {
                return (
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="glass-card border border-white/5 rounded-3xl p-12 text-center">
                    <p className="text-slate-400 text-lg">No announcements yet. Check back soon!</p>
                  </motion.div>
                );
              }
              return (
                <div className="space-y-6">
                  {announcements.slice(0, 5).map((ann: any, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }} 
                      whileInView={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card border border-emerald-500/20 rounded-3xl p-8 hover:border-emerald-500/40 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors">{ann.title}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1">{new Date(ann.date).toLocaleDateString()}</p>
                        </div>
                        <motion.div whileHover={{ rotate: 45, scale: 1.1 }} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors">
                          <ArrowRight size={20} />
                        </motion.div>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{ann.content}</p>
                      {ann.link && (
                        <motion.a href={ann.link} target="_blank" rel="noopener noreferrer" whileHover={{ x: 4 }} className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-[10px] font-black uppercase tracking-widest mt-6 transition-colors">
                          Learn More <ArrowRight size={12} />
                        </motion.a>
                      )}
                    </motion.div>
                  ))}
                </div>
              );
            } catch {
              return <div className="text-slate-400">Loading announcements...</div>;
            }
          })()}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-slate-900/20 via-slate-950/50 to-slate-900/20 border-y border-emerald-500/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/8 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-teal-500/8 blur-[140px] rounded-full" />
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">{config.testimonials_title || 'WHAT MEMBERS SAY.'}</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{config.testimonials_subtitle || 'Real Stories, Real Impact'}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="glass-card border border-white/5 rounded-3xl p-8 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500/30">
                    <img src={testimonial.img} alt={testimonial.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-white">{testimonial.name}</p>
                    <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed italic">"{testimonial.text}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
