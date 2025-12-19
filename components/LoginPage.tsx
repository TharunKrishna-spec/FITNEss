
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Loader2, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Props {
  onLogin: (email: string) => void;
}

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        onLogin(data.user.email || 'Admin');
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Access Denied: Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-card rounded-[48px] border-white/10 p-10 md:p-12 shadow-2xl overflow-hidden relative">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-black mb-6 shadow-lg shadow-emerald-500/20">
              <Shield size={32} fill="currentColor" />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-2">Vault <span className="text-emerald-500">Access</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Authorized Personnel Only</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center uppercase tracking-wider"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white text-sm focus:border-emerald-500/50 outline-none transition-all"
                    placeholder="name@vitstudent.ac.in"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white text-sm focus:border-emerald-500/50 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>Unlock Terminal</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
              Connection encrypted with <br />
              <span className="text-emerald-500/50 italic font-black">Club Security Protocol v4.0</span>
            </p>
          </div>
        </div>

        {/* Floating Accent */}
        <div className="absolute -bottom-6 -right-6 pointer-events-none opacity-20">
          <Zap size={120} className="text-emerald-500" />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;