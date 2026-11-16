import React from 'react';
import { Button } from '@/components/atoms/button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100/80 text-teal-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      {description ? (
        <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-5">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
