
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { Menu, X, Zap, ShieldCheck, LogOut, CreditCard, QrCode, Instagram, Linkedin, Mail, ShieldAlert, ArrowUp } from 'lucide-react';
import { INITIAL_PROFILES, INITIAL_EVENTS, INITIAL_HALL_OF_FAME } from './constants';
import { Profile, Event, Achievement } from './types';
import { supabase } from './supabaseClient';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
          <div className="glass-card border border-red-500/30 rounded-3xl p-12 max-w-md text-center">
            <ShieldAlert className="text-red-500 mx-auto mb-6" size={64} />
            <h2 className="text-3xl font-black uppercase mb-4 text-white">Something went wrong</h2>
            <p className="text-slate-400 mb-8">We're sorry for the inconvenience. Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-wider hover:bg-emerald-400 transition-all"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Back to Top Button
const BackToTop = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-emerald-500 text-black rounded-full shadow-2xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Page Components
import LandingPage from './components/LandingPage';
import BoardMembersPage from './components/BoardMembersPage';
import TimelinePage from './components/TimelinePage';
import HallOfFamePage from './components/HallOfFamePage';
import ContactPage from './components/ContactPage';
import JoinPage from './components/JoinPage';
import AdminDashboard from './components/AdminDashboard';
import CalculatorPage from './components/CalculatorPage';
import LoginPage from './components/LoginPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';

const NavLink = ({ to, state, children, icon: Icon, onClick, scrolled, index }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to && (!state || (location.state && location.state.scrollTo === state.scrollTo));
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ 
        y: scrolled ? 0 : 4,
        scale: scrolled ? 1 : 0.98,
        opacity: 1
      }}
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30, delay: index * 0.05 }}
    >
      <Link
        to={to}
        state={state}
        onClick={onClick}
        className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
          isActive 
            ? 'text-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        {Icon && <Icon size={14} />}
        <span className="uppercase tracking-[0.2em] text-[9px] font-black">{children}</span>
        {isActive && (
          <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-4 right-4 h-0.5 bg-emerald-500 rounded-full" />
        )}
      </Link>
    </motion.div>
  );
};

const MobileMenu = ({ isOpen, onClose, user }: any) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] lg:hidden"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-slate-900 border-l border-white/10 p-8 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Zap size={16} className="text-black" fill="currentColor" />
              </div>
              <span className="font-black uppercase text-sm">Menu</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>
          <nav className="space-y-2">
            <Link to="/" onClick={onClose} className="block px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-wider">Home</Link>
            <Link to="/team" onClick={onClose} className="block px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-wider">Leadership</Link>
            <Link to="/timeline" onClick={onClose} className="block px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-wider">Events</Link>
            <Link to="/hall-of-fame" onClick={onClose} className="block px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-wider">Hall of Fame</Link>
            <Link to="/join" onClick={onClose} className="block px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-wider">Join Us</Link>
            <Link to="/calculator" onClick={onClose} className="block px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-wider">Calculator</Link>
            {user && <Link to="/admin" onClick={onClose} className="block px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-black uppercase tracking-wider text-emerald-400">Admin</Link>}
          </nav>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Header = ({ scrolled, setIsMenuOpen, isMenuOpen, user, openIDModal, onLogout }: any) => {
  const { scrollYProgress } = useScroll();
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  return (
    <>
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} user={user} />
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1, paddingTop: scrolled ? '8px' : '20px', paddingBottom: scrolled ? '8px' : '20px' }}
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
      >
        <div className="max-w-7xl w-full px-4 pointer-events-auto">
          <motion.div 
            style={{ scale: headerScale }}
            animate={{
              backgroundColor: scrolled ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0)',
              backdropFilter: scrolled ? 'blur(32px)' : 'blur(0px)',
              borderColor: scrolled ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0)',
              borderRadius: scrolled ? '28px' : '0px',
            }}
            className="flex items-center justify-between py-3 px-6 border border-transparent relative shadow-2xl"
          >
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-emerald-500/20 origin-center z-20" />

          <Link to="/" className="flex items-center space-x-3 z-50">
            <div className="p-2 bg-emerald-500 rounded-lg shadow-lg">
              <Zap className="text-black" size={18} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tighter uppercase leading-none text-lg">FITNESS CLUB</span>
              <span className="text-[7px] font-black text-emerald-500 tracking-[0.4em] uppercase">VIT Chennai</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            <NavLink to="/" scrolled={scrolled} index={0}>Home</NavLink>
            <NavLink to="/team" scrolled={scrolled} index={1}>Leadership</NavLink>
            <NavLink to="/timeline" scrolled={scrolled} index={3}>Events</NavLink>
            <NavLink to="/hall-of-fame" scrolled={scrolled} index={4}>Hall of Fame</NavLink>
            <NavLink to="/join" scrolled={scrolled} index={5}>Join Us</NavLink>
            <NavLink to="/calculator" scrolled={scrolled} index={6}>Calculator</NavLink>
            {user && <NavLink to="/admin" icon={ShieldCheck} scrolled={scrolled} index={7}>Admin</NavLink>}
          </nav>

          <div className="flex items-center space-x-4 z-50">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openIDModal}
              className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20"
            >
              <CreditCard size={14} />
              <span className="hidden sm:inline">Member ID</span>
            </motion.button>
            {user && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-500/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-400 border border-red-500/30"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            )}
            <motion.button className="lg:hidden p-2 text-slate-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.header>
    </>
  );
};

