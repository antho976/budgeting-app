import { useState } from 'react'
import Papa from 'papaparse'
import { Card, Btn, Input } from '../components/ui'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { DEFAULT_CATEGORIES } from '../constants'

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-CA')

export default function Settings({
  income, setIncome,
  categories, setCategories,
  transactions, setTransactions
}) {
  const [showReset, setShowReset] = useState(false)
  const [incomeInput, setIncomeInput] = useState('')
  const [incomeError, setIncomeError] = useState('')
  const [incomeSaved, setIncomeSaved] = useState(false)

  const saveIncome = () => {
    const v = parseFloat(incomeInput)
    if (isNaN(v) || v < 0) { setIncomeError('Enter a valid positive amount'); return }
    setIncome(v)
    setIncomeInput('')
    setIncomeError('')
    setIncomeSaved(true)
    setTimeout(() => setIncomeSaved(false), 2000)
  }

  const exportCSV = () => {
    const rows = transactions.map(t => ({
      Date: t.date,
      Description: t.desc || '',
      Category: categories.find(c => c.id === t.category)?.name || t.category,
      Amount: t.amount
    }))
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetAll = () => {
    setIncome(0)
    setCategories(DEFAULT_CATEGORIES)
    setTransactions([])
    setShowReset(false)
  }

  const totalTransactions = transactions.length
  const oldestDate = transactions.length
    ? [...transactions].sort((a, b) => a.date.localeCompare(b.date))[0].date
    : null

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Income */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Monthly income</h3>
        <div className="flex flex-col gap-2">
          <Input
            label={`Current: ${income > 0 ? fmt(income) : 'Not set'}`}
            type="number"
            placeholder="Net monthly income"
            value={incomeInput}
            onChange={e => { setIncomeInput(e.target.value); setIncomeError('') }}
            error={incomeError}
          />
          <Btn onClick={saveIncome} variant={incomeSaved ? 'secondary' : 'primary'} className="self-start">
            {incomeSaved ? '✓ Saved' : 'Update income'}
          </Btn>
        </div>
      </Card>

      {/* Data summary */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Your data</h3>
        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Transactions</span>
            <span className="font-medium">{totalTransactions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Categories</span>
            <span className="font-medium">{categories.length}</span>
          </div>
          {oldestDate && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Tracking since</span>
              <span className="font-medium">{oldestDate}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Export */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-1">Export</h3>
        <p className="text-xs text-slate-400 mb-3">Download all your transactions as a CSV file.</p>
        <Btn onClick={exportCSV} variant="secondary" disabled={transactions.length === 0}>
          <Icon name="download" className="w-4 h-4" /> Export CSV ({totalTransactions} rows)
        </Btn>
      </Card>

      {/* Danger zone */}
      <Card className="p-4 border-red-100 dark:border-red-900">
        <h3 className="text-sm font-semibold mb-1 text-red-600">Danger zone</h3>
        <p className="text-xs text-slate-400 mb-3">Permanently delete all data including transactions and categories.</p>
        <Btn onClick={() => setShowReset(true)} variant="danger" size="sm">
          Reset all data
        </Btn>
      </Card>

      {/* Confirm reset modal */}
      {showReset && (
        <Modal
          title="Reset all data?"
          onClose={() => setShowReset(false)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setShowReset(false)}>Cancel</Btn>
              <Btn variant="danger" onClick={resetAll}>Yes, delete everything</Btn>
            </>
          }
        >
          <div className="flex items-start gap-3">
            <Icon name="alertTriangle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">This will delete:</p>
              <ul className="text-sm text-slate-500 mt-1 list-disc list-inside space-y-0.5">
                <li>All {totalTransactions} transactions</li>
                <li>All {categories.length} categories</li>
                <li>Your income setting</li>
              </ul>
              <p className="text-xs text-red-500 mt-2 font-medium">This cannot be undone.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
