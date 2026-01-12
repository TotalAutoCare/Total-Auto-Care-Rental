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
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#020617');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#f8fafc');
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
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex-shrink-0 z-50 glass border-b border-slate-200 dark:border-slate-800 transition-all">
        {/* Added Safe Area Padding Top */}
        <div style={{ paddingTop: 'var(--sat, 0px)' }}>
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 pr-4">
              <div className="bg-emerald-600 dark:bg-emerald-500 text-white w-8 h-8 rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                <span className="text-base font-black">$</span>
              </div>
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-600 dark:from-emerald-400 dark:via-white dark:to-emerald-400 bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent italic pl-1">
                TAC Rental
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative" ref={currencyMenuRef}>
                <button 
                  onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
                  className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-[10px] font-black px-3 py-2 rounded-xl outline-none"
                >
                  {currency}
                </button>
                {isCurrencyMenuOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-1 z-50">
                    {Object.values(Currency).map((curr) => (
                      <button
                        key={curr}
                        onClick={() => { setCurrency(curr); setIsCurrencyMenuOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest ${currency === curr ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2.5 bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded-xl"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto px-5 py-6">
          <AddTransactionMenu 
            onAdd={handleManualAdd} 
            editingTransaction={editingTransaction}
            onUpdate={handleUpdate}
            onCancelEdit={() => setEditingTransaction(null)}
            currentCurrency={currency}
          />

          <div className="mt-6 mb-8">
             <DashboardCards summary={summary} currency={currency} />
          </div>

          {advice && (
            <div className="mb-8 bg-emerald-950 dark:bg-emerald-500 text-white dark:text-slate-900 p-5 rounded-[2rem] shadow-xl relative overflow-hidden">
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Architect's Council</h4>
              <p className="text-sm font-semibold leading-relaxed tracking-tight">{advice}</p>
            </div>
          )}
          
          <Visualizer transactions={transactions} currency={currency} />

          <div className="sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md z-20 py-4 -mx-5 px-5">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {['ALL', 'INCOME', 'EXPENSE'].map((f) => (
                <button 
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pb-20">
            <TransactionTable 
              transactions={filteredTransactions} 
              onEdit={setEditingTransaction}
              onDelete={handleDelete}
              currency={currency}
            />
          </div>
        </div>
        {/* Added Safe Area Padding Bottom */}
        <div style={{ height: 'var(--sab, 0px)' }}></div>
      </main>
    </div>
  );
};

export default App;