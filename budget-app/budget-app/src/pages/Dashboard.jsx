import { useState } from 'react'
import { Card, StatCard, Btn, Input } from '../components/ui'
import Modal from '../components/Modal'
import DonutChart from '../components/DonutChart'
import BarChart from '../components/BarChart'
import Icon from '../components/Icon'
import { COLORS } from '../constants'
import { fmt, offsetMonthKey, monthKeyToLabel, daysInMonth } from '../utils'

export default function Dashboard({ incomes, getIncome, setIncomeForMonth, categories, transactions, onAddTransaction }) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [showAddTx, setShowAddTx] = useState(false)
  const [showSetIncome, setShowSetIncome] = useState(false)

  const displayKey = offsetMonthKey(monthOffset)
  const currentKey = offsetMonthKey(0)
  const isCurrentMonth = displayKey === currentKey
  const displayLabel = monthKeyToLabel(displayKey)
  const income = getIncome(displayKey)

  // Spending aggregation for displayed month
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

  // Forecast (current month only)
  let forecast = null
  if (isCurrentMonth && totalSpent > 0) {
    const today = new Date()
    const dayOfMonth = today.getDate()
    const totalDays = daysInMonth(displayKey)
    const dailyRate = totalSpent / dayOfMonth
    const projectedTotal = dailyRate * totalDays
    const projectedRemaining = income - projectedTotal
    forecast = { dailyRate, projectedTotal, projectedRemaining, dayOfMonth, totalDays, isOnTrack: projectedTotal <= income || income === 0 }
  }

  // Bar chart data: last 6 months
  const last6 = Array.from({ length: 6 }, (_, i) => offsetMonthKey(i - 5))
  const spentByMonth = {}
  last6.forEach(mk => {
    spentByMonth[mk] = transactions
      .filter(t => t.date.slice(0, 7) === mk)
      .reduce((s, t) => s + t.amount, 0)
  })

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
        <div className="text-center">
          <h2 className="text-base font-semibold capitalize">{displayLabel}</h2>
          {!isCurrentMonth && (
            <button onClick={() => setMonthOffset(0)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to today
            </button>
          )}
        </div>
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
          tone={remaining < 0 ? 'danger' : remaining < income * 0.1 && income > 0 ? 'warning' : 'normal'}
        />
        <StatCard
          label="Spent"
          value={fmt(totalSpent)}
          sub={income > 0 ? Math.round((totalSpent / income) * 100) + '% of income' : undefined}
        />
        <StatCard
          label="Invested"
          value={fmt(investingSpent)}
          sub={savingsRate > 0 ? savingsRate + '% savings rate' : undefined}
          tone="success"
        />
      </div>

      {/* Forecast card (current month only) */}
      {forecast && income > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Month forecast</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${forecast.isOnTrack ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
              {forecast.isOnTrack ? 'On track' : 'Over budget'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Daily pace</div>
              <div className="text-sm font-semibold">{fmt(forecast.dailyRate)}/day</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">Projected total</div>
              <div className={`text-sm font-semibold ${!forecast.isOnTrack ? 'text-red-500' : ''}`}>{fmt(forecast.projectedTotal)}</div>
            </div>
          </div>
          <div className="text-xs mb-2 font-medium" style={{ color: forecast.isOnTrack ? '#16a34a' : '#ef4444' }}>
            {forecast.isOnTrack
              ? 'Projected to stay under budget by ' + fmt(-forecast.projectedRemaining)
              : 'Projected to overspend by ' + fmt(forecast.projectedTotal - income)
            }
          </div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Day {forecast.dayOfMonth} of {forecast.totalDays}</span>
            <span>{income > 0 ? Math.round((forecast.projectedTotal / income) * 100) : 0}% of income</span>
          </div>
          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: Math.min(100, income > 0 ? (forecast.projectedTotal / income) * 100 : 0) + '%',
                background: forecast.isOnTrack ? '#22c55e' : '#ef4444'
              }}
            />
          </div>
        </Card>
      )}

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
              const c = COLORS[cat.color] || COLORS.gray
              return (
                <div key={cat.id} className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.bar }} />
                  <span className="text-xs truncate flex-1 min-w-0">{cat.name}</span>
                  <span className={`text-xs font-medium tabular-nums flex-shrink-0 ${spent > cat.budget ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {fmt(spent)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Budget bars */}
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

      {/* 6-month bar chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-4">Last 6 months</h3>
        <BarChart monthKeys={last6} spentByMonth={spentByMonth} incomeByMonth={incomes} />
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block rounded" /> Spending</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0 border-t-2 border-dashed border-green-500 inline-block" /> Income</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" /> Over budget</span>
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

      {showAddTx && (
        <AddTransactionModal
          categories={categories}
          onAdd={(tx) => { onAddTransaction(tx); setShowAddTx(false) }}
          onClose={() => setShowAddTx(false)}
        />
      )}

      {showSetIncome && (
        <SetIncomeModal
          displayKey={displayKey}
          currentAmount={income}
          onSave={(amount, asDefault) => { setIncomeForMonth(displayKey, amount, asDefault); setShowSetIncome(false) }}
          onClose={() => setShowSetIncome(false)}
        />
      )}
    </div>
  )
}

function SetIncomeModal({ displayKey, currentAmount, onSave, onClose }) {
  const [amount, setAmount] = useState(currentAmount > 0 ? String(currentAmount) : '')
  const [asDefault, setAsDefault] = useState(false)
  const [error, setError] = useState('')

  const submit = () => {
    const v = parseFloat(amount)
    if (isNaN(v) || v < 0) { setError('Enter a valid amount'); return }
    onSave(v, asDefault)
  }

  return (
    <Modal
      title={'Income for ' + monthKeyToLabel(displayKey)}
      onClose={onClose}
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={submit}>Save</Btn>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          label="Net monthly income"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={e => { setAmount(e.target.value); setError('') }}
          error={error}
          autoFocus
        />
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={asDefault}
            onChange={e => setAsDefault(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-slate-600 dark:text-slate-300">Also set as default for all months</span>
        </label>
      </div>
    </Modal>
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
    onAdd({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 6), desc: form.desc.trim(), amount: amt, category: form.category, date: form.date })
  }

  return (
    <Modal title="Add Transaction" onClose={onClose} footer={
      <>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>Add</Btn>
      </>
    }>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Description (optional)</label>
          <input type="text" placeholder="e.g. Groceries at IGA" value={form.desc}
            onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
            className="px-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
            autoFocus />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Amount</label>
          <input type="number" step="0.01" placeholder="0.00" value={form.amount}
            onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(er => ({ ...er, amount: '' })) }}
            className={`px-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white ${errors.amount ? 'border-red-400' : ''}`} />
          {errors.amount && <span className="text-xs text-red-500">{errors.amount}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Category</label>
          <select value={form.category} onChange={e => { setForm(f => ({ ...f, category: e.target.value })); setErrors(er => ({ ...er, category: '' })) }}
            className="px-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Date</label>
          <input type="date" value={form.date}
            onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setErrors(er => ({ ...er, date: '' })) }}
            className="px-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white" />
        </div>
      </div>
    </Modal>
  )
}
