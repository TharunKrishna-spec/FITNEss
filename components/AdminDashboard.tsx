
import React, { useState } from 'react';
import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition } from '../types';
import { LayoutDashboard, Users, Calendar, Trophy, Plus, Trash2, Edit2, ShieldCheck, Settings, Save, X, Loader2, Link as LinkIcon, Image as ImageIcon, FileText, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

interface Props {
  profiles: Profile[];
  setProfiles: (p: Profile[]) => void;
  events: Event[];
  setEvents: (e: Event[]) => void;
  hallOfFame: Achievement[];
  setHallOfFame: (h: Achievement[]) => void;
  recruitmentLink: string;
  setRecruitmentLink: (l: string) => void;
}

const AdminDashboard: React.FC<Props> = ({ 
  profiles, setProfiles, 
  events, setEvents, 
  hallOfFame, setHallOfFame,
  recruitmentLink, setRecruitmentLink 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'events' | 'hall' | 'settings'>('overview');
  const [editingItem, setEditingItem] = useState<{ type: 'profile' | 'event' | 'hall', data: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const deleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) setProfiles(profiles.filter(p => p.id !== id));
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) setEvents(events.filter(e => e.id !== id));
  };

  const deleteHallRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    const { error } = await supabase.from('hall_of_fame').delete().eq('id', id);
    if (!error) setHallOfFame(hallOfFame.filter(h => h.id !== id));
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    try {
      let payload: any = { ...rawData };
      
      if (editingItem.type === 'profile') {
        payload.socials = {
          linkedin: rawData.linkedin || '',
          instagram: rawData.instagram || '',
          twitter: rawData.twitter || ''
        };
        delete payload.linkedin;
        delete payload.instagram;
        delete payload.twitter;
        payload.achievements = rawData.achievements ? (rawData.achievements as string).split(',').map(s => s.trim()) : [];
        payload.order_index = parseInt(rawData.order_index as string) || 0;
      }

      if (editingItem.type === 'event') {
        payload.gallery = rawData.gallery ? (rawData.gallery as string).split(',').map(s => s.trim()) : [];
        payload.is_featured = rawData.is_featured === 'on';
      }

      if (editingItem.type === 'hall') {
        payload.featured = rawData.featured === 'on';
      }

      if (editingItem.data.id) {
        payload.id = editingItem.data.id;
      }

      const table = editingItem.type === 'profile' ? 'profiles' : 
                    editingItem.type === 'event' ? 'events' : 'hall_of_fame';

      const { data: updated, error } = await supabase.from(table).upsert(payload).select().single();

      if (error) throw error;

      if (updated) {
        if (editingItem.type === 'profile') {
          setProfiles(editingItem.data.id ? profiles.map(p => p.id === updated.id ? updated : p) : [...profiles, updated]);
        } else if (editingItem.type === 'event') {
          setEvents(editingItem.data.id ? events.map(ev => ev.id === updated.id ? updated : ev) : [...events, updated]);
        } else if (editingItem.type === 'hall') {
          setHallOfFame(editingItem.data.id ? hallOfFame.map(h => h.id === updated.id ? updated : h) : [...hallOfFame, updated]);
        }
        setEditingItem(null);
      }
    } catch (err: any) {
      alert('Error saving to cloud: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = async () => {
    setIsSaving(true);
    const { error } = await supabase.from('site_config').upsert({ key: 'recruitment_link', value: recruitmentLink });
    if (error) alert('Error updating config');
    setIsSaving(false);
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
          <SidebarBtn id="hall" label="Hall of Records" icon={Trophy} />
          <SidebarBtn id="settings" label="Site Config" icon={Settings} />
        </nav>
      </aside>

      <div className="flex-grow lg:ml-80 p-8 lg:p-12 xl:p-16 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
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
            <div className="space-y-8">
              <h2 className="text-5xl font-black uppercase tracking-tighter italic">Cloud Config</h2>
              <div className="glass-card p-10 rounded-[40px] border-white/5 bg-slate-900/20">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Official Recruitment Link</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <LinkIcon size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" value={recruitmentLink} onChange={(e) => setRecruitmentLink(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-emerald-500 transition-colors" />
                  </div>
                  <button onClick={updateConfig} disabled={isSaving} className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors">
                    {isSaving && <Loader2 size={14} className="animate-spin" />} Sync Link
                  </button>
                </div>
              </div>

              <div className="p-10 bg-white/5 border border-white/5 rounded-[40px] opacity-50 cursor-not-allowed">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Branding & Hero (Coming Soon)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="h-12 bg-white/5 rounded-xl" />
                   <div className="h-12 bg-white/5 rounded-xl" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                    <span>{isSaving ? 'Updating Club Records...' : 'Save Changes'}</span>
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

const ProfileForm = ({ data }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><InputField label="Full Name" name="name" defaultValue={data.name} required /></div>
    <SelectField label="Role" name="role" defaultValue={data.role || Role.LEAD}>
      {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
    </SelectField>
    <InputField label="Position Title" name="position" defaultValue={data.position} required />
    <InputField label="Order Priority (Low = Top)" name="order_index" type="number" defaultValue={data.order_index} icon={<Hash size={14} />} />
    <InputField label="Tenure Period" name="tenure" defaultValue={data.tenure} placeholder="2024 - 2025" />
    <div className="md:col-span-2"><InputField label="Photo URL" name="photo" defaultValue={data.photo} required icon={<ImageIcon size={14} />} /></div>
    <InputField label="LinkedIn URL" name="linkedin" defaultValue={data.socials?.linkedin} icon={<LinkIcon size={14} />} />
    <InputField label="Instagram URL" name="instagram" defaultValue={data.socials?.instagram} icon={<LinkIcon size={14} />} />
    <InputField label="Twitter/X URL" name="twitter" defaultValue={data.socials?.twitter} icon={<LinkIcon size={14} />} />
    <div className="md:col-span-2">
      <TextAreaField label="Milestones (Comma Separated)" name="achievements" defaultValue={data.achievements?.join(', ')} placeholder="Gold Medalist, 3x Captain..." />
    </div>
    <div className="md:col-span-2">
      <TextAreaField label="Leadership Biography" name="bio" defaultValue={data.bio} required />
    </div>
  </div>
);

const EventForm = ({ data }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="md:col-span-2"><InputField label="Event Title" name="title" defaultValue={data.title} required /></div>
    <InputField label="Event Date" name="date" type="date" defaultValue={data.date} required />
    <SelectField label="Status" name="status" defaultValue={data.status || EventStatus.UPCOMING}>
      {Object.values(EventStatus).map(s => <option key={s} value={s}>{s}</option>)}
    </SelectField>
    <div className="md:col-span-2"><InputField label="Banner Image URL" name="banner" defaultValue={data.banner} required icon={<ImageIcon size={14} />} /></div>
    <div className="md:col-span-2"><TextAreaField label="Gallery URLs (Comma Separated)" name="gallery" defaultValue={data.gallery?.join(', ')} placeholder="https://img1.com, https://img2.com..." icon={<ImageIcon size={14} />} /></div>
    <div className="md:col-span-2"><TextAreaField label="Post-Event Results / Summary" name="results" defaultValue={data.results} placeholder="Tournament standings, records broken..." icon={<FileText size={14} />} /></div>
    <div className="md:col-span-2"><TextAreaField label="Main Description" name="description" defaultValue={data.description} required /></div>
    <div className="flex items-center gap-4 py-4">
      <input type="checkbox" name="is_featured" defaultChecked={data.is_featured} className="w-6 h-6 rounded accent-emerald-500 cursor-pointer" />
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Featured in Live Feed</span>
    </div>
  </div>
);

const HallForm = ({ data }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <InputField label="Athlete Name" name="athleteName" defaultValue={data.athleteName} required />
    <InputField label="Category" name="category" defaultValue={data.category} placeholder="e.g. 75kg Powerlifting" required />
    <InputField label="Event Name" name="eventName" defaultValue={data.eventName} required />
    <InputField label="Year" name="year" defaultValue={data.year} required />
    <SelectField label="Podium Position" name="position" defaultValue={data.position || PodiumPosition.GOLD}>
      {Object.values(PodiumPosition).map(p => <option key={p} value={p}>{p}</option>)}
    </SelectField>
    <InputField label="Winning Stat" name="stat" defaultValue={data.stat} placeholder="e.g. 450kg Total" />
    <div className="md:col-span-2"><InputField label="Athlete Social Link" name="athleteSocial" defaultValue={data.athleteSocial} placeholder="Instagram or Portfolio link" icon={<LinkIcon size={14} />} /></div>
    <div className="md:col-span-2"><InputField label="Athlete Photo URL" name="athleteImg" defaultValue={data.athleteImg} icon={<ImageIcon size={14} />} /></div>
    <div className="flex items-center gap-4 py-4">
      <input type="checkbox" name="featured" defaultChecked={data.featured} className="w-6 h-6 rounded accent-emerald-500 cursor-pointer" />
      <span className="text-xs font-black uppercase tracking-widest text-slate-400">Featured Legend</span>
    </div>
  </div>
);

const InputField = ({ label, icon, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>}
      <input {...props} className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 text-white text-sm focus:border-emerald-500 outline-none transition-colors ${icon ? 'pl-12 pr-5' : 'px-5'}`} />
    </div>
  </div>
);

const SelectField = ({ label, children, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <select {...props} className="w-full bg-slate-900 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm focus:border-emerald-500 outline-none transition-colors">
      {children}
    </select>
  </div>
);

const TextAreaField = ({ label, icon, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-5 top-6 text-slate-500">{icon}</div>}
      <textarea {...props} className={`w-full bg-white/5 border border-white/5 rounded-2xl py-4 text-white text-sm min-h-[100px] focus:border-emerald-500 outline-none transition-colors ${icon ? 'pl-12 pr-5' : 'px-5'}`} />
    </div>
  </div>
);

export default AdminDashboard;
