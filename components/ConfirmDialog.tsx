import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const colors = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-emerald-500 hover:bg-emerald-600'
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative glass-card border border-white/10 rounded-3xl p-8 max-w-md w-full"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-black transition-all ${colors[variant]}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
