import React, { useState } from 'react';
import { Profile, Event, Achievement } from '../types';
import {
  LayoutDashboard, Users, Calendar, Trophy, Settings, Scan,
  Terminal, ShieldCheck, Database, RefreshCw, LogOut, ChevronRight, Zap,
  AlertCircle, Megaphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { SEED_PROFILES, INITIAL_EVENTS, INITIAL_HALL_OF_FAME } from '../constants';
import { mapProfileToDb, mapEventToDb, mapHallToDb } from '../utils/supabaseUtils';

// Sub-components
import RegistryTab from './admin/RegistryTab';
import CyclesTab from './admin/CyclesTab';
import MatrixTab from './admin/MatrixTab';
import TerminalTab from './admin/TerminalTab';
import ArchivesTab from './admin/ArchivesTab';
import ContentTab from './admin/ContentTab';
import CoreUnitsTab from './admin/CoreUnitsTab';
import AnnouncementsTab from './admin/AnnouncementsTab';
import TestimonialsTab from './admin/TestimonialsTab';
import FAQTab from './admin/FAQTab';

interface Props {
  profiles: Profile[];
  setProfiles: (p: Profile[]) => void;
  events: Event[];
  setEvents: (e: Event[]) => void;
  hallOfFame: Achievement[];
  setHallOfFame: (h: Achievement[]) => void;
  siteConfig: Record<string, string>;
  setSiteConfig: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const AdminDashboard: React.FC<Props> = ({
  profiles, setProfiles,
  events, setEvents,
  hallOfFame, setHallOfFame,
  siteConfig, setSiteConfig
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'events' | 'hall' | 'scoring' | 'scanner' | 'content' | 'core' | 'announcements' | 'testimonials' | 'faq'>('overview');
  const [isSyncing, setIsSyncing] = useState(false);

  const seedDatabase = async () => {
    if (!confirm("This will upload initial demo data ( Aryan Sharma, Campus Clash 2024, etc.) to your Supabase instance. Continue?")) return;
    setIsSyncing(true);
    try {
      const profilesPayload = SEED_PROFILES.map(mapProfileToDb);
      const eventsPayload = INITIAL_EVENTS.map(mapEventToDb);
      const hofPayload = INITIAL_HALL_OF_FAME.map(mapHallToDb);

      // Try upsert; if profile upsert errors about unknown columns, retry without socials
      const pRes = await supabase.from('profiles').upsert(profilesPayload);
      if (pRes.error) {
        const msg = (pRes.error.message || '').toLowerCase();
        if (msg.includes('could not find') || msg.includes('column') || msg.includes('unknown column')) {
          const stripped = profilesPayload.map(({ socials, ...rest }) => rest);
          const retry = await supabase.from('profiles').upsert(stripped);
          if (retry.error) throw retry.error;
        } else throw pRes.error;
      }

      const eRes = await supabase.from('events').upsert(eventsPayload);
      if (eRes.error) throw eRes.error;

      const hRes = await supabase.from('hall_of_fame').upsert(hofPayload);
      if (hRes.error) throw hRes.error;

      alert("System Initialized. Refreshing data...");
      window.location.reload();
    } catch (err: any) {
      alert(`Seed failed: ${err.message || String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const SidebarBtn = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${activeTab === id
        ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20'
        : 'text-slate-500 hover:text-white hover:bg-white/5'
        }`}
    >
      <div className="flex items-center space-x-4">
        <Icon size={18} className={activeTab === id ? 'text-black' : 'group-hover:text-emerald-500'} />
        <span className="uppercase tracking-[0.2em] text-[10px] font-black">{label}</span>
      </div>
      {activeTab === id && <ChevronRight size={14} />}
    </button>
  );

  const isSystemEmpty = profiles.length === 0 && events.length === 0;

  // helper: convert camelCase keys to snake_case
  const toSnake = (s: string) => s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  const mapKeysToSnake = (obj: any) => {
    // handle non-objects
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toSnake(k), v])
    );
  };
  // Make cleanObject robust against null/undefined/non-objects
  const cleanObject = (obj: any) => {
    if (!obj || typeof obj !== 'object') return obj;
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  };

  // add request state & error state near component state declarations
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [profileError, setProfileError] = React.useState<string | null>(null);
  const [isSavingEvent, setIsSavingEvent] = React.useState(false);
  const [eventError, setEventError] = React.useState<string | null>(null);

  // Replace the profile save handler with this (adjust name to your existing handler)
  const handleSaveProfile = async (profileData: any) => {
    setProfileError(null);
    if (!profileData.name) { setProfileError('Name is required'); return; }
    setIsSavingProfile(true);
    try {
      const payload = mapProfileToDb(profileData);
      let { error } = await supabase.from('profiles').upsert([payload]).select();
      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('could not find') || msg.includes('column') || msg.includes('unknown column')) {
          const { socials, ...withoutSocials } = payload;
          const retry = await supabase.from('profiles').upsert([withoutSocials]).select();
          if (retry.error) {
            setProfileError(retry.error.message || 'Failed to save profile');
            return;
          }
        } else {
          setProfileError(error.message || 'Failed to save profile');
          return;
        }
      }
      console.debug('Profile saved');
    } catch (err: any) {
      console.error('Unexpected save error', err);
      setProfileError(err?.message || String(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Replace the event save handler with this (adjust name to your existing handler)
  const handleSaveEvent = async (eventData: any) => {
    setEventError(null);
    if (!eventData.title && !eventData.name) {
      setEventError('Event title is required');
      return;
    }

    setIsSavingEvent(true);
    try {
      const payload = mapEventToDb(eventData);
      const { data, error } = await supabase.from('events').upsert([payload]).select();
      if (error) {
        console.error('Supabase events upsert error:', error);
        setEventError(error.message || 'Failed to save event');
        return;
      }
      console.debug('Event saved:', data);
    } catch (err: any) {
      console.error('Unexpected event save error', err);
      setEventError(err?.message || String(err));
    } finally {
      setIsSavingEvent(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#020617] pt-28 pb-16 gap-8 lg:gap-0">
      {/* Navigation Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-900/20 backdrop-blur-3xl border-r border-white/5 p-8 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] lg:flex-shrink-0 overflow-y-auto no-scrollbar flex flex-col">
        <div className="mb-8 hidden lg:block">
          <div className="flex items-center space-x-3 mb-2">
            <Terminal size={20} className="text-emerald-500" />
            <span className="text-xl font-black uppercase italic text-white tracking-tighter">HIGH<span className="text-emerald-500">COMMAND</span></span>
          </div>
          <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em]">Auth Level: Administrator</p>
        </div>

        <div className="glass-card border border-white/5 rounded-3xl p-4 mb-6 text-[11px] text-slate-300">
          <div className="flex items-center justify-between mb-2">
            <span className="font-black uppercase tracking-[0.2em]">System Pulse</span>
            <span className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Online</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500">
            <div className="space-y-1">
              <p className="uppercase tracking-widest">Profiles</p>
              <p className="text-white font-black text-lg leading-none">{profiles.length}</p>
            </div>
            <div className="space-y-1">
              <p className="uppercase tracking-widest">Cycles</p>
              <p className="text-white font-black text-lg leading-none">{events.length}</p>
            </div>
            <div className="space-y-1">
              <p className="uppercase tracking-widest">Archives</p>
              <p className="text-white font-black text-lg leading-none">{hallOfFame.length}</p>
            </div>
            <div className="space-y-1">
              <p className="uppercase tracking-widest">Matrix</p>
              <p className="text-white font-black text-lg leading-none">Live</p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <SidebarBtn id="overview" label="Dashboard" icon={LayoutDashboard} />
          <SidebarBtn id="profiles" label="Registry" icon={Users} />
          <SidebarBtn id="events" label="Cycles" icon={Calendar} />
          <SidebarBtn id="scoring" label="Matrix" icon={Zap} />
          <SidebarBtn id="content" label="Content" icon={Settings} />
          <SidebarBtn id="core" label="Core Units" icon={LayoutDashboard} />
          <SidebarBtn id="announcements" label="Announcements" icon={Megaphone} />
          <SidebarBtn id="testimonials" label="Testimonials" icon={Users} />
          <SidebarBtn id="faq" label="FAQ" icon={ShieldCheck} />
          <SidebarBtn id="scanner" label="Terminal" icon={Scan} />
          <SidebarBtn id="hall" label="Archives" icon={Trophy} />
        </nav>

        <div className="pt-6 mt-6 border-t border-white/5 space-y-3">
          <div className="glass-card border border-white/5 rounded-2xl p-4 text-[11px] text-slate-400 flex items-center justify-between">
            <div>
              <p className="uppercase tracking-widest">Storage</p>
              <p className="text-white font-black text-base">Supabase</p>
            </div>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-grow px-8 lg:px-0 w-full">
        <div className="max-w-7xl mx-auto lg:px-12">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-12">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">Status Brief</h2>
                    {isSystemEmpty && (
                      <p className="text-emerald-500/60 font-black uppercase tracking-widest text-[10px] mt-4 flex items-center gap-2">
                        <AlertCircle size={14} /> Critical: Core registries are empty
                      </p>
                    )}
                  </div>
                  <button
                    onClick={seedDatabase}
                    disabled={isSyncing}
                    className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white hover:border-emerald-500/50 transition-all"
                  >
                    {isSyncing ? <RefreshCw className="animate-spin" size={14} /> : <Database size={14} />}
                    Seed System Data
                  </button>
                </div>

                {isSystemEmpty && (
                  <div className="glass-card p-16 rounded-[64px] border-2 border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center text-center">
                    <Zap size={64} className="text-emerald-500 mb-8 animate-pulse" />
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic mb-4">Initialize High Command</h3>
                    <p className="text-slate-400 max-w-xl mb-10 font-medium">
                      Your database is currently empty. To populate the leadership registry, operational cycles, and legacy hall of fame with default club data, click the button below.
                    </p>
                    <button onClick={seedDatabase} className="px-12 py-6 bg-emerald-500 text-black rounded-[24px] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all">
                      Deploy System Seeds
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { l: 'Personnel', v: profiles.length, c: 'text-emerald-500', i: Users },
                    { l: 'Operational Cycles', v: events.length, c: 'text-blue-500', i: Calendar },
                    { l: 'Archived Records', v: hallOfFame.length, c: 'text-yellow-500', i: Trophy }
                  ].map((s, idx) => (
                    <div key={idx} className="glass-card p-12 rounded-[56px] border-white/5 relative group overflow-hidden">
                      <s.i className="absolute -bottom-8 -right-8 text-white/[0.02] group-hover:text-white/[0.04] transition-all duration-700" size={200} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">{s.l}</p>
                      <p className={`text-9xl font-black ${s.c} tracking-tighter italic leading-none`}>{s.v}</p>
                    </div>
                  ))}
                </div>

                <div className="glass-card p-10 rounded-[48px] border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl"><ShieldCheck size={32} /></div>
                    <div>
                      <p className="text-xl font-black uppercase italic tracking-tight">System Integrity: 100%</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">All database clusters reporting healthy</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'profiles' && <RegistryTab profiles={profiles} setProfiles={setProfiles} />}
            {activeTab === 'events' && <CyclesTab events={events} setEvents={setEvents} />}
            {activeTab === 'scoring' && <MatrixTab events={events} />}
            {activeTab === 'content' && <ContentTab siteConfig={siteConfig} setSiteConfig={setSiteConfig} />}
            {activeTab === 'core' && <CoreUnitsTab siteConfig={siteConfig} setSiteConfig={setSiteConfig} />}
            {activeTab === 'announcements' && <AnnouncementsTab siteConfig={siteConfig} setSiteConfig={setSiteConfig} />}
            {activeTab === 'testimonials' && <TestimonialsTab />}
            {activeTab === 'faq' && <FAQTab />}
            {activeTab === 'scanner' && <TerminalTab profiles={profiles} />}
            {activeTab === 'hall' && <ArchivesTab hallOfFame={hallOfFame} setHallOfFame={setHallOfFame} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
