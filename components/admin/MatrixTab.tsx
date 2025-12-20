
import React, { useState, useEffect } from 'react';
import { Event, ScoreColumn, EventScore } from '../../types';
import { Save, Loader2, Table as TableIcon, Trash2, UserPlus, Settings2, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';

const generateId = () => crypto.randomUUID();

const MatrixTab: React.FC<{ events: Event[] }> = ({ events }) => {
  const [selectedEventId, setSelectedEventId] = useState('');
  const [scores, setScores] = useState<EventScore[]>([]);
  const [schema, setSchema] = useState<ScoreColumn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSchemaOpen, setIsSchemaOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  useEffect(() => {
    if (selectedEvent) {
      setSchema(selectedEvent.score_schema || []);
      fetchScores(selectedEvent.id);
    } else {
      setScores([]);
      setSchema([]);
    }
  }, [selectedEventId]);

  const fetchScores = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('event_scores').select('*').eq('event_id', id);
      if (error) throw error;
      setScores(data || []);
    } catch (err: any) {
      setFeedback({ type: 'error', message: "Registry link failed. Run SQL setup script." });
    } finally {
      setIsLoading(false);
    }
  };

  const syncMatrix = async () => {
    if (!selectedEventId) return;
    setIsSyncing(true);
    setFeedback(null);
    
    try {
      // 1. Update schema on event
      const { error: schemaError } = await supabase
        .from('events')
        .update({ score_schema: schema })
        .eq('id', selectedEventId);
      
      if (schemaError) throw schemaError;

      // 2. Prepare payload for scores
      // Supabase expects row-per-athlete for event_scores table
      const payload = scores.map(s => ({
        id: s.id || generateId(),
        event_id: selectedEventId,
        athlete_name: s.athlete_name.trim().toUpperCase(),
        data: s.data, // This is our jsonb object
        total: s.total
      }));

      const { error: dataError } = await supabase.from('event_scores').upsert(payload, { onConflict: 'id' });
      if (dataError) throw dataError;

      setFeedback({ type: 'success', message: "Telemetry Grid Synchronized" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const updateScoreValue = (id: string, colId: string, val: string) => {
    const numVal = Number(val);
    setScores(prev => prev.map(s => {
      if (s.id === id) {
        const newData = { ...s.data, [colId]: numVal };
        let total = 0;
        schema.forEach(c => {
          if (c.isTotalComponent) total += Number(newData[c.id] || 0);
        });
        return { ...s, data: newData, total };
      }
      return s;
    }));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
        <div>
          <h2 className="text-7xl font-black uppercase tracking-tighter italic leading-none">Scoring Matrix</h2>
          <p className="text-slate-500 uppercase tracking-[0.5em] text-[10px] mt-6 font-black italic">Ops Layer 02 Active</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <select 
            value={selectedEventId} 
            onChange={e => setSelectedEventId(e.target.value)} 
            className="flex-grow lg:w-[400px] bg-slate-900 border border-white/10 rounded-[28px] px-8 py-6 text-white text-[12px] font-black uppercase outline-none focus:border-emerald-500 shadow-2xl transition-all"
          >
            <option value="">-- SELECT OPS CYCLE --</option>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
          </select>
          {selectedEventId && (
            <button onClick={syncMatrix} disabled={isSyncing} className="bg-emerald-500 text-black px-12 py-6 rounded-[28px] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all">
              {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Commit Grid
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-6 rounded-3xl border flex items-center gap-4 font-black uppercase text-[10px] tracking-widest ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />} {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedEventId ? (
        <div className="space-y-10">
          <div className="flex gap-4">
            <button onClick={() => setScores([...scores, { id: generateId(), event_id: selectedEventId, athlete_name: "ATHLETE NAME", data: {}, total: 0 }])} className="flex items-center gap-4 bg-white/5 hover:bg-emerald-500 hover:text-black px-10 py-6 rounded-[32px] text-[10px] font-black uppercase transition-all border border-white/5">
              <UserPlus size={18} /> Add Athlete
            </button>
            <button onClick={() => setIsSchemaOpen(true)} className="flex items-center gap-4 bg-white/5 hover:bg-slate-800 px-10 py-6 rounded-[32px] text-[10px] font-black uppercase transition-all border border-white/5">
              <Settings2 size={18} /> Matrix Schema
            </button>
          </div>

          <div className="glass-card rounded-[64px] overflow-hidden border-white/5 shadow-2xl">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="p-10 text-[10px] font-black uppercase text-slate-500 border-b border-white/5 italic">Rank</th>
                    <th className="p-10 text-[10px] font-black uppercase text-slate-500 border-b border-white/5 italic">Identity</th>
                    {schema.map(c => <th key={c.id} className="p-10 text-[10px] font-black uppercase text-emerald-500 border-b border-white/5 text-center">{c.name}</th>)}
                    <th className="p-10 text-[10px] font-black uppercase text-yellow-500 border-b border-white/5 text-center">Total</th>
                    <th className="p-10 border-b border-white/5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {scores.sort((a,b) => b.total - a.total).map((s, idx) => (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-10"><span className={`text-4xl font-black italic ${idx < 3 ? 'text-yellow-500' : 'text-slate-800'}`}>#{(idx + 1)}</span></td>
                      <td className="p-10">
                        <input type="text" value={s.athlete_name} onChange={e => setScores(scores.map(row => row.id === s.id ? { ...row, athlete_name: e.target.value.toUpperCase() } : row))} className="bg-transparent text-3xl font-black text-white italic outline-none uppercase tracking-tighter w-full focus:text-emerald-500 transition-colors" />
                      </td>
                      {schema.map(c => (
                        <td key={c.id} className="p-10 text-center">
                          <input type="number" value={s.data[c.id] || ''} onChange={e => updateScoreValue(s.id, c.id, e.target.value)} className="bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-center text-emerald-400 font-mono text-2xl outline-none w-28 focus:border-emerald-500" />
                        </td>
                      ))}
                      <td className="p-10 text-center text-5xl font-black text-yellow-500 italic">{s.total}</td>
                      <td className="p-10 text-right">
                        <button onClick={() => setScores(scores.filter(row => row.id !== s.id))} className="p-4 bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 size={20} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {scores.length === 0 && <div className="py-40 text-center text-slate-800 uppercase tracking-widest font-black italic">Grid Unpopulated</div>}
          </div>
        </div>
      ) : (
        <div className="py-64 flex flex-col items-center justify-center glass-card rounded-[100px] border-white/5 shadow-2xl border-dashed">
          <TableIcon className="text-slate-900 mb-12 animate-pulse" size={140} />
          <p className="text-slate-700 uppercase tracking-[1em] font-black text-[12px] italic">Awaiting Cycle Selection</p>
        </div>
      )}

      {/* Schema Editor */}
      <AnimatePresence>
        {isSchemaOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl" onClick={() => setIsSchemaOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl glass-card rounded-[64px] p-16 border-white/10 shadow-2xl">
              <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-10 text-white">Grid Schema</h3>
              <div className="space-y-4 mb-12">
                {schema.map(col => (
                  <div key={col.id} className="p-6 bg-white/[0.03] border border-white/5 rounded-[32px] flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black text-white italic uppercase">{col.name}</p>
                      <p className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">{col.isTotalComponent ? 'Aggregating to Total' : 'Metadata Only'}</p>
                    </div>
                    <button onClick={() => setSchema(schema.filter(c => c.id !== col.id))} className="p-4 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={20} /></button>
                  </div>
                ))}
                <button onClick={() => { const n = prompt("Metric Name?"); if(n) setSchema([...schema, { id: Math.random().toString(36).substr(2, 9), name: n.toUpperCase(), type: 'number', isTotalComponent: true }]); }} className="w-full py-6 border-2 border-dashed border-white/5 rounded-[32px] text-[11px] font-black uppercase text-slate-600 hover:text-white transition-all">Append Metric</button>
              </div>
              <button onClick={() => setIsSchemaOpen(false)} className="w-full py-8 bg-emerald-500 text-black rounded-[32px] font-black uppercase tracking-widest text-[11px]">Save Schema Architecture</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatrixTab;
