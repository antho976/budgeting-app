import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_CATEGORIES, TABS } from './constants'
import Icon from './components/Icon'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Settings from './pages/Settings'

export default function App() {
  const [income, setIncome] = useLocalStorage('bt-income', 0)
  const [categories, setCategories] = useLocalStorage('bt-categories', DEFAULT_CATEGORIES)
  const [transactions, setTransactions] = useLocalStorage('bt-transactions', [])
  const [activeTab, setActiveTab] = useState('dashboard')

  const addTransaction = (tx) => setTransactions(prev => [...prev, tx])
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id))

  const addCategory = (data) => {
    const color = data.color
    setCategories(prev => [
      ...prev,
      { id: 'cat-' + Date.now(), ...data, color }
    ])
  }
  const editCategory = (updated) => setCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
  const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id))

  const pages = {
    dashboard: (
      <Dashboard
        income={income}
        setIncome={setIncome}
        categories={categories}
        transactions={transactions}
        onAddTransaction={addTransaction}
      />
    ),
    transactions: (
      <Transactions
        categories={categories}
        transactions={transactions}
        onAdd={addTransaction}
        onDelete={deleteTransaction}
      />
    ),
    categories: (
      <Categories
        categories={categories}
        transactions={transactions}
        onAdd={addCategory}
        onEdit={editCategory}
        onDelete={deleteCategory}
      />
    ),
    settings: (
      <Settings
        income={income}
        setIncome={setIncome}
        categories={categories}
        setCategories={setCategories}
        transactions={transactions}
        setTransactions={setTransactions}
      />
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex flex-col w-56 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 fixed top-0 left-0 h-full z-10 px-3 py-6 gap-1">
        <div className="px-3 mb-6">
          <h1 className="text-base font-bold tracking-tight">Budget Tracker</h1>
        </div>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left
              ${activeTab === tab.id
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <Icon name={tab.icon} className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 sm:ml-56 pb-24 sm:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {pages[activeTab]}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex safe-bottom">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 dark:text-slate-500'
              }`}
          >
            <Icon name={tab.icon} className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
