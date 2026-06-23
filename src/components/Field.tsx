import type { InputHTMLAttributes, LabelHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export const FieldLabel = ({ children, ...props }: FieldLabelProps) => (
  <label className="grid gap-2 text-sm font-medium text-slate-300" {...props}>
    {children}
  </label>
);

export const TextInput = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-emerald-400"
    {...props}
  />
);

export const SelectInput = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-emerald-400"
    {...props}
  />
);
