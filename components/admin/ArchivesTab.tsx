
import React, { useState } from 'react';
import { Achievement, PodiumPosition } from '../../types';
import { Edit2, Trash2, Trophy, Star, Crown, Plus, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

const generateId = () => crypto.randomUUID();

interface Props {
  hallOfFame: Achievement[];
  setHallOfFame: (h: Achievement[]) => void;
}

const ArchivesTab: React.FC<Props> = ({ hallOfFame, setHallOfFame }) => {
  const [editing, setEditing] = useState<any>(null);

  const saveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const id = editing.id || generateId();
    
    const payload = {
      ...editing,
      ...data,
      id,
      featured: !!data.featured
    };

    const { error } = await supabase.from('hall_of_fame').upsert(payload);
    if (!error) {
      setHallOfFame(editing.id ? hallOfFame.map(h => h.id === id ? payload : h) : [...hallOfFame, payload]);
      setEditing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Archives</h2>
        <button onClick={() => setEditing({ position: PodiumPosition.GOLD })} className="bg-yellow-500 text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Record Achievement</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {hallOfFame.sort((a,b) => b.year.localeCompare(a.year)).map(h => (
          <div key={h.id} className="glass-card p-6 rounded-[32px] hover:bg-white/[0.03] transition-all border-white/5 flex flex-col group">
            <div className="aspect-square rounded-2xl overflow-hidden mb-6 relative">
              <img src={h.athleteImg} className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="" />
              <div className="absolute top-4 right-4 p-3 rounded-xl bg-yellow-500 text-black shadow-lg">
                <Crown size={16} />
              </div>
            </div>
            
            <div className="flex-grow mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mb-2">{h.position}</p>
              <p className="text-2xl font-black uppercase italic tracking-tighter mb-1">{h.athleteName}</p>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{h.eventName} • {h.year}</p>
            </div>

            <div className="flex gap-2 pt-6 border-t border-white/5">
              <button onClick={() => setEditing(h)} className="flex-grow py-3 bg-white/5 rounded-xl hover:text-yellow-500 transition-colors text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <Edit2 size={12} /> Edit Detail
              </button>
              <button onClick={async () => { if(confirm('Purge record?')) { await supabase.from('hall_of_fame').delete().eq('id', h.id); setHallOfFame(hallOfFame.filter(x => x.id !== h.id)); } }} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setEditing(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl glass-card rounded-[48px] p-12 border-white/10 shadow-2xl">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-10 leading-none">Record Archive</h3>
            <form onSubmit={saveAchievement} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Athlete Name</label>
                  <input name="athleteName" defaultValue={editing.athleteName} placeholder="NAME" className="admin-input" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Division/Category</label>
                  <input name="category" defaultValue={editing.category} placeholder="e.g. Under 85kg" className="admin-input" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Event Source</label>
                  <input name="eventName" defaultValue={editing.eventName} placeholder="e.g. Campus Clash 2023" className="admin-input" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Year</label>
                  <input name="year" defaultValue={editing.year} placeholder="2024" className="admin-input" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Podium Rank</label>
                  <select name="position" defaultValue={editing.position} className="admin-input">
                    {Object.values(PodiumPosition).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Action Shot URL</label>
                  <input name="athleteImg" defaultValue={editing.athleteImg} placeholder="https://..." className="admin-input" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 ml-4 tracking-widest">Performance Stat</label>
                  <input name="stat" defaultValue={editing.stat} placeholder="e.g. 540kg Total" className="admin-input" />
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <input type="checkbox" name="featured" defaultChecked={editing.featured} className="w-5 h-5 rounded" />
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pin to Champions Wall</label>
                </div>
              </div>
              <button className="w-full py-6 bg-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl">Commit Archive</button>
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
        .admin-input:focus { border-color: #f59e0b; background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};

export default ArchivesTab;
