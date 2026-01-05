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
  const [uploading, setUploading] = useState(false);

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

  const validateImageUrl = (url: string) => {
    if (!url) return false;
    try {
      const u = new URL(url);
      return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(u.pathname) || /^https?:\/\//i.test(url);
    } catch {
      return false;
    }
  };

  const setLogoFromUrl = async (url: string) => {
    if (!url) return alert('Please enter a URL');
    if (!validateImageUrl(url)) {
      // try loading the image to be sure
      try {
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          const timeout = setTimeout(() => reject(new Error('Image load timed out')), 5000);
          img.onload = () => { clearTimeout(timeout); resolve(); };
          img.onerror = () => { clearTimeout(timeout); reject(new Error('Image failed to load')); };
          img.src = url;
        });
      } catch (err: any) {
        return alert('Provided URL is not a valid or reachable image');
      }
    }

    try {
      const { error } = await supabase.from('site_config').upsert([{ key: 'logo_url', value: url }]);
      if (error) throw error;
      setDraft(prev => ({ ...prev, logo_url: url }));
      setSiteConfig(prev => ({ ...prev, logo_url: url }));
      alert('Logo URL saved');
    } catch (err: any) {
      alert(`Save failed: ${err.message || err}`);
    }
  };

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const bucket = draft.storage_bucket || 'site-assets';
      const filePath = `branding/logo-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl || '';

      // persist to site_config right away
      const entries = [
        { key: 'logo_url', value: publicUrl },
        { key: 'storage_bucket', value: bucket }
      ];
      const { error: upsertError } = await supabase.from('site_config').upsert(entries);
      if (upsertError) throw upsertError;

      setDraft(prev => ({ ...prev, logo_url: publicUrl, storage_bucket: bucket }));
      setSiteConfig(prev => ({ ...prev, logo_url: publicUrl, storage_bucket: bucket }));
      alert('Logo uploaded and saved');
    } catch (err: any) {
      alert(`Upload failed: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    await uploadLogo(f);
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
        {/* Logo card (first item) */}
        <div className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <ImageIcon size={16} className="text-slate-300" />
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest">Site Logo</div>
              <p className="text-[10px] text-slate-400">Upload or paste a public image URL to update the header/footer logo</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {draft.logo_url ? (
              <img src={draft.logo_url} alt="Logo" className="h-16 object-contain rounded-md" />
            ) : (
              <div className="h-16 w-16 bg-white/3 rounded-md flex items-center justify-center text-slate-400 font-black">Logo</div>
            )}

            <div className="flex-1 flex flex-col gap-2">
              <input
                value={draft.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none"
              />
              <div className="flex items-center gap-2">
                <button onClick={() => setLogoFromUrl(draft.logo_url || '')} className="px-4 py-2 bg-emerald-500 text-black rounded-2xl text-[10px] font-black uppercase">Use URL</button>
                <label className="px-4 py-2 bg-white/5 rounded-2xl cursor-pointer text-[10px] font-black uppercase">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {uploading ? 'Uploading...' : 'Upload File'}
                </label>
                {draft.logo_url && (
                  <button onClick={async () => {
                    try {
                      await supabase.from('site_config').upsert([{ key: 'logo_url', value: '' }]);
                      setDraft(prev => ({ ...prev, logo_url: '' }));
                      setSiteConfig(prev => ({ ...prev, logo_url: '' }));
                      alert('Logo removed');
                    } catch (err: any) {
                      alert(`Remove failed: ${err.message || err}`);
                    }
                  }} className="px-4 py-2 bg-red-500/10 rounded-2xl text-[10px] font-black uppercase text-red-400">Remove</button>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Storage Bucket</label>
                <input
                  value={draft.storage_bucket || ''}
                  onChange={(e) => handleChange('storage_bucket', e.target.value)}
                  placeholder="site-assets"
                  className="mt-2 w-56 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Other content fields */}
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
