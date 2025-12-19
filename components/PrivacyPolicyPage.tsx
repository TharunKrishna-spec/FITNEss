
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Lock, Database } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] pt-40 pb-32 relative overflow-hidden">
      <div className="absolute top-0 right-[-10%] w-[60vw] h-[60vh] bg-emerald-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center space-x-3 text-emerald-500 mb-6 font-black uppercase tracking-[0.5em] text-[10px]">
            <ShieldCheck size={14} />
            <span>Legal Archive</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic mb-8">PRIVACY <br /><span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>PROTOCOL.</span></h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed uppercase tracking-widest">Effective Date: June 01, 2024</p>
        </motion.div>

        <div className="space-y-16">
          <section className="glass-card p-10 md:p-14 rounded-[40px] border-white/5">
            <div className="flex items-center space-x-4 mb-8">
              <Eye className="text-emerald-500" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tight">1. Data Acquisition</h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed mb-6">
              Fitness Club collects specific metrics to optimize your athletic experience. This includes personal identifiers (Name, VIT Email, Reg No) and performance telemetry (Lift maxes, physical benchmarks).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-white font-black uppercase tracking-widest text-xs mb-2">Member Data</p>
                <p className="text-slate-500 text-sm">Stored securely for club authentication and member roster management.</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-emerald-500 font-black uppercase tracking-widest text-xs mb-2">Performance Data</p>
                <p className="text-slate-500 text-sm">Used exclusively for Hall of Fame rankings and campus strength leaderboards.</p>
              </div>
            </div>
          </section>

          <section className="glass-card p-10 md:p-14 rounded-[40px] border-white/5">
            <div className="flex items-center space-x-4 mb-8">
              <Database className="text-blue-500" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tight">2. Secure Storage</h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed mb-6">
              All data is processed through Supabase Cloud infrastructure with AES-256 level encryption. We do not sell your biometric or personal data to third-party advertisers.
            </p>
            <div className="flex items-center space-x-3 text-emerald-500/50 italic text-sm font-black uppercase tracking-widest">
              <Lock size={14} />
              <span>Club Security Protocol Active</span>
            </div>
          </section>

          <section className="glass-card p-10 md:p-14 rounded-[40px] border-white/5">
            <div className="flex items-center space-x-4 mb-8">
              <ShieldCheck className="text-slate-500" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tight">3. User Sovereignty</h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Members reserve the right to request full data erasure from the Club Archive at any time. To purge your record, contact the Board via the recruitment portal.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;