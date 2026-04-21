import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Card, Btn, Input, Select } from '../components/ui'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { DEFAULT_CATEGORIES, COLORS, COLOR_NAMES } from '../constants'
import { fmt } from '../utils'

export default function Settings({
  profileId, profileName, profiles,
  incomes, setIncomes,
  categories, setCategories,
  transactions, setTransactions,
  recurring,
  onSwitchProfile, onCreateProfile, onDeleteProfile, onRenameProfile,
  onAddRecurring, onEditRecurring, onDeleteRecurring
}) {
  const [showReset, setShowReset] = useState(false)
  const [showAddProfile, setShowAddProfile] = useState(false)
  const [showRenameProfile, setShowRenameProfile] = useState(false)
  const [showDeleteProfile, setShowDeleteProfile] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const resetAll = () => {
    setIncomes({ default: 0 })
    setCategories(DEFAULT_CATEGORIES)
    setTransactions([])
    setShowReset(false)
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
    a.download = 'budget-export-' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportJSON = () => {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      profileName,
      incomes,
      categories,
      transactions,
      recurring
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'budget-backup-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJSON = (file) => {
    setImportError('')
    setImportSuccess(false)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.version !== 2) { setImportError('Unsupported file format (expected version 2)'); return }
        if (!Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
          setImportError('Invalid data structure in file')
          return
        }
        if (data.categories) setCategories(data.categories)
        if (data.transactions) setTransactions(data.transactions)
        if (data.incomes) setIncomes(data.incomes)
        setImportSuccess(true)
        setTimeout(() => setImportSuccess(false), 3000)
      } catch {
        setImportError('Could not parse file. Make sure it is a valid JSON backup.')
      }
    }
    reader.readAsText(file)
  }

  const oldestDate = transactions.length
    ? [...transactions].sort((a, b) => a.date.localeCompare(b.date))[0].date
    : null

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold">Settings</h2>

      {/* Profile */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Profile</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-lg flex-shrink-0">
            {profileName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{profileName}</div>
            <div className="text-xs text-slate-400">Current profile</div>
          </div>
          <Btn size="sm" variant="ghost" onClick={() => setShowRenameProfile(true)}>
            <Icon name="pencil" className="w-4 h-4" />
          </Btn>
        </div>

        {profiles.length > 1 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Switch profile:</p>
            <div className="flex flex-col gap-1">
              {profiles.filter(p => p.id !== profileId).map(p => (
                <button
                  key={p.id}
                  onClick={() => onSwitchProfile(p.id)}
                  className="text-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Btn size="sm" variant="secondary" onClick={() => setShowAddProfile(true)}>
            <Icon name="plus" className="w-3.5 h-3.5" /> Add profile
          </Btn>
          {profiles.length > 1 && (
            <Btn size="sm" variant="ghost" onClick={() => setShowDeleteProfile(true)}>
              <Icon name="trash" className="w-3.5 h-3.5" /> Delete profile
            </Btn>
          )}
        </div>
      </Card>

      {/* Recurring transactions */}
      <RecurringSection
        recurring={recurring}
        categories={categories}
        onAdd={onAddRecurring}
        onEdit={onEditRecurring}
        onDelete={onDeleteRecurring}
      />

      {/* Data summary */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Your data</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Transactions</span>
            <span className="font-medium">{transactions.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Categories</span>
            <span className="font-medium">{categories.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">Recurring templates</span>
            <span className="font-medium">{recurring.length}</span>
          </div>
          {oldestDate && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Tracking since</span>
              <span className="font-medium">{oldestDate}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Export / Import */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-1">Export & Import</h3>
        <p className="text-xs text-slate-400 mb-4">Back up your data or transfer it to another device.</p>
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">JSON backup (full restore)</p>
            <div className="flex gap-2">
              <Btn onClick={exportJSON} variant="secondary" size="sm" disabled={transactions.length === 0}>
                <Icon name="download" className="w-4 h-4" /> Export JSON
              </Btn>
              <Btn onClick={() => fileInputRef.current?.click()} variant="secondary" size="sm">
                Import JSON
              </Btn>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden"
                onChange={e => { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = '' }} />
            </div>
            {importError && <p className="text-xs text-red-500 mt-1.5">{importError}</p>}
            {importSuccess && <p className="text-xs text-green-600 dark:text-green-400 mt-1.5">Import successful!</p>}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">CSV (spreadsheet compatible)</p>
            <Btn onClick={exportCSV} variant="secondary" size="sm" disabled={transactions.length === 0}>
              <Icon name="download" className="w-4 h-4" /> Export CSV ({transactions.length} rows)
            </Btn>
          </div>
        </div>
      </Card>

      {/* Danger zone */}
      <Card className="p-4 border-red-100 dark:border-red-900/50">
        <h3 className="text-sm font-semibold mb-1 text-red-600">Danger zone</h3>
        <p className="text-xs text-slate-400 mb-3">Permanently delete all data for this profile.</p>
        <Btn onClick={() => setShowReset(true)} variant="danger" size="sm">Reset all data</Btn>
      </Card>

      {/* Modals */}
      {showReset && (
        <Modal title="Reset all data?" onClose={() => setShowReset(false)} footer={
          <>
            <Btn variant="secondary" onClick={() => setShowReset(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={resetAll}>Yes, delete everything</Btn>
          </>
        }>
          <div className="flex items-start gap-3">
            <Icon name="alertTriangle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">This will delete:</p>
              <ul className="text-sm text-slate-500 mt-1 list-disc list-inside space-y-0.5">
                <li>All {transactions.length} transactions</li>
                <li>All {categories.length} categories</li>
                <li>Your income settings</li>
              </ul>
              <p className="text-xs text-red-500 mt-2 font-medium">This cannot be undone.</p>
            </div>
          </div>
        </Modal>
      )}

      {showAddProfile && (
        <AddProfileModal
          onCreate={(name) => { onCreateProfile(name); setShowAddProfile(false) }}
          onClose={() => setShowAddProfile(false)}
        />
      )}

      {showRenameProfile && (
        <RenameProfileModal
          currentName={profileName}
          onRename={(name) => { onRenameProfile(profileId, name); setShowRenameProfile(false) }}
          onClose={() => setShowRenameProfile(false)}
        />
      )}

      {showDeleteProfile && (
        <Modal title="Delete this profile?" onClose={() => setShowDeleteProfile(false)} footer={
          <>
            <Btn variant="secondary" onClick={() => setShowDeleteProfile(false)}>Cancel</Btn>
            <Btn variant="danger" onClick={() => { onDeleteProfile(profileId); setShowDeleteProfile(false) }}>Delete</Btn>
          </>
        }>
          <div className="flex items-start gap-3">
            <Icon name="alertTriangle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Delete profile "{profileName}"?</p>
              <p className="text-xs text-slate-400 mt-1">All data for this profile will be permanently removed.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function RecurringSection({ recurring, categories, onAdd, onEdit, onDelete }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold">Recurring transactions</h3>
          <p className="text-xs text-slate-400 mt-0.5">Auto-added at the start of each month.</p>
        </div>
        <Btn size="sm" onClick={() => setShowAdd(true)}>
          <Icon name="plus" className="w-4 h-4" /> Add
        </Btn>
      </div>

      {recurring.length === 0 ? (
        <p className="text-xs text-slate-400 py-2">No recurring transactions. Add one for rent, subscriptions, etc.</p>
      ) : (
        <div className="flex flex-col">
          {recurring.map((r, i) => {
            const cat = categories.find(c => c.id === r.category)
            const c = cat ? (COLORS[cat.color] || COLORS.gray) : COLORS.gray
            return (
              <div key={r.id} className={`flex items-center gap-2 py-2.5 ${i < recurring.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.bar }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.desc || '(no description)'}</div>
                  <div className="text-xs text-slate-400">{cat?.name || 'Unknown'} · {fmt(r.amount)} · day {r.dayOfMonth}</div>
                </div>
                <button onClick={() => setEditTarget(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Icon name="pencil" className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(r.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                  <Icon name="trash" className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <RecurringFormModal
          categories={categories}
          onSave={(data) => { onAdd(data); setShowAdd(false) }}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editTarget && (
        <RecurringFormModal
          categories={categories}
          initial={editTarget}
          onSave={(data) => { onEdit({ ...editTarget, ...data }); setEditTarget(null) }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </Card>
  )
}

function RecurringFormModal({ categories, initial, onSave, onClose }) {
  const [form, setForm] = useState({
    desc: initial?.desc || '',
    amount: initial?.amount != null ? String(initial.amount) : '',
    category: initial?.category || categories[0]?.id || '',
    dayOfMonth: initial?.dayOfMonth || 1
  })
  const [errors, setErrors] = useState({})

  const submit = () => {
    const e = {}
    const amt = parseFloat(form.amount)
    if (isNaN(amt) || amt <= 0) e.amount = 'Enter a positive amount'
    const day = parseInt(form.dayOfMonth)
    if (isNaN(day) || day < 1 || day > 28) e.dayOfMonth = 'Enter a day between 1 and 28'
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ desc: form.desc.trim(), amount: amt, category: form.category, dayOfMonth: day })
  }

  return (
    <Modal title={initial ? 'Edit recurring' : 'Add recurring'} onClose={onClose} footer={
      <>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>Save</Btn>
      </>
    }>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
          <input type="text" placeholder="e.g. Rent" value={form.desc}
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
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="px-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white">
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Day of month (1–28)</label>
          <input type="number" min="1" max="28" value={form.dayOfMonth}
            onChange={e => { setForm(f => ({ ...f, dayOfMonth: e.target.value })); setErrors(er => ({ ...er, dayOfMonth: '' })) }}
            className={`px-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white ${errors.dayOfMonth ? 'border-red-400' : ''}`} />
          {errors.dayOfMonth && <span className="text-xs text-red-500">{errors.dayOfMonth}</span>}
        </div>
      </div>
    </Modal>
  )
}

function AddProfileModal({ onCreate, onClose }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const submit = () => {
    if (!name.trim()) { setError('Enter a name'); return }
    onCreate(name.trim())
  }
  return (
    <Modal title="Add profile" onClose={onClose} footer={
      <>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>Create</Btn>
      </>
    }>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Name</label>
        <input type="text" placeholder="e.g. Marie" value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="px-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
          autoFocus />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </Modal>
  )
}

function RenameProfileModal({ currentName, onRename, onClose }) {
  const [name, setName] = useState(currentName)
  const [error, setError] = useState('')
  const submit = () => {
    if (!name.trim()) { setError('Enter a name'); return }
    onRename(name.trim())
  }
  return (
    <Modal title="Rename profile" onClose={onClose} footer={
      <>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>Save</Btn>
      </>
    }>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Name</label>
        <input type="text" value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="px-3 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
          autoFocus />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </Modal>
  )
}
