import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { Menu, X, Zap, ShieldCheck, LogOut } from 'lucide-react';
import { INITIAL_PROFILES, INITIAL_EVENTS, INITIAL_HALL_OF_FAME } from './constants';
import { Profile, Event, Achievement } from './types';
import { supabase } from './supabaseClient';

// Page Components
import LandingPage from './components/LandingPage';
import BoardMembersPage from './components/BoardMembersPage';
import TimelinePage from './components/TimelinePage';
import HallOfFamePage from './components/HallOfFamePage';
import ContactPage from './components/ContactPage';
import AdminDashboard from './components/AdminDashboard';
import CalculatorPage from './components/CalculatorPage';
import LoginPage from './components/LoginPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';

const NavLink = ({ to, children, icon: Icon, onClick, scrolled, index }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <motion.div
      initial={false}
      animate={{ 
        y: scrolled ? 0 : 4,
        scale: scrolled ? 1 : 0.98,
        opacity: 1
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30, 
        delay: scrolled ? index * 0.02 : 0 
      }}
    >
      <Link
        to={to}
        onClick={onClick}
        className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          isActive 
            ? 'text-emerald-400 bg-emerald-500/5' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {Icon && <Icon size={14} />}
        <span className="uppercase tracking-[0.2em] text-[9px] font-black">{children}</span>
        {isActive && (
          <motion.div 
            layoutId="nav-underline"
            className="absolute -bottom-1 left-4 right-4 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" 
          />
        )}
      </Link>
    </motion.div>
  );
};

