import React, { useState, useRef, useEffect } from 'react';
import { Profile } from '../../types';
import { Scan, Terminal, ShieldAlert, Check, Keyboard, Activity, UserCheck, Crosshair, Flashlight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import { supabase } from '../../supabaseClient';

interface Registration {
  id: string;
  name: string;
  reg_number: string;
  created_at: string;
}

const TerminalTab: React.FC<{ profiles: Profile[] }> = ({ profiles }) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [manual, setManual] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [scanMessage, setScanMessage] = useState('');
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load registrations from Supabase
  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading registrations:', error);
    } else if (data) {
      console.log('Loaded registrations:', data);
      setRegistrations(data);
    }
  };

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });

        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;

        const [track] = stream.getVideoTracks();
        const caps: any = track.getCapabilities ? track.getCapabilities() : {};
        setTorchAvailable(!!caps.torch);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsScanning(true);
          };
        }
      } catch (err) {
        console.error("Terminal Error: Camera access denied.", err);
        setScanMessage('Camera access denied. Allow camera permission.');
        setIsScanning(false);
      }
    };

    const decodeWithFallback = (imageData: ImageData) => {
      const primary = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
      if (primary) return primary;

      // Center crop fallback for small / low-contrast codes
      const side = Math.floor(Math.min(imageData.width, imageData.height) * 0.7);
      const sx = Math.floor((imageData.width - side) / 2);
      const sy = Math.floor((imageData.height - side) / 2);
      const off = document.createElement('canvas');
      off.width = side;
      off.height = side;
      const offCtx = off.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return null;
      offCtx.putImageData(imageData, -sx, -sy);
      const cropped = offCtx.getImageData(0, 0, side, side);
      return jsQR(cropped.data, cropped.width, cropped.height, { inversionAttempts: 'attemptBoth' });
    };

    const scan = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

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
            const code = decodeWithFallback(imageData);

            if (code && code.data) {
              setScanMessage('Code detected');
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
      mounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const lastIdentified = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

  const handleIdentify = (data: string) => {
    const now = Date.now();
    const ident = data.trim().toUpperCase();

    // Throttle: don't process same code twice within 4 seconds
    if (ident === lastIdentified.current && now - lastScanTime.current < 4000) return;

    // Search logic: First check profiles (board members, etc.)
    let profile = profiles.find(p => {
      const pReg = (p.reg_no || "").trim().toUpperCase();
      const pId = (p.id || "").trim().toUpperCase();
      return pReg === ident || pId === ident;
    });

    // If not found in profiles, check registrations table
    let registration = null;
    if (!profile) {
      registration = registrations.find(r => {
        const rReg = (r.reg_number || "").trim().toUpperCase();
        const rId = (r.id || "").trim().toUpperCase();
        return rReg === ident || rId === ident;
      });

      // Create a profile-like object from registration for display
      if (registration) {
        profile = {
          id: registration.id,
          name: registration.name,
          reg_no: registration.reg_number,
          position: 'Registered Member',
          role: 'FFCS Member' as any,
          tenure: '',
          photo: '',
          bio: '',
          socials: {}
        } as Profile;
      }
    }

    const result = {
      profile,
      raw: ident,
      ts: new Date().toLocaleTimeString(),
      status: profile ? 'VALID' : 'INVALID',
      isRegistration: !!registration
    };

    setScanResult(result);
    setHistory(prev => [result, ...prev].slice(0, 15));

    lastIdentified.current = ident;
    lastScanTime.current = now;

    if (profile) {
      new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(() => { });
      if ('vibrate' in navigator) navigator.vibrate(200);
      setScanMessage('Validated');
    } else {
      setScanMessage('Not found');
    }

    setTimeout(() => {
      setScanResult((prev: any) => (prev && prev.raw === ident) ? null : prev);
    }, 5000);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsFileLoading(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = URL.createObjectURL(file);
      });

      const canvas = canvasRef.current;
      if (!canvas) {
        setIsFileLoading(false);
        setScanMessage('No canvas available');
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsFileLoading(false);
        setScanMessage('Could not get canvas context');
        return;
      }
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(data.data, data.width, data.height, { inversionAttempts: 'attemptBoth' });
      if (code?.data) {
        setScanMessage('Code detected from image');
        handleIdentify(code.data);
      } else {
        setScanMessage('No code found in image');
      }
    } catch (err) {
      console.error('File decode error', err);
      setScanMessage('Could not read image');
    } finally {
      setIsFileLoading(false);
    }
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

      <div className="flex flex-wrap gap-3 items-center text-sm text-slate-400">
        <button
          onClick={() => {
            const track = streamRef.current?.getVideoTracks()[0];
            if (!track || !torchAvailable) return;
            const next = !torchOn;
            // Torch is non-standard; cast constraints to keep type-checker happy while targeting supported browsers
            track.applyConstraints({ advanced: [{ torch: next }] } as unknown as MediaTrackConstraints).catch(() => { });
            setTorchOn(next);
          }}
          disabled={!torchAvailable}
          className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest flex items-center gap-2 ${torchAvailable ? 'border-white/10 text-white hover:border-emerald-500/40' : 'border-white/5 text-slate-600 cursor-not-allowed'}`}
        >
          <Flashlight size={14} /> {torchAvailable ? (torchOn ? 'Torch On' : 'Torch Off') : 'Torch Unavailable'}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest hover:border-emerald-500/40 flex items-center gap-2"
        >
          Upload QR Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          id="qr-image"
          name="qr_image"
          className="hidden"
          onChange={handleFileInputChange}
        />
        {scanMessage && <span className="text-xs text-slate-500">{scanMessage}{isFileLoading ? ' (processing...)' : ''}</span>}
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
              <input id="manual-reg" name="manual_reg" type="text" value={manual} onChange={e => setManual(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && manual && handleIdentify(manual)} placeholder="REG NUMBER..." className="flex-grow bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg font-black tracking-[0.3em] outline-none focus:border-emerald-500 transition-all" autoComplete="off" />
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
                }
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
