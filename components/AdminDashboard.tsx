
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition, ScoreColumn, EventScore } from '../types';
import { 
  LayoutDashboard, Users, Calendar, Trophy, Plus, Trash2, Edit2, ShieldCheck, 
  Settings, Save, X, Loader2, Link as LinkIcon, Image as ImageIcon, FileText, Hash,
  Globe, Mail, Type, LayoutTemplate, Palette, Table as TableIcon, Target, ChevronDown, 
  ChevronUp, Download, Check, UploadCloud, AlertCircle, RefreshCw, FileSpreadsheet,
  Instagram, Linkedin, Scan, Camera, UserCheck, ShieldAlert, History, CreditCard, ExternalLink,
  PlusCircle, UserPlus, Send
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

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
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
  const navigate = useNavigate();
  
  // Scanner State
  const [scanResult, setScanResult] = useState<{ profile?: Profile; raw: string; timestamp: string; status: 'valid' | 'invalid' } | null>(null);
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

  // HIGH PERFORMANCE QR SCANNER LOGIC
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
        console.error("Camera access denied:", err);
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
            if (now - lastScanTime.current > 250) { 
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height, { 
                inversionAttempts: 'attemptBoth' 
              });
              
              if (code && code.data) {
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
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [activeTab]);

  const handleScan = (data: string) => {
    const cleanData = data.trim();
    if (scanResult && scanResult.raw === cleanData) return; 

    // Robust matching logic
    const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const normalizedInput = normalize(cleanData);

    const profile = profiles.find(p => 
      normalize(p.reg_no || '') === normalizedInput || 
      normalize(p.id || '') === normalizedInput
    );

    const result = {
      profile,
      raw: cleanData,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: true
      }),
      status: profile ? 'valid' as const : 'invalid' as const
    };

    setScanResult(result);
    setScanHistory(prev => [result, ...prev].slice(0, 100));
    setTimeout(() => setScanResult(null), 2500);
  };

  const fetchScores = async (eventId: string) => {
    setIsScoringLoading(true);
    const { data, error } = await supabase.from('event_scores').select('*').eq('event_id', eventId);
    if (!error && data) {
      setScores(data.sort((a, b) => b.total - a.total));
    }
    setIsScoringLoading(false);
  };

  const syncScoresWithCloud = async () => {
    if (!selectedEventId) return;
    setIsSyncingScores(true);
    try {
      const { error } = await supabase.from('event_scores').upsert(scores);
      if (error) throw error;
      alert("SUCCESS: Cloud Matrix Synced.");
    } catch (err: any) {
      alert("SYNC ERROR: " + err.message);
    } finally {
      setIsSyncingScores(false);
    }
  };

  const deleteItem = async (type: 'profile' | 'event' | 'hall', id: string) => {
    if (!confirm(`Confirm deletion from ${type} registry?`)) return;
    const table = type === 'profile' ? 'profiles' : type === 'event' ? 'events' : 'hall_of_fame';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) {
      if (type === 'profile') setProfiles(profiles.filter(p => p.id !== id));
      if (type === 'event') setEvents(events.filter(e => e.id !== id));
      if (type === 'hall') setHallOfFame(hallOfFame.filter(h => h.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const vals = Object.fromEntries(formData.entries());
    const id = editingItem.data.id || generateId();
    
    try {
      let data: any = { id };
      let table = '';

      if (editingItem.type === 'profile') {
        table = 'profiles';
        data = { ...data, name: vals.name, role: vals.role, position: vals.position, reg_no: vals.reg_no, tenure: vals.tenure, photo: vals.photo, bio: vals.bio, order_index: Number(vals.order_index || 0) };
      } else if (editingItem.type === 'event') {
        table = 'events';
        data = { ...data, title: vals.title, date: vals.date, description: vals.description, status: vals.status, banner: vals.banner, is_featured: !!formData.get('is_featured') };
      } else if (editingItem.type === 'hall') {
        table = 'hall_of_fame';
        data = { ...data, athleteName: vals.athleteName, category: vals.category, eventName: vals.eventName, year: vals.year, position: vals.position, stat: vals.stat, athleteImg: vals.athleteImg, featured: !!formData.get('featured') };
      }

      const { error } = await supabase.from(table).upsert(data);
      if (error) throw error;

      if (editingItem.type === 'profile') setProfiles(editingItem.data.id ? profiles.map(p => p.id === id ? data : p) : [...profiles, data]);
      if (editingItem.type === 'event') setEvents(editingItem.data.id ? events.map(ev => ev.id === id ? data : ev) : [...events, data]);
      if (editingItem.type === 'hall') setHallOfFame(editingItem.data.id ? hallOfFame.map(h => h.id === id ? data : h) : [...hallOfFame, data]);
      
      setEditingItem(null);
    } catch (err: any) { alert(err.message); } finally { setIsSaving(false); }
  };

  const SidebarBtn = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[20px] transition-all group ${activeTab === id ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
      <Icon size={18} className={activeTab === id ? 'text-black' : 'group-hover:text-emerald-500'} />
      <span className="uppercase tracking-[0.15em] text-[10px] font-black">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 pt-28">
      <aside className="w-full lg:w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 p-8 lg:fixed lg:top-24 lg:bottom-0 overflow-y-auto no-scrollbar">
        <div className="mb-8 hidden lg:block">
           <div className="flex items-center space-x-3 mb-2">
             <div className="p-2 bg-emerald-500 rounded-lg"><ShieldCheck size={20} className="text-black" fill="currentColor" /></div>
             <span className="text-xl font-black uppercase italic text-white">CLUB<span className="text-emerald-500">CORE</span></span>
           </div>
           <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em]">Operational High-Command</p>
        </div>
        <nav className="space-y-2">
          <SidebarBtn id="overview" label="Dashboard" icon={LayoutDashboard} />
          <SidebarBtn id="profiles" label="Registry" icon={Users} />
          <SidebarBtn id="events" label="Events" icon={Calendar} />
          <SidebarBtn id="scoring" label="Scoring" icon={TableIcon} />
          <SidebarBtn id="scanner" label="Scanner" icon={Scan} />
          <SidebarBtn id="hall" label="Hall of Fame" icon={Trophy} />
          <SidebarBtn id="settings" label="Site CMS" icon={Settings} />
        </nav>
      </aside>

      <div className="flex-grow lg:ml-80 p-8 lg:p-12 w-full">
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Operational Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[ { l: 'Registry', v: profiles.length, c: 'text-emerald-500' }, { l: 'Events', v: events.length, c: 'text-blue-500' }, { l: 'Hall Records', v: hallOfFame.length, c: 'text-yellow-500' } ].map((s, i) => (
                <div key={i} className="glass-card p-10 rounded-[40px] text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{s.l}</p>
                  <p className={`text-6xl font-black ${s.c}`}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div><h2 className="text-5xl font-black uppercase tracking-tighter italic">Member Registry</h2></div>
              <button onClick={() => setEditingItem({ type: 'profile', data: {} })} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase">Add Member</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {profiles.map(p => (
                <div key={p.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <img src={p.photo} className="w-16 h-16 rounded-2xl object-cover bg-slate-800" />
                    <div><p className="text-xl font-black uppercase text-white">{p.name}</p><p className="text-emerald-500 text-[10px] font-black uppercase">{p.reg_no} • {p.role}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingItem({ type: 'profile', data: p })} className="p-4 bg-white/5 rounded-2xl hover:text-emerald-500"><Edit2 size={16} /></button>
                    <button onClick={() => deleteItem('profile', p.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div><h2 className="text-5xl font-black uppercase tracking-tighter italic">Event Control</h2></div>
              <button onClick={() => setEditingItem({ type: 'event', data: {} })} className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase">New Event</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {events.map(e => (
                <div key={e.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <img src={e.banner} className="w-24 h-16 rounded-2xl object-cover bg-slate-800" />
                    <div><p className="text-xl font-black uppercase text-white">{e.title}</p><p className="text-blue-400 text-[10px] font-black uppercase">{e.status} • {e.date}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingItem({ type: 'event', data: e })} className="p-4 bg-white/5 rounded-2xl hover:text-blue-500"><Edit2 size={16} /></button>
                    <button onClick={() => deleteItem('event', e.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hall' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
              <div><h2 className="text-5xl font-black uppercase tracking-tighter italic">Hall of Fame</h2></div>
              <button onClick={() => setEditingItem({ type: 'hall', data: {} })} className="bg-yellow-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase">Add Record</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {hallOfFame.map(h => (
                <div key={h.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <img src={h.athleteImg} className="w-16 h-16 rounded-2xl object-cover bg-slate-800" />
                    <div><p className="text-xl font-black uppercase text-white">{h.athleteName}</p><p className="text-yellow-500 text-[10px] font-black uppercase">{h.position} • {h.eventName}</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingItem({ type: 'hall', data: h })} className="p-4 bg-white/5 rounded-2xl hover:text-yellow-500"><Edit2 size={16} /></button>
                    <button onClick={() => deleteItem('hall', h.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-6">
              <div><h2 className="text-5xl font-black uppercase tracking-tighter italic">Scoring Matrix</h2></div>
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <select value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)} className="bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-white text-[10px] font-black uppercase outline-none focus:border-emerald-500">
                  <option value="">Select Event...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
                {selectedEventId && (
                  <button onClick={syncScoresWithCloud} disabled={isSyncingScores} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2">
                    {isSyncingScores ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Sync Matrix
                  </button>
                )}
              </div>
            </div>

            {selectedEventId ? (
              <div className="space-y-6">
                <div className="flex gap-3">
                  <button onClick={() => { const name = prompt("Athlete Name?"); if(name) setScores([...scores, { id: generateId(), event_id: selectedEventId, athlete_name: name, data: {}, total: 0 }]); }} className="bg-white/5 px-6 py-3 rounded-xl text-[10px] font-black uppercase text-white">Add Athlete</button>
                  <button onClick={() => { const col = prompt("Column Name?"); if(col) { const newCol = { id: generateId(), name: col.toUpperCase(), type: 'number' as const, isTotalComponent: true }; setLocalSchema([...localSchema, newCol]); supabase.from('events').update({ score_schema: [...localSchema, newCol] }).eq('id', selectedEventId).then(); } }} className="bg-white/5 px-6 py-3 rounded-xl text-[10px] font-black uppercase text-white">Add Column</button>
                </div>
                <div className="glass-card rounded-[40px] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="p-6 text-[10px] font-black uppercase text-slate-500 border-b border-white/5">Athlete</th>
                          {localSchema.map(c => <th key={c.id} className="p-6 text-[10px] font-black uppercase text-emerald-500 border-b border-white/5 text-center">{c.name}</th>)}
                          <th className="p-6 text-[10px] font-black uppercase text-yellow-500 border-b border-white/5 text-center">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores.map(s => (
                          <tr key={s.id} className="border-b border-white/5">
                            <td className="p-6 font-black text-white italic">{s.athlete_name}</td>
                            {localSchema.map(c => (
                              <td key={c.id} className="p-6 text-center">
                                <input type="number" value={s.data[c.id] || ''} onChange={e => {
                                  setScores(prev => prev.map(row => {
                                    if(row.id === s.id) {
                                      const newData = { ...row.data, [c.id]: Number(e.target.value) };
                                      let total = 0; localSchema.forEach(col => { if(col.isTotalComponent) total += Number(newData[col.id] || 0); });
                                      return { ...row, data: newData, total };
                                    } return row;
                                  }));
                                }} className="bg-transparent text-center text-emerald-400 font-mono text-lg outline-none w-20" placeholder="0" />
                              </td>
                            ))}
                            <td className="p-6 text-center font-black text-xl text-yellow-500">{s.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center glass-card rounded-[40px] text-slate-600 font-black uppercase text-[10px] tracking-widest">Select an event to load matrix</div>
            )}
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Access Terminal</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="relative aspect-square bg-slate-900 rounded-[48px] overflow-hidden border border-white/10 shadow-2xl">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover grayscale opacity-60" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-dashed border-emerald-500/40 rounded-3xl"><div className="scanner-laser" /></div>
                </div>
                <AnimatePresence>
                  {scanResult && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-8 left-8 right-8">
                      <div className={`glass-card p-6 rounded-[32px] border-2 flex items-center justify-between ${scanResult.status === 'valid' ? 'border-emerald-500 bg-emerald-950/40' : 'border-red-500 bg-red-950/40'}`}>
                        <div className="flex items-center gap-5">
                          {scanResult.profile?.photo ? <img src={scanResult.profile.photo} className="w-14 h-14 rounded-2xl object-cover" /> : <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center"><UserCheck className="text-slate-600" /></div>}
                          <div><p className="text-xl font-black uppercase text-white">{scanResult.profile?.name || 'Invalid Entry'}</p><p className="text-[10px] font-bold text-white/60">{scanResult.raw}</p></div>
                        </div>
                        {scanResult.status === 'valid' && <Check className="text-emerald-500" size={32} />}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="glass-card rounded-[48px] p-8 overflow-hidden h-[600px] flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 italic">Audit Logs</h3>
                <div className="space-y-3 overflow-y-auto no-scrollbar">
                  {scanHistory.map((h, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                      <div className="flex flex-col">
                        <p className={`text-sm font-black ${h.status === 'valid' ? 'text-emerald-500' : 'text-red-500'}`}>{h.profile?.name || 'UNKNOWN_ACCESS'}</p>
                        <p className="text-[10px] font-bold text-slate-400">Scanned: {h.raw}</p>
                        <p className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-tighter">{h.timestamp}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${h.status === 'valid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{h.status === 'valid' ? <Check size={14} /> : <AlertCircle size={14} />}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Site Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(siteConfig).map(([key, val]) => (
                <div key={key} className="glass-card p-8 rounded-[32px]">
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{key.replace('_', ' ')}</label>
                   <input type="text" value={val} onChange={async (e) => { const newVal = e.target.value; setSiteConfig({ ...siteConfig, [key]: newVal }); await supabase.from('site_config').upsert({ key, value: newVal }); }} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-emerald-500 outline-none" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setEditingItem(null)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-3xl glass-card rounded-[40px] p-10 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase italic">Edit {editingItem.type}</h3>
                <button onClick={() => setEditingItem(null)}><X size={24} /></button>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                {editingItem.type === 'profile' && (
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Name" name="name" defaultValue={editingItem.data.name} required />
                    <InputField label="Reg No" name="reg_no" defaultValue={editingItem.data.reg_no} required />
                    <SelectField label="Role" name="role" defaultValue={editingItem.data.role}>
                       {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </SelectField>
                    <InputField label="Position" name="position" defaultValue={editingItem.data.position} required />
                    <InputField label="Tenure" name="tenure" defaultValue={editingItem.data.tenure} />
                    <InputField label="Order Index" name="order_index" type="number" defaultValue={editingItem.data.order_index} />
                    <div className="col-span-2"><InputField label="Photo URL" name="photo" defaultValue={editingItem.data.photo} required /></div>
                    <div className="col-span-2"><TextAreaField label="Bio" name="bio" defaultValue={editingItem.data.bio} required /></div>
                  </div>
                )}
                {editingItem.type === 'event' && (
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Title" name="title" defaultValue={editingItem.data.title} required />
                    <InputField label="Date" name="date" type="date" defaultValue={editingItem.data.date} required />
                    <SelectField label="Status" name="status" defaultValue={editingItem.data.status}>
                      {Object.values(EventStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </SelectField>
                    <div className="col-span-2"><InputField label="Banner URL" name="banner" defaultValue={editingItem.data.banner} required /></div>
                    <div className="col-span-2"><TextAreaField label="Description" name="description" defaultValue={editingItem.data.description} required /></div>
                  </div>
                )}
                {editingItem.type === 'hall' && (
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Athlete Name" name="athleteName" defaultValue={editingItem.data.athleteName} required />
                    <InputField label="Event Name" name="eventName" defaultValue={editingItem.data.eventName} required />
                    <InputField label="Category" name="category" defaultValue={editingItem.data.category} required />
                    <InputField label="Stat" name="stat" defaultValue={editingItem.data.stat} required />
                    <InputField label="Year" name="year" defaultValue={editingItem.data.year} required />
                    <SelectField label="Position" name="position" defaultValue={editingItem.data.position}>
                      {Object.values(PodiumPosition).map(p => <option key={p} value={p}>{p}</option>)}
                    </SelectField>
                    <div className="col-span-2"><InputField label="Athlete Image URL" name="athleteImg" defaultValue={editingItem.data.athleteImg} required /></div>
                  </div>
                )}
                <button disabled={isSaving} className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Cloud Data
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, ...p }: any) => (
  <div><label className="block text-[9px] font-black uppercase text-slate-500 mb-2 ml-2">{label}</label>
  <input {...p} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-emerald-500" /></div>
);

const SelectField = ({ label, children, ...p }: any) => (
  <div><label className="block text-[9px] font-black uppercase text-slate-500 mb-2 ml-2">{label}</label>
  <select {...p} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm outline-none">{children}</select></div>
);

const TextAreaField = ({ label, ...p }: any) => (
  <div><label className="block text-[9px] font-black uppercase text-slate-500 mb-2 ml-2">{label}</label>
  <textarea {...p} className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm min-h-[100px] outline-none" /></div>
);

export default AdminDashboard;
