
import React, { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from 'framer-motion';
import { LayoutGrid } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: { title: string; icon: React.ReactNode; onClick: () => void; active: boolean }[];
  desktopClassName?: string;
  mobileClassName?: string;
}) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const FloatingDockMobile = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; onClick: () => void; active: boolean }[];
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div
            layoutId="nav"
            className="absolute bottom-full right-0 mb-4 flex flex-col gap-3 items-end"
          >
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  x: 20,
                  transition: { delay: idx * 0.05 },
                }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <button
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-11 w-auto min-w-[140px] items-center justify-between gap-4 rounded-xl px-4 py-2 shadow-2xl backdrop-blur-2xl border border-white/10 transition-colors",
                    item.active ? "bg-emerald-500 text-black font-black" : "bg-slate-900/90 text-white/70"
                  )}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest">{item.title}</span>
                  <div className="h-4 w-4">{item.icon}</div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-black shadow-2xl shadow-emerald-500/20 active:scale-90 transition-transform"
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
    </div>
  );
};

const FloatingDockDesktop = ({
  items,
  className,
}: {
  items: { title: string; icon: React.ReactNode; onClick: () => void; active: boolean }[];
  className?: string;
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-3 rounded-[24px] bg-slate-950/40 border border-white/5 backdrop-blur-3xl px-4 pb-3 md:flex shadow-2xl",
        className
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  onClick,
  active,
}: {
  mouseX: MotionValue;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  active: boolean;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - (bounds.x + bounds.width / 2);
  });

  // Refined sizes for a more balanced look: 48px base to 88px peak
  let widthTransform = useTransform(distance, [-140, 0, 140], [48, 88, 48]);
  let heightTransform = useTransform(distance, [-140, 0, 140], [48, 88, 48]);

  let widthTransformIcon = useTransform(distance, [-140, 0, 140], [20, 38, 20]);
  let heightTransformIcon = useTransform(distance, [-140, 0, 140], [20, 38, 20]);

  let width = useSpring(widthTransform, { mass: 0.1, stiffness: 180, damping: 15 });
  let height = useSpring(heightTransform, { mass: 0.1, stiffness: 180, damping: 15 });
  let widthIcon = useSpring(widthTransformIcon, { mass: 0.1, stiffness: 180, damping: 15 });
  let heightIcon = useSpring(heightTransformIcon, { mass: 0.1, stiffness: 180, damping: 15 });

  const [hovered, setHovered] = useState(false);

  return (
    <button onClick={onClick} className="relative outline-none">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex items-center justify-center rounded-2xl transition-all duration-300",
          active ? "bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.3)]" : "bg-white/[0.03] text-white/50 hover:bg-white/[0.08] hover:text-white"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-12 left-1/2 w-fit rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest whitespace-pre text-white shadow-2xl backdrop-blur-xl"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center"
        >
          {icon}
        </motion.div>
      </motion.div>
      {active && (
        <motion.div 
          layoutId="active-dot"
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-emerald-500"
        />
      )}
    </button>
  );
}