const Footer = ({ user, config }: { user: string | null; config?: Record<string, string> }) => (
  <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10 mt-auto">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2">
          <Link to="/" className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Zap className="text-black" size={18} fill="currentColor" />
            </div>
            <span className="font-black tracking-tighter uppercase text-xl">FITNESS CLUB.</span>
          </Link>
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
            {config?.footer_text || 'The official fitness pulse of VIT Chennai. Re-engineering campus strength culture through science and community.'}
          </p>
          <div className="flex space-x-4">
            <a href={config?.contact_instagram || '#'} className="p-3 bg-white/5 rounded-xl hover:bg-emerald-500 hover:text-black transition-all"><Instagram size={18} /></a>
            <a href={config?.contact_linkedin || '#'} className="p-3 bg-white/5 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Linkedin size={18} /></a>
            <a href={`mailto:${config?.contact_email || '#'}`} className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all"><Mail size={18} /></a>
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Explore</h4>
          <ul className="space-y-4">
            <li><Link to="/" className="text-slate-500 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors">Home</Link></li>
            <li><Link to="/team" className="text-slate-500 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors">Team</Link></li>
            <li><Link to="/timeline" className="text-slate-500 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors">Events</Link></li>
            <li><Link to="/join" className="text-slate-500 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors">Join Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Admin</h4>
          <ul className="space-y-4">
            <li>
              <Link to={user ? "/admin" : "/login"} className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors">
                <ShieldAlert size={12} />
                <span>{user ? "Admin Dashboard" : "Board Login"}</span>
              </Link>
            </li>
            <li><Link to="/privacy" className="text-slate-500 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors">Privacy</Link></li>
            <li><Link to="/terms" className="text-slate-500 hover:text-emerald-500 text-xs font-black uppercase tracking-widest transition-colors">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-700">© 2024 FITNESS CLUB VIT CHENNAI</p>
      </div>
    </div>
  </footer>
);

const IDModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [regNo, setRegNo] = useState('');
  const [showQR, setShowQR] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={onClose} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md glass-card rounded-[40px] border-white/10 p-10 shadow-2xl text-center">
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"><X size={20} /></button>
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
              <QrCode size={32} />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Virtual <span className="text-emerald-500">Member Card</span></h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">Access for FFCS Members Only</p>
            <div className="space-y-6">
              {!showQR ? (
                <>
                  <input 
                    type="text" 
                    placeholder="ENTER REG NUMBER" 
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl font-black tracking-[0.2em] outline-none focus:border-emerald-500/50 transition-all text-white"
                  />
                  <button onClick={() => regNo && setShowQR(true)} className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-emerald-500/20">Generate ID QR</button>
                </>
              ) : (
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-[32px] inline-block shadow-2xl">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${regNo}`} className="w-48 h-48" alt="QR" />
                  </div>
                  <div>
                    <p className="text-xl font-black tracking-widest mb-1 text-white">{regNo}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Authorized FFCS Member</p>
                  </div>
                  <button onClick={() => setShowQR(false)} className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">Change Reg No</button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [hallOfFame, setHallOfFame] = useState<Achievement[]>(INITIAL_HALL_OF_FAME);
  const [siteConfig, setSiteConfig] = useState<Record<string, string>>({
    hero_title: 'FITNESS CLUB.',
    hero_subtitle: 'The high-performance athletic pulse of VIT Chennai.',
    hero_image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1200',
    board_title: 'THE BOARD.',
    announcements_title: 'ANNOUNCEMENTS.',
    announcements_subtitle: 'Club News & Updates',
    hall_title: 'HALL OF CHAMPIONS.',
    announcements_list: '[]'
  });
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIDModalOpen, setIsIDModalOpen] = useState(false);
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
        const [{ data: p }, { data: e }, { data: h }, { data: c }] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('events').select('*'),
          supabase.from('hall_of_fame').select('id, athlete_name, category, event_name, year, position, athlete_img, stat, featured'),
          supabase.from('site_config').select('*')
        ]);
        if (p?.length) setProfiles(p);
        if (e?.length) setEvents(e);
        if (h?.length) {
          const mapped = h.map((rec: any) => ({
            id: rec.id,
            athleteName: rec.athlete_name,
            category: rec.category,
            eventName: rec.event_name,
            year: rec.year,
            position: rec.position,
            athleteImg: rec.athlete_img,
            stat: rec.stat,
            featured: rec.featured
          }));
          setHallOfFame(mapped);
        }
        if (c?.length) {
          const configMap: Record<string, string> = {};
          c.forEach(item => { configMap[item.key] = item.value; });
          setSiteConfig(prev => ({ ...prev, ...configMap }));
        }
      } catch (err) { console.warn("Offline."); } finally { setTimeout(() => setIsLoading(false), 800); }
    };
    initApp();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout failed', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <ErrorBoundary>
      <HashRouter>
        <ScrollToTop />
        <BackToTop />
        <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50">
        <AnimatePresence>
          {isLoading ? (
            <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center">
              <Zap className="text-emerald-500 animate-pulse" size={48} />
            </motion.div>
          ) : (
            <div className="flex flex-col min-h-screen relative">
              <Header scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} openIDModal={() => setIsIDModalOpen(true)} onLogout={handleLogout} />
              <IDModal isOpen={isIDModalOpen} onClose={() => setIsIDModalOpen(false)} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage events={events} hallOfFame={hallOfFame} config={siteConfig} profiles={profiles} />} />
                  <Route path="/team" element={<BoardMembersPage profiles={profiles} config={siteConfig} />} />
                  <Route path="/timeline" element={<TimelinePage events={events} config={siteConfig} />} />
                  <Route path="/hall-of-fame" element={<HallOfFamePage hallOfFame={hallOfFame} config={siteConfig} />} />
                  <Route path="/join" element={<JoinPage config={siteConfig} profiles={profiles} />} />
                  <Route path="/contact" element={<ContactPage config={siteConfig} />} />
                  <Route path="/calculator" element={<CalculatorPage />} />
                  <Route path="/login" element={<LoginPage onLogin={(email) => setUser(email)} />} />
                  <Route path="/admin" element={user ? <AdminDashboard profiles={profiles} setProfiles={setProfiles} events={events} setEvents={setEvents} hallOfFame={hallOfFame} setHallOfFame={setHallOfFame} siteConfig={siteConfig} setSiteConfig={setSiteConfig} /> : <Navigate to="/login" />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
              <Footer user={user} config={siteConfig} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </HashRouter>
    </ErrorBoundary>
  );
};

export default App;
