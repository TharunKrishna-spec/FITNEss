import React, { useState, useEffect } from 'react';
import { Profile, Role } from '../../types';
import { Edit2, Trash2, UserPlus, Search, ImageIcon, FileText, QrCode, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { mapProfileToDb } from '../../utils/supabaseUtils';

const generateId = () => crypto.randomUUID();

interface Registration {
  id: string;
  name: string;
  reg_number: string;
  created_at: string;
}

interface Props {
  profiles: Profile[];
  setProfiles: (p: Profile[]) => void;
}

const RegistryTab: React.FC<Props> = ({ profiles, setProfiles }) => {
  const [editing, setEditing] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [addingRegistration, setAddingRegistration] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRegistrations(data);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    const id = editing?.id || generateId();
    const base = editing || {};

    const payloadUi = {
      ...base,
      ...data,
      id,
      order_index: Number((data as any).order_index) || 0
    };

    const payloadDb = mapProfileToDb(payloadUi);

    try {
      // Try the normal upsert first
      const res = await supabase.from('profiles').upsert([payloadDb]).select();
      console.debug('Upsert attempt', { payloadDb, res });

      if (res.error) {
        const msg = (res.error.message || '').toLowerCase();
        // If DB complains about missing columns (e.g., 'instagram' or 'linkedin'), retry without socials
        if (msg.includes('could not find') || msg.includes('column') || msg.includes('unknown column')) {
          const { socials, ...withoutSocials } = payloadDb;
          const retry = await supabase.from('profiles').upsert([withoutSocials]).select();
          console.debug('Retry upsert without socials', { withoutSocials, retry });
          if (retry.error) {
            setSaveError(retry.error.message || JSON.stringify(retry.error));
            console.error('RegistryTab upsert retry error', retry.error);
          } else {
            setProfiles(editing?.id ? profiles.map(p => p.id === id ? payloadUi as Profile : p) : [...profiles, payloadUi as Profile]);
            setEditing(null);
          }
          return;
        }
        setSaveError(res.error.message || JSON.stringify(res.error));
        console.error('RegistryTab upsert error', res.error);
        return;
      }
      // success
      setProfiles(editing?.id ? profiles.map(p => p.id === id ? payloadUi as Profile : p) : [...profiles, payloadUi as Profile]);
      setEditing(null);
    } catch (err: any) {
      console.error('Unexpected save profile error', err);
      setSaveError(err?.message || String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const saveRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const reg_number = formData.get('reg_number') as string;

    const payload = {
      id: generateId(),
      name,
      reg_number,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('registrations').insert(payload);
    if (!error) {
      setRegistrations([payload, ...registrations]);
      setAddingRegistration(false);
      alert('Registration added successfully!');
    } else {
      alert('Failed to add registration: ' + error.message);
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!confirm('Delete this registration?')) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (!error) {
      setRegistrations(registrations.filter(r => r.id !== id));
    }
  };

  const filteredRegistrations = registrations.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reg_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* QR Registrations Section */}
      <div className="glass-card p-8 rounded-[32px] border border-emerald-500/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <QrCode className="text-emerald-500" size={24} />
            <h3 className="text-3xl font-black uppercase tracking-tighter italic">QR Registrations</h3>
          </div>
          <button
            onClick={() => setAddingRegistration(true)}
            className="bg-emerald-500 text-black px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            Add Registration
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
            <input
              id="registry-search"
              name="registry_search"
              type="text"
              placeholder="SEARCH BY NAME OR REG NUMBER..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Registrations List */}
        <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
          {filteredRegistrations.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-sm font-medium">No registrations found</p>
          ) : (
            filteredRegistrations.map(reg => (
              <div key={reg.id} className="bg-white/5 p-5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all group">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="text-emerald-500" size={20} />
                  <div>
                    <p className="font-black text-lg uppercase tracking-tight">{reg.name}</p>
                    <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">{reg.reg_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] text-slate-500 font-medium">{new Date(reg.created_at).toLocaleDateString()}</span>
                  <button
                    onClick={() => deleteRegistration(reg.id)}
                    className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Registration Modal */}
        {addingRegistration && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setAddingRegistration(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md glass-card rounded-[32px] p-10 border-white/10 shadow-2xl"
            >
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 flex items-center space-x-3">
                <QrCode className="text-emerald-500" size={24} />
                <span>Add Registration</span>
              </h3>
              <form onSubmit={saveRegistration} className="space-y-5">
                <input name="name" placeholder="FULL NAME" className="admin-input" required />
                <input name="reg_number" placeholder="REGISTRATION NUMBER" className="admin-input" required />
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setAddingRegistration(false)} className="flex-1 py-4 bg-white/5 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg">
                    Add
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>

      {/* Personnel Section */}
      <div className="flex justify-between items-end">
        <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Personnel</h2>
        <button onClick={() => setEditing({})} className="bg-emerald-500 text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Add Personnel</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {profiles.sort((a, b) => (a.order_index || 0) - (b.order_index || 0)).map(p => (
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
              <button onClick={async () => { if (confirm('Purge record?')) { await supabase.from('profiles').delete().eq('id', p.id); setProfiles(profiles.filter(x => x.id !== p.id)); } }} className="p-4 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
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
                <input id="profile-name" name="name" defaultValue={editing?.name} placeholder="NAME" className="admin-input col-span-2" required autoComplete="name" />
                <input id="profile-position" name="position" defaultValue={editing?.position} placeholder="POSITION" className="admin-input" required autoComplete="organization-title" />
                <input id="profile-regno" name="reg_no" defaultValue={editing?.reg_no} placeholder="REG NO" className="admin-input" autoComplete="off" />
                <input id="profile-photo" name="photo" defaultValue={editing?.photo} placeholder="PHOTO URL" className="admin-input col-span-2" required autoComplete="off" />
                <textarea id="profile-bio" name="bio" defaultValue={editing?.bio} placeholder="BIOGRAPHY" className="admin-input col-span-2 h-32" required autoComplete="off" />
                <input id="profile-order" name="order_index" type="number" defaultValue={editing?.order_index} placeholder="ORDER INDEX" className="admin-input" autoComplete="off" />
                <select id="profile-role" name="role" defaultValue={editing?.role} className="admin-input" autoComplete="off">
                  {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button className="w-full py-6 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[11px]" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Commit Changes'}
              </button>
              {saveError && <pre className="mt-3 text-sm text-red-400 whitespace-pre-wrap">{String(saveError)}</pre>}
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
