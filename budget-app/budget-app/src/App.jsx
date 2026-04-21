import { useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_CATEGORIES, COLORS, COLOR_NAMES } from './constants'

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-CA')

const thisMonthKey = () => {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

const monthLabel = () =>
  new Date().toLocaleString('en-CA', { month: 'long', year: 'numeric' })

export default function App() {
  const [income, setIncome] = useLocalStorage('bt-income', 0)
  const [categories, setCategories] = useLocalStorage('bt-categories', DEFAULT_CATEGORIES)
  const [transactions, setTransactions] = useLocalStorage('bt-transactions', [])

  const [incomeInput, setIncomeInput] = useState('')
  const [tx, setTx] = useState({
    desc: '',
    amount: '',
    category: categories[0]?.id || '',
    date: new Date().toISOString().slice(0, 10)
  })

  const km = thisMonthKey()
  const spentByCat = {}
  categories.forEach(c => { spentByCat[c.id] = 0 })
  transactions.forEach(t => {
    if (t.date.slice(0, 7) === km && spentByCat[t.category] !== undefined) {
      spentByCat[t.category] += t.amount
    }
  })
  const totalSpent = Object.values(spentByCat).reduce((a, b) => a + b, 0)
  const investingSpent = spentByCat['investing'] || 0
  const remaining = income - totalSpent

  const addTransaction = () => {
    const amount = parseFloat(tx.amount)
    if (isNaN(amount) || amount <= 0 || !tx.date || !tx.category) return
    setTransactions([
      ...transactions,
      {
        id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        desc: tx.desc.trim(),
        amount,
        category: tx.category,
        date: tx.date
      }
    ])
    setTx({ ...tx, desc: '', amount: '' })
  }

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id))
  }

  const addCategory = () => {
    const name = prompt('Category name?')
    if (!name) return
    const budget = parseFloat(prompt('Monthly budget?', '100'))
    if (isNaN(budget)) return
    const color = COLOR_NAMES[categories.length % COLOR_NAMES.length]
    setCategories([
      ...categories,
      { id: 'cat-' + Date.now(), name, budget, color }
    ])
  }

  const editCategory = (cat) => {
    const newBudget = parseFloat(prompt(`New monthly budget for ${cat.name}?`, cat.budget))
    if (isNaN(newBudget)) return
    setCategories(categories.map(c =>
      c.id === cat.id ? { ...c, budget: newBudget } : c
    ))
  }

  const deleteCategory = (id) => {
    if (!confirm('Delete this category?')) return
    setCategories(categories.filter(c => c.id !== id))
  }

  const resetAll = () => {
    if (!confirm('Reset all data?')) return
    setIncome(0)
    setCategories(DEFAULT_CATEGORIES)
    setTransactions([])
  }

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 15)

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Budget tracker</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{monthLabel()}</p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat label="Income" value={fmt(income)} />
        <Stat label="Spent" value={fmt(totalSpent)} />
        <Stat
          label="Remaining"
          value={fmt(remaining)}
          tone={remaining < 0 ? 'danger' : 'normal'}
        />
        <Stat label="Invested" value={fmt(investingSpent)} />
      </section>

      <Card title="Monthly income">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={income ? String(income) : 'Net monthly income'}
            value={incomeInput}
            onChange={e => setIncomeInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <button
            onClick={() => {
              const v = parseFloat(incomeInput)
              if (!isNaN(v)) {
                setIncome(v)
                setIncomeInput('')
              }
            }}
            className="px-4 py-2 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            Save
          </button>
        </div>
      </Card>

      <section className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-medium">Categories</h2>
          <button
            onClick={addCategory}
            className="text-sm px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {categories.map(cat => {
            const spent = spentByCat[cat.id] || 0
            const pct = cat.budget > 0 ? Math.min(100, (spent / cat.budget) * 100) : 0
            const over = spent > cat.budget
            const c = COLORS[cat.color] || COLORS.gray
            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: c.bar }}
                    />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${over ? 'text-red-600' : 'text-slate-500 dark:text-slate-400'}`}>
                      {fmt(spent)} / {fmt(cat.budget)}
                    </span>
                    <button
                      onClick={() => editCategory(cat)}
                      className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: pct + '%',
                      background: over ? '#ef4444' : c.bar
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Card title="Add transaction">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="text"
            placeholder="Description"
            value={tx.desc}
            onChange={e => setTx({ ...tx, desc: e.target.value })}
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={tx.amount}
            onChange={e => setTx({ ...tx, amount: e.target.value })}
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <select
            value={tx.category}
            onChange={e => setTx({ ...tx, category: e.target.value })}
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={tx.date}
            onChange={e => setTx({ ...tx, date: e.target.value })}
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
          <button
            onClick={addTransaction}
            className="px-4 py-2 rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          >
            Add
          </button>
        </div>
      </Card>

      <section className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-medium">Recent transactions</h2>
          <button
            onClick={resetAll}
            className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-500"
          >
            Reset all
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No transactions yet</p>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {recent.map(t => {
              const cat = categories.find(c => c.id === t.category)
              const c = cat ? (COLORS[cat.color] || COLORS.gray) : COLORS.gray
              return (
                <div
                  key={t.id}
                  className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: c.bar }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm truncate">{t.desc || '(no description)'}</div>
                      <div className="text-xs text-slate-500">
                        {cat ? cat.name : 'Unknown'} · {t.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{fmt(t.amount)}</span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-semibold ${tone === 'danger' ? 'text-red-600' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6">
      <h2 className="text-base font-medium mb-3">{title}</h2>
      {children}
    </div>
  )
}
