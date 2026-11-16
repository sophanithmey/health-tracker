import React from 'react';

interface FormFieldProps {
  label?: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className = ''
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label ? (
        <label className="block text-xs font-bold text-slate-700 tracking-wide">
          {label}
          {required ? <span className="text-red-500 ml-1">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-red-600 font-medium tracking-tight animate-fade-in">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