const Header = ({ scrolled, setIsMenuOpen, isMenuOpen, user, onLogout }: any) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  // Parallax effect for header background elements
  const bgShift = useTransform(scrollYProgress, [0, 0.2], [0, -20]);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0, paddingTop: scrolled ? '8px' : '20px', paddingBottom: scrolled ? '8px' : '20px' }}
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
    >
      <div className="max-w-7xl w-full px-4 pointer-events-auto">
        <motion.div 
          animate={{
            backgroundColor: scrolled ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0)',
            backdropFilter: scrolled ? 'blur(32px)' : 'blur(0px)',
            borderColor: scrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)',
            borderRadius: scrolled ? '24px' : '0px',
            scale: scrolled ? 0.98 : 1,
            y: scrolled ? 4 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex items-center justify-between py-3 px-6 border border-transparent relative overflow-hidden group shadow-2xl"
        >
          {/* Subtle parallax background glow */}
          <motion.div 
            style={{ y: bgShift }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          />

          <motion.div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-emerald-500 origin-center z-20 opacity-40" style={{ scaleX }} />

          <motion.div
            animate={{ 
              scale: scrolled ? 1.05 : 1,
              y: scrolled ? 0 : 2
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <Link to="/" className="flex items-center space-x-3 z-50" onClick={() => setIsMenuOpen(false)}>
              <div className="p-2 bg-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Zap className="text-black" size={18} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="font-black tracking-tighter uppercase leading-none text-lg">FITNESS CLUB</span>
                <span className="text-[7px] font-black text-emerald-500 tracking-[0.4em] uppercase">VIT Chennai</span>
              </div>
            </Link>
          </motion.div>

          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/" scrolled={scrolled} index={0}>Home</NavLink>
            <NavLink to="/team" scrolled={scrolled} index={1}>Leadership</NavLink>
            <NavLink to="/timeline" scrolled={scrolled} index={2}>Events</NavLink>
            <NavLink to="/hall-of-fame" scrolled={scrolled} index={3}>Hall of Fame</NavLink>
            <NavLink to="/calculator" scrolled={scrolled} index={4}>Calculator</NavLink>
            <NavLink to="/contact" scrolled={scrolled} index={5}>Join Us</NavLink>
            {user && <NavLink to="/admin" icon={ShieldCheck} scrolled={scrolled} index={6}>Admin</NavLink>}
          </nav>

          <div className="flex items-center space-x-4 z-50">
            {user && (
              <button onClick={onLogout} className="hidden lg:flex items-center space-x-2 text-red-500 hover:text-red-400 font-black text-[9px] uppercase tracking-widest px-4 py-2 bg-red-500/10 rounded-xl transition-all">
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            )}
            <button className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [hallOfFame, setHallOfFame] = useState<Achievement[]>(INITIAL_HALL_OF_FAME);
  const [recruitmentLink, setRecruitmentLink] = useState('https://forms.gle/mock');
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user?.email || null);

        const [
          { data: p, error: pErr }, 
          { data: e, error: eErr }, 
          { data: h, error: hErr }, 
          { data: c }
        ] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('events').select('*'),
          supabase.from('hall_of_fame').select('*'),
          supabase.from('site_config').select('*').eq('key', 'recruitment_link').maybeSingle()
        ]);

        if (p && !pErr && p.length > 0) setProfiles(p);
        if (e && !eErr && e.length > 0) setEvents(e);
        if (h && !hErr && h.length > 0) setHallOfFame(h);
        if (c && c.value) setRecruitmentLink(c.value);

      } catch (err) {
        console.warn("Using offline constants.");
      } finally {
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    initApp();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleLogin = (val: string) => {
    setUser(val);
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50 selection:bg-emerald-500 selection:text-black">
        <AnimatePresence>
          {isLoading ? (
            <motion.div 
              key="loader"
              exit={{ opacity: 0, scale: 1.1 }}
              className="fixed inset-0 z-[200] bg-[#020617] flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 border-t-2 border-emerald-500 rounded-full"
                />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500 animate-pulse" size={32} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-2">Fitness Cloud Synchronization</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Establishing Secure Uplink...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-h-screen relative"
            >
              <Header scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} onLogout={handleLogout} />

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: '-100%' }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-[80] lg:hidden flex flex-col bg-slate-950/95 backdrop-blur-2xl p-8 pt-32"
                  >
                    <nav className="flex flex-col space-y-4">
                      {[
                        { name: 'Home', path: '/' },
                        { name: 'Leadership', path: '/team' },
                        { name: 'Events', path: '/timeline' },
                        { name: 'Hall of Fame', path: '/hall-of-fame' },
                        { name: 'Calculator', path: '/calculator' },
                        { name: 'Join Us', path: '/contact' }
                      ].map((item) => (
                        <Link 
                          key={item.name}
                          to={item.path} 
                          onClick={() => setIsMenuOpen(false)} 
                          className="text-4xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-colors py-2 border-b border-white/5"
                        >
                          {item.name}
                        </Link>
                      ))}
                      {user && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsMenuOpen(false)} 
                          className="text-4xl font-black uppercase tracking-tighter text-emerald-500 py-2"
                        >
                          Board Panel
                        </Link>
                      )}
                      {user && (
                        <button 
                          onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                          className="text-left text-2xl font-black uppercase tracking-tighter text-red-500 py-4 mt-8"
                        >
                          Log Out
                        </button>
                      )}
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>

              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage events={events} hallOfFame={hallOfFame} />} />
                  <Route path="/team" element={<BoardMembersPage profiles={profiles} />} />
                  <Route path="/timeline" element={<TimelinePage events={events} />} />
                  <Route path="/hall-of-fame" element={<HallOfFamePage hallOfFame={hallOfFame} />} />
                  <Route path="/contact" element={<ContactPage recruitmentLink={recruitmentLink} />} />
                  <Route path="/calculator" element={<CalculatorPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="/login" element={user ? <Navigate to="/admin" /> : <LoginPage onLogin={handleLogin} />} />
                  <Route path="/admin" element={user ? <AdminDashboard profiles={profiles} setProfiles={setProfiles} events={events} setEvents={setEvents} hallOfFame={hallOfFame} setHallOfFame={setHallOfFame} recruitmentLink={recruitmentLink} setRecruitmentLink={setRecruitmentLink} /> : <Navigate to="/login" />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>

              <footer className="w-full bg-slate-950 py-20 px-6 border-t border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Zap size={24} className="text-emerald-500" />
                      <span className="font-black tracking-tighter uppercase text-2xl">Fitness Club</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                      The official strength and performance hub of VIT Chennai. Join the movement. Achieve elite results.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Navigation</h4>
                      <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-400">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <Link to="/team" className="hover:text-white transition-colors">Team</Link>
                        <Link to="/timeline" className="hover:text-white transition-colors">Events</Link>
                        <Link to="/calculator" className="hover:text-white transition-colors">Calculator</Link>
                      </nav>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Administration</h4>
                      <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-400">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="/login" className="hover:text-emerald-500 transition-colors">Board Login</Link>
                      </nav>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between">
                     <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-1">Status</p>
                       <div className="flex items-center space-x-2 text-emerald-500 font-black text-sm italic uppercase">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                         <span>Cloud Active</span>
                       </div>
                     </div>
                     <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-12">
                       © 2024 Fitness Club VIT Chennai. All Rights Reserved.
                     </p>
                  </div>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HashRouter>
  );
};

export default App;
