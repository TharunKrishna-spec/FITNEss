
import React, { useState } from 'react';
import { Event, EventStatus } from '../../types';
import { Edit2, Trash2, Calendar, ImageIcon, FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

const generateId = () => crypto.randomUUID();

interface Props {
  events: Event[];
  setEvents: (e: Event[]) => void;
}

const CyclesTab: React.FC<Props> = ({ events, setEvents }) => {
  const [editing, setEditing] = useState<any>(null);

  const saveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const id = editing.id || generateId();
    
    const payload = {
      ...editing,
      ...data,
      id,
      is_featured: !!data.is_featured
    };

    const { error } = await supabase.from('events').upsert(payload);
    if (!error) {
      setEvents(editing.id ? events.map(ev => ev.id === id ? payload : ev) : [...events, payload]);
      setEditing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Cycles</h2>
        <button onClick={() => setEditing({ status: EventStatus.UPCOMING })} className="bg-emerald-500 text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Create Cycle</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ev => (
          <div key={ev.id} className="glass-card p-8 rounded-[40px] flex flex-col justify-between group hover:bg-white/[0.03] transition-all border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-white group-hover:opacity-[0.08] transition-all">
              <Calendar size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 ${
                  ev.status === EventStatus.COMPLETED ? 'bg-slate-800 text-slate-500' : 'bg-emerald-500 text-black'
                }`}>
                  {ev.status}
                </span>
                <span className="text-slate-500 text-[9px] font-bold">{new Date(ev.date).toDateString()}</span>
              </div>
              <p className="text-3xl font-black uppercase italic tracking-tighter mb-4 leading-none">{ev.title}</p>
              <p className="text-slate-500 text-sm line-clamp-2 h-10 mb-8 font-medium">{ev.description}</p>
            </div>

            <div className="flex gap-2 relative z-10 pt-6 border-t border-white/5">
              <button onClick={() => setEditing(ev)} className="flex-grow py-4 bg-white/5 rounded-xl hover:text-emerald-500 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Edit2 size={14} /> Edit Detail
              </button>
              <button onClick={async () => { if(confirm('Purge cycle?')) { await supabase.from('events').delete().eq('id', ev.id); setEvents(events.filter(x => x.id !== ev.id)); } }} className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setEditing(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl glass-card rounded-[48px] p-12 border-white/10 shadow-2xl">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-10 leading-none">Cycle Parameters</h3>
            <form onSubmit={saveEvent} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Event Title</label>
                  <input name="title" defaultValue={editing.title} placeholder="e.g. CAMPUS CLASH 2024" className="admin-input" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Date</label>
                  <input name="date" type="date" defaultValue={editing.date} className="admin-input" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Status</label>
                  <select name="status" defaultValue={editing.status} className="admin-input">
                    {Object.values(EventStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Banner Image URL</label>
                  <input name="banner" defaultValue={editing.banner} placeholder="https://..." className="admin-input" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Briefing</label>
                  <textarea name="description" defaultValue={editing.description} placeholder="Operational details..." className="admin-input h-32" required />
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <input type="checkbox" name="is_featured" defaultChecked={editing.is_featured} className="w-5 h-5 rounded" />
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Feature on Front-Page</label>
                </div>
              </div>
              <button className="w-full py-6 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl">Deploy Cycle</button>
            </form>
          </motion.div>
        </div>
      )}

      <style>{`
        .admin-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 16px 20px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: all 0.3s;
        }
        .admin-input:focus { border-color: #10b981; background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};

export default CyclesTab;
