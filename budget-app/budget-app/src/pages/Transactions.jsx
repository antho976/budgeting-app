import { useState, useMemo } from 'react'
import { Card, Btn, Input, Select } from '../components/ui'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { COLORS } from '../constants'

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-CA')

export default function Transactions({ categories, transactions, onAdd, onDelete }) {
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterMonth, setFilterMonth] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState(null) // transaction id

  // Build list of available months from transactions
  const months = useMemo(() => {
    const set = new Set(transactions.map(t => t.date.slice(0, 7)))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const filtered = useMemo(() => {
    return [...transactions]
      .filter(t => {
        if (filterCat !== 'all' && t.category !== filterCat) return false
        if (filterMonth !== 'all' && t.date.slice(0, 7) !== filterMonth) return false
        if (search.trim()) {
          const q = search.toLowerCase()
          const catName = categories.find(c => c.id === t.category)?.name?.toLowerCase() || ''
          if (!t.desc.toLowerCase().includes(q) && !catName.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, filterCat, filterMonth, search, categories])

  const totalFiltered = filtered.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transactions</h2>
        <Btn onClick={() => setShowAdd(true)} size="sm">
          <Icon name="plus" className="w-4 h-4" /> Add
        </Btn>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon name="search" className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All months</option>
            {months.map(m => (
              <option key={m} value={m}>
                {new Date(m + '-02').toLocaleString('en-CA', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary row */}
      {filtered.length > 0 && (
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
          <span className="font-medium">{fmt(totalFiltered)}</span>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-8 flex flex-col items-center gap-2 text-slate-400">
          <Icon name="list" className="w-10 h-10 opacity-30" />
          <p className="text-sm">No transactions found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {filtered.map((t, i) => {
            const cat = categories.find(c => c.id === t.category)
            const c = cat ? (COLORS[cat.color] || COLORS.gray) : COLORS.gray
            return (
              <div
                key={t.id}
                className={`flex items-center gap-3 px-4 py-3 ${i < filtered.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.bar }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.desc || '(no description)'}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{cat?.name ?? 'Unknown'} · {t.date}</div>
                </div>
                <span className="text-sm font-semibold tabular-nums flex-shrink-0">{fmt(t.amount)}</span>
                <button
                  onClick={() => setConfirmDelete(t.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex-shrink-0"
                  aria-label="Delete"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </Card>
      )}

      {/* Add Modal */}
      {showAdd && (
        <AddTransactionModal
          categories={categories}
          onAdd={(tx) => { onAdd(tx); setShowAdd(false) }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <Modal
          title="Delete transaction?"
          onClose={() => setConfirmDelete(null)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => { onDelete(confirmDelete); setConfirmDelete(null) }}>Delete</Btn>
            </>
          }
        >
          <div className="flex items-start gap-3">
            <Icon name="alertTriangle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This transaction will be permanently removed. This cannot be undone.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AddTransactionModal({ categories, onAdd, onClose }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ desc: '', amount: '', category: categories[0]?.id || '', date: today })
  const [errors, setErrors] = useState({})

  const submit = () => {
    const e = {}
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) e.amount = 'Enter a positive amount'
    if (!form.category) e.category = 'Select a category'
    if (!form.date) e.date = 'Pick a date'
    if (Object.keys(e).length) { setErrors(e); return }
    onAdd({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      desc: form.desc.trim(),
      amount: amt,
      category: form.category,
      date: form.date
    })
  }

  return (
    <Modal title="Add Transaction" onClose={onClose} footer={
      <>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>Add</Btn>
      </>
    }>
      <div className="flex flex-col gap-3">
        <Input label="Description (optional)" type="text" placeholder="e.g. Groceries" value={form.desc}
          onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} autoFocus />
        <Input label="Amount" type="number" step="0.01" placeholder="0.00" value={form.amount}
          onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(er => ({ ...er, amount: '' })) }}
          error={errors.amount} />
        <Select label="Category" value={form.category}
          onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(er => ({ ...er, category: '' })) }}
          error={errors.category}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Input label="Date" type="date" value={form.date}
          onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(er => ({ ...er, date: '' })) }}
          error={errors.date} />
      </div>
    </Modal>
  )
}
