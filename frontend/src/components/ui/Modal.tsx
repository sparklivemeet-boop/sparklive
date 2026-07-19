'use client';

import React, { useEffect, useCallback, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children?: ReactNode;
  footer?: ReactNode;
  closeOnBackdrop?: boolean;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[90vw]',
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  closeOnBackdrop = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 modal-backdrop"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      <div
        className={`
          relative w-full ${sizeStyles[size]}
          ${open ? 'animate-scale-in' : 'scale-95'}
        `}
      >
        <div className="glass-strong rounded-[32px] border border-white/10 shadow-glow-lg overflow-hidden">
          {(title || description) && (
            <div className="relative p-6 pb-4 border-b border-white/10">
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-gray-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              )}
              {title && (
                <h2 className="text-xl font-bold text-white pr-8">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-400">{description}</p>
              )}
            </div>
          )}

          <div className="p-6 overflow-y-auto max-h-[60vh]">{children}</div>

          {footer && (
            <div className="p-6 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}