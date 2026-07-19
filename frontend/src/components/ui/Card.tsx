'use client';

import React, { forwardRef, type HTMLAttributes, type ReactNode } from 'react';

export type CardVariant = 'glass' | 'strong' | 'highlight' | 'bordered' | 'neon';
export type CardHover = 'lift' | 'glow' | 'none';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  hover?: CardHover;
  padding?: CardPadding;
  children?: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  glass: 'glass rounded-[28px]',
  strong: 'glass-strong rounded-[28px]',
  highlight: 'card-highlight rounded-[28px]',
  bordered: 'border border-white/10 bg-transparent rounded-[28px]',
  neon: 'glass rounded-[28px] neon-border',
};

const hoverStyles: Record<CardHover, string> = {
  lift: 'hover-lift cursor-pointer',
  glow: 'hover-glow cursor-pointer',
  none: '',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-between gap-4 mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={`space-y-3 ${className}`} {...props}>
      {children}
    </div>
  )
);
CardBody.displayName = 'CardBody';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-between gap-4 mt-4 pt-4 border-t border-white/10 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'glass',
      hover = 'none',
      padding = 'md',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          animate-in
          ${variantStyles[variant]}
          ${hoverStyles[hover]}
          ${paddingStyles[padding]}
          shadow-card
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;