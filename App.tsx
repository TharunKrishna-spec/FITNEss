
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { Menu, X, Zap, ShieldCheck, LogOut, CreditCard, QrCode } from 'lucide-react';
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
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30, 
        delay: index * 0.05 
      }}
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
          <motion.div 
            layoutId="nav-underline"
            className="absolute -bottom-1 left-4 right-4 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" 
          />
        )}
      </Link>
    </motion.div>
  );
};

const Header = ({ scrolled, setIsMenuOpen, isMenuOpen, user, onLogout, openIDModal }: any) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const headerScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1, paddingTop: scrolled ? '8px' : '20px', paddingBottom: scrolled ? '8px' : '20px' }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
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
            y: scrolled ? 4 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex items-center justify-between py-3 px-6 border border-transparent relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-emerald-500/20 origin-center z-20" />

          <Link to="/" className="flex items-center space-x-3 z-50">
            <div className="p-2 bg-emerald-500 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.5)]">
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
            <NavLink to="/calculator" scrolled={scrolled} index={5}>Calculator</NavLink>
            {user && <NavLink to="/admin" icon={ShieldCheck} scrolled={scrolled} index={7}>Admin</NavLink>}
          </nav>

          <div className="flex items-center space-x-4 z-50">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openIDModal}
              className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20 shadow-lg"
            >
              <CreditCard size={14} />
              <span className="hidden sm:inline">Member ID</span>
            </motion.button>
            <motion.button className="lg:hidden p-2 text-slate-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
};

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
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">Uplink to Entry Terminals</p>
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
                  <button onClick={() => regNo && setShowQR(true)} className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-emerald-500/20">Generate Digital ID</button>
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
                  <button onClick={() => setShowQR(false)} className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">Reset Terminal</button>
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
    hero_subtitle: 'Representing the athletic pulse of VIT Chennai.',
    hero_image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1200',
    board_title: 'THE BOARD.',
    events_title: 'LIVE & UPCOMING.',
    hall_title: 'HALL OF CHAMPIONS.'
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
          supabase.from('hall_of_fame').select('*'),
          supabase.from('site_config').select('*')
        ]);
        if (p?.length) setProfiles(p);
        if (e?.length) setEvents(e);
        if (h?.length) setHallOfFame(h);
        if (c?.length) {
          const configMap: Record<string, string> = {};
          c.forEach(item => { configMap[item.key] = item.value; });
          setSiteConfig(prev => ({ ...prev, ...configMap }));
        }
      } catch (err) { console.warn("Offline."); } finally { setTimeout(() => setIsLoading(false), 800); }
    };
    initApp();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#020617] text-slate-50">
        <AnimatePresence>
          {isLoading ? (
            <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#020617] flex items-center justify-center">
              <Zap className="text-emerald-500 animate-pulse" size={48} />
            </motion.div>
          ) : (
            <div className="flex flex-col min-h-screen relative">
              <Header scrolled={scrolled} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} onLogout={() => supabase.auth.signOut()} openIDModal={() => setIsIDModalOpen(true)} />
              <IDModal isOpen={isIDModalOpen} onClose={() => setIsIDModalOpen(false)} />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage events={events} hallOfFame={hallOfFame} config={siteConfig} />} />
                  <Route path="/team" element={<BoardMembersPage profiles={profiles} config={siteConfig} />} />
                  <Route path="/timeline" element={<TimelinePage events={events} config={siteConfig} />} />
                  <Route path="/hall-of-fame" element={<HallOfFamePage hallOfFame={hallOfFame} config={siteConfig} />} />
                  <Route path="/calculator" element={<CalculatorPage />} />
                  <Route path="/login" element={<LoginPage onLogin={(email) => setUser(email)} />} />
                  <Route path="/admin" element={user ? <AdminDashboard profiles={profiles} setProfiles={setProfiles} events={events} setEvents={setEvents} hallOfFame={hallOfFame} setHallOfFame={setHallOfFame} siteConfig={siteConfig} setSiteConfig={setSiteConfig} /> : <Navigate to="/login" />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsOfServicePage />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>

              <footer className="bg-slate-950 py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                  <div>
                    <Link to="/" className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                      <Zap className="text-emerald-500" size={24} />
                      <span className="font-black text-2xl uppercase tracking-tighter">Fitness Club</span>
                    </Link>
                    <p className="text-slate-500 text-sm font-medium">Official performance hub of VIT Chennai.</p>
                  </div>
                  <nav className="flex flex-col space-y-4">
                    <h4 className="text-emerald-500 font-black uppercase tracking-widest text-[10px]">Registry</h4>
                    <Link to="/privacy" className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Privacy</Link>
                    <Link to="/terms" className="text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Terms</Link>
                  </nav>
                  <div className="flex flex-col items-center md:items-end justify-center">
                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">© 2024 FITNESS CLUB VIT CHENNAI</p>
                  </div>
                </div>
              </footer>
            </div>
          )}
        </AnimatePresence>
      </div>
    </HashRouter>
  );
};

export default App;
