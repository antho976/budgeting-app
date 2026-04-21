import { useState, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { useProfiles } from './useProfileStorage'
import { DEFAULT_CATEGORIES, TABS } from './constants'
import { offsetMonthKey, daysInMonth } from './utils'
import Icon from './components/Icon'
import ProfileSelector from './components/ProfileSelector'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import Settings from './pages/Settings'

function BudgetApp({ profileId, profileName, profiles, onSwitchProfile, onCreateProfile, onDeleteProfile, onRenameProfile }) {
  const pk = (key) => `${profileId}-${key}`

  const [incomes, setIncomes] = useLocalStorage(pk('incomes'), { default: 0 })
  const [categories, setCategories] = useLocalStorage(pk('categories'), DEFAULT_CATEGORIES)
  const [transactions, setTransactions] = useLocalStorage(pk('transactions'), [])
  const [recurring, setRecurring] = useLocalStorage(pk('recurring'), [])
  const [processedMonths, setProcessedMonths] = useLocalStorage(pk('processed-months'), [])
  const [activeTab, setActiveTab] = useState('dashboard')

  const didGenerate = useRef(false)
  useEffect(() => {
    if (didGenerate.current) return
    didGenerate.current = true
    const mk = offsetMonthKey(0)
    if (processedMonths.includes(mk)) return
    if (recurring.length > 0) {
      const existingIds = new Set(transactions.map(t => t.id))
      const toAdd = recurring
        .map(r => {
          const day = Math.min(r.dayOfMonth, daysInMonth(mk))
          const date = mk + '-' + String(day).padStart(2, '0')
          const id = 'rec-' + r.id + '-' + mk
          return { id, desc: r.desc, amount: r.amount, category: r.category, date, fromRecurring: r.id }
        })
        .filter(t => !existingIds.has(t.id))
      if (toAdd.length > 0) setTransactions(prev => [...prev, ...toAdd])
    }
    setProcessedMonths(prev => [...prev, mk])
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getIncome = (mk) => incomes[mk] !== undefined ? incomes[mk] : (incomes.default || 0)
  const setIncomeForMonth = (mk, amount, asDefault = false) =>
    setIncomes(prev => ({ ...prev, [mk]: amount, ...(asDefault ? { default: amount } : {}) }))

  const addTransaction = (tx) => setTransactions(prev => [...prev, tx])
  const editTransaction = (updated) => setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t))
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id))

  const addCategory = (data) => setCategories(prev => [...prev, { id: 'cat-' + Date.now(), ...data }])
  const editCategory = (updated) => setCategories(prev => prev.map(c => c.id === updated.id ? updated : c))
  const deleteCategory = (id) => setCategories(prev => prev.filter(c => c.id !== id))

  const addRecurring = (r) => setRecurring(prev => [...prev, { id: 'rec-' + Date.now(), ...r }])
  const editRecurring = (updated) => setRecurring(prev => prev.map(r => r.id === updated.id ? updated : r))
  const deleteRecurring = (id) => setRecurring(prev => prev.filter(r => r.id !== id))

  const pages = {
    dashboard: (
      <Dashboard
        incomes={incomes}
        getIncome={getIncome}
        setIncomeForMonth={setIncomeForMonth}
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
        onEdit={editTransaction}
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
        profileId={profileId}
        profileName={profileName}
        profiles={profiles}
        incomes={incomes}
        setIncomes={setIncomes}
        categories={categories}
        setCategories={setCategories}
        transactions={transactions}
        setTransactions={setTransactions}
        recurring={recurring}
        onSwitchProfile={onSwitchProfile}
        onCreateProfile={onCreateProfile}
        onDeleteProfile={onDeleteProfile}
        onRenameProfile={onRenameProfile}
        onAddRecurring={addRecurring}
        onEditRecurring={editRecurring}
        onDeleteRecurring={deleteRecurring}
      />
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden sm:flex flex-col w-56 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 fixed top-0 left-0 h-full z-10 px-3 py-6 gap-1">
        <div className="px-3 mb-6">
          <h1 className="text-base font-bold tracking-tight">Budget Tracker</h1>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{profileName}</p>
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

      <main className="flex-1 sm:ml-56 pb-24 sm:pb-8">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {pages[activeTab]}
        </div>
      </main>

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

export default function App() {
  const { profiles, activeProfile, activeId, createProfile, switchProfile, renameProfile, deleteProfile } = useProfiles()

  if (!activeProfile) {
    return (
      <ProfileSelector
        profiles={profiles}
        activeId={activeId}
        onCreate={createProfile}
        onSwitch={switchProfile}
      />
    )
  }

  return (
    <BudgetApp
      key={activeId}
      profileId={activeId}
      profileName={activeProfile.name}
      profiles={profiles}
      onSwitchProfile={switchProfile}
      onCreateProfile={createProfile}
      onDeleteProfile={deleteProfile}
      onRenameProfile={renameProfile}
    />
  )
}
