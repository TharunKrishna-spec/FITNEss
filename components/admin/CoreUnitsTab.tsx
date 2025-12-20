import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Save, Type, Plus, Trash2 } from 'lucide-react';
import { Role, Profile } from '../../types';

interface Props {
  siteConfig: Record<string, string>;
  setSiteConfig: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

interface CoreUnit {
  id: string;
  name: string;
  iconName: string;
}

const TEXT_FIELDS = [
  { key: 'core_units_title', label: 'Core Units Title', placeholder: 'CORE UNITS.' },
  { key: 'core_units_subtitle', label: 'Core Units Subtitle', placeholder: 'Architects of High Performance' }
];

const CoreUnitsTab: React.FC<Props> = ({ siteConfig, setSiteConfig }) => {
  const [draft, setDraft] = useState<Record<string, string>>(siteConfig);
  const [coreUnits, setCoreUnits] = useState<CoreUnit[]>([]);
  const [leadProfiles, setLeadProfiles] = useState<Profile[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  useEffect(() => {
    setDraft(siteConfig);
    // Parse core units list from config
    try {
      const unitsList = siteConfig.core_units_list ? JSON.parse(siteConfig.core_units_list) : [];
      setCoreUnits(unitsList);
    } catch {
      setCoreUnits([]);
    }

    // Fetch all leads
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', Role.LEAD)
          .order('name');
        if (error) throw error;
        setLeadProfiles(data || []);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      }
    };
    fetchLeads();
  }, [siteConfig]);

  const handleChange = (key: string, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleAddUnit = () => {
    if (!newUnitName.trim()) return;
    const newId = newUnitName.toLowerCase().replace(/\s+/g, '_');
    const newUnit: CoreUnit = {
      id: newId,
      name: newUnitName,
      iconName: 'Activity'
    };
    setCoreUnits(prev => [...prev, newUnit]);
    setNewUnitName('');
  };

  const handleRemoveUnit = (unitId: string) => {
    setCoreUnits(prev => prev.filter(u => u.id !== unitId));
    // Clean up fields for this unit
    setDraft(prev => {
      const newDraft = { ...prev };
      delete newDraft[`core_unit_${unitId}_img`];
      delete newDraft[`core_unit_${unitId}_lead`];
      return newDraft;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const entries = [
      ...TEXT_FIELDS.map(f => ({ key: f.key, value: draft[f.key] || '' })),
      { key: 'core_units_list', value: JSON.stringify(coreUnits) },
      { key: 'core_units_highlight', value: draft.core_units_highlight ?? 'true' }
    ];

    // Add image and lead fields for all core units
    coreUnits.forEach(unit => {
      entries.push({ key: `core_unit_${unit.id}_img`, value: draft[`core_unit_${unit.id}_img`] || '' });
      entries.push({ key: `core_unit_${unit.id}_lead_id`, value: draft[`core_unit_${unit.id}_lead_id`] || '' });
    });

    try {
      const { error } = await supabase.from('site_config').upsert(entries);
      if (error) throw error;
      const updates = entries.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {} as Record<string, string>);
      setSiteConfig(prev => ({ ...prev, ...updates }));
      alert('Core Units updated');
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
          <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Core Units</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Manage units, titles, images, and leads</p>
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
        {TEXT_FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400">
              <Type size={14} />
              <span>{label}</span>
            </div>
            <input
              value={draft[key] || ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
              placeholder={placeholder}
            />
          </label>
        ))}
      </div>

      {/* Add New Core Unit */}
      <div className="glass-card p-5 rounded-3xl border border-white/5 flex flex-col gap-3">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Add New Core Unit</p>
        <div className="flex gap-3">
          <input
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
            placeholder="e.g. Strategy & Planning"
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-all"
          />
          <button
            onClick={handleAddUnit}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Core Units Management */}
      {coreUnits.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Core Units ({coreUnits.length})</p>
          {coreUnits.map((unit) => (
            <div key={unit.id} className="glass-card p-5 rounded-3xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-lg">{unit.name}</p>
                  <p className="text-slate-500 text-xs">ID: {unit.id}</p>
                </div>
                <button
                  onClick={() => handleRemoveUnit(unit.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <label className="flex flex-col gap-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Image URL</div>
                  <input
                    value={draft[`core_unit_${unit.id}_img`] || ''}
                    onChange={(e) => handleChange(`core_unit_${unit.id}_img`, e.target.value)}
                    placeholder="https://..."
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Lead Person</div>
                  <select
                    value={draft[`core_unit_${unit.id}_lead_id`] || ''}
                    onChange={(e) => handleChange(`core_unit_${unit.id}_lead_id`, e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                  >
                    <option value="">Select a lead...</option>
                    {leadProfiles.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} - {lead.position}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="glass-card p-5 rounded-3xl border border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Highlight Core Units</p>
          <p className="text-slate-500 text-xs">Show the Active badge and accent glow</p>
        </div>
        <input
          type="checkbox"
          checked={(draft.core_units_highlight ?? 'true') !== 'false'}
          onChange={(e) => handleChange('core_units_highlight', e.target.checked ? 'true' : 'false')}
          className="w-5 h-5 rounded border-white/20 bg-white/5"
        />
      </div>
    </div>
  );
};

export default CoreUnitsTab;
