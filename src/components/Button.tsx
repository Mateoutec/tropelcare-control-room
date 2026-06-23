import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../lib/classNames';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
}

const variantClasses = {
  primary: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
  danger: 'bg-rose-500 text-white hover:bg-rose-400',
  ghost: 'bg-transparent text-slate-300 hover:bg-slate-800',
};

export const Button = ({ variant = 'primary', className, children, ...props }: ButtonProps) => (
  <button
    className={classNames(
      'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55',
      variantClasses[variant],
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
