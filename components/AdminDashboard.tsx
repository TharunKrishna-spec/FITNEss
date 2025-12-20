
import React, { useState, useEffect, useMemo } from 'react';
import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition, ScoreColumn, EventScore } from '../types';
import { 
  LayoutDashboard, Users, Calendar, Trophy, Plus, Trash2, Edit2, ShieldCheck, 
  Settings, Save, X, Loader2, Link as LinkIcon, Image as ImageIcon, FileText, Hash,
  Globe, Mail, Type, LayoutTemplate, Palette, Table as TableIcon, Target, ChevronDown, 
  ChevronUp, Download, Check, UploadCloud, AlertCircle, RefreshCw, FileSpreadsheet,
  Instagram, Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'events' | 'hall' | 'settings' | 'scoring'>('overview');
  const [editingItem, setEditingItem] = useState<{ type: 'profile' | 'event' | 'hall', data: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState(siteConfig);
  
  // Scoring Terminal State
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [scores, setScores] = useState<EventScore[]>([]);
  const [localSchema, setLocalSchema] = useState<ScoreColumn[]>([]);
  const [isScoringLoading, setIsScoringLoading] = useState(false);
  const [schemaModified, setSchemaModified] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  useEffect(() => {
    if (selectedEvent) {
      setLocalSchema(selectedEvent.score_schema || []);
      setSchemaModified(false);
      fetchScores(selectedEvent.id);
    } else {
      setLocalSchema([]);
      setScores([]);
    }
  }, [selectedEventId, events]);

  const fetchScores = async (eventId: string) => {
    setIsScoringLoading(true);
    const { data, error } = await supabase.from('event_scores').select('*').eq('event_id', eventId);
    if (!error && data) {
      setScores(data.sort((a, b) => b.total - a.total));
    }
    setIsScoringLoading(false);
  };

  const handleScoreUpdate = (athleteId: string, columnId: string, value: any) => {
    const updatedScores = scores.map(s => {
      if (s.id === athleteId) {
        const newData = { ...s.data, [columnId]: value };
        let newTotal = 0;
        localSchema.forEach(col => {
          if (col.isTotalComponent && col.type === 'number') {
            const val = parseFloat(newData[col.id]);
            if (!isNaN(val)) newTotal += val;
          }
        });
        return { ...s, data: newData, total: newTotal };
      }
      return s;
    });
    setScores(updatedScores.sort((a, b) => b.total - a.total));
  };

  const saveScoresToCloud = async () => {
    if (!selectedEventId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('event_scores').upsert(
        scores.map(s => ({ ...s, event_id: selectedEventId }))
      );
      if (error) throw error;
      alert('Cloud Matrix Synchronized.');
    } catch (err: any) {
      alert('UPLINK FAILED: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const addColumn = () => {
    const newCol: ScoreColumn = { 
      id: generateId(), 
      name: 'NEW_METRIC', 
      type: 'number', 
      isTotalComponent: true 
    };
    setLocalSchema([...localSchema, newCol]);
    setSchemaModified(true);
  };

  const updateLocalColumn = (idx: number, updates: Partial<ScoreColumn>) => {
    const updated = [...localSchema];
    updated[idx] = { ...updated[idx], ...updates };
    setLocalSchema(updated);
    setSchemaModified(true);
  };

  const removeColumn = (idx: number) => {
    if (confirm('CAUTION: Removing a column will purge its data from the local view.')) {
      setLocalSchema(localSchema.filter((_, i) => i !== idx));
      setSchemaModified(true);
    }
  };

  const saveSchemaToCloud = async () => {
    if (!selectedEventId) return;
    setIsSaving(true);
    const { error } = await supabase.from('events').update({ score_schema: localSchema }).eq('id', selectedEventId);
    if (!error) {
      setEvents(events.map(e => e.id === selectedEventId ? { ...e, score_schema: localSchema } : e));
      setSchemaModified(false);
      alert('Template Core Updated.');
    } else {
      alert('CORE SYNC ERROR: ' + error.message);
    }
    setIsSaving(false);
  };

  const handleBulkImport = () => {
    const lines = bulkInput.split('\n').filter(l => l.trim());
    const newRecords: EventScore[] = lines.map(line => ({
      id: generateId(),
      event_id: selectedEventId,
      athlete_name: line.trim(),
      data: {},
      total: 0
    }));
    setScores([...newRecords, ...scores]);
    setIsBulkModalOpen(false);
    setBulkInput('');
  };

  const handleConfigChange = (key: string, value: string) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateGlobalConfig = async () => {
    setIsSaving(true);
    try {
      const updates = Object.entries(localConfig).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from('site_config').upsert(updates);
      if (error) throw error;
      setSiteConfig(localConfig);
      alert('Brand CMS Synced.');
    } catch (err: any) {
      alert('Sync Failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProfile = async (id: string) => {
    if (confirm('Delete member permanently?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  const deleteEvent = async (id: string) => {
    if (confirm('Delete event cycle? This cannot be undone.')) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (!error) setEvents(events.filter(e => e.id !== id));
    }
  };

  const deleteHallRecord = async (id: string) => {
    if (confirm('Purge record from Hall of Fame?')) {
      const { error } = await supabase.from('hall_of_fame').delete().eq('id', id);
      if (!error) setHallOfFame(hallOfFame.filter(h => h.id !== id));
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
    } catch (err: any) {
      alert('Save Failure: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const SidebarBtn = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[20px] transition-all group ${
        activeTab === id ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} className={activeTab === id ? 'text-black' : 'group-hover:text-emerald-500 transition-colors'} />
      <span className="uppercase tracking-[0.15em] text-[10px] font-black">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 pt-28">
      <aside className="w-full lg:w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 p-8 lg:fixed lg:top-24 lg:bottom-0 overflow-y-auto no-scrollbar">
        <div className="mb-8 hidden lg:block">
           <div className="flex items-center space-x-3 mb-2">
             <div className="p-2 bg-emerald-500 rounded-lg">
               <ShieldCheck size={20} className="text-black" fill="currentColor" />
             </div>
             <span className="text-xl font-black tracking-tighter uppercase italic">CLUB<span className="text-emerald-500">CORE</span></span>
           </div>
           <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] ml-1">Advanced Control Panel</p>
        </div>
        
        <nav className="space-y-2">
          <SidebarBtn id="overview" label="Dashboard" icon={LayoutDashboard} />
          <SidebarBtn id="profiles" label="Team Roster" icon={Users} />
          <SidebarBtn id="events" label="Event Control" icon={Calendar} />
          <SidebarBtn id="scoring" label="Live Scoring" icon={TableIcon} />
          <SidebarBtn id="hall" label="Hall of Records" icon={Trophy} />
          <SidebarBtn id="settings" label="Site CMS" icon={Settings} />
        </nav>
      </aside>

      <div className="flex-grow lg:ml-80 p-8 lg:p-12 xl:p-16 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'scoring' && (
            <div className="space-y-12">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-2">Scoring Terminal</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Active Data Matrix • {scores.length} Entities Indexed</p>
                </div>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <div className="relative flex-grow lg:w-64">
                    <select 
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-emerald-500 outline-none focus:border-emerald-500/50 appearance-none"
                    >
                      <option value="" className="bg-slate-900">Select Event Core...</option>
                      {events.map(ev => <option key={ev.id} value={ev.id} className="bg-slate-900">{ev.title}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" size={14} />
                  </div>
                </div>
              </div>

              {selectedEventId ? (
                <div className="space-y-10">
                  {/* Template Config */}
                  <div className="glass-card p-10 rounded-[40px] border-white/5 bg-slate-900/20">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                           <Target size={24} />
                         </div>
                         <div>
                           <h3 className="text-xl font-black uppercase tracking-tighter italic">Volatile Schema</h3>
                           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Define custom metrics for this cycle</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <button 
                           onClick={addColumn}
                           className="flex items-center gap-2 bg-white/5 text-emerald-500 border border-white/5 font-black uppercase text-[9px] tracking-[0.2em] hover:bg-emerald-500/10 px-6 py-3 rounded-xl transition-all"
                         >
                           <Plus size={14} /> Add Column
                         </button>
                         {schemaModified && (
                           <button 
                             onClick={saveSchemaToCloud}
                             disabled={isSaving}
                             className="flex items-center gap-2 bg-emerald-500 text-black font-black uppercase text-[9px] tracking-[0.2em] hover:bg-emerald-400 px-8 py-3 rounded-xl transition-all shadow-xl shadow-emerald-500/20"
                           >
                             {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                             Commit Template
                           </button>
                         )}
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                      {localSchema.map((col, idx) => (
                        <motion.div 
                          layout 
                          key={col.id} 
                          className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/20 transition-all"
                        >
                          <div className="flex flex-col">
                            <input 
                              value={col.name}
                              onChange={(e) => updateLocalColumn(idx, { name: e.target.value.toUpperCase() })}
                              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none border-b border-white/5 focus:border-emerald-500 w-28 py-1"
                            />
                            <div className="flex items-center gap-4 mt-2">
                              <select 
                                value={col.type}
                                onChange={(e) => updateLocalColumn(idx, { type: e.target.value as any })}
                                className="bg-transparent text-[8px] font-black text-slate-500 outline-none uppercase tracking-widest"
                              >
                                <option value="number" className="bg-slate-900">Num</option>
                                <option value="text" className="bg-slate-900">Text</option>
                                <option value="time" className="bg-slate-900">Time</option>
                              </select>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={col.isTotalComponent}
                                  onChange={(e) => updateLocalColumn(idx, { isTotalComponent: e.target.checked })}
                                  className="accent-emerald-500 w-3 h-3"
                                />
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Sum?</span>
                              </label>
                            </div>
                          </div>
                          <button 
                            onClick={() => removeColumn(idx)}
                            className="p-2 text-red-500/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                      {localSchema.length === 0 && (
                        <div className="w-full flex items-center justify-center p-8 border border-dashed border-white/5 rounded-3xl">
                           <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] italic">Awaiting schema definition...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Leaderboard Table */}
                  <div className="glass-card rounded-[48px] border-white/5 bg-slate-900/10 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                      <div className="flex items-center gap-4">
                        <h3 className="text-xl font-black uppercase tracking-tighter italic">Live Matrix</h3>
                        <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIsBulkModalOpen(true)}
                          className="px-6 py-3 bg-white/5 hover:bg-emerald-500/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all text-emerald-500"
                        >
                          <FileSpreadsheet size={14} /> Bulk Matrix
                        </button>
                        <button 
                          onClick={() => {
                            const newA: EventScore = { id: generateId(), event_id: selectedEventId, athlete_name: 'ATHLETE_NEW', data: {}, total: 0 };
                            setScores([newA, ...scores]);
                          }}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                          <Plus size={14} /> Add Individual
                        </button>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto no-scrollbar min-h-[400px]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 text-center">Rnk</th>
                            <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">Identity</th>
                            {localSchema.map(col => (
                              <th key={col.id} className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 text-center">{col.name}</th>
                            ))}
                            <th className="p-6 text-[9px] font-black uppercase tracking-[0.3em] text-yellow-500 text-center">Score</th>
                            <th className="p-6"></th>
                          </tr>
                        </thead>
                        <tbody>
                          <AnimatePresence mode="popLayout">
                            {scores.map((score, rIdx) => (
                              <motion.tr 
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={score.id} 
                                className="border-b border-white/5 hover:bg-emerald-500/[0.02] group transition-colors"
                              >
                                <td className="p-6 font-mono font-black text-lg italic text-slate-800 text-center group-hover:text-emerald-500 transition-colors">
                                  #{rIdx + 1}
                                </td>
                                <td className="p-6 min-w-[200px]">
                                  <input 
                                    value={score.athlete_name}
                                    onChange={(e) => {
                                      const updated = scores.map(s => s.id === score.id ? { ...s, athlete_name: e.target.value.toUpperCase() } : s);
                                      setScores(updated);
                                    }}
                                    className="bg-transparent font-black uppercase tracking-tight text-white border-b border-transparent focus:border-emerald-500 outline-none w-full py-1"
                                  />
                                </td>
                                {localSchema.map(col => (
                                  <td key={col.id} className="p-6 text-center">
                                    <input 
                                      type={col.type === 'number' ? 'number' : 'text'}
                                      value={score.data[col.id] || ''}
                                      placeholder="---"
                                      onChange={(e) => handleScoreUpdate(score.id, col.id, e.target.value)}
                                      className="bg-white/5 border border-white/5 rounded-xl py-2 px-3 text-center text-sm font-mono font-bold text-emerald-400 w-24 outline-none focus:border-emerald-500 transition-all hover:bg-white/[0.08]"
                                    />
                                  </td>
                                ))}
                                <td className="p-6 text-center">
                                  <div className="text-2xl font-black text-yellow-500 italic font-mono tracking-tighter shadow-yellow-500/20 drop-shadow-sm">
                                    {score.total}
                                  </div>
                                </td>
                                <td className="p-6">
                                  <button 
                                    onClick={() => {
                                      if (confirm('Erase this record from local memory?')) setScores(scores.filter(s => s.id !== score.id));
                                    }}
                                    className="p-3 text-red-500/20 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                      </table>
                      {scores.length === 0 && !isScoringLoading && (
                        <div className="p-32 flex flex-col items-center justify-center text-center">
                          <AlertCircle size={48} className="text-slate-800 mb-4" />
                          <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px]">Matrix Depleted • System Ready for Upload</p>
                        </div>
                      )}
                      {isScoringLoading && (
                        <div className="p-32 flex items-center justify-center">
                          <Loader2 size={48} className="animate-spin text-emerald-500" />
                        </div>
                      )}
                    </div>

                    <div className="p-8 bg-white/[0.01] border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                         <div className="flex flex-col">
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Last Matrix Snapshot</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleString()}</span>
                         </div>
                      </div>
                      <button 
                        onClick={saveScoresToCloud} 
                        disabled={isSaving || scores.length === 0} 
                        className="w-full md:w-auto px-12 py-5 bg-emerald-500 text-black rounded-[24px] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />} 
                        <span>Upload Matrix to Cloud</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[60px] bg-slate-900/5">
                   <div className="p-10 bg-white/5 rounded-[40px] mb-8 border border-white/5">
                     <Target size={64} className="text-slate-800" />
                   </div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-500 mb-4">TERMINAL OFFLINE</h3>
                   <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">Select a cycle core to engage data matrix</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 italic">Operation Center</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Managing {profiles.length} athletes & {events.length} event cycles</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Team Members', value: profiles.length, color: 'text-emerald-500' },
                  { label: 'Total Events', value: events.length, color: 'text-blue-500' },
                  { label: 'Hall Records', value: hallOfFame.length, color: 'text-yellow-500' },
                  { label: 'Cloud Status', value: 'Synced', color: 'text-purple-500' }
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-8 rounded-[32px] border-white/5 bg-slate-900/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{stat.label}</p>
                      <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
              </div>

              <div className="glass-card p-10 rounded-[40px] border-white/5 bg-slate-900/20">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-10 italic">Quick Create</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button onClick={() => setEditingItem({ type: 'event', data: {} })} className="flex items-center justify-between p-6 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
                      <span>Add Event</span> <Plus size={16} />
                  </button>
                  <button onClick={() => setEditingItem({ type: 'profile', data: {} })} className="flex items-center justify-between p-6 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
                      <span>Add Member</span> <Plus size={16} />
                  </button>
                  <button onClick={() => setEditingItem({ type: 'hall', data: {} })} className="flex items-center justify-between p-6 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest">
                      <span>Record Victory</span> <Trophy size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">Team Roster</h2>
                <button onClick={() => setEditingItem({ type: 'profile', data: {} })} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">New Profile</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[...profiles].sort((a,b) => (a.order_index || 0) - (b.order_index || 0)).map(p => (
                  <div key={p.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between border-white/5 hover:border-emerald-500/30 transition-all bg-slate-900/20">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <img src={p.photo} className="w-16 h-16 rounded-[20px] object-cover bg-slate-800" alt="" />
                        <span className="absolute -top-2 -left-2 bg-white/10 text-[8px] font-black p-1 rounded-md">#{p.order_index || 0}</span>
                      </div>
                      <div>
                        <p className="text-xl font-black uppercase tracking-tighter">{p.name}</p>
                        <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">{p.position} • {p.role}</p>
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

          {activeTab === 'events' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">Event Control</h2>
                <button onClick={() => setEditingItem({ type: 'event', data: {} })} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">Create Event</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {events.map(e => (
                  <div key={e.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between border-white/5 hover:border-emerald-500/30 transition-all bg-slate-900/20">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 rounded-[20px] bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={e.banner} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-black uppercase tracking-tighter">{e.title}</p>
                          {e.is_featured && <span className="bg-yellow-500/20 text-yellow-500 text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Featured</span>}
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{e.status} • {e.date}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => setEditingItem({ type: 'event', data: e })} className="p-4 bg-white/5 rounded-2xl hover:text-emerald-500 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => deleteEvent(e.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hall' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">Hall of Records</h2>
                <button onClick={() => setEditingItem({ type: 'hall', data: {} })} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors">Record Victory</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {hallOfFame.map(h => (
                  <div key={h.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between border-white/5 hover:border-yellow-500/30 transition-all bg-slate-900/20">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 rounded-[20px] bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src={h.athleteImg} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-xl font-black uppercase tracking-tighter">{h.athleteName}</p>
                        <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">{h.position} • {h.stat}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => setEditingItem({ type: 'hall', data: h })} className="p-4 bg-white/5 rounded-2xl hover:text-emerald-500 transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => deleteHallRecord(h.id)} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-12 pb-24">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic mb-2">Brand CMS</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Site-wide Identity Control</p>
                </div>
                <button onClick={updateGlobalConfig} disabled={isSaving} className="bg-emerald-500 text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={16} />} 
                  <span>Sync Global CMS</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Hero Config */}
                <div className="glass-card p-10 rounded-[40px] border-white/5 bg-slate-900/20 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <LayoutTemplate size={20} className="text-emerald-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Hero & Branding</h3>
                  </div>
                  <CMSInput label="Hero Title" icon={<Type size={16} />} value={localConfig.hero_title} onChange={(v: string) => handleConfigChange('hero_title', v)} />
                  <CMSArea label="Hero Subtitle" icon={<FileText size={16} />} value={localConfig.hero_subtitle} onChange={(v: string) => handleConfigChange('hero_subtitle', v)} />
                  
                  <div className="space-y-4">
                    <CMSInput label="Hero Banner Image URL" icon={<ImageIcon size={16} />} value={localConfig.hero_image} onChange={(v: string) => handleConfigChange('hero_image', v)} />
                    {localConfig.hero_image && (
                      <div className="rounded-2xl overflow-hidden h-32 w-full border border-white/10">
                        <img src={localConfig.hero_image} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Page Titles Config */}
                <div className="glass-card p-10 rounded-[40px] border-white/5 bg-slate-900/20 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette size={20} className="text-blue-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Page Navigation Titles</h3>
                  </div>
                  <CMSInput label="Board Page Title" icon={<Users size={16} />} value={localConfig.board_title} onChange={(v: string) => handleConfigChange('board_title', v)} />
                  <CMSInput label="Events Page Title" icon={<Calendar size={16} />} value={localConfig.events_title} onChange={(v: string) => handleConfigChange('events_title', v)} />
                  <CMSInput label="Hall of Fame Title" icon={<Trophy size={16} />} value={localConfig.hall_title} onChange={(v: string) => handleConfigChange('hall_title', v)} />
                  <CMSArea label="About Club Description" icon={<FileText size={16} />} value={localConfig.about_description} onChange={(v: string) => handleConfigChange('about_description', v)} />
                </div>

                {/* Communication & Socials */}
                <div className="glass-card p-10 rounded-[40px] border-white/5 bg-slate-900/20 space-y-6 lg:col-span-2">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe size={20} className="text-purple-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Communication & Links</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CMSInput label="Recruitment Form Link" icon={<LinkIcon size={16} />} value={localConfig.recruitment_link} onChange={(v: string) => handleConfigChange('recruitment_link', v)} />
                    <CMSInput label="Contact Email" icon={<Mail size={16} />} value={localConfig.contact_email} onChange={(v: string) => handleConfigChange('contact_email', v)} />
                    <CMSInput label="Instagram Handle/Link" icon={<Instagram size={16} />} value={localConfig.instagram_link} onChange={(v: string) => handleConfigChange('instagram_link', v)} />
                    <CMSInput label="LinkedIn Page Link" icon={<Linkedin size={16} />} value={localConfig.linkedin_link} onChange={(v: string) => handleConfigChange('linkedin_link', v)} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Upload Modal */}
      <AnimatePresence>
        {isBulkModalOpen && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setIsBulkModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-2xl glass-card rounded-[48px] border-white/10 p-12 bg-slate-900/80">
              <div className="mb-10 flex items-center gap-4">
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                   <FileSpreadsheet size={32} />
                </div>
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter italic">Batch Identity Uplink</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Import multiple athlete records simultaneously</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-2">Paste Names (One per line)</label>
                  <textarea 
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    placeholder="Sameer Khan&#10;Aryan Sharma&#10;Riya Kapoor..."
                    className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm font-bold focus:border-emerald-500/50 outline-none transition-all resize-none font-mono"
                  />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 py-5 bg-white/5 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Abort</button>
                  <button onClick={handleBulkImport} className="flex-1 py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all">Hydrate Matrix</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl" onClick={() => setEditingItem(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-3xl glass-card rounded-[48px] border-white/10 p-10 overflow-y-auto max-h-[95vh] bg-slate-900/80">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    {editingItem.type === 'profile' && <Users size={24} />}
                    {editingItem.type === 'event' && <Calendar size={24} />}
                    {editingItem.type === 'hall' && <Trophy size={24} />}
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Edit {editingItem.type}</h3>
                </div>
                <button onClick={() => setEditingItem(null)} className="p-3 bg-white/5 rounded-2xl hover:text-white transition-colors"><X size={20} /></button>
              </div>

              <form className="space-y-6" onSubmit={handleSave}>
                {editingItem.type === 'profile' && <ProfileForm data={editingItem.data} />}
                {editingItem.type === 'event' && <EventForm data={editingItem.data} />}
                {editingItem.type === 'hall' && <HallForm data={editingItem.data} />}

                <div className="pt-6 border-t border-white/5">
                  <button disabled={isSaving} type="submit" className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 hover:bg-emerald-400 transition-colors shadow-2xl shadow-emerald-500/20">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{isSaving ? 'Syncing...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CMSInput = ({ label, icon, value, onChange }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600">{icon}</div>
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm focus:border-emerald-500/50 outline-none transition-all" />
    </div>
  </div>
);

const CMSArea = ({ label, icon, value, onChange }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <div className="relative">
      <div className="absolute left-5 top-6 text-slate-600">{icon}</div>
      <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm min-h-[120px] focus:border-emerald-500/50 outline-none transition-all" />
    </div>
  </div>
);

const ProfileForm = ({ data }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><InputField label="Full Name" name="name" defaultValue={data.name} required /></div>
    <SelectField label="Role" name="role" defaultValue={data.role || Role.LEAD}>
      {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
    </SelectField>
    <InputField label="Position Title" name="position" defaultValue={data.position} required />
    <InputField label="Order Priority" name="order_index" type="number" defaultValue={data.order_index} icon={<Hash size={14} />} />
    <InputField label="Tenure Period" name="tenure" defaultValue={data.tenure} placeholder="2024 - 2025" />
    <div className="md:col-span-2">
      <InputField label="Photo URL" name="photo" defaultValue={data.photo} required icon={<ImageIcon size={14} />} />
      {data.photo && <img src={data.photo} className="mt-4 h-32 w-32 rounded-2xl object-cover border border-white/10" alt="Profile Preview" />}
    </div>
    <InputField label="LinkedIn URL" name="linkedin" defaultValue={data.socials?.linkedin} icon={<LinkIcon size={14} />} />
    <InputField label="Instagram URL" name="instagram" defaultValue={data.socials?.instagram} icon={<LinkIcon size={14} />} />
    <InputField label="Twitter/X URL" name="twitter" defaultValue={data.socials?.twitter} icon={<LinkIcon size={14} />} />
    <div className="md:col-span-2"><TextAreaField label="Milestones (Comma Separated)" name="achievements" defaultValue={data.achievements?.join(', ')} /></div>
    <div className="md:col-span-2"><TextAreaField label="Biography" name="bio" defaultValue={data.bio} required /></div>
  </div>
);

const EventForm = ({ data }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><InputField label="Event Title" name="title" defaultValue={data.title} required /></div>
    <InputField label="Event Date" name="date" type="date" defaultValue={data.date} required />
    <SelectField label="Status" name="status" defaultValue={data.status || EventStatus.UPCOMING}>
      {Object.values(EventStatus).map(s => <option key={s} value={s}>{s}</option>)}
    </SelectField>
    <div className="md:col-span-2">
      <InputField label="Banner Image URL" name="banner" defaultValue={data.banner} required />
      {data.banner && <img src={data.banner} className="mt-4 h-32 w-full rounded-2xl object-cover border border-white/10" alt="Event Preview" />}
    </div>
    <div className="md:col-span-2"><TextAreaField label="Description" name="description" defaultValue={data.description} required /></div>
    <div className="flex items-center gap-4 py-4">
      <input type="checkbox" name="is_featured" defaultChecked={data.is_featured} className="w-6 h-6 rounded accent-emerald-500 cursor-pointer" />
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Featured</span>
    </div>
  </div>
);

const HallForm = ({ data }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <InputField label="Athlete Name" name="athleteName" defaultValue={data.athleteName} required />
    <InputField label="Category" name="category" defaultValue={data.category} required />
    <InputField label="Event Name" name="eventName" defaultValue={data.eventName} required />
    <InputField label="Year" name="year" defaultValue={data.year} required />
    <SelectField label="Position" name="position" defaultValue={data.position || PodiumPosition.GOLD}>
      {Object.values(PodiumPosition).map(p => <option key={p} value={p}>{p}</option>)}
    </SelectField>
    <InputField label="Winning Stat" name="stat" defaultValue={data.stat} />
    <div className="md:col-span-2">
      <InputField label="Athlete Photo URL" name="athleteImg" defaultValue={data.athleteImg} />
      {data.athleteImg && <img src={data.athleteImg} className="mt-4 h-32 w-32 rounded-2xl object-cover border border-white/10" alt="Athlete Preview" />}
    </div>
  </div>
);

const InputField = ({ label, icon, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
      <input {...props} className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 text-white text-sm focus:border-emerald-500 outline-none transition-colors ${icon ? 'pl-12 pr-5' : 'px-5'}`} />
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

const TextAreaField = ({ label, icon, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <textarea {...props} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-white text-sm min-h-[100px] outline-none" />
  </div>
);

export default AdminDashboard;
