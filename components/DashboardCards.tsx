
import React from 'react';
import { FinancialSummary, Currency, CurrencyMeta } from '../types';

interface Props {
  summary: FinancialSummary;
  currency: Currency;
}

export const DashboardCards: React.FC<Props> = ({ summary, currency }) => {
  const cardClass = "bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md";
  const { symbol } = CurrencyMeta[currency];
  
  return (
    <div className="space-y-4">
      {/* Primary Net Balance Card */}
      <div className={cardClass}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Balance</span>
          <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg font-black text-[10px]">
            {currency}
          </div>
        </div>
        <div className={`text-3xl font-black tracking-tighter ${summary.netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
          {summary.netBalance >= 0 ? '' : '-'}{symbol}{Math.abs(summary.netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Side-by-side Split for Income and Expense */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`${cardClass} p-4 md:p-6`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Inflow</span>
            <div className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-1 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
            </div>
          </div>
          <div className="text-lg md:text-2xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter">
            +{symbol}{summary.totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className={`${cardClass} p-4 md:p-6`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Outflow</span>
            <div className="text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-1 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>
            </div>
          </div>
          <div className="text-lg md:text-2xl font-black text-rose-600 dark:text-rose-500 tracking-tighter">
            -{symbol}{summary.totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </div>
  );
};
