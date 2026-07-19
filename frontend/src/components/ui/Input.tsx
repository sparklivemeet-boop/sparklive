'use client';

import React, { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export type InputVariant = 'default' | 'glass' | 'underlined';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  inputSize?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  textarea?: boolean;
  rows?: number;
}

const variantStyles: Record<InputVariant, string> = {
  default:
    'border border-white/10 bg-white/5 focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)]',
  glass:
    'glass focus:border-[var(--color-spark-pink)] focus:ring-1 focus:ring-[var(--color-spark-pink)]',
  underlined:
    'border-0 border-b-2 border-white/10 bg-transparent rounded-none px-0 focus:border-[var(--color-spark-pink)] focus:ring-0',
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-xs rounded-2xl',
  md: 'px-4 py-3 text-sm rounded-3xl',
  lg: 'px-5 py-4 text-base rounded-3xl',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      inputSize = 'md',
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      textarea = false,
      rows = 4,
      type = 'text',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const actualType = isPassword && showPassword ? 'text' : type;

    const inputClasses = `
      w-full text-white placeholder-gray-500 outline-none transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantStyles[variant]}
      ${sizeStyles[inputSize]}
      ${icon && iconPosition === 'left' ? 'pl-12' : ''}
      ${(isPassword || (icon && iconPosition === 'right')) ? 'pr-12' : ''}
      ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' : ''}
    `;

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-300">{label}</label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {icon}
            </span>
          )}

          {textarea ? (
            <textarea
              className={inputClasses.replace('rounded-3xl', 'rounded-3xl min-h-[100px] resize-y')}
              rows={rows}
              disabled={disabled}
              {...(props as any)}
            />
          ) : (
            <input
              ref={ref}
              type={actualType}
              disabled={disabled}
              className={inputClasses}
              {...props}
            />
          )}

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}

          {!isPassword && icon && iconPosition === 'right' && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              {icon}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 mt-1">{error}</p>
        )}

        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;