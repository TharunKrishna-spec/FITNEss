import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
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

const NavLink = ({ to, children, icon: Icon, onClick }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'text-emerald-400' 
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
  );
};

const Header = ({ scrolled, setIsMenuOpen, isMenuOpen, user, onLogout }: any) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0, paddingTop: scrolled ? '12px' : '24px', paddingBottom: scrolled ? '12px' : '24px' }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <div className="max-w-7xl w-full px-4 pointer-events-auto">
        <motion.div 
          animate={{
            backgroundColor: scrolled ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0)',
            backdropFilter: scrolled ? 'blur(32px)' : 'blur(0px)',
            borderColor: scrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)',
            borderRadius: scrolled ? '24px' : '0px',
            scale: scrolled ? 0.98 : 1,
          }}
          className="flex items-center justify-between py-3 px-6 border relative overflow-hidden group"
        >
          <motion.div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-emerald-500 origin-center z-20 opacity-40" style={{ scaleX }} />

          <Link to="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
            <div className="p-2 bg-emerald-500 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Zap className="text-black" size={18} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tighter uppercase leading-none text-lg">TITAN FITNESS</span>
              <span className="text-[7px] font-black text-emerald-500 tracking-[0.4em] uppercase">VIT Chennai</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/team">Leadership</NavLink>
            <NavLink to="/timeline">Events</NavLink>
            <NavLink to="/hall-of-fame">Hall of Fame</NavLink>
            <NavLink to="/calculator">Calculator</NavLink>
            <NavLink to="/contact">Join Us</NavLink>
            {user && <NavLink to="/admin" icon={ShieldCheck}>Admin</NavLink>}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            {user && (
              <button onClick={onLogout} className="hidden lg:flex items-center space-x-2 text-red-500 hover:text-red-400 font-black text-[9px] uppercase tracking-widest px-4 py-2 bg-red-500/10 rounded-xl transition-all">
                <LogOut size={14} />
                <span>Exit</span>
              </button>
            )}
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

  // Sync Auth State & Initial Fetch
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      // 1. Get current session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user?.email || null);

      // 2. Fetch Initial Data
      try {
        const [
          { data: p }, 
          { data: e }, 
          { data: h }, 
          { data: c }
        ] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('events').select('*'),
          supabase.from('hall_of_fame').select('*'),
          supabase.from('site_config').select('*').eq('key', 'recruitment_link').maybeSingle()
        ]);

        if (p && p.length > 0) setProfiles(p);
        if (e && e.length > 0) setEvents(e);
        if (h && h.length > 0) setHallOfFame(h);
        if (c) setRecruitmentLink(c.value);
      } catch (err) {
        console.error("Supabase sync failed, using initial constants", err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    // Listen for Auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleLogin = (val: string) => {
    setUser(val);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Zap className="text-emerald-500 animate-pulse" size={48} />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">Syncing with Titan Core...</span>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#020617]">
        <Header scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} onLogout={handleLogout} />

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-[60] lg:hidden flex flex-col bg-slate-950 p-8 pt-24"
            >
              <nav className="flex flex-col space-y-6">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter">Home</Link>
                <Link to="/team" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter">Leadership</Link>
                <Link to="/timeline" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter">Events</Link>
                <Link to="/hall-of-fame" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter">Hall of Fame</Link>
                <Link to="/calculator" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter">Calculator</Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter">Join Us</Link>
                {user && <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter text-emerald-500">Admin</Link>}
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
            <Route path="/login" element={user ? <Navigate to="/admin" /> : <LoginPage onLogin={handleLogin} />} />
            <Route path="/admin" element={user ? <AdminDashboard profiles={profiles} setProfiles={setProfiles} events={events} setEvents={setEvents} hallOfFame={hallOfFame} setHallOfFame={setHallOfFame} recruitmentLink={recruitmentLink} setRecruitmentLink={setRecruitmentLink} /> : <Navigate to="/login" />} />
          </Routes>
        </main>

        <footer className="w-full bg-slate-950/50 py-12 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-3 opacity-50">
              <Zap size={16} className="text-emerald-500" />
              <span className="font-black tracking-tighter uppercase text-sm">Titan Fitness Club © 2024</span>
            </div>
            <div className="flex space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Link to="/team" className="hover:text-emerald-500">Leadership</Link>
              <Link to="/timeline" className="hover:text-emerald-500">Events</Link>
              <Link to="/login" className="hover:text-emerald-500">Vault Access</Link>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;