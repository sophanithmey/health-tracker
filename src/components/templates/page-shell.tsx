import React from 'react';

interface PageShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageShell({
  title,
  subtitle,
  actions,
  children,
  className = ''
}: PageShellProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-khmer">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-3 flex-shrink-0">{actions}</div> : null}
      </div>

      {/* Main Content Area */}
      <div>{children}</div>
    </div>
  );
}
