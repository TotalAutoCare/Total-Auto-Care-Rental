
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, RecurrenceType, Currency, CurrencyMeta } from '../types';

interface Props {
  onAdd: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  editingTransaction: Transaction | null;
  onUpdate: (id: string, updates: Partial<Transaction>) => void;
  onCancelEdit: () => void;
  currentCurrency: Currency;
}

const CustomDropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = "Select..." 
}: { 
  label: string; 
  value: string; 
  options: string[]; 
  onChange: (val: string) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 flex items-center justify-between text-base text-slate-900 dark:text-white font-black transition-all hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm"
      >
        <span className={!value ? "text-slate-400" : ""}>{value || placeholder}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-[60] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors ${value === opt ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const AddTransactionMenu: React.FC<Props> = ({ onAdd, editingTransaction, onUpdate, onCancelEdit, currentCurrency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>(RecurrenceType.NONE);
  
  const formRef = useRef<HTMLDivElement>(null);

  const [expenseCategories, setExpenseCategories] = useState(() => {
    const saved = localStorage.getItem('finance_architect_expense_cats');
    return saved ? JSON.parse(saved) : ['Food', 'Clothing', 'Rent', 'Utilities', 'Transport', 'Entertainment', 'Health', 'Other'];
  });

  const [incomeCategories, setIncomeCategories] = useState(() => {
    const saved = localStorage.getItem('finance_architect_income_cats');
    return saved ? JSON.parse(saved) : ['Salary', 'Freelance', 'Investments', 'Rental Income', 'Gifts', 'Other'];
  });

  useEffect(() => {
    localStorage.setItem('finance_architect_expense_cats', JSON.stringify(expenseCategories));
    localStorage.setItem('finance_architect_income_cats', JSON.stringify(incomeCategories));
  }, [expenseCategories, incomeCategories]);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      const displayedAmount = editingTransaction.amount * CurrencyMeta[currentCurrency].rate;
      setAmount(displayedAmount.toFixed(2));
      setDescription(editingTransaction.description);
      setCategory(editingTransaction.category);
      setRecurrence(editingTransaction.recurrence || RecurrenceType.NONE);
      setIsOpen(true);
      setIsCustomCategory(false);
      
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [editingTransaction, currentCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || (!category && !customCategory)) return;

    let finalCategory = category;
    if (category === 'Other' && customCategory.trim()) {
      finalCategory = customCategory.trim();
      if (type === TransactionType.EXPENSE) {
        if (!expenseCategories.includes(finalCategory)) {
          setExpenseCategories(prev => [...prev.slice(0, -1), finalCategory, 'Other']);
        }
      } else {
        if (!incomeCategories.includes(finalCategory)) {
          setIncomeCategories(prev => [...prev.slice(0, -1), finalCategory, 'Other']);
        }
      }
    }

    const data = {
      amount: parseFloat(amount),
      description,
      category: finalCategory,
      type,
      recurrence
    };

    if (editingTransaction) {
      onUpdate(editingTransaction.id, data);
    } else {
      onAdd(data);
    }

    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setCustomCategory('');
    setIsCustomCategory(false);
    setRecurrence(RecurrenceType.NONE);
    setIsOpen(false);
    if (editingTransaction) onCancelEdit();
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setIsCustomCategory(val === 'Other');
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-base text-slate-900 dark:text-white font-black shadow-sm";

  return (
    <div className="mb-6" ref={formRef}>
      {!editingTransaction && (
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl text-xs uppercase tracking-[0.2em]"
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
          </svg>
          {isOpen ? 'Close Entry' : 'New Transaction'}
        </button>
      )}

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border-2 border-slate-950 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              {editingTransaction ? 'Revision Required' : 'Transaction Log'}
            </h3>
            {editingTransaction && (
              <button type="button" onClick={resetForm} className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-colors">Cancel</button>
            )}
          </div>
          
          <div className="flex gap-2 mb-8 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button 
              type="button"
              onClick={() => { setType(TransactionType.EXPENSE); setCategory(''); setIsCustomCategory(false); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Expense 🔴
            </button>
            <button 
              type="button"
              onClick={() => { setType(TransactionType.INCOME); setCategory(''); setIsCustomCategory(false); }}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
            >
              Income 🟢
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Amount ({CurrencyMeta[currentCurrency].symbol})</label>
              <input required type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
            </div>
            
            <CustomDropdown 
              label="Classification"
              value={category}
              placeholder="Select Category..."
              options={type === TransactionType.EXPENSE ? expenseCategories : incomeCategories}
              onChange={handleCategoryChange}
            />
            
            {isCustomCategory && (
              <div className="md:col-span-2 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-1">New Category Label</label>
                <input required type="text" placeholder="e.g. Subscriptions" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className={`${inputClass} border-emerald-500/30 dark:border-emerald-500/30`} />
              </div>
            )}

            <div className="md:col-span-1 space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description</label>
              <input required type="text" placeholder="e.g. Server Hosting" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
            </div>
            
            <CustomDropdown 
              label="Cycle"
              value={recurrence === RecurrenceType.NONE ? "Once" : recurrence === RecurrenceType.WEEKLY ? "Weekly" : "Monthly"}
              options={["Once", "Weekly", "Monthly"]}
              onChange={(val) => {
                if (val === "Once") setRecurrence(RecurrenceType.NONE);
                else if (val === "Weekly") setRecurrence(RecurrenceType.WEEKLY);
                else setRecurrence(RecurrenceType.MONTHLY);
              }}
            />
          </div>

          <button type="submit" className="w-full mt-10 bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl font-black hover:opacity-90 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.3em] shadow-2xl">
            {editingTransaction ? 'Authorize Revision' : 'Authorize Transaction'}
          </button>
        </form>
      )}
    </div>
  );
};
