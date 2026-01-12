
import React, { useState } from 'react';
import { Transaction, TransactionType, RecurrenceType, Currency, CurrencyMeta } from '../types';

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  currency: Currency;
}

export const TransactionTable: React.FC<Props> = ({ transactions, onEdit, onDelete, currency }) => {
  const { symbol, rate } = CurrencyMeta[currency];
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs">No Ledger Entries Yet</p>
      </div>
    );
  }

  const convert = (usd: number) => usd * rate;

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const ActionMenu = ({ t }: { t: Transaction }) => (
    <div className="absolute right-0 top-0 mt-2 mr-2 z-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden min-w-[120px] animate-in fade-in zoom-in duration-150">
      <button 
        onClick={() => { onEdit(t); setActiveMenu(null); }}
        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        Edit
      </button>
      <button 
        onClick={() => { onDelete(t.id); setActiveMenu(null); }}
        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        Remove
      </button>
    </div>
  );

  return (
    <div className="space-y-3" onClick={() => setActiveMenu(null)}>
      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {[...transactions].reverse().map((t) => (
              <tr key={t.id} className="relative group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                <td className="px-6 py-4 text-xs font-bold text-slate-400">{t.date.split('-').slice(1).join('/')}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.description}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-tight">{t.category}</span>
                    {t.recurrence && t.recurrence !== RecurrenceType.NONE && (
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase">🔄</span>
                    )}
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm font-black text-right ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}{symbol}{convert(t.amount).toFixed(2)}
                </td>
                <td className="px-4 py-4 relative">
                  <button 
                    onClick={(e) => toggleMenu(t.id, e)}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 dark:text-slate-500"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </button>
                  {activeMenu === t.id && <ActionMenu t={t} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Compact Cards */}
      <div className="md:hidden space-y-2">
        {[...transactions].reverse().map((t) => (
          <div 
            key={t.id} 
            onClick={(e) => toggleMenu(t.id, e)}
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group relative active:scale-[0.98] transition-transform"
          >
            <div className="flex gap-3 items-center">
              <div className={`w-1 h-8 rounded-full ${t.type === TransactionType.INCOME ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none">{t.description}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.date.split('-').slice(1).join('/')}</span>
                  <span className="text-[9px] text-slate-300 font-black">•</span>
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.category}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-sm font-black ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === TransactionType.INCOME ? '+' : '-'}{symbol}{convert(t.amount).toFixed(2)}
              </div>
              <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
            </div>
            {activeMenu === t.id && <ActionMenu t={t} />}
          </div>
        ))}
      </div>
    </div>
  );
};
