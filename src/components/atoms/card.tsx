import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
