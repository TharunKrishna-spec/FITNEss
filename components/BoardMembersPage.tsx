
import React, { useState } from 'react';
import { Role, Profile } from '../types';
import { Linkedin, Instagram, X as XIcon, ArrowUpRight, Trophy, Users, Shield, GraduationCap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingDock } from './FloatingDock';

interface Props {
  profiles: Profile[];
  config?: Record<string, string>;
}

// Enhanced Profile Card Component with stunning animations
const ProfileCard = ({ profile, onClick, featured, delay = 0, index = 0 }: {
  profile: Profile;
  onClick: () => void;
  featured?: boolean;
  delay?: number;
  index?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 60, rotateX: 15 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        rotateY: isHovered ? mousePosition.x * 10 : 0,
        rotateZ: isHovered ? mousePosition.x * 2 : 0,
      }}
      exit={{ opacity: 0, scale: 0.8, y: 60 }}
      whileHover={{
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      transition={{
        duration: 0.8,
        delay: delay + index * 0.1,
        ease: [0.22, 1, 0.36, 1],
        rotateY: { duration: 0.1 },
        rotateZ: { duration: 0.1 }
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={`group relative rounded-[48px] overflow-hidden cursor-pointer bg-slate-900/50 transition-all duration-500 ${featured ? 'w-[320px] h-[420px] lg:w-[380px] lg:h-[500px]' : 'w-[280px] h-[380px] lg:w-[320px] lg:h-[440px]'
        }`}
    >
      {/* Animated Glow Border */}
      <motion.div
        className="absolute -inset-[2px] rounded-[50px] z-0"
        animate={{
          background: isHovered
            ? [
              'linear-gradient(0deg, #10b981, #3b82f6, #8b5cf6, #10b981)',
              'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #10b981)',
              'linear-gradient(180deg, #10b981, #3b82f6, #8b5cf6, #10b981)',
              'linear-gradient(270deg, #10b981, #3b82f6, #8b5cf6, #10b981)',
              'linear-gradient(360deg, #10b981, #3b82f6, #8b5cf6, #10b981)',
            ]
            : 'linear-gradient(0deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))'
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner card */}
      <div className="absolute inset-[2px] rounded-[46px] overflow-hidden bg-slate-900 z-10">
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          {isHovered && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: [0, 1, 0], y: -100 }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                className="absolute left-[20%] bottom-0 w-1 h-1 bg-emerald-400 rounded-full blur-[1px]"
              />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: [0, 1, 0], y: -100 }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute left-[50%] bottom-0 w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px]"
              />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: [0, 1, 0], y: -100 }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute left-[80%] bottom-0 w-1 h-1 bg-purple-400 rounded-full blur-[1px]"
              />
            </>
          )}
        </div>

        {/* Background text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0"
          animate={{ opacity: isHovered ? 0.05 : 0.02 }}
        >
          <span className="text-[14rem] font-black text-white uppercase rotate-90 leading-none whitespace-nowrap">
            {profile.role.toUpperCase()}
          </span>
        </motion.div>

        {/* Profile Image */}
        <motion.img
          src={profile.photo}
          alt={profile.name}
          animate={{
            scale: isHovered ? 1.1 : 1,
            filter: isHovered ? 'grayscale(0%) brightness(1)' : 'grayscale(100%) brightness(0.6)'
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"
          animate={{ opacity: isHovered ? 0.6 : 0.85 }}
          transition={{ duration: 0.5 }}
        />

        {/* Hover glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Laser Scanning Effect */}
        <motion.div
          className="absolute inset-x-0 h-[2px] bg-emerald-400/50 shadow-[0_0_15px_#10b981] z-40 pointer-events-none"
          initial={{ top: '-10%' }}
          animate={isHovered ? { top: '110%' } : { top: '-10%' }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            ease: "linear",
            repeatDelay: 0.5
          }}
        />

        {/* Dynamic Glass Reflection */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-30 pointer-events-none"
          animate={{
            x: isHovered ? mousePosition.x * 50 : 0,
            y: isHovered ? mousePosition.y * 50 : 0,
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />

        {/* Position Badge */}
        <motion.div
          className="absolute top-6 left-6 z-30"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: delay + 0.3, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-2xl border shadow-lg ${profile.role === Role.BOARD
              ? 'bg-emerald-500 text-black border-emerald-400/50 shadow-emerald-500/30'
              : 'bg-slate-900/80 text-white border-white/10'
              }`}
          >
            {profile.position}
          </motion.div>
        </motion.div>

        {/* Featured Crown for Chair Person */}
        {featured && (
          <motion.div
            className="absolute top-6 right-6 z-30"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: delay + 0.5, type: "spring", stiffness: 200 }}
          >
            <div className="w-10 h-10 bg-yellow-500/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-yellow-500/30">
              <Sparkles size={18} className="text-yellow-400" />
            </div>
          </motion.div>
        )}

        {/* Name and Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-30">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delay + 0.4, duration: 0.6 }}
          >
            <motion.h3
              className={`font-black uppercase tracking-tighter leading-[0.85] mb-3 ${featured ? 'text-3xl lg:text-4xl' : 'text-2xl lg:text-3xl'}`}
              animate={{
                textShadow: isHovered ? '0 0 30px rgba(16, 185, 129, 0.5)' : '0 0 0px rgba(16, 185, 129, 0)'
              }}
            >
              {profile.name.split(' ')[0]}
              <br />
              <motion.span
                className="text-lg font-bold"
                animate={{
                  color: isHovered ? '#10b981' : '#94a3b8',
                  opacity: isHovered ? 1 : 0.6
                }}
                transition={{ duration: 0.3 }}
              >
                {profile.name.split(' ').slice(1).join(' ')}
              </motion.span>
            </motion.h3>

            {/* Social Links with stagger animation */}
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.div
                className="h-px bg-gradient-to-r from-emerald-500 to-transparent"
                animate={{ width: isHovered ? 32 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <div className="flex space-x-3">
                {profile.socials?.instagram && (
                  <motion.div whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }}>
                    <Instagram size={16} className="text-slate-400 hover:text-pink-500 transition-colors cursor-pointer" />
                  </motion.div>
                )}
                {profile.socials?.linkedin && (
                  <motion.div whileHover={{ scale: 1.2, y: -2 }} whileTap={{ scale: 0.9 }}>
                    <Linkedin size={16} className="text-slate-400 hover:text-blue-500 transition-colors cursor-pointer" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const BoardMembersPage: React.FC<Props> = ({ profiles, config }) => {
  const [activeTab, setActiveTab] = useState<Role>(Role.BOARD);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Get profiles for pyramid layout (Core team)
  const coreProfiles = profiles.filter(p => p.role === Role.BOARD).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const leadProfiles = profiles.filter(p => p.role === Role.LEAD).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
  const alumniProfiles = profiles.filter(p => p.role === Role.ALUMNI).sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

  // Pyramid structure for core team
  const chairPerson = coreProfiles.find(p => p.position === 'Chair Person');
  const advisory = coreProfiles.find(p => p.position === 'Advisory');
  const coChairs = coreProfiles.filter(p => p.position === 'Co-Chair');
  const generalSecretaries = coreProfiles.filter(p => p.position === 'General Secretary');

  const dockItems = [
    {
      title: 'Core',
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
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Neural Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <motion.div
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 60, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-10%] w-[70vw] h-[70vh] bg-emerald-500/[0.05] blur-[150px] rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -30, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] left-[-10%] w-[70vw] h-[70vh] bg-blue-500/[0.05] blur-[150px] rounded-full"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <div className="container mx-auto px-6 pt-32 lg:pt-48 relative z-10">
        <div className="max-w-4xl mb-24 lg:mb-32">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center space-x-3 text-emerald-500 mb-8 font-black uppercase tracking-[0.5em] text-[10px]"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 40 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-px bg-emerald-500/50"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Operational High Command
            </motion.span>
          </motion.div>

          <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8] italic flex flex-wrap gap-x-6">
            {boardTitle.split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 1,
                  delay: 0.2 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="inline-block origin-bottom"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-slate-400 text-lg md:text-2xl font-medium max-w-2xl leading-relaxed opacity-80 border-l-2 border-emerald-500/20 pl-8"
          >
            Student architects of the campus fitness revolution. Managing operations, technical coaching, and high-impact logistics for VIT Chennai's elite athletic community.
          </motion.p>
        </div>

        {/* Core Team - Pyramid Layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === Role.BOARD && (
              <div className="space-y-20 lg:space-y-32">
                {chairPerson && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex justify-center"
                  >
                    <ProfileCard profile={chairPerson} onClick={() => setSelectedProfile(chairPerson)} featured />
                  </motion.div>
                )}

                {advisory && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center"
                  >
                    <ProfileCard profile={advisory} onClick={() => setSelectedProfile(advisory)} />
                  </motion.div>
                )}

                {coChairs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center gap-8 lg:gap-16 flex-wrap"
                  >
                    {coChairs.map((profile, idx) => (
                      <ProfileCard key={profile.id} profile={profile} onClick={() => setSelectedProfile(profile)} index={idx} delay={0.1} />
                    ))}
                  </motion.div>
                )}

                {generalSecretaries.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center gap-8 lg:gap-16 flex-wrap"
                  >
                    {generalSecretaries.map((profile, idx) => (
                      <ProfileCard key={profile.id} profile={profile} onClick={() => setSelectedProfile(profile)} index={idx} delay={0.1} />
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === Role.LEAD && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                {leadProfiles.length > 0 ? leadProfiles.map((profile, idx) => (
                  <ProfileCard key={profile.id} profile={profile} onClick={() => setSelectedProfile(profile)} index={idx} />
                )) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-32 bg-white/5 rounded-[48px] border border-white/10"
                  >
                    <p className="text-slate-500 text-xl font-black uppercase tracking-widest italic">Recruiting Elite Leads</p>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === Role.ALUMNI && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                {alumniProfiles.length > 0 ? alumniProfiles.map((profile, idx) => (
                  <ProfileCard key={profile.id} profile={profile} onClick={() => setSelectedProfile(profile)} index={idx} />
                )) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full text-center py-32 bg-white/5 rounded-[48px] border border-white/10"
                  >
                    <p className="text-slate-500 text-xl font-black uppercase tracking-widest italic">Building a Legacy</p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
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
    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 15.1046 21.017 14V9C21.017 7.89543 20.1216 7 19.017 7H16.017C14.9124 7 14.017 7.89543 14.017 9V12M3.01697 21L3.01697 18C3.01697 16.8954 3.9124 16 5.01697 16H8.01697C9.12154 16 10.017 15.1046 10.017 14V9C10.017 7.89543 9.12154 7 8.01697 7H5.01697C3.9124 7 3.01697 7.89543 3.01697 9V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default BoardMembersPage;
