
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Gavel, Users, Zap } from 'lucide-react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#020617] pt-40 pb-32 relative overflow-hidden">
      <div className="absolute bottom-0 left-[-10%] w-[60vw] h-[60vh] bg-blue-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center space-x-3 text-blue-500 mb-6 font-black uppercase tracking-[0.5em] text-[10px]">
            <Gavel size={14} />
            <span>Code of Conduct</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter italic mb-8">CLUB <br /><span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>CHARTER.</span></h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed uppercase tracking-widest">Version 2.4 | System Wide Apply</p>
        </motion.div>

        <div className="space-y-16">
          <section className="glass-card p-10 md:p-14 rounded-[40px] border-white/5">
            <div className="flex items-center space-x-4 mb-8">
              <Users className="text-emerald-500" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tight">1. Eligibility</h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Membership is restricted to active students, faculty, and alumni of VIT Chennai. Misrepresentation of student status will result in immediate termination of "Board Access" and removal from the Hall of Fame.
            </p>
          </section>

          <section className="glass-card p-10 md:p-14 rounded-[40px] border-white/5">
            <div className="flex items-center space-x-4 mb-8">
              <Zap className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tight">2. Assumption of Risk</h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed mb-6">
              Fitness Club events involve high-intensity physical activity. By participating, you acknowledge and assume full responsibility for any physical injury. Professional form and safety protocols are mandatory at all club sanctioned events.
            </p>
            <div className="p-6 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
              <p className="text-yellow-500 font-black uppercase tracking-[0.2em] text-[10px]">Mandatory Notice:</p>
              <p className="text-slate-400 text-sm italic">Fitness Club Board Members are not medical professionals. Consult with campus physicians before beginning any extreme strength protocol.</p>
            </div>
          </section>

          <section className="glass-card p-10 md:p-14 rounded-[40px] border-white/5">
            <div className="flex items-center space-x-4 mb-8">
              <FileText className="text-blue-500" size={24} />
              <h2 className="text-2xl font-black uppercase tracking-tight">3. Board Authority</h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              The Club President and Board reserve the right to modify Hall of Fame records, event schedules, and recruitment eligibility without prior notification. Decisions made during campus strength competitions are final.
            </p>
          </section>
        </div>

        <div className="mt-20 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Stronger Together. Disciplined Always.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;