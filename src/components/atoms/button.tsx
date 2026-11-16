import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs focus:ring-teal-500',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-400',
  outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 focus:ring-slate-400',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs focus:ring-red-500',
  ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 focus:ring-slate-400'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl font-semibold',
  md: 'px-4 py-2.5 text-sm rounded-2xl font-bold',
  lg: 'px-6 py-3.5 text-base rounded-2xl font-bold'
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
      ) : icon ? (
        <span className="mr-2 flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
