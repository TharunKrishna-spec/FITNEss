import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Save, Type, Plus, Trash2, Link as LinkIcon } from 'lucide-react';

interface Props {
  siteConfig: Record<string, string>;
  setSiteConfig: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  link?: string;
}

const AnnouncementsTab: React.FC<Props> = ({ siteConfig, setSiteConfig }) => {
  const [draft, setDraft] = useState<Record<string, string>>(siteConfig);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', link: '' });

  useEffect(() => {
    setDraft(siteConfig);
    try {
      const list = siteConfig.announcements_list ? JSON.parse(siteConfig.announcements_list) : [];
      setAnnouncements(list);
    } catch {
      setAnnouncements([]);
    }
  }, [siteConfig]);

  const handleChange = (key: string, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleAddAnnouncement = () => {
    if (!newAnn.title.trim() || !newAnn.content.trim()) {
      alert('Title and content are required');
      return;
    }
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnn.title,
      content: newAnn.content,
      date: new Date().toISOString(),
      link: newAnn.link || undefined
    };
    setAnnouncements(prev => [announcement, ...prev]);
    setNewAnn({ title: '', content: '', link: '' });
  };

  const handleRemoveAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const entries = [
      { key: 'announcements_title', value: draft.announcements_title || 'ANNOUNCEMENTS.' },
      { key: 'announcements_subtitle', value: draft.announcements_subtitle || 'Club News & Updates' },
      { key: 'announcements_list', value: JSON.stringify(announcements) }
    ];

    try {
      const { error } = await supabase.from('site_config').upsert(entries);
      if (error) throw error;
      const updates = entries.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {} as Record<string, string>);
      setSiteConfig(prev => ({ ...prev, ...updates }));
      alert('Announcements updated');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Announcements</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Manage club news and updates</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-60"
        >
          <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <Type size={14} />
            <span>Announcements Title</span>
          </div>
          <input
            value={draft.announcements_title || ''}
            onChange={(e) => handleChange('announcements_title', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
            placeholder="ANNOUNCEMENTS."
          />
        </label>
        <label className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <Type size={14} />
            <span>Subtitle</span>
          </div>
          <input
            value={draft.announcements_subtitle || ''}
            onChange={(e) => handleChange('announcements_subtitle', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
            placeholder="Club News & Updates"
          />
        </label>
      </div>

      {/* Add New Announcement */}
      <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Add New Announcement</p>
        <div className="space-y-3">
          <input
            value={newAnn.title}
            onChange={(e) => setNewAnn(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Announcement title"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
          />
          <textarea
            value={newAnn.content}
            onChange={(e) => setNewAnn(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Announcement content"
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all resize-none"
          />
          <input
            value={newAnn.link}
            onChange={(e) => setNewAnn(prev => ({ ...prev, link: e.target.value }))}
            placeholder="Optional link (e.g. https://...)"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
          />
          <button
            onClick={handleAddAnnouncement}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Plus size={16} /> Add Announcement
          </button>
        </div>
      </div>

      {/* Announcements List */}
      {announcements.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Active Announcements ({announcements.length})</p>
          {announcements.map((ann) => (
            <div key={ann.id} className="glass-card p-5 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-black text-lg">{ann.title}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1">{new Date(ann.date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleRemoveAnnouncement(ann.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{ann.content}</p>
              {ann.link && (
                <div className="flex items-center gap-2 text-[10px] text-emerald-400 pt-2">
                  <LinkIcon size={12} />
                  <a href={ann.link} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-300 underline truncate">
                    {ann.link}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTab;
