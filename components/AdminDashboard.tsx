
import React, { useState } from 'react';
import { Role, Profile, Event, EventStatus, Achievement, PodiumPosition } from '../types';
// Added missing ShieldCheck and Settings icons from lucide-react
import { LayoutDashboard, Users, Calendar, Trophy, Plus, Trash2, Edit2, BarChart3, Clock, ArrowUpRight, CheckCircle2, Save, X, Globe, UserPlus, Image as ImageIcon, ShieldCheck, Settings } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Management functions
  const deleteProfile = (id: string) => setProfiles(profiles.filter(p => p.id !== id));
  const deleteEvent = (id: string) => setEvents(events.filter(e => e.id !== id));
  const deleteHallRecord = (id: string) => setHallOfFame(hallOfFame.filter(h => h.id !== id));

  const saveProfile = (data: Profile) => {
    if (profiles.find(p => p.id === data.id)) {
      setProfiles(profiles.map(p => p.id === data.id ? data : p));
    } else {
      setProfiles([...profiles, { ...data, id: Date.now().toString() }]);
    }
    setEditingItem(null);
  };

  const saveEvent = (data: Event) => {
    if (events.find(e => e.id === data.id)) {
      setEvents(events.map(e => e.id === data.id ? data : e));
    } else {
      setEvents([...events, { ...data, id: Date.now().toString() }]);
    }
    setEditingItem(null);
  };

  const saveHallRecord = (data: Achievement) => {
    if (hallOfFame.find(h => h.id === data.id)) {
      setHallOfFame(hallOfFame.map(h => h.id === data.id ? data : h));
    } else {
      setHallOfFame([...hallOfFame, { ...data, id: Date.now().toString() }]);
    }
    setEditingItem(null);
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 pt-24 lg:pt-0">
      {/* Workspace Sidebar */}
      <aside className="w-full lg:w-80 bg-slate-900/10 border-r border-white/5 p-8 lg:fixed lg:top-0 lg:bottom-0 overflow-y-auto">
        <div className="mb-12 hidden lg:block">
           <div className="flex items-center space-x-3 mb-2">
             <div className="p-2 bg-emerald-500 rounded-lg">
               <ShieldCheck size={20} className="text-black" fill="currentColor" />
             </div>
             <span className="text-xl font-black tracking-tighter uppercase italic">TITAN<span className="text-emerald-500">CORE</span></span>
           </div>
           <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] ml-1">v2.4 Command Center</p>
        </div>
        
        <nav className="space-y-2">
          <SidebarBtn id="overview" label="Dashboard" icon={LayoutDashboard} />
          <SidebarBtn id="profiles" label="Team Roster" icon={Users} />
          <SidebarBtn id="events" label="Event Control" icon={Calendar} />
          <SidebarBtn id="hall" label="Hall of Records" icon={Trophy} />
          <SidebarBtn id="settings" label="Site Config" icon={Settings} />
        </nav>

        <div className="mt-12 pt-12 border-t border-white/5 hidden lg:block">
           <div className="flex items-center space-x-3 mb-6 p-4 glass-card rounded-2xl border-white/5">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-500 font-black">A</div>
              <div>
                 <p className="text-xs font-black uppercase tracking-widest">Admin User</p>
                 <p className="text-[8px] text-slate-500 uppercase">Super Privilege</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Workspace Content */}
      <div className="flex-grow lg:ml-80 p-8 lg:p-16 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
               <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter mb-2 italic">Operation Center</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Portal health & analytics summary</p>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: 'Team Members', value: profiles.length, color: 'text-emerald-500' },
                 { label: 'Total Events', value: events.length, color: 'text-blue-500' },
                 { label: 'Hall Records', value: hallOfFame.length, color: 'text-yellow-500' },
                 { label: 'System Uptime', value: '99.9%', color: 'text-purple-500' }
               ].map((stat, i) => (
                  <div key={i} className="glass-card p-8 rounded-[32px] border-white/5 hover:border-white/10 transition-all">
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">{stat.label}</p>
                     <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 glass-card p-10 rounded-[40px] border-white/5">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-10 flex items-center">
                    <BarChart3 className="mr-3 text-emerald-500" size={20} />
                    Engagement Metrics
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Jan', users: 120 }, { name: 'Feb', users: 340 }, { name: 'Mar', users: 210 }, { name: 'Apr', users: 542 },
                      ]}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                        <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="glass-card p-10 rounded-[40px] border-white/5">
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-8 italic">Quick Actions</h3>
                  <div className="space-y-4">
                    <button onClick={() => setEditingItem({ type: 'event', data: {} })} className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-emerald-500 hover:text-black rounded-2xl transition-all group font-black text-[10px] uppercase tracking-widest">
                       <span>Create Event</span>
                       <Plus size={16} />
                    </button>
                    <button onClick={() => setEditingItem({ type: 'profile', data: {} })} className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-blue-500 hover:text-black rounded-2xl transition-all group font-black text-[10px] uppercase tracking-widest">
                       <span>Add Member</span>
                       <UserPlus size={16} />
                    </button>
                    <button onClick={() => setEditingItem({ type: 'hall', data: {} })} className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-2xl transition-all group font-black text-[10px] uppercase tracking-widest">
                       <span>Record Victory</span>
                       <Trophy size={16} />
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
               <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic">Team Roster</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Managing {profiles.length} Titans</p>
               </div>
               <button 
                 onClick={() => setEditingItem({ type: 'profile', data: {} })}
                 className="bg-emerald-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
               >
                 Add New Coach
               </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {profiles.map(p => (
                 <div key={p.id} className="glass-card p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between group border-white/5 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center space-x-6">
                       <img src={p.photo} className="w-16 h-16 rounded-[20px] object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                       <div>
                          <p className="text-xl font-black uppercase tracking-tighter">{p.name}</p>
                          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest opacity-60">{p.position}</p>
                       </div>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                       <button onClick={() => setEditingItem({ type: 'profile', data: p })} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                       <button onClick={() => deleteProfile(p.id)} className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
               <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic">Event Control</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Timeline orchestration</p>
               </div>
               <button 
                 onClick={() => setEditingItem({ type: 'event', data: {} })}
                 className="bg-blue-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
               >
                 Draft Event
               </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {events.map(e => (
                 <div key={e.id} className="glass-card p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between group border-white/5 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center space-x-6">
                       <img src={e.banner} className="w-24 h-16 rounded-[20px] object-cover brightness-50 group-hover:brightness-100 transition-all" alt="" />
                       <div>
                          <p className="text-xl font-black uppercase tracking-tighter">{e.title}</p>
                          <div className="flex items-center space-x-3 mt-1">
                             <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{e.status}</span>
                             <span className="text-slate-600 text-[10px] uppercase font-black">{new Date(e.date).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                       <button onClick={() => setEditingItem({ type: 'event', data: e })} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                       <button onClick={() => deleteEvent(e.id)} className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'hall' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end">
               <div>
                  <h2 className="text-5xl font-black uppercase tracking-tighter italic">Legacy Vault</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Victory records & records</p>
               </div>
               <button 
                 onClick={() => setEditingItem({ type: 'hall', data: {} })}
                 className="bg-yellow-500 text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
               >
                 New Record
               </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {hallOfFame.map(h => (
                 <div key={h.id} className="glass-card p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between group border-white/5 hover:border-yellow-500/30 transition-all">
                    <div className="flex items-center space-x-6">
                       <div className="w-16 h-16 rounded-[20px] bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                          <Trophy size={24} />
                       </div>
                       <div>
                          <p className="text-xl font-black uppercase tracking-tighter">{h.athleteName}</p>
                          <p className="text-yellow-500 text-[10px] font-black uppercase tracking-widest opacity-60">{h.position} • {h.category}</p>
                       </div>
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                       <button onClick={() => setEditingItem({ type: 'hall', data: h })} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><Edit2 size={16} /></button>
                       <button onClick={() => deleteHallRecord(h.id)} className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div>
               <h2 className="text-5xl font-black uppercase tracking-tighter italic">Global Config</h2>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Core site settings & links</p>
            </div>
            
            <div className="glass-card p-10 rounded-[40px] border-white/5 space-y-10">
               <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Official Recruitment Link (Google Form)</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={recruitmentLink}
                      onChange={(e) => setRecruitmentLink(e.target.value)}
                      className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      placeholder="https://forms.gle/..."
                    />
                    <button className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Update</button>
                  </div>
               </div>

               <div className="pt-10 border-t border-white/5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6">System Maintenance</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-6 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-black border border-red-500/10 rounded-[32px] transition-all text-left group">
                        <p className="font-black uppercase tracking-widest text-[10px] mb-1">Factory Reset</p>
                        <p className="text-[8px] font-bold opacity-60">Wipe all local changes and revert to initial state</p>
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Cinematic Editing Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl"
              onClick={() => setEditingItem(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl glass-card rounded-[48px] border-white/10 p-10 md:p-16 overflow-y-auto max-h-[90vh] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black uppercase tracking-tighter">Edit {editingItem.type}</h3>
                <button onClick={() => setEditingItem(null)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <form className="space-y-6" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                if (editingItem.type === 'profile') saveProfile({ ...editingItem.data, ...data });
                if (editingItem.type === 'event') saveEvent({ ...editingItem.data, ...data });
                if (editingItem.type === 'hall') saveHallRecord({ ...editingItem.data, ...data });
              }}>
                {editingItem.type === 'profile' && (
                  <div className="space-y-4">
                    <InputField label="Full Name" name="name" defaultValue={editingItem.data.name} required />
                    <InputField label="Position Title" name="position" defaultValue={editingItem.data.position} required />
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Role Category" name="role" defaultValue={editingItem.data.role}>
                        <option value={Role.BOARD}>Board Member</option>
                        <option value={Role.LEAD}>Lead</option>
                        <option value={Role.ALUMNI}>Alumni</option>
                      </SelectField>
                      <InputField label="Tenure" name="tenure" defaultValue={editingItem.data.tenure} placeholder="2024-25" />
                    </div>
                    <InputField label="Photo URL" name="photo" defaultValue={editingItem.data.photo} required />
                    <TextAreaField label="Biography" name="bio" defaultValue={editingItem.data.bio} required />
                  </div>
                )}

                {editingItem.type === 'event' && (
                  <div className="space-y-4">
                    <InputField label="Event Title" name="title" defaultValue={editingItem.data.title} required />
                    <InputField label="Date" name="date" type="date" defaultValue={editingItem.data.date} required />
                    <SelectField label="Status" name="status" defaultValue={editingItem.data.status}>
                      <option value={EventStatus.UPCOMING}>Upcoming</option>
                      <option value={EventStatus.REGISTRATION_OPEN}>Registrations Open</option>
                      <option value={EventStatus.ONGOING}>Ongoing</option>
                      <option value={EventStatus.COMPLETED}>Completed</option>
                    </SelectField>
                    <InputField label="Banner Image URL" name="banner" defaultValue={editingItem.data.banner} required />
                    <TextAreaField label="Description" name="description" defaultValue={editingItem.data.description} required />
                  </div>
                )}

                {editingItem.type === 'hall' && (
                  <div className="space-y-4">
                    <InputField label="Athlete Name" name="athleteName" defaultValue={editingItem.data.athleteName} required />
                    <InputField label="Category" name="category" defaultValue={editingItem.data.category} placeholder="e.g. Powerlifting - 75kg" required />
                    <InputField label="Event Name" name="eventName" defaultValue={editingItem.data.eventName} required />
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Position" name="position" defaultValue={editingItem.data.position}>
                        <option value={PodiumPosition.GOLD}>1st Place (Gold)</option>
                        <option value={PodiumPosition.SILVER}>2nd Place (Silver)</option>
                        <option value={PodiumPosition.BRONZE}>3rd Place (Bronze)</option>
                      </SelectField>
                      <InputField label="Metric / Stat" name="stat" defaultValue={editingItem.data.stat} placeholder="e.g. 540kg Total" />
                    </div>
                    <InputField label="Athlete Image URL" name="athleteImg" defaultValue={editingItem.data.athleteImg} />
                  </div>
                )}

                <div className="pt-6 flex gap-3">
                  <button type="submit" className="flex-grow py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20">Save Changes</button>
                  <button type="button" onClick={() => setEditingItem(null)} className="px-8 py-5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InputField = ({ label, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <input 
      {...props}
      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm"
    />
  </div>
);

const TextAreaField = ({ label, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <textarea 
      {...props}
      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm min-h-[100px]"
    />
  </div>
);

const SelectField = ({ label, children, ...props }: any) => (
  <div>
    <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">{label}</label>
    <select 
      {...props}
      className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm appearance-none"
    >
      {children}
    </select>
  </div>
);

export default AdminDashboard;
