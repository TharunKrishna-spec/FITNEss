
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition, ScoreColumn, EventScore } from '../types';
import { 
  LayoutDashboard, Users, Calendar, Trophy, Plus, Trash2, Edit2, ShieldCheck, 
  Settings, Save, X, Loader2, Link as LinkIcon, Image as ImageIcon, FileText, Hash,
  Globe, Mail, Type, LayoutTemplate, Palette, Table as TableIcon, Target, ChevronDown, 
  ChevronUp, Download, Check, UploadCloud, AlertCircle, RefreshCw, FileSpreadsheet,
  Instagram, Linkedin, Scan, Camera, UserCheck, ShieldAlert, History, CreditCard, ExternalLink,
  PlusCircle, UserPlus, Send, Activity, Info, Database, Eye, Terminal, Keyboard, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import jsQR from 'jsqr';

interface Props {
  profiles: Profile[];
  setProfiles: (p: Profile[]) => void;
  events: Event[];
  setEvents: (e: Event[]) => void;
  hallOfFame: Achievement[];
  setHallOfFame: (h: Achievement[]) => void;
  siteConfig: Record<string, string>;
  setSiteConfig: (c: Record<string, string>) => void;
}

// Strictly enforce UUID generation
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // Fallback to a UUID-v4-like string if crypto.randomUUID is not available
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const isValidUUID = (id: string) => {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(id);
};

const ultraNormalize = (s: any) => {
  if (s === null || s === undefined) return '';
  return s.toString().replace(/[^a-zA-Z0-9]/g, '').toUpperCase().trim();
};

const AdminDashboard: React.FC<Props> = ({ 
  profiles, setProfiles, 
  events, setEvents, 
  hallOfFame, setHallOfFame,
  siteConfig, setSiteConfig 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'events' | 'hall' | 'settings' | 'scoring' | 'scanner'>('overview');
  const [editingItem, setEditingItem] = useState<{ type: 'profile' | 'event' | 'hall', data: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  
  // Scanner Logic
  const [scanResult, setScanResult] = useState<{ profile?: Profile; raw: string; timestamp: string; status: 'valid' | 'invalid' } | null>(null);
  const [rawDetected, setRawDetected] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const lastScanTime = useRef<number>(0);

  // Scoring State
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [scores, setScores] = useState<EventScore[]>([]);
  const [localSchema, setLocalSchema] = useState<ScoreColumn[]>([]);
  const [isScoringLoading, setIsScoringLoading] = useState(false);
  const [isSyncingScores, setIsSyncingScores] = useState(false);

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  useEffect(() => {
    if (selectedEvent) {
      setLocalSchema(selectedEvent.score_schema || []);
      fetchScores(selectedEvent.id);
    } else {
      setScores([]);
      setLocalSchema([]);
    }
  }, [selectedEventId, events]);

  // QR ENGINE
  useEffect(() => {
    let animationFrame: number;
    const startScanner = async () => {
      if (activeTab !== 'scanner') return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.play();
          setIsScanning(true);
          requestAnimationFrame(tick);
        }
      } catch (err) {
        setErrorMessage("CAMERA_ERROR: Access denied. Ensure you are on HTTPS and granted permissions.");
      }
    };

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.height = videoRef.current.videoHeight;
            canvas.width = videoRef.current.videoWidth;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            
            const now = Date.now();
            if (now - lastScanTime.current > 200) { 
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
              
              if (code && code.data) {
                setRawDetected(code.data);
                handleScan(code.data);
                lastScanTime.current = now;
              }
            }
          }
        }
      }
      animationFrame = requestAnimationFrame(tick);
    };

    if (activeTab === 'scanner') startScanner();
    return () => {
      cancelAnimationFrame(animationFrame);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [activeTab]);

  const handleScan = (data: string) => {
    const rawData = data.trim();
    const normalizedInput = ultraNormalize(rawData);
    if (!normalizedInput) return;

    const profile = profiles.find(p => 
      ultraNormalize(p.reg_no) === normalizedInput || 
      ultraNormalize(p.id) === normalizedInput
    );

    if (scanResult && scanResult.raw === rawData) return;

    const result = {
      profile,
      raw: rawData,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: true }),
      status: profile ? 'valid' as const : 'invalid' as const
    };

    setScanResult(result);
    setScanHistory(prev => [result, ...prev].slice(0, 100));
    
    if (profile) {
      new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(() => {});
    }

    setTimeout(() => {
      setScanResult(null);
      setRawDetected('');
    }, 4000);
  };

  const fetchScores = async (eventId: string) => {
    if (!isValidUUID(eventId)) return;
    setIsScoringLoading(true);
    try {
      const { data, error } = await supabase.from('event_scores').select('*').eq('event_id', eventId);
      if (error) throw error;
      setScores(data?.sort((a, b) => b.total - a.total) || []);
    } catch (e: any) {
      setErrorMessage(`SQL_ERROR: Scoring table desync. ${e.message}`);
    } finally {
      setIsScoringLoading(false);
    }
  };

  const syncScoresWithCloud = async () => {
    if (!selectedEventId || !isValidUUID(selectedEventId)) {
      alert("Invalid Cycle ID. Target must be a valid UUID.");
      return;
    }
    setIsSyncingScores(true);
    setErrorMessage(null);
    try {
      // Clean scores to ensure IDs are UUIDs
      const cleanedScores = scores.map(s => ({
        ...s,
        id: isValidUUID(s.id) ? s.id : generateId()
      }));
      const { error } = await supabase.from('event_scores').upsert(cleanedScores);
      if (error) throw error;
      alert("SUCCESS: Matrix Committed.");
    } catch (err: any) {
      setErrorMessage(`SYNC_FAILED: ${err.message}`);
    } finally {
      setIsSyncingScores(false);
    }
  };

  const deleteItem = async (type: 'profile' | 'event' | 'hall', id: string) => {
    if (!isValidUUID(id)) {
      alert("Cannot delete local-only records. Save them first.");
      return;
    }
    if (!confirm(`Confirm deletion from ${type} registry?`)) return;
    const table = type === 'profile' ? 'profiles' : type === 'event' ? 'events' : 'hall_of_fame';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) setErrorMessage(`DELETE_FAILED: ${error.message}`);
    else {
      if (type === 'profile') setProfiles(profiles.filter(p => p.id !== id));
      if (type === 'event') setEvents(events.filter(e => e.id !== id));
      if (type === 'hall') setHallOfFame(hallOfFame.filter(h => h.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    setErrorMessage(null);
    const formData = new FormData(e.currentTarget);
    const vals = Object.fromEntries(formData.entries());
    
    // Ensure the ID is a valid UUID
    const rawId = editingItem.data.id;
    const id = (rawId && isValidUUID(rawId)) ? rawId : generateId();
    
    try {
      let payload: any = { id };
      let table = '';

      if (editingItem.type === 'profile') {
        table = 'profiles';
        payload = { ...payload, name: vals.name, role: vals.role, position: vals.position, reg_no: vals.reg_no, photo: vals.photo, bio: vals.bio, order_index: vals.order_index ? Number(vals.order_index) : 0 };
      } else if (editingItem.type === 'event') {
        table = 'events';
        payload = { ...payload, title: vals.title, date: vals.date, description: vals.description, status: vals.status, banner: vals.banner, is_featured: !!formData.get('is_featured') };
      } else if (editingItem.type === 'hall') {
        table = 'hall_of_fame';
        payload = { ...payload, athleteName: vals.athleteName, category: vals.category, eventName: vals.eventName, year: vals.year, position: vals.position, stat: vals.stat, athleteImg: vals.athleteImg, featured: !!formData.get('featured') };
      }

      const { error } = await supabase.from(table).upsert(payload);
      if (error) throw error;

      if (editingItem.type === 'profile') setProfiles(editingItem.data.id ? profiles.map(p => p.id === id ? payload : p) : [...profiles, payload]);
      if (editingItem.type === 'event') setEvents(editingItem.data.id ? events.map(ev => ev.id === id ? payload : ev) : [...events, payload]);
      if (editingItem.type === 'hall') setHallOfFame(editingItem.data.id ? hallOfFame.map(h => h.id === id ? payload : h) : [...hallOfFame, payload]);
      
      setEditingItem(null);
    } catch (err: any) { 
      setErrorMessage(`TRANSACTION_FAILED: ${err.message}. Use the SQL Reset & Fix button below.`);
    } finally { 
      setIsSaving(false); 
    }
  };

  const copySqlFix = () => {
    const sql = `-- 1. DROP EXISTING POLICIES TO PREVENT "ALREADY EXISTS" ERRORS
DROP POLICY IF EXISTS "Public Access" ON profiles;
DROP POLICY IF EXISTS "Public Access" ON events;
DROP POLICY IF EXISTS "Public Access" ON event_scores;
DROP POLICY IF EXISTS "Admin Access" ON profiles;
DROP POLICY IF EXISTS "Admin Access" ON events;
DROP POLICY IF EXISTS "Admin Access" ON event_scores;

-- 2. RESET PRIMARY KEYS TO UUID (WARNING: WIPES EXISTING DATA)
ALTER TABLE events DROP COLUMN IF EXISTS id CASCADE;
ALTER TABLE events ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
ALTER TABLE profiles DROP COLUMN IF EXISTS id CASCADE;
ALTER TABLE profiles ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- 3. ENSURE COLUMNS EXIST
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS score_schema JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reg_no TEXT;

-- 4. RECREATE SCORING TABLE
DROP TABLE IF EXISTS event_scores;
CREATE TABLE event_scores (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID, athlete_name TEXT NOT NULL, data JSONB DEFAULT '{}'::jsonb, total NUMERIC DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now());

-- 5. RECREATE POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON profiles FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON events FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE event_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON event_scores FOR ALL USING (true) WITH CHECK (true);`;
    navigator.clipboard.writeText(sql);
    alert("SQL Reset Script copied! This version includes DROP POLICY commands. Paste into Supabase SQL Editor.");
  };

  const SidebarBtn = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => { setActiveTab(id); setErrorMessage(null); }} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all group ${activeTab === id ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
      <Icon size={18} className={activeTab === id ? 'text-black' : 'group-hover:text-emerald-500'} />
      <span className="uppercase tracking-[0.2em] text-[10px] font-black">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 pt-28">
      <aside className="w-full lg:w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 p-8 lg:fixed lg:top-24 lg:bottom-0 overflow-y-auto no-scrollbar">
        <div className="mb-10 hidden lg:block">
           <div className="flex items-center space-x-3 mb-2">
             <Terminal size={20} className="text-emerald-500" />
             <span className="text-xl font-black uppercase italic text-white tracking-tighter">HIGH<span className="text-emerald-500">COMMAND</span></span>
           </div>
           <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em]">UUID Security Level: Active</p>
        </div>
        <nav className="space-y-1">
          <SidebarBtn id="overview" label="Overview" icon={LayoutDashboard} />
          <SidebarBtn id="profiles" label="Registry" icon={Users} />
          <SidebarBtn id="events" label="Events" icon={Calendar} />
          <SidebarBtn id="scoring" label="Scoring" icon={TableIcon} />
          <SidebarBtn id="scanner" label="Terminal" icon={Scan} />
          <SidebarBtn id="hall" label="Archives" icon={Trophy} />
          <SidebarBtn id="settings" label="Site CMS" icon={Settings} />
        </nav>
      </aside>

      <div className="flex-grow lg:ml-80 p-8 lg:p-12 w-full">
        {errorMessage && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-10 p-8 bg-red-500/10 border-2 border-red-500/20 rounded-[40px] shadow-2xl">
            <div className="flex items-start gap-6">
              <ShieldAlert size={40} className="text-red-500 shrink-0" />
              <div className="flex-grow">
                 <p className="text-sm font-black uppercase tracking-[0.3em] text-red-500 mb-2">Database Protocol Violation</p>
                 <p className="text-sm font-bold text-white/70 mb-6">{errorMessage}</p>
                 <div className="flex gap-4">
                    <button onClick={copySqlFix} className="bg-red-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Copy size={14} /> Copy Reset & Fix Script
                    </button>
                 </div>
              </div>
              <button onClick={() => setErrorMessage(null)}><X size={24} className="text-slate-500 hover:text-white" /></button>
            </div>
          </motion.div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">Command Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[ { l: 'Indexed Profiles', v: profiles.length, c: 'text-emerald-500', i: Users }, { l: 'Event Cycles', v: events.length, c: 'text-blue-500', i: Calendar }, { l: 'Legacy Records', v: hallOfFame.length, c: 'text-yellow-500', i: Trophy } ].map((s, idx) => (
                <div key={idx} className="glass-card p-12 rounded-[56px] border-white/5 relative group overflow-hidden">
                  <s.i className="absolute -bottom-8 -right-8 text-white/[0.02] group-hover:text-white/[0.04] transition-all duration-700" size={200} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">{s.l}</p>
                  <p className={`text-9xl font-black ${s.c} tracking-tighter italic leading-none`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
              <div><h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Registry</h2></div>
              <button onClick={() => setEditingItem({ type: 'profile', data: {} })} className="bg-emerald-500 text-black px-12 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">Add Personnel</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {profiles.map(p => (
                <div key={p.id} className="glass-card p-8 rounded-[40px] flex items-center justify-between border-white/5 hover:bg-white/[0.03] transition-all">
                  <div className="flex items-center space-x-8">
                    <img src={p.photo} className="w-20 h-20 rounded-[28px] object-cover bg-slate-800 border border-white/5 shadow-xl" />
                    <div>
                       <p className="text-3xl font-black uppercase text-white italic tracking-tighter leading-none mb-3">{p.name}</p>
                       <div className="flex items-center gap-3">
                         <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{p.reg_no || 'UID_NOT_SET'}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-700" />
                         {!isValidUUID(p.id) && <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">Local Only</span>}
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setEditingItem({ type: 'profile', data: p })} className="p-5 bg-white/5 rounded-2xl hover:text-emerald-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => deleteItem('profile', p.id)} className="p-5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
              <div><h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Cycles</h2></div>
              <button onClick={() => setEditingItem({ type: 'event', data: {} })} className="bg-blue-500 text-white px-12 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">New Cycle</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {events.map(e => (
                <div key={e.id} className="glass-card p-8 rounded-[48px] border-white/5 group relative overflow-hidden flex flex-col">
                  <div className="aspect-[16/9] rounded-[32px] overflow-hidden mb-8 bg-slate-800 border border-white/5">
                    <img src={e.banner} className="w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" />
                  </div>
                  <div className="flex justify-between items-start mt-auto">
                    <div>
                      <p className="text-4xl font-black uppercase text-white mb-3 italic tracking-tighter leading-none">{e.title}</p>
                      <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{e.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingItem({ type: 'event', data: e })} className="p-5 bg-white/5 rounded-2xl hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => deleteItem('event', e.id)} className="p-5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6 mb-10">
              <div><h2 className="text-6xl font-black uppercase tracking-tighter italic leading-none">Matrix</h2></div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="flex-grow lg:w-96 bg-slate-900 border border-white/10 rounded-2xl px-6 py-5 text-white text-[11px] font-black uppercase outline-none focus:border-emerald-500 shadow-xl transition-all">
                  <option value="">Select Cycle...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
                {selectedEventId && (
                  <button onClick={syncScoresWithCloud} disabled={isSyncingScores} className="bg-emerald-500 text-black px-12 py-5 rounded-3xl text-[11px] font-black uppercase flex items-center gap-3 shadow-2xl active:scale-95 transition-all">
                    {isSyncingScores ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Commit
                  </button>
                )}
              </div>
            </div>

            {selectedEventId ? (
              <div className="space-y-8">
                <div className="flex gap-4">
                  <button onClick={() => setScores([...scores, { id: generateId(), event_id: selectedEventId, athlete_name: "New Athlete", data: {}, total: 0 }])} className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-10 py-5 rounded-[24px] text-[10px] font-black uppercase text-white transition-all border border-white/5"><UserPlus size={18} /> Add Athlete</button>
                </div>
                <div className="glass-card rounded-[64px] overflow-hidden border-white/5 shadow-2xl">
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="p-12 text-[10px] font-black uppercase text-slate-500 border-b border-white/5 italic">Athlete</th>
                          {localSchema.map(c => <th key={c.id} className="p-12 text-[10px] font-black uppercase text-emerald-500 border-b border-white/5 text-center">{c.name}</th>)}
                          <th className="p-12 text-[10px] font-black uppercase text-yellow-500 border-b border-white/5 text-center italic">Total</th>
                          <th className="p-12 border-b border-white/5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores.map(s => (
                          <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="p-12 font-black text-white italic text-3xl tracking-tighter">
                              <input type="text" value={s.athlete_name} onChange={e => setScores(scores.map(row => row.id === s.id ? { ...row, athlete_name: e.target.value } : row))} className="bg-transparent border-none outline-none text-white w-full italic" />
                            </td>
                            {localSchema.map(c => (
                              <td key={c.id} className="p-12 text-center">
                                <input type="number" value={s.data[c.id] || ''} onChange={e => {
                                  setScores(prev => prev.map(row => {
                                    if(row.id === s.id) {
                                      const newData = { ...row.data, [c.id]: Number(e.target.value) };
                                      let total = 0; localSchema.forEach(col => { if(col.isTotalComponent) total += Number(newData[col.id] || 0); });
                                      return { ...row, data: newData, total };
                                    } return row;
                                  }));
                                }} className="bg-transparent text-center text-emerald-400 font-mono text-3xl outline-none w-32 focus:text-white" placeholder="0" />
                              </td>
                            ))}
                            <td className="p-12 text-center font-black text-5xl text-yellow-500 italic tracking-tighter">{s.total}</td>
                            <td className="p-12 text-center"><button onClick={() => setScores(scores.filter(row => row.id !== s.id))} className="text-slate-800 hover:text-red-500 transition-all"><Trash2 size={24} /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-52 flex flex-col items-center justify-center glass-card rounded-[80px] border-white/5">
                <Activity className="text-slate-900 mb-10" size={100} />
                <p className="text-slate-600 uppercase tracking-[0.6em] font-black text-[11px]">Matrix Offline</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Security Terminal</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="relative aspect-square bg-slate-900 rounded-[80px] overflow-hidden border border-white/10 shadow-2xl">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover grayscale opacity-40" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-96 h-96 border-2 border-dashed border-emerald-500/20 rounded-[40px] relative">
                    <div className="scanner-laser" />
                  </div>
                </div>
                
                {rawDetected && (
                   <div className="absolute top-12 left-12 right-12 bg-emerald-950/90 backdrop-blur-2xl px-8 py-5 rounded-full border border-emerald-500/20 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center justify-between shadow-2xl">
                      <span className="flex items-center gap-4"><Terminal size={16} /> RAW: {rawDetected}</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                   </div>
                )}

                <AnimatePresence>
                  {scanResult && (
                    <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-12 left-12 right-12">
                      <div className={`glass-card p-10 rounded-[56px] border-2 flex items-center justify-between shadow-2xl ${scanResult.status === 'valid' ? 'border-emerald-500 bg-emerald-950/90' : 'border-red-500 bg-red-950/90'}`}>
                        <div className="flex items-center gap-8">
                          {scanResult.profile?.photo ? <img src={scanResult.profile.photo} className="w-24 h-24 rounded-[32px] object-cover border-2 border-white/10 shadow-2xl" /> : <div className="w-24 h-24 rounded-[32px] bg-slate-800 flex items-center justify-center"><UserCheck className="text-slate-600" /></div>}
                          <div>
                             <p className="text-4xl font-black uppercase text-white tracking-tighter italic leading-none mb-2">{scanResult.profile?.name || 'DENIED / UNKNOWN'}</p>
                             <p className="text-[11px] font-black uppercase text-white/40 tracking-widest">{scanResult.raw}</p>
                          </div>
                        </div>
                        <div className={`p-6 rounded-[32px] ${scanResult.status === 'valid' ? 'bg-emerald-500 text-black shadow-2xl shadow-emerald-500/40' : 'bg-red-500 text-white shadow-2xl shadow-red-500/40'}`}>
                          {scanResult.status === 'valid' ? <Check size={48} /> : <ShieldAlert size={48} />}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex flex-col gap-8">
                <div className="glass-card rounded-[56px] p-10 border-white/5 shadow-xl">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <Keyboard className="text-slate-600" size={20} />
                         <h3 className="text-xl font-black uppercase italic tracking-tighter">Manual Override</h3>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={manualInput} 
                        onChange={e => setManualInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && manualInput && handleScan(manualInput)}
                        placeholder="REG NO..." 
                        className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg font-black tracking-widest focus:border-emerald-500 outline-none" 
                      />
                      <button onClick={() => manualInput && handleScan(manualInput)} className="bg-emerald-500 text-black px-8 rounded-2xl font-black uppercase tracking-widest text-[11px]">Identify</button>
                   </div>
                </div>

                <div className="glass-card rounded-[56px] p-12 overflow-hidden h-[450px] flex flex-col border-white/5 shadow-2xl">
                  <div className="flex items-center justify-between mb-10">
                      <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Security Log</h3>
                      <div className="flex items-center gap-3 p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/10">
                        <Activity size={16} className="animate-pulse" /> Live Ops
                      </div>
                  </div>
                  <div className="space-y-4 overflow-y-auto no-scrollbar flex-grow">
                    {scanHistory.map((h, i) => (
                      <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex justify-between items-center group">
                        <div className="flex flex-col">
                          <p className={`text-xl font-black uppercase italic tracking-tight ${h.status === 'valid' ? 'text-emerald-500' : 'text-red-500'}`}>{h.profile?.name || 'UID_MISMATCH'}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">DATA: {h.raw}</p>
                          <p className="text-[9px] font-mono text-slate-700 mt-2">{h.timestamp}</p>
                        </div>
                        <div className={`p-4 rounded-2xl ${h.status === 'valid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/10'}`}>{h.status === 'valid' ? <Check size={20} /> : <AlertCircle size={20} />}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs follow similar pattern... */}
        {activeTab === 'hall' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
              <div><h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Archives</h2></div>
              <button onClick={() => setEditingItem({ type: 'hall', data: {} })} className="bg-yellow-500 text-black px-12 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">New Record</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {hallOfFame.map(h => (
                <div key={h.id} className="glass-card p-8 rounded-[48px] border-white/5 flex items-center justify-between group hover:bg-white/[0.02] transition-all">
                  <div className="flex items-center space-x-8">
                    <img src={h.athleteImg} className="w-24 h-24 rounded-[32px] object-cover bg-slate-800 border border-white/5" />
                    <div><p className="text-3xl font-black uppercase text-white leading-none mb-3 italic tracking-tighter">{h.athleteName}</p><p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest leading-none">{h.position}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingItem({ type: 'hall', data: h })} className="p-5 bg-white/5 rounded-2xl hover:text-yellow-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => deleteItem('hall', h.id)} className="p-5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setEditingItem(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl glass-card rounded-[80px] p-16 overflow-y-auto max-h-[90vh] border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.8)]">
              <div className="flex justify-between items-center mb-16">
                <h3 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none">Record Editor</h3>
                <button onClick={() => setEditingItem(null)} className="p-5 bg-white/5 hover:bg-white/10 rounded-[32px] text-slate-500 transition-all"><X size={32} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-12">
                {editingItem.type === 'profile' && (
                  <div className="grid grid-cols-2 gap-10">
                    <InputField label="Identity Name" name="name" defaultValue={editingItem.data.name} required />
                    <InputField label="Registry Reg No" name="reg_no" defaultValue={editingItem.data.reg_no} required placeholder="21BCE1234" />
                    <SelectField label="Role Designation" name="role" defaultValue={editingItem.data.role}>
                       {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </SelectField>
                    <InputField label="Position Title" name="position" defaultValue={editingItem.data.position} required />
                    <div className="col-span-2"><InputField label="Cloud Photo URL" name="photo" defaultValue={editingItem.data.photo} required icon={<ImageIcon size={18}/>} /></div>
                    <div className="col-span-2"><TextAreaField label="Official Personnel Biography" name="bio" defaultValue={editingItem.data.bio} required /></div>
                    <InputField label="Display Order (Numeric)" name="order_index" type="number" defaultValue={editingItem.data.order_index} />
                  </div>
                )}
                {editingItem.type === 'event' && (
                  <div className="grid grid-cols-2 gap-10">
                    <InputField label="Cycle Title" name="title" defaultValue={editingItem.data.title} required />
                    <InputField label="Cycle Date" name="date" type="date" defaultValue={editingItem.data.date} required />
                    <SelectField label="Ops Status" name="status" defaultValue={editingItem.data.status}>
                      {Object.values(EventStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectField>
                    <div className="col-span-2"><InputField label="Asset Banner URL" name="banner" defaultValue={editingItem.data.banner} required icon={<ImageIcon size={18}/>} /></div>
                    <div className="col-span-2"><TextAreaField label="Deployment Briefing" name="description" defaultValue={editingItem.data.description} required /></div>
                    <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                       <input type="checkbox" name="is_featured" defaultChecked={editingItem.data.is_featured} className="w-6 h-6 rounded bg-emerald-500" />
                       <label className="text-[11px] font-black uppercase tracking-widest text-slate-300">Feature on Frontpage</label>
                    </div>
                  </div>
                )}
                {editingItem.type === 'hall' && (
                  <div className="grid grid-cols-2 gap-10">
                    <InputField label="Athlete Identity" name="athleteName" defaultValue={editingItem.data.athleteName} required />
                    <InputField label="Event Cycle" name="eventName" defaultValue={editingItem.data.eventName} required />
                    <InputField label="Weight Division" name="category" defaultValue={editingItem.data.category} required />
                    <InputField label="Metric Stat" name="stat" defaultValue={editingItem.data.stat} required placeholder="540kg Total" />
                    <InputField label="Year" name="year" defaultValue={editingItem.data.year} required />
                    <SelectField label="Podium Rank" name="position" defaultValue={editingItem.data.position}>
                      {Object.values(PodiumPosition).map(p => <option key={p} value={p}>{p}</option>)}
                    </SelectField>
                    <div className="col-span-2"><InputField label="Action Shot URL" name="athleteImg" defaultValue={editingItem.data.athleteImg} required icon={<ImageIcon size={18}/>} /></div>
                  </div>
                )}
                <button disabled={isSaving} className="w-full py-10 bg-emerald-500 text-black rounded-[40px] font-black uppercase tracking-[0.4em] text-[13px] flex items-center justify-center gap-5 hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-2xl">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Database size={24} />} Commit Transaction
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, icon, ...p }: any) => (
  <div className="relative">
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-5 ml-4">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600">{icon}</div>}
      <input {...p} className={`w-full bg-white/[0.03] border border-white/10 rounded-3xl py-6 text-white text-base font-medium outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all shadow-xl ${icon ? 'pl-20 pr-8' : 'px-8'}`} />
    </div>
  </div>
);

const SelectField = ({ label, children, ...p }: any) => (
  <div>
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-5 ml-4">{label}</label>
    <select {...p} className="w-full bg-slate-900 border border-white/10 rounded-3xl px-8 py-6 text-white text-base font-medium outline-none focus:border-emerald-500/50 transition-all shadow-xl">{children}</select>
  </div>
);

const TextAreaField = ({ label, ...p }: any) => (
  <div>
    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-5 ml-4">{label}</label>
    <textarea {...p} className="w-full bg-white/[0.03] border border-white/10 rounded-[48px] px-8 py-6 text-white text-base font-medium min-h-[200px] outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all shadow-xl no-scrollbar" />
  </div>
);

export default AdminDashboard;
