
import React, { useState } from 'react';
import { Role, Profile } from '../types';
import { Linkedin, Instagram, X as XIcon, ArrowUpRight, Trophy, Users, Shield, GraduationCap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingDock } from './FloatingDock';

interface Props {
  profiles: Profile[];
  config?: Record<string, string>;
}

const BoardMembersPage: React.FC<Props> = ({ profiles, config }) => {
  const [activeTab, setActiveTab] = useState<Role | 'All'>('All');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const filteredProfiles = activeTab === 'All' 
    ? [...profiles].sort((a,b) => (a.order_index || 0) - (b.order_index || 0))
    : profiles.filter(p => p.role === activeTab).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));

  const dockItems = [
    { 
      title: 'Show All', 
      icon: <Users size={20} />, 
      onClick: () => setActiveTab('All'), 
      active: activeTab === 'All' 
    },
    { 
      title: 'Board', 
      icon: <Shield size={20} />, 
      onClick: () => setActiveTab(Role.BOARD), 
      active: activeTab === Role.BOARD 
    },
    { 
      title: 'Leads', 
      icon: <Sparkles size={20} />, 
      onClick: () => setActiveTab(Role.LEAD), 
      active: activeTab === Role.LEAD 
    },
    { 
      title: 'Alumni', 
      icon: <GraduationCap size={20} />, 
      onClick: () => setActiveTab(Role.ALUMNI), 
      active: activeTab === Role.ALUMNI 
    },
  ];

  const boardTitle = config?.board_title || 'THE BOARD.';

  return (
    <div className="relative min-h-screen bg-[#020617] pb-48">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-[-10%] w-[60vw] h-[60vh] bg-emerald-500/[0.03] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[60vw] h-[60vh] bg-blue-500/[0.03] blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 pt-32 lg:pt-48 relative z-10">
        <div className="max-w-4xl mb-24 lg:mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-3 text-emerald-500 mb-6 font-black uppercase tracking-[0.5em] text-[9px]"
          >
            <div className="w-10 h-px bg-emerald-500/30" />
            <span>Operational High Command</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-8 leading-[0.8] italic"
          >
            {boardTitle.split('.').map((part, i) => (
              <React.Fragment key={i}>
                {part}{i === 0 && boardTitle.includes('.') && <br />}
              </React.Fragment>
            ))}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-80"
          >
            Student architects of the campus fitness revolution. Managing operations, technical coaching, and high-impact logistics for VIT Chennai's elite athletic community.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProfiles.map((profile, idx) => (
              <motion.div 
                key={profile.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                transition={{ duration: 0.6, delay: idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSelectedProfile(profile)}
                className="group relative h-[480px] lg:h-[540px] rounded-[48px] overflow-hidden cursor-pointer bg-slate-900/50 border border-white/[0.03] hover:border-emerald-500/20 transition-all duration-700 shadow-2xl"
              >
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
                  <span className="text-[14rem] font-black text-white/[0.02] uppercase rotate-90 leading-none whitespace-nowrap">
                    {profile.role.toUpperCase()}
                  </span>
                </div>

                <img 
                  src={profile.photo} 
                  alt={profile.name} 
                  className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.7] group-hover:grayscale-0 group-hover:scale-105 group-hover:brightness-100 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" 
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700" />

                <div className="absolute top-8 left-8">
                  <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-2xl border border-white/10 ${
                    profile.role === Role.BOARD ? 'bg-emerald-500 text-black' : 'bg-slate-900/80 text-white'
                  }`}>
                    {profile.position}
                  </div>
                </div>

                <div className="absolute bottom-10 left-10 right-10 translate-y-2 group-hover:translate-y-0 transition-all duration-700">
                  <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-[0.8] mb-4">
                    {profile.name.split(' ')[0]} <br />
                    <span className="text-xl text-slate-400 font-bold opacity-60 group-hover:text-emerald-500 group-hover:opacity-100 transition-all">{profile.name.split(' ').slice(1).join(' ')}</span>
                  </h3>
                  
                  <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <div className="h-px w-8 bg-emerald-500/30" />
                    <div className="flex space-x-3">
                       {profile.socials?.instagram && <Instagram size={14} className="text-slate-400 hover:text-pink-500 transition-colors" />}
                       {profile.socials?.linkedin && <Linkedin size={14} className="text-slate-400 hover:text-blue-500 transition-colors" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-[100] px-6 pointer-events-none">
        <div className="container mx-auto flex justify-center pointer-events-auto">
          <FloatingDock items={dockItems} />
        </div>
      </div>

      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl" 
              onClick={() => setSelectedProfile(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              className="relative w-full max-w-5xl h-full lg:h-auto max-h-[90vh] glass-card rounded-[48px] border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => setSelectedProfile(null)}
                className="absolute top-8 right-8 p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all z-20"
              >
                <XIcon size={24} />
              </button>
              
              <div className="flex flex-col lg:flex-row h-full">
                <div className="w-full lg:w-5/12 h-[350px] lg:h-auto relative">
                  <img src={selectedProfile.photo} className="w-full h-full object-cover grayscale" alt={selectedProfile.name} />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/90 hidden lg:block" />
                </div>
                <div className="p-10 lg:p-16 lg:w-7/12 overflow-y-auto flex flex-col justify-center bg-slate-900/40">
                  <div className="text-emerald-400 text-[9px] font-black uppercase tracking-[0.5em] mb-6 flex items-center">
                    <Sparkles size={12} className="mr-2" />
                    {selectedProfile.role} • {selectedProfile.tenure}
                  </div>
                  <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter mb-4 leading-none italic">{selectedProfile.name}</h2>
                  <p className="text-xl text-white/40 font-bold mb-10 uppercase tracking-wide">{selectedProfile.position}</p>
                  
                  <div className="space-y-10">
                    <div className="relative">
                       <Quote className="absolute -top-6 -left-8 text-emerald-500/10" size={80} />
                       <p className="text-lg lg:text-xl text-slate-300 leading-relaxed font-medium relative z-10 italic opacity-90">
                         "{selectedProfile.bio}"
                       </p>
                    </div>
                    
                    {selectedProfile.achievements && selectedProfile.achievements.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-white/30 text-[9px] font-black uppercase tracking-widest flex items-center">
                          <Trophy size={12} className="mr-2 text-yellow-500" /> Strategic Milestones
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                          {selectedProfile.achievements.map((ach, idx) => (
                            <div key={idx} className="bg-white/5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:border-emerald-500/30 transition-all duration-300">
                              {ach}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-12 lg:mt-16 flex items-center space-x-4">
                    <button className="flex-grow py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/20">
                      Request Mentorship
                    </button>
                    <div className="flex space-x-2">
                       {selectedProfile.socials?.instagram && (
                         <a href={selectedProfile.socials.instagram} target="_blank" className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                            <Instagram size={20} className="text-slate-400 hover:text-white transition-colors" />
                         </a>
                       )}
                       {selectedProfile.socials?.linkedin && (
                         <a href={selectedProfile.socials.linkedin} target="_blank" className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5">
                            <Linkedin size={20} className="text-slate-400 hover:text-white transition-colors" />
                         </a>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Quote = ({ className, size }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 15.1046 21.017 14V9C21.017 7.89543 20.1216 7 19.017 7H16.017C14.9124 7 14.017 7.89543 14.017 9V12M3.01697 21L3.01697 18C3.01697 16.8954 3.9124 16 5.01697 16H8.01697C9.12154 16 10.017 15.1046 10.017 14V9C10.017 7.89543 9.12154 7 8.01697 7H5.01697C3.9124 7 3.01697 7.89543 3.01697 9V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default BoardMembersPage;
