'use client';

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'btn-primary',
  secondary:
    'btn-secondary',
  ghost:
    'btn-ghost',
  danger:
    'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl px-5 py-3 text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  outline:
    'inline-flex items-center justify-center gap-2 font-medium rounded-2xl px-5 py-3 text-sm border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-xs gap-1.5 rounded-xl',
  md: 'px-5 py-3 text-sm gap-2 rounded-2xl',
  lg: 'px-6 py-3.5 text-base gap-2.5 rounded-2xl',
  xl: 'px-8 py-4 text-lg gap-3 rounded-2xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      children,
      className = '',
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed hover:translate-y-0',
          className
        )}
        aria-disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span
            className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0"
            aria-hidden="true"
          />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        {children && <span>{children}</span>}
        {!loading && icon && iconPosition === 'right' && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;