import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Zap, Heart, Target, Shield, Activity, ChevronDown } from 'lucide-react';
import { Profile } from '../types';

interface JoinPageProps {
  config: Record<string, string>;
  profiles?: Profile[];
}

const JoinPage: React.FC<JoinPageProps> = ({ config, profiles = [] }) => {
  const joinFormLink = config.join_form_link || 'https://forms.google.com/placeholder';

  // Parse dynamic core units from config
  const dynamicCoreUnits = (() => {
    try {
      const unitsList = config.core_units_list ? JSON.parse(config.core_units_list) : [];
      if (unitsList.length > 0) {
        return unitsList.map((unit: any) => ({
          id: unit.id,
          name: unit.name,
          icon: Activity,
          desc: unit.desc || 'Core unit',
          scope: unit.scope || [],
          color: 'from-emerald-500 to-teal-600',
          glow: 'rgba(16, 185, 129, 0.3)',
          img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800'
        }));
      }
    } catch {}
    // Fallback to default departments
    return [
      {
        id: 'TECH',
        name: 'Scientific Training',
        icon: Zap,
        desc: 'The biomechanical core of our operations.',
        scope: ['Form Analysis', 'Periodization', 'Coaching Clinics', 'Nutrition Logic'],
        color: 'from-emerald-500 to-teal-600',
        glow: 'rgba(16, 185, 129, 0.3)',
        img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800'
      },
      {
        id: 'MEDIA',
        name: 'Creative Narrative',
        icon: Users,
        desc: 'The visual heartbeat of the club.',
        scope: ['Action Photography', 'Cinematic Edits', 'Visual Branding', 'Web Design'],
        color: 'from-blue-500 to-indigo-600',
        glow: 'rgba(59, 130, 246, 0.3)',
        img: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800'
      },
      {
        id: 'LOGS',
        name: 'Event Architecture',
        icon: Target,
        desc: 'The masterminds behind VIT\'s biggest strength events.',
        scope: ['Campus Clash', 'Indoor Strength Open', 'Workshops', 'Logistics'],
        color: 'from-purple-500 to-fuchsia-600',
        glow: 'rgba(168, 85, 247, 0.3)',
        img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200'
      },
      {
        id: 'PR',
        name: 'Strategic Outreach',
        icon: Shield,
        desc: 'The voice that resonates across VIT Chennai.',
        scope: ['Brand Relations', 'Campus PR', 'Member Relations', 'Sponsorships'],
        color: 'from-red-500 to-orange-600',
        glow: 'rgba(239, 68, 68, 0.3)',
        img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800'
      }
    ];
  })();

  // Parse FAQs from config
  const faqs = (() => {
    try {
      const faqList = config.faq_list ? JSON.parse(config.faq_list) : [];
      if (faqList.length > 0) {
        return faqList;
      }
    } catch {}
    // Default FAQs
    return [
      {
        id: '1',
        question: 'Who can join the Fitness Club?',
        answer: 'Any VIT Chennai student passionate about fitness, athletics, or sports management is welcome to apply. We look for dedication, passion, and willingness to learn, not just current fitness levels.'
      },
      {
        id: '2',
        question: 'Do I need prior experience in fitness or athletics?',
        answer: 'Not necessarily! While experience helps, we value enthusiasm and commitment equally. Different departments require different skills - Technical needs training knowledge, Media needs creative skills, etc.'
      },
      {
        id: '3',
        question: 'What is the application process?',
        answer: 'Submit the Google Form, attend an interview if shortlisted, and complete a trial period. The entire process typically takes 2-3 weeks.'
      },
      {
        id: '4',
        question: 'Is there a membership fee?',
        answer: 'Membership details and any associated fees will be communicated during the interview process. We strive to keep it accessible for all students.'
      },
      {
        id: '5',
        question: 'How much time commitment is required?',
        answer: 'It varies by department and role. Expect 5-10 hours per week for meetings, events, and department activities. We work around academic schedules.'
      },
      {
        id: '6',
        question: 'Can I switch departments later?',
        answer: 'Yes! After your first semester, you can request a department transfer based on your interests and club needs.'
      }
    ];
  })();

  // Helper to get lead profile name from lead_id
  const getLeadName = (leadId: string): string | null => {
    if (!leadId) return null;
    const lead = profiles.find(p => p.id === leadId);
    return lead ? lead.name : null;
  };

  const benefits = [
    {
      icon: Zap,
      title: 'Elite Training',
      desc: 'Access to world-class coaching and periodized training programs designed for peak performance.'
    },
    {
      icon: Users,
      title: 'Community',
      desc: 'Join a tribe of dedicated athletes pushing boundaries together, both on and off the field.'
    },
    {
      icon: Heart,
      title: 'Leadership',
      desc: 'Develop leadership skills across tech, media, logistics, and strategic outreach departments.'
    },
    {
      icon: Target,
      title: 'Events',
      desc: 'Compete in and organize major campus events like Campus Clash and Strength Opens.'
    },
    {
      icon: Shield,
      title: 'Credibility',
      desc: 'Become part of VIT Chennai\'s most prestigious athletic organization with proven impact.'
    },
    {
      icon: Heart,
      title: 'Growth',
      desc: 'Develop professionally and personally through mentorship and real-world experience.'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#020617] overflow-hidden">
      {/* Gradient Blobs */}
      <div className="absolute top-0 left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-[-10%] w-[40vw] h-[40vw] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 pt-40 pb-32 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">Join the Movement</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-6 leading-[0.85] italic">
            Become Part<br />of the <span className="text-emerald-500">Elite</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            The FITNESS CLUB is more than just an organization. It's a movement dedicated to redefining athletic culture at VIT Chennai. We're looking for individuals who are passionate, driven, and ready to make an impact.
          </p>

          <motion.a
            href={joinFormLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-tight shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all"
          >
            Apply Now <ArrowRight size={20} />
          </motion.a>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card p-8 rounded-[32px] border border-white/5 hover:border-emerald-500/30 transition-all group"
              >
                <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit mb-6 group-hover:bg-emerald-500/20 transition-all">
                  <Icon size={28} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-3 group-hover:text-emerald-500 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Departments */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic">
              Find Your Department
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Choose where your talents can have the most impact
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {dynamicCoreUnits.map((dept, idx) => {
              const overrideImg = config[`core_unit_${dept.id.toLowerCase()}_img`];
              const leadId = config[`core_unit_${dept.id.toLowerCase()}_lead_id`];
              const leadName = getLeadName(leadId || '');
              const imgSrc = overrideImg || dept.img;
              return (
                <motion.div 
                  key={dept.id} 
                  initial={{ opacity: 0, scale: 0.92, rotate: -0.5 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 120, damping: 18 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative aspect-[16/9] rounded-[40px] overflow-hidden border border-white/5 p-10 flex flex-col justify-end shadow-2xl hover:shadow-emerald-500/25 transition-all duration-600 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.08),transparent_30%)]" />
                  <img src={imgSrc} className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3] group-hover:scale-105 group-hover:brightness-[0.38] transition-all duration-800" alt={dept.name} />
                  <motion.div className="relative z-10 space-y-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 + 0.15 }} className="flex items-center gap-4">
                      <motion.div whileHover={{ scale: 1.1, rotate: 8 }} className="p-3 bg-emerald-500 rounded-xl text-black shadow-lg shadow-emerald-500/25"><dept.icon size={20} /></motion.div>
                      <div>
                        <h3 className="text-3xl font-black uppercase tracking-tight text-white">{dept.name}</h3>
                        <div className="text-[9px] uppercase tracking-[0.3em] text-emerald-400 font-black">Department</div>
                        {leadName && (
                          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-200/80 font-black mt-1">Lead: {leadName}</div>
                        )}
                      </div>
                    </motion.div>
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: idx * 0.1 + 0.25 }} className="text-sm text-slate-300 max-w-md line-clamp-3 font-medium leading-relaxed">{dept.desc}</motion.p>
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: idx * 0.1 + 0.35 }} className="flex flex-wrap gap-3">
                      {dept.scope.slice(0, 4).map((s, i) => (
                        <motion.span key={i} whileHover={{ scale: 1.08 }} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-200 hover:bg-emerald-500/20 hover:border-emerald-400/60 transition-all">
                          {s}
                        </motion.span>
                      ))}
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic">
              {config.faq_title || 'Frequently Asked'}
            </h2>
            <p className="text-slate-500 text-lg">
              {config.faq_subtitle || 'Common questions about joining the club'}
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => (
              <FAQItem key={faq.id || idx} question={faq.question} answer={faq.answer} index={idx} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card border border-emerald-500/30 rounded-[48px] p-16 text-center bg-gradient-to-br from-emerald-500/10 to-teal-500/5"
        >
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6 italic">
            Ready to Make an Impact?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12 font-medium">
            Submit your application below. We review applications on a rolling basis and will contact shortlisted candidates for interviews.
          </p>
          <motion.a
            href={joinFormLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-10 py-6 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-emerald-500/30 hover:bg-emerald-400 transition-all"
          >
            Apply via Google Form <ArrowRight size={20} />
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

const FAQItem: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="glass-card border border-white/5 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/5 transition-all text-left"
      >
        <span className="font-black uppercase tracking-tight text-lg pr-4">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={24} className="text-emerald-500" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="px-8 pb-6 text-slate-300 leading-relaxed">
          {answer}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JoinPage;
