
import React from 'react';
import { Mail, Instagram, Send, ArrowUpRight, Sparkles, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContactPageProps {
  config: Record<string, string>;
}

const ContactPage: React.FC<ContactPageProps> = ({ config }) => {
  return (
    <div className="relative min-h-screen bg-[#020617] overflow-hidden">
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40vw] h-[40vw] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 pt-40 pb-32 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-3 text-emerald-500 mb-8 font-black uppercase tracking-[0.5em] text-[10px]">
              <Sparkles size={14} />
              <span>Join the Legacy</span>
            </div>
            
            <h1 className="text-6xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.85] mb-10 italic">
              JOIN THE <br /><span className="text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.15)' }}>CLUB.</span>
            </h1>
            
            <p className="text-slate-400 text-xl font-medium mb-16 max-w-xl leading-relaxed opacity-80">
              We're looking for passionate individuals to lead the next generation of campus fitness. Apply to be part of the Technical, Media, Logistics, or PR departments.
            </p>
            
            <div className="space-y-12">
              <div className="flex items-start space-x-6 group">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-all duration-500">
                  <Instagram size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-[11px] text-slate-500 mb-2">Follow the Journey</h4>
                  <a href="https://instagram.com/fitnessclub_vitcc" target="_blank" rel="noopener noreferrer" className="text-2xl font-black text-white hover:text-emerald-500 transition-colors">
                    @fitnessclub_vitcc
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 group">
                <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-all duration-500">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-[11px] text-slate-500 mb-2">Official Inquiry</h4>
                  <p className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{config.contact_email}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card rounded-[60px] p-10 md:p-16 border-white/5 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 text-white/[0.02] group-hover:text-emerald-500/[0.05] transition-colors pointer-events-none">
                <FileText size={200} />
              </div>

              <div className="relative z-10">
                <h3 className="text-3xl font-black uppercase tracking-tight mb-6">RECRUITMENT PORTAL</h3>
                <p className="text-slate-400 font-medium mb-12 leading-relaxed">
                  The primary application process is handled via Google Forms. Please ensure you are logged into your VIT student email to access the link.
                </p>

                <div className="space-y-6">
                  <a 
                    href={config.recruitment_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full py-8 px-10 bg-emerald-500 text-black rounded-[32px] font-black uppercase tracking-widest text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
                  >
                    <span>Open Application Form</span>
                    <ArrowUpRight size={28} />
                  </a>

                  <div className="p-8 rounded-[32px] bg-white/5 border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">What to prepare:</h4>
                    <ul className="space-y-3 text-sm font-medium text-slate-300">
                      <li className="flex items-center space-x-3 italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Brief intro about your fitness journey</span>
                      </li>
                      <li className="flex items-center space-x-3 italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Portfolio for Media/Design applicants</span>
                      </li>
                      <li className="flex items-center space-x-3 italic">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Available slots for personal interview</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-12 flex items-center justify-center space-x-3 text-slate-600 text-[9px] font-black uppercase tracking-[0.3em]">
                  <div className="w-8 h-px bg-white/5" />
                  <span>Cycle 2024-25 • Phase 1</span>
                  <div className="w-8 h-px bg-white/5" />
                </div>
              </div>
            </div>

            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -bottom-8 -left-8 glass-card p-6 rounded-3xl border-emerald-500/20 shadow-2xl hidden md:block"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-black">
                   <Send size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Applications Status</p>
                  <p className="text-lg font-black text-emerald-500 uppercase">Currently Live</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
