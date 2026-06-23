import type { ReactNode } from 'react';
import { classNames } from '../lib/classNames';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => (
  <section className={classNames('rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-2xl shadow-slate-950/35 backdrop-blur', className)}>
    {children}
  </section>
);
