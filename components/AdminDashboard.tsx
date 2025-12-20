
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition, ScoreColumn, EventScore } from '../types';
import { 
  LayoutDashboard, Users, Calendar, Trophy, Plus, Trash2, Edit2, ShieldCheck, 
  Settings, Save, X, Loader2, Link as LinkIcon, Image as ImageIcon, FileText, Hash,
  Globe, Mail, Type, LayoutTemplate, Palette, Table as TableIcon, Target, ChevronDown, 
  ChevronUp, Download, Check, UploadCloud, AlertCircle, RefreshCw, FileSpreadsheet,
  Instagram, Linkedin, Scan, Camera, UserCheck, ShieldAlert, History, CreditCard, ExternalLink
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
  const [localConfig, setLocalConfig] = useState(siteConfig);
  const navigate = useNavigate();
  
  // Scanner State
  const [scanResult, setScanResult] = useState<{ profile?: Profile; raw: string; timestamp: string; status: 'valid' | 'invalid' } | null>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Scoring State
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [scores, setScores] = useState<EventScore[]>([]);
  const [isScoringLoading, setIsScoringLoading] = useState(false);

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  useEffect(() => {
    if (selectedEvent) {
      fetchScores(selectedEvent.id);
    }
  }, [selectedEventId]);

  // QR SCANNER LOGIC
  useEffect(() => {
    let animationFrame: number;
    const startScanner = async () => {
      if (activeTab !== 'scanner') return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.height = videoRef.current.videoHeight;
            canvas.width = videoRef.current.videoWidth;
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
            if (code) handleScan(code.data);
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
    if (scanResult && scanResult.raw === data) return; 
    const profile = profiles.find(p => p.reg_no?.toLowerCase() === data.toLowerCase() || p.id === data);
    const result = {
      profile,
      raw: data,
      timestamp: new Date().toLocaleTimeString(),
      status: profile ? 'valid' as const : 'invalid' as const
    };
    setScanResult(result);
    setScanHistory(prev => [result, ...prev].slice(0, 30));
    setTimeout(() => setScanResult(null), 3000);
  };

  const fetchScores = async (eventId: string) => {
    setIsScoringLoading(true);
    const { data } = await supabase.from('event_scores').select('*').eq('event_id', eventId);
    if (data) setScores(data.sort((a, b) => b.total - a.total));
    setIsScoringLoading(false);
  };

  const deleteProfile = async (id: string) => {
    if (confirm('Delete member permanently?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    try {
      let tableName = '';
      let updateData: any = {};
      const id = editingItem.data.id || generateId();
      if (editingItem.type === 'profile') {
        tableName = 'profiles';
        updateData = {
          id,
          name: formValues.name,
          role: formValues.role,
          position: formValues.position,
          reg_no: formValues.reg_no,
          tenure: formValues.tenure,
          photo: formValues.photo,
          order_index: Number(formValues.order_index || 0),
          bio: formValues.bio,
          socials: {
            linkedin: formValues.linkedin,
            instagram: formValues.instagram,
            twitter: formValues.twitter,
          },
          achievements: (formValues.achievements as string || '').split(',').map(s => s.trim()).filter(Boolean)
        };
      } else if (editingItem.type === 'event') {
        tableName = 'events';
        updateData = {
          id,
          title: formValues.title,
          date: formValues.date,
          description: formValues.description,
          status: formValues.status,
          banner: formValues.banner,
          is_featured: !!formData.get('is_featured')
        };
      } else if (editingItem.type === 'hall') {
        tableName = 'hall_of_fame';
        updateData = {
          id,
          athleteName: formValues.athleteName,
          category: formValues.category,
          eventName: formValues.eventName,
          year: formValues.year,
          position: formValues.position,
          stat: formValues.stat,
          athleteImg: formValues.athleteImg,
          featured: editingItem.data.featured || false
        };
      }
      const { error } = await supabase.from(tableName).upsert(updateData);
      if (error) throw error;
      if (editingItem.type === 'profile') {
        setProfiles(editingItem.data.id ? profiles.map(p => p.id === id ? updateData : p) : [...profiles, updateData]);
      } else if (editingItem.type === 'event') {
        setEvents(editingItem.data.id ? events.map(ev => ev.id === id ? updateData : ev) : [...events, updateData]);
      } else if (editingItem.type === 'hall') {
        setHallOfFame(editingItem.data.id ? hallOfFame.map(h => h.id === id ? updateData : h) : [...hallOfFame, updateData]);
      }
      setEditingItem(null);
    } catch (err: any) { alert('Save Failure: ' + err.message); } finally { setIsSaving(false); }
  };

  const SidebarBtn = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[20px] transition-all ${activeTab === id ? 'bg-emerald-500 text-black font-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
      <Icon size={18} />
      <span className="uppercase tracking-[0.15em] text-[10px] font-black">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 pt-28">
      <aside className="w-full lg:w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 p-8 lg:fixed lg:top-24 lg:bottom-0">
        <div className="mb-8 hidden lg:block">
           <div className="flex items-center space-x-3 mb-2">
             <ShieldCheck size={20} className="text-emerald-500" />
             <span className="text-xl font-black uppercase italic text-white">CLUB<span className="text-emerald-500">CORE</span></span>
           </div>
           <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em]">Management Console</p>
        </div>
        <nav className="space-y-2">
          <SidebarBtn id="overview" label="Dashboard" icon={LayoutDashboard} />
          <SidebarBtn id="profiles" label="FFCS Registry" icon={Users} />
          <SidebarBtn id="events" label="Events" icon={Calendar} />
          <SidebarBtn id="scanner" label="Attendance" icon={Scan} />
          <SidebarBtn id="hall" label="Hall Records" icon={Trophy} />
          <SidebarBtn id="settings" label="Site CMS" icon={Settings} />
        </nav>
        <button onClick={() => navigate('/')} className="mt-12 w-full flex items-center justify-between px-5 py-4 rounded-[20px] text-slate-500 hover:text-white hover:bg-white/5 transition-all">
           <span className="uppercase tracking-[0.15em] text-[10px] font-black">Exit to Site</span>
           <ExternalLink size={14} />
        </button>
      </aside>

      <div className="flex-grow lg:ml-80 p-8 lg:p-12 w-full">
        {activeTab === 'scanner' && (
          <div className="space-y-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Access Terminal</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              <div className="relative aspect-square bg-slate-900 rounded-[48px] overflow-hidden border border-white/10 shadow-2xl">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover grayscale opacity-60" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-dashed border-emerald-500/40 rounded-3xl relative">
                    <div className="scanner-laser" />
                  </div>
                </div>
                <AnimatePresence>
                  {scanResult && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-8 left-8 right-8">
                      <div className={`glass-card p-6 rounded-[32px] border-2 flex items-center justify-between shadow-2xl ${scanResult.status === 'valid' ? 'border-emerald-500/50 bg-emerald-950/40' : 'border-red-500/50 bg-red-950/40'}`}>
                        <div className="flex items-center gap-5">
                          <img src={scanResult.profile?.photo} className="w-14 h-14 rounded-2xl object-cover bg-slate-800" />
                          <div>
                            <p className="text-xl font-black uppercase tracking-tighter text-white">{scanResult.profile ? scanResult.profile.name : 'Unknown'}</p>
                            <p className="text-[10px] font-bold text-white/60">{scanResult.raw}</p>
                          </div>
                        </div>
                        {scanResult.status === 'valid' && <Check className="text-emerald-500" size={32} />}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="glass-card rounded-[48px] p-8 overflow-hidden h-[600px] flex flex-col">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 italic">Attendance History</h3>
                <div className="space-y-3 overflow-y-auto no-scrollbar">
                  {scanHistory.map((h, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center">
                      <div>
                        <p className="text-sm font-black text-white">{h.profile?.name || 'Invalid Registry'}</p>
                        <p className="text-[9px] font-black text-slate-500">{h.raw}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600 italic">{h.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <h2 className="text-5xl font-black uppercase tracking-tighter italic">FFCS Registry</h2>
              <button onClick={() => setEditingItem({ type: 'profile', data: {} })} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Add Member</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {profiles.map(p => (
                <div key={p.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between border-white/5 bg-slate-900/20">
                  <div className="flex items-center space-x-6">
                    <img src={p.photo} className="w-16 h-16 rounded-[20px] object-cover" />
                    <div>
                      <p className="text-xl font-black uppercase tracking-tighter text-white">{p.name}</p>
                      <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{p.reg_no || 'NO_REG'} • {p.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditingItem({ type: 'profile', data: p })} className="p-4 bg-white/5 rounded-2xl hover:text-emerald-500 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => deleteProfile(p.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Operation Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-10 rounded-[40px] border-white/5 bg-slate-900/20 text-center">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">FFCS Members</p>
                 <p className="text-4xl font-black text-emerald-500">{profiles.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={() => setEditingItem(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-3xl glass-card rounded-[48px] p-10 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Edit Record</h3>
                <button onClick={() => setEditingItem(null)} className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <form className="space-y-6" onSubmit={handleSave}>
                {editingItem.type === 'profile' && <ProfileForm data={editingItem.data} />}
                <button disabled={isSaving} type="submit" className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl">
                  {isSaving ? 'Syncing...' : 'Save Record'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileForm = ({ data }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><InputField label="Full Name" name="name" defaultValue={data.name} required /></div>
    <InputField label="Registration Number (Reg No)" name="reg_no" defaultValue={data.reg_no} placeholder="e.g. 21BCE1234" icon={<CreditCard size={14} />} required />
    <SelectField label="Role" name="role" defaultValue={data.role || Role.MEMBER}>
      {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
    </SelectField>
    <InputField label="Position" name="position" defaultValue={data.position} required />
    <InputField label="Order" name="order_index" type="number" defaultValue={data.order_index} icon={<Hash size={14} />} />
    <InputField label="Tenure" name="tenure" defaultValue={data.tenure} placeholder="2024 - 2025" />
    <div className="md:col-span-2"><InputField label="Photo URL" name="photo" defaultValue={data.photo} required icon={<ImageIcon size={14} />} /></div>
    <div className="md:col-span-2"><TextAreaField label="Biography" name="bio" defaultValue={data.bio} required /></div>
  </div>
);

const InputField = ({ label, icon, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
      <input {...props} className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-white text-sm focus:border-emerald-500 outline-none ${icon ? 'pl-12 pr-5' : 'px-5'}`} />
    </div>
  </div>
);

const SelectField = ({ label, children, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <select {...props} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm outline-none">
      {children}
    </select>
  </div>
);

const TextAreaField = ({ label, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <textarea {...props} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-white text-sm min-h-[100px] outline-none" />
  </div>
);

export default AdminDashboard;
