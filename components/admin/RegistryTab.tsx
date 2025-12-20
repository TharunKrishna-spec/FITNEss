
import React, { useState } from 'react';
import { Profile, Role } from '../../types';
import { Edit2, Trash2, UserPlus, Search, ImageIcon, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';

const generateId = () => crypto.randomUUID();

interface Props {
  profiles: Profile[];
  setProfiles: (p: Profile[]) => void;
}

const RegistryTab: React.FC<Props> = ({ profiles, setProfiles }) => {
  const [editing, setEditing] = useState<any>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const id = editing.id || generateId();
    
    const payload = {
      ...editing,
      ...data,
      id,
      order_index: Number(data.order_index) || 0
    };

    const { error } = await supabase.from('profiles').upsert(payload);
    if (!error) {
      setProfiles(editing.id ? profiles.map(p => p.id === id ? payload : p) : [...profiles, payload]);
      setEditing(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Registry</h2>
        <button onClick={() => setEditing({})} className="bg-emerald-500 text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Add Personnel</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {profiles.sort((a,b) => (a.order_index || 0) - (b.order_index || 0)).map(p => (
          <div key={p.id} className="glass-card p-6 rounded-[32px] flex items-center justify-between group hover:bg-white/[0.03] transition-all">
            <div className="flex items-center space-x-6">
              <img src={p.photo} className="w-16 h-16 rounded-2xl object-cover bg-slate-800 border border-white/5" />
              <div>
                <p className="text-2xl font-black uppercase italic tracking-tighter">{p.name}</p>
                <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">{p.position}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="p-4 bg-white/5 rounded-xl hover:text-emerald-500 transition-colors"><Edit2 size={16} /></button>
              <button onClick={async () => { if(confirm('Purge record?')) { await supabase.from('profiles').delete().eq('id', p.id); setProfiles(profiles.filter(x => x.id !== p.id)); } }} className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setEditing(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl glass-card rounded-[48px] p-12 border-white/10 shadow-2xl">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-10">Personnel Editor</h3>
            <form onSubmit={saveProfile} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input name="name" defaultValue={editing.name} placeholder="NAME" className="admin-input col-span-2" required />
                <input name="position" defaultValue={editing.position} placeholder="POSITION" className="admin-input" required />
                <input name="reg_no" defaultValue={editing.reg_no} placeholder="REG NO" className="admin-input" />
                <input name="photo" defaultValue={editing.photo} placeholder="PHOTO URL" className="admin-input col-span-2" required />
                <textarea name="bio" defaultValue={editing.bio} placeholder="BIOGRAPHY" className="admin-input col-span-2 h-32" required />
                <input name="order_index" type="number" defaultValue={editing.order_index} placeholder="ORDER INDEX" className="admin-input" />
                <select name="role" defaultValue={editing.role} className="admin-input">
                  {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button className="w-full py-6 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl">Commit Changes</button>
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

export default RegistryTab;
