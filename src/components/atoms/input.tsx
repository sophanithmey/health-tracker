import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-300 focus:ring-red-400 focus:border-red-400'
            : 'border-slate-200 focus:ring-teal-500 focus:border-teal-500'
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
