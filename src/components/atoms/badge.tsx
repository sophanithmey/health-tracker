import React from 'react';

export type BadgeVariant = 'emerald' | 'teal' | 'amber' | 'red' | 'slate' | 'blue' | 'purple';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  teal: 'bg-teal-50 text-teal-800 border-teal-200/80',
  amber: 'bg-amber-50 text-amber-900 border-amber-200/80',
  red: 'bg-red-50 text-red-800 border-red-200/80',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-800 border-blue-200/80',
  purple: 'bg-purple-50 text-purple-800 border-purple-200/80'
};

export function Badge({
  variant = 'teal',
  children,
  icon,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon ? <span className="mr-1.5 shrink-0">{icon}</span> : null}
      {children}
    </span>
  );
}
