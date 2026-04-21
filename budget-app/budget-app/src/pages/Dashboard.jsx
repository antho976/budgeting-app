import { useState } from 'react'
import { Card, StatCard, Btn, Input, Select } from '../components/ui'
import Modal from '../components/Modal'
import DonutChart from '../components/DonutChart'
import Icon from '../components/Icon'
import { COLORS } from '../constants'

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-CA')

export default function Dashboard({
  income, setIncome,
  categories,
  transactions,
  onAddTransaction
}) {
  const [monthOffset, setMonthOffset] = useState(0) // 0 = current, -1 = prev, etc.
  const [showAddTx, setShowAddTx] = useState(false)
  const [showSetIncome, setShowSetIncome] = useState(false)
  const [incomeInput, setIncomeInput] = useState('')
  const [incomeError, setIncomeError] = useState('')

  // Compute month key for the displayed month
  const displayDate = new Date()
  displayDate.setMonth(displayDate.getMonth() + monthOffset)
  const displayKey = displayDate.getFullYear() + '-' + String(displayDate.getMonth() + 1).padStart(2, '0')
  const displayLabel = displayDate.toLocaleString('en-CA', { month: 'long', year: 'numeric' })

  // Aggregate for the displayed month
  const spentByCat = {}
  categories.forEach(c => { spentByCat[c.id] = 0 })
  transactions.forEach(t => {
    if (t.date.slice(0, 7) === displayKey && spentByCat[t.category] !== undefined) {
      spentByCat[t.category] += t.amount
    }
  })
  const totalSpent = Object.values(spentByCat).reduce((a, b) => a + b, 0)
  const investingSpent = spentByCat['investing'] || 0
  const remaining = income - totalSpent
  const savingsRate = income > 0 ? Math.round((investingSpent / income) * 100) : 0

  const saveIncome = () => {
    const v = parseFloat(incomeInput)
    if (isNaN(v) || v < 0) { setIncomeError('Enter a valid amount'); return }
    setIncome(v)
    setIncomeInput('')
    setIncomeError('')
    setShowSetIncome(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMonthOffset(o => o - 1)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Previous month"
        >
          <Icon name="chevronLeft" />
        </button>
        <h2 className="text-base font-semibold capitalize">{displayLabel}</h2>
        <button
          onClick={() => setMonthOffset(o => Math.min(0, o + 1))}
          disabled={monthOffset === 0}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
          aria-label="Next month"
        >
          <Icon name="chevronRight" />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Income" value={fmt(income)} />
        <StatCard
          label="Remaining"
          value={fmt(remaining)}
          tone={remaining < 0 ? 'danger' : remaining < income * 0.1 ? 'warning' : 'normal'}
        />
        <StatCard label="Spent" value={fmt(totalSpent)} sub={`${income > 0 ? Math.round((totalSpent / income) * 100) : 0}% of income`} />
        <StatCard label="Invested" value={fmt(investingSpent)} sub={`${savingsRate}% savings rate`} tone="success" />
      </div>

      {/* Donut + legend */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Spending by category</h3>
        <div className="flex gap-4 items-center">
          <div className="w-[140px] flex-shrink-0">
            <DonutChart categories={categories} spentByCat={spentByCat} />
          </div>
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {categories.map(cat => {
              const spent = spentByCat[cat.id] || 0
              const pct = cat.budget > 0 ? Math.min(100, (spent / cat.budget) * 100) : 0
              const over = spent > cat.budget
              const c = COLORS[cat.color] || COLORS.gray
              return (
                <div key={cat.id} className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.bar }} />
                  <span className="text-xs truncate flex-1 min-w-0">{cat.name}</span>
                  <span className={`text-xs font-medium tabular-nums flex-shrink-0 ${over ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {fmt(spent)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Category budget bars */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Budget tracker</h3>
        <div className="flex flex-col gap-3">
          {categories.map(cat => {
            const spent = spentByCat[cat.id] || 0
            const pct = cat.budget > 0 ? Math.min(100, (spent / cat.budget) * 100) : 0
            const over = spent > cat.budget
            const c = COLORS[cat.color] || COLORS.gray
            return (
              <div key={cat.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-medium">{cat.name}</span>
                  <span className={`text-xs tabular-nums ${over ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {fmt(spent)} / {fmt(cat.budget)}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: pct + '%', background: over ? '#ef4444' : c.bar }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Btn onClick={() => setShowAddTx(true)} variant="primary" size="lg" className="w-full">
          <Icon name="plus" className="w-4 h-4" /> Add transaction
        </Btn>
        <Btn onClick={() => setShowSetIncome(true)} variant="secondary" size="lg" className="w-full">
          Set income
        </Btn>
      </div>

      {/* Add Transaction Modal */}
      {showAddTx && (
        <AddTransactionModal
          categories={categories}
          onAdd={(tx) => { onAddTransaction(tx); setShowAddTx(false) }}
          onClose={() => setShowAddTx(false)}
        />
      )}

      {/* Set Income Modal */}
      {showSetIncome && (
        <Modal title="Monthly Income" onClose={() => setShowSetIncome(false)} footer={
          <>
            <Btn variant="secondary" onClick={() => setShowSetIncome(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={saveIncome}>Save</Btn>
          </>
        }>
          <Input
            label="Net monthly income"
            type="number"
            placeholder={income ? String(income) : '0.00'}
            value={incomeInput}
            onChange={e => { setIncomeInput(e.target.value); setIncomeError('') }}
            error={incomeError}
            autoFocus
          />
          {income > 0 && (
            <p className="text-xs text-slate-400 mt-2">Current income: {fmt(income)}</p>
          )}
        </Modal>
      )}
    </div>
  )
}

function AddTransactionModal({ categories, onAdd, onClose }) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    desc: '', amount: '', category: categories[0]?.id || '', date: today
  })
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) e.amount = 'Enter a positive amount'
    if (!form.category) e.category = 'Select a category'
    if (!form.date) e.date = 'Pick a date'
    return e
  }

  const submit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onAdd({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      desc: form.desc.trim(),
      amount: parseFloat(form.amount),
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
        <Input
          label="Description (optional)"
          type="text"
          placeholder="e.g. Groceries at IGA"
          value={form.desc}
          onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
          autoFocus
        />
        <Input
          label="Amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={form.amount}
          onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(er => ({ ...er, amount: '' })) }}
          error={errors.amount}
        />
        <Select
          label="Category"
          value={form.category}
          onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(er => ({ ...er, category: '' })) }}
          error={errors.category}
        >
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(er => ({ ...er, date: '' })) }}
          error={errors.date}
        />
      </div>
    </Modal>
  )
}
