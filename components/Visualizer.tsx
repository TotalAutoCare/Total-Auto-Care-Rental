
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType, Currency, CurrencyMeta } from '../types';

interface Props {
  transactions: Transaction[];
  currency: Currency;
}

export const Visualizer: React.FC<Props> = ({ transactions, currency }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const { rate, symbol } = CurrencyMeta[currency];
  
  const data = React.useMemo(() => {
    const groups: Record<string, { name: string; income: number; expense: number }> = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      if (!groups[month]) groups[month] = { name: month, income: 0, expense: 0 };
      const converted = t.amount * rate;
      if (t.type === TransactionType.INCOME) groups[month].income += converted;
      else groups[month].expense += converted;
    });
    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
  }, [transactions, rate]);

  if (data.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 mb-8 h-80 md:h-96">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Financial Structure ({currency})</h3>
        <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Income</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Spent</span>
            </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} 
            tickFormatter={(val) => `${symbol}${val}`}
          />
          <Tooltip 
            cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }}
            contentStyle={{ 
                borderRadius: '24px', 
                backgroundColor: isDark ? '#0f172a' : '#fff', 
                border: isDark ? '1px solid #1e293b' : 'none', 
                boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                padding: '16px',
                fontWeight: 900
            }}
            formatter={(val: number) => [`${symbol}${val.toLocaleString()}`, '']}
          />
          <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} barSize={28} />
          <Bar dataKey="expense" fill="#f43f5e" radius={[8, 8, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
