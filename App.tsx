
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Menu, X, Activity, Trophy, Calendar, Users, Home, Settings, Zap, ArrowUpRight, LayoutGrid, Clock, ShieldCheck } from 'lucide-react';
import { INITIAL_PROFILES, INITIAL_EVENTS, INITIAL_HALL_OF_FAME } from './constants';
import { Profile, Event, Achievement, UserRole } from './types';

// Page Components
import LandingPage from './components/LandingPage';
import BoardMembersPage from './components/BoardMembersPage';
import TimelinePage from './components/TimelinePage';
import HallOfFamePage from './components/HallOfFamePage';
import ContactPage from './components/ContactPage';
import AdminDashboard from './components/AdminDashboard';
import CalculatorPage from './components/CalculatorPage';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  onClick?: () => void;
  external?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon: Icon, onClick, external }) => {
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

const Header: React.FC<{ scrolled: boolean; setIsMenuOpen: (v: boolean) => void; isMenuOpen: boolean }> = ({ scrolled, setIsMenuOpen, isMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const handleAnchorClick = (anchor: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/', { state: { scrollTo: anchor } });
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ 
        y: 0,
        paddingTop: scrolled ? '16px' : '32px',
        paddingBottom: scrolled ? '16px' : '32px',
      }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <div className="max-w-7xl w-full px-4 pointer-events-auto">
        <motion.div 
          animate={{
            backgroundColor: scrolled ? 'rgba(15, 23, 42, 0.82)' : 'rgba(15, 23, 42, 0)',
            backdropFilter: scrolled ? 'blur(64px) saturate(180%)' : 'blur(0px) saturate(100%)',
            borderColor: scrolled ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0)',
            borderRadius: scrolled ? '32px' : '0px',
            paddingLeft: scrolled ? '32px' : '16px',
            paddingRight: scrolled ? '32px' : '16px',
            scale: scrolled ? 0.98 : 1,
            boxShadow: scrolled 
              ? '0 30px 60px -15px rgba(0,0,0,0.7), 0 0 1px 1px rgba(255,255,255,0.08) inset, 0 8px 16px -8px rgba(0,0,0,0.5)' 
              : 'none'
          }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="flex items-center justify-between py-3 border relative overflow-hidden group"
        >
          {/* Scroll Progress Bar */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent origin-center z-20 opacity-80"
            style={{ scaleX }}
          />

          <Link to="/" className="flex items-center space-x-3 group/logo" onClick={handleNavClick}>
            <motion.div 
              animate={{ 
                scale: scrolled ? 0.8 : 1, 
                rotate: scrolled ? 6 : 0,
              }}
              className="p-2.5 rounded-xl group-hover/logo:rotate-12 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.4)] bg-emerald-500"
            >
              <Zap className="text-black" size={20} fill="currentColor" />
            </motion.div>
            <div className="flex flex-col">
              <motion.span 
                animate={{ fontSize: scrolled ? '1rem' : '1.25rem' }} 
                className="font-black tracking-tighter uppercase leading-none"
              >
                FITNESS CLUB
              </motion.span>
              <AnimatePresence>
                {!scrolled && (
                  <motion.span 
                    initial={{ opacity: 0, height: 0, y: -5 }} 
                    animate={{ opacity: 1, height: 'auto', y: 0 }} 
                    exit={{ opacity: 0, height: 0, y: -5 }} 
                    className="text-[8px] font-black text-emerald-500 tracking-[0.3em] overflow-hidden"
                  >
                    VIT CHENNAI
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/" onClick={handleNavClick}>Home</NavLink>
            <NavLink to="/team" onClick={handleNavClick}>Leadership</NavLink>
            <button 
              onClick={handleAnchorClick('upcoming')} 
              className="relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all text-slate-400 hover:text-white uppercase tracking-[0.2em] text-[9px] font-black group/navlink"
            >
               <span className="group-hover/navlink:text-emerald-400 transition-colors">Upcoming</span>
               <div className="flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500 text-[6px] text-black font-black animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]">NEW</div>
            </button>
            <button 
              onClick={handleAnchorClick('departments')} 
              className="relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all text-slate-400 hover:text-white uppercase tracking-[0.2em] text-[9px] font-black group/navlink"
            >
               <span className="group-hover/navlink:text-emerald-400 transition-colors">Departments</span>
            </button>
            <NavLink to="/timeline" onClick={handleNavClick}>Events</NavLink>
            <NavLink to="/hall-of-fame" onClick={handleNavClick}>Hall of Fame</NavLink>
            <NavLink to="/contact" onClick={handleNavClick}>Recruitments</NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-3 bg-white/5 rounded-xl text-slate-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 py-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="text-emerald-500" size={20} fill="currentColor" />
            <span className="font-black tracking-tighter uppercase">Titan Fitness</span>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">© 2024 VIT Chennai. All Rights Reserved.</p>
        </div>
        
        <div className="flex space-x-8">
          <Link to="/team" className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">Team</Link>
          <Link to="/timeline" className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">Events</Link>
          <Link to="/contact" className="text-slate-500 hover:text-white text-[9px] font-black uppercase tracking-widest transition-colors">Apply</Link>
        </div>

        <Link 
          to="/admin" 
          className="group flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
        >
          <ShieldCheck size={14} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />
          <span className="text-[8px] font-black text-slate-600 group-hover:text-slate-300 uppercase tracking-widest">Vault</span>
        </Link>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('titan_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });
  
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('titan_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });
  
  const [hallOfFame, setHallOfFame] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('titan_hall');
    return saved ? JSON.parse(saved) : INITIAL_HALL_OF_FAME;
  });

  const [recruitmentLink, setRecruitmentLink] = useState(() => {
    return localStorage.getItem('titan_recruitment_link') || 'https://forms.gle/your-google-recruitment-link';
  });

  useEffect(() => {
    localStorage.setItem('titan_profiles', JSON.stringify(profiles));
    localStorage.setItem('titan_events', JSON.stringify(events));
    localStorage.setItem('titan_hall', JSON.stringify(hallOfFame));
    localStorage.setItem('titan_recruitment_link', recruitmentLink);
  }, [profiles, events, hallOfFame, recruitmentLink]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileAnchor = (anchor: string) => {
    const el = document.getElementById(anchor);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    } else {
      window.location.hash = '#/';
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      setIsMenuOpen(false);
    }
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-emerald-500 selection:text-black">
        <Header scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[60] lg:hidden flex flex-col bg-slate-950 p-8"
            >
              <div className="flex justify-between items-center mb-16">
                <span className="text-2xl font-black tracking-tighter uppercase italic">VIT<span className="text-emerald-500">FIT</span></span>
                <button onClick={() => setIsMenuOpen(false)} className="p-4 bg-white/5 rounded-2xl text-slate-400"><X size={32} /></button>
              </div>
              <nav className="flex flex-col space-y-6">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-colors">Home</Link>
                <Link to="/team" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-colors">Leadership</Link>
                <button onClick={() => handleMobileAnchor('upcoming')} className="text-left text-4xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-colors">Upcoming</button>
                <button onClick={() => handleMobileAnchor('departments')} className="text-left text-4xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-colors">Departments</button>
                <Link to="/timeline" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-colors">Events</Link>
                <Link to="/hall-of-fame" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-colors">Hall of Fame</Link>
                <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-4xl font-black uppercase tracking-tighter hover:text-emerald-500 transition-colors">Recruitments</Link>
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
            <Route 
              path="/admin" 
              element={
                <AdminDashboard 
                  profiles={profiles} 
                  setProfiles={setProfiles} 
                  events={events} 
                  setEvents={setEvents} 
                  hallOfFame={hallOfFame} 
                  setHallOfFame={setHallOfFame}
                  recruitmentLink={recruitmentLink}
                  setRecruitmentLink={setRecruitmentLink}
                />
              } 
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
