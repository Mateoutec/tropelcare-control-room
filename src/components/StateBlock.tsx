import { Card } from './Card';

interface StateBlockProps {
  title: string;
  message: string;
}

export const StateBlock = ({ title, message }: StateBlockProps) => (
  <Card className="text-center">
    <p className="text-lg font-bold text-slate-100">{title}</p>
    <p className="mt-2 text-sm text-slate-400">{message}</p>
  </Card>
);
