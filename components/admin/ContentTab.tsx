import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Save, Image as ImageIcon, Link as LinkIcon, Type } from 'lucide-react';

interface Props {
  siteConfig: Record<string, string>;
  setSiteConfig: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const presetFields = [
  { key: 'hero_title', label: 'Hero Title', icon: Type },
  { key: 'hero_subtitle', label: 'Hero Subtitle', icon: Type },
  { key: 'hero_image', label: 'Hero Image URL', icon: ImageIcon },
  { key: 'who_are_we_title', label: 'Who Are We Title', icon: Type },
  { key: 'who_are_we_subtitle', label: 'Who Are We Description', icon: Type },
  { key: 'board_title', label: 'Board Section Title', icon: Type },
  { key: 'events_title', label: 'Events Section Title', icon: Type },
  { key: 'hall_title', label: 'Hall Section Title', icon: Type },
  { key: 'core_units_title', label: 'Core Units Title', icon: Type },
  { key: 'core_units_subtitle', label: 'Core Units Subtitle', icon: Type },
  { key: 'join_form_link', label: 'Join Us / Recruitment Google Form Link', icon: LinkIcon },
  { key: 'footer_text', label: 'Footer Description', icon: Type },
  { key: 'contact_email', label: 'Contact Email', icon: LinkIcon },
  { key: 'contact_instagram', label: 'Instagram Link', icon: LinkIcon },
  { key: 'contact_linkedin', label: 'LinkedIn Link', icon: LinkIcon }
];

const ContentTab: React.FC<Props> = ({ siteConfig, setSiteConfig }) => {
  const [draft, setDraft] = useState<Record<string, string>>(siteConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(siteConfig);
  }, [siteConfig]);

  const handleChange = (key: string, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const entries = Object.entries(draft).map(([key, value]) => ({ key, value }));
    try {
      const { error } = await supabase.from('site_config').upsert(entries);
      if (error) throw error;
      setSiteConfig(draft);
      alert('Content updated');
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
          <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Content Controls</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Edit public copy, images, and links</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-4 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl disabled:opacity-60"
        >
          <Save size={16} /> {isSaving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presetFields.map(({ key, label, icon: Icon }) => (
          <label key={key} className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Icon size={14} />
              <span>{label}</span>
            </div>
            <input
              value={draft[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
              placeholder={label}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default ContentTab;
