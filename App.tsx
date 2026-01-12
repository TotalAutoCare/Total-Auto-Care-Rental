
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction, TransactionType, FinancialSummary, RecurrenceType, Currency, CurrencyMeta } from './types';
import { getFinancialAdvice } from './services/geminiService';
import { DashboardCards } from './components/DashboardCards';
import { TransactionTable } from './components/TransactionTable';
import { Visualizer } from './components/Visualizer';
import { AddTransactionMenu } from './components/AddTransactionMenu';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [currency, setCurrency] = useState<Currency>(() => (localStorage.getItem('pref_currency') as Currency) || Currency.AUD);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_architect_tx');
    return saved ? JSON.parse(saved) : [];
  });
  const [advice, setAdvice] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const currencyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('pref_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('finance_architect_tx', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setIsCurrencyMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const convert = (usdAmount: number) => usdAmount * CurrencyMeta[currency].rate;

  const summary: FinancialSummary = React.useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: convert(income),
      totalExpenses: convert(expenses),
      netBalance: convert(income - expenses)
    };
  }, [transactions, currency]);

  const handleManualAdd = (data: Omit<Transaction, 'id' | 'date'>) => {
    const usdAmount = data.amount / CurrencyMeta[currency].rate;
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      ...data,
      amount: usdAmount
    };
    setTransactions(prev => [...prev, newTx]);
  };

  const handleUpdate = (id: string, updates: Partial<Transaction>) => {
    if (updates.amount !== undefined) {
      updates.amount = updates.amount / CurrencyMeta[currency].rate;
    }
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this entry?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const generateAdvice = useCallback(async () => {
    if (transactions.length === 0) return;
    const insight = await getFinancialAdvice(transactions);
    setAdvice(insight || null);
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0 && transactions.length % 5 === 0) {
      generateAdvice();
    }
  }, [transactions.length, generateAdvice]);

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-24 font-sans overflow-x-hidden text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-2.5 md:px-6 md:py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 pr-4">
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white w-7 h-7 md:w-9 md:h-9 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
              <span className="text-sm md:text-lg font-black">$</span>
            </div>
            <div className="flex items-center">
              <h1 className="text-lg md:text-2xl font-black tracking-tighter uppercase leading-none bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 dark:from-emerald-400 dark:via-white dark:to-emerald-400 bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent italic pl-1 pr-1">
                TAC Rental
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="relative" ref={currencyMenuRef}>
              <button 
                onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
                className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-[10px] md:text-xs font-black px-3 py-2 rounded-lg outline-none border-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-widest"
              >
                {currency}
                <svg className={`w-3 h-3 transition-transform ${isCurrencyMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {isCurrencyMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in duration-100">
                  {Object.values(Currency).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        setCurrency(curr);
                        setIsCurrencyMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${currency === curr ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-none"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 17.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <div className="mb-6">
          <AddTransactionMenu 
            onAdd={handleManualAdd} 
            editingTransaction={editingTransaction}
            onUpdate={handleUpdate}
            onCancelEdit={() => setEditingTransaction(null)}
            currentCurrency={currency}
          />
        </div>

        <div className="flex flex-col landscape:flex-row gap-6 mb-8">
           <div className="flex-1">
             <DashboardCards summary={summary} currency={currency} />
           </div>
           
           {advice && (
            <div className="landscape:w-1/3 bg-emerald-900 dark:bg-emerald-500 text-white dark:text-slate-900 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group self-start">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-emerald-100 dark:text-emerald-900">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-70">Architect's Council</h4>
                <p className="text-sm font-semibold leading-relaxed tracking-tight">{advice}</p>
              </div>
            </div>
          )}
        </div>
        
        <Visualizer transactions={transactions} currency={currency} />

        <div className="sticky top-[56px] md:top-[64px] bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-20 py-4 -mx-6 px-6 border-b border-transparent">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex-shrink-0 ${filter === 'ALL' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('INCOME')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex-shrink-0 ${filter === 'INCOME' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
            >
              Income 🟢
            </button>
            <button 
              onClick={() => setFilter('EXPENSE')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex-shrink-0 ${filter === 'EXPENSE' ? 'bg-rose-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
            >
              Expense 🔴
            </button>
          </div>
        </div>

        <div className="mt-4">
          <TransactionTable 
            transactions={filteredTransactions} 
            onEdit={setEditingTransaction}
            onDelete={handleDelete}
            currency={currency}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
