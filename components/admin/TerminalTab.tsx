
import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../../types';
import { Scan, Terminal, ShieldAlert, Check, Keyboard, Activity, UserCheck, Crosshair } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';

const TerminalTab: React.FC<{ profiles: Profile[] }> = ({ profiles }) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [manual, setManual] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsScanning(true);
          };
        }
      } catch (err) { 
        console.error("Terminal Error: Camera access denied."); 
        setIsScanning(false);
      }
    };

    const scan = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // CRITICAL: Check dimensions and readyState to prevent IndexSizeError
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const vw = video.videoWidth;
        const vh = video.videoHeight;

        if (vw > 0 && vh > 0) {
          if (canvas.width !== vw || canvas.height !== vh) {
            canvas.width = vw;
            canvas.height = vh;
          }

          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, vw, vh);
            const imageData = ctx.getImageData(0, 0, vw, vh);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            
            if (code && code.data) {
              handleIdentify(code.data);
            }
          }
        }
      }
      requestRef.current = requestAnimationFrame(scan);
    };

    start();
    requestRef.current = requestAnimationFrame(scan);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const lastIdentified = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

  const handleIdentify = (data: string) => {
    const now = Date.now();
    const ident = data.trim().toUpperCase();
    
    // Throttle: don't process same code twice within 4 seconds
    if (ident === lastIdentified.current && now - lastScanTime.current < 4000) return;

    // Search logic: check reg_no and ID
    const profile = profiles.find(p => {
      const pReg = (p.reg_no || "").trim().toUpperCase();
      const pId = (p.id || "").trim().toUpperCase();
      return pReg === ident || pId === ident;
    });

    const result = { 
      profile, 
      raw: ident, 
      ts: new Date().toLocaleTimeString(), 
      status: profile ? 'VALID' : 'INVALID' 
    };

    setScanResult(result);
    setHistory(prev => [result, ...prev].slice(0, 15));
    
    lastIdentified.current = ident;
    lastScanTime.current = now;

    if (profile) {
      new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(() => {});
      if ('vibrate' in navigator) navigator.vibrate(200);
    }

    setTimeout(() => {
      setScanResult((prev: any) => (prev && prev.raw === ident) ? null : prev);
    }, 5000);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <Scan className="text-emerald-500" size={32} />
            <h2 className="text-6xl font-black uppercase tracking-tighter italic leading-none">Security Terminal</h2>
          </div>
          <p className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-black italic">Active Monitoring Pulse</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl border ${isScanning ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-red-500/20 bg-red-500/5 text-red-500'} flex items-center gap-3`}>
          <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">{isScanning ? 'Sensor Online' : 'Sensor Offline'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-[#01040f] rounded-[80px] overflow-hidden border border-white/10 shadow-2xl">
          <video ref={videoRef} muted autoPlay playsInline className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 opacity-30" />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scan Zone UI */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 border border-emerald-500/20 rounded-[48px] relative">
              <div className="absolute inset-x-0 h-0.5 bg-emerald-500 shadow-[0_0_15px_#10b981] animate-[scanLine_4s_infinite]" />
              <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl" />
              <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl" />
              <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-xl" />
              <div className="absolute inset-0 flex items-center justify-center opacity-10"><Crosshair size={64} className="text-emerald-500" /></div>
            </div>
          </div>

          <AnimatePresence>
            {scanResult && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="absolute bottom-8 left-8 right-8 z-50">
                <div className={`glass-card p-10 rounded-[56px] border-2 flex items-center justify-between shadow-2xl backdrop-blur-3xl ${scanResult.profile ? 'border-emerald-500 bg-emerald-950/90' : 'border-red-500 bg-red-950/90'}`}>
                  <div className="flex items-center gap-8">
                    {scanResult.profile?.photo ? (
                      <img src={scanResult.profile.photo} className="w-24 h-24 rounded-[32px] object-cover border-2 border-white/10" alt="" />
                    ) : (
                      <div className="w-24 h-24 bg-slate-800 rounded-[32px] flex items-center justify-center border-2 border-white/10 text-slate-500"><UserCheck size={40} /></div>
                    )}
                    <div>
                      <p className="text-4xl font-black uppercase text-white tracking-tighter italic leading-none mb-2">{scanResult.profile?.name || 'DENIED'}</p>
                      <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">{scanResult.raw}</p>
                    </div>
                  </div>
                  <div className={`p-6 rounded-[32px] ${scanResult.profile ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
                    {scanResult.profile ? <Check size={40} /> : <ShieldAlert size={40} />}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-8">
          <div className="glass-card rounded-[56px] p-12 border-white/5 shadow-xl">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3 text-slate-400"><Keyboard size={20} /> Manual Validation</h3>
            <div className="flex gap-4">
              <input type="text" value={manual} onChange={e => setManual(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && manual && handleIdentify(manual)} placeholder="REG NUMBER..." className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg font-black tracking-[0.3em] outline-none focus:border-emerald-500 transition-all" />
              <button onClick={() => manual && handleIdentify(manual)} className="bg-emerald-500 text-black px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 active:scale-95 transition-all">CHECK</button>
            </div>
          </div>

          <div className="glass-card rounded-[56px] p-12 flex-grow border-white/5 flex flex-col shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3"><Activity className="text-emerald-500" size={24} /> Log History</h3>
            </div>
            <div className="space-y-4 overflow-y-auto no-scrollbar flex-grow">
              <AnimatePresence initial={false}>
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-800"><Terminal size={64} className="mb-6 opacity-10" /><p className="text-[10px] font-black uppercase tracking-widest opacity-20 italic">No cycles detected</p></div>
                ) : (
                  history.map((h, i) => (
                    <motion.div key={`${h.raw}-${h.ts}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] flex justify-between items-center group">
                      <div>
                        <p className={`text-xl font-black uppercase italic leading-none mb-2 ${h.profile ? 'text-white' : 'text-red-500'}`}>{h.profile?.name || 'UNKNOWN'}</p>
                        <p className="text-[10px] font-mono text-slate-500 flex items-center gap-4"><span>{h.raw}</span><span>{h.ts}</span></p>
                      </div>
                      <div className={`p-4 rounded-2xl border ${h.profile ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>{h.profile ? <UserCheck size={20} /> : <ShieldAlert size={20} />}</div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes scanLine { 0% { top: 0% } 50% { top: 100% } 100% { top: 0% } }`}</style>
    </div>
  );
};

export default TerminalTab;
