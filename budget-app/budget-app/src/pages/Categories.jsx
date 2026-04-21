import { useState } from 'react'
import { Card, Btn, Input, Select } from '../components/ui'
import Modal from '../components/Modal'
import Icon from '../components/Icon'
import { COLORS, COLOR_NAMES } from '../constants'

const fmt = (n) => '$' + Math.round(n).toLocaleString('en-CA')

export default function Categories({
  categories,
  transactions,
  onAdd,
  onEdit,
  onDelete
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Current month spending per category
  const km = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')
  const spentByCat = {}
  categories.forEach(c => { spentByCat[c.id] = 0 })
  transactions.forEach(t => {
    if (t.date.slice(0, 7) === km && spentByCat[t.category] !== undefined) {
      spentByCat[t.category] += t.amount
    }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Btn onClick={() => setShowAdd(true)} size="sm">
          <Icon name="plus" className="w-4 h-4" /> Add
        </Btn>
      </div>

      <div className="flex flex-col gap-3">
        {categories.map(cat => {
          const spent = spentByCat[cat.id] || 0
          const pct = cat.budget > 0 ? Math.min(100, (spent / cat.budget) * 100) : 0
          const over = spent > cat.budget
          const c = COLORS[cat.color] || COLORS.gray
          const txCount = transactions.filter(t => t.category === cat.id).length

          return (
            <Card key={cat.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.bar }} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{cat.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{txCount} transaction{txCount !== 1 ? 's' : ''} total</div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditTarget(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label="Edit"
                  >
                    <Icon name="pencil" className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    aria-label="Delete"
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-1.5">
                <span className={`text-xs ${over ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                  {fmt(spent)} spent
                </span>
                <span className="text-xs text-slate-400">Budget: {fmt(cat.budget)}</span>
              </div>

              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: pct + '%', background: over ? '#ef4444' : c.bar }}
                />
              </div>

              {over && (
                <div className="flex items-center gap-1.5 mt-2 text-red-500">
                  <Icon name="alertTriangle" className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Over budget by {fmt(spent - cat.budget)}</span>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Add modal */}
      {showAdd && (
        <CategoryFormModal
          title="Add Category"
          onSave={(data) => { onAdd(data); setShowAdd(false) }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <CategoryFormModal
          title="Edit Category"
          initial={editTarget}
          onSave={(data) => { onEdit({ ...editTarget, ...data }); setEditTarget(null) }}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <Modal
          title="Delete category?"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <Btn variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={() => { onDelete(deleteTarget.id); setDeleteTarget(null) }}>Delete</Btn>
            </>
          }
        >
          <div className="flex items-start gap-3">
            <Icon name="alertTriangle" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Delete "{deleteTarget.name}"?</p>
              <p className="text-xs text-slate-400 mt-1">
                Transactions in this category will remain but will show as "Unknown". This cannot be undone.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function CategoryFormModal({ title, initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [budget, setBudget] = useState(initial?.budget != null ? String(initial.budget) : '')
  const [color, setColor] = useState(initial?.color || COLOR_NAMES[0])
  const [errors, setErrors] = useState({})

  const submit = () => {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    const b = parseFloat(budget)
    if (isNaN(b) || b < 0) e.budget = 'Enter a valid budget'
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ name: name.trim(), budget: b, color })
  }

  return (
    <Modal title={title} onClose={onClose} footer={
      <>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={submit}>Save</Btn>
      </>
    }>
      <div className="flex flex-col gap-3">
        <Input label="Name" type="text" placeholder="e.g. Groceries" value={name}
          onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })) }}
          error={errors.name} autoFocus />
        <Input label="Monthly budget" type="number" step="1" placeholder="0" value={budget}
          onChange={e => { setBudget(e.target.value); setErrors(er => ({ ...er, budget: '' })) }}
          error={errors.budget} />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_NAMES.map(cn => (
              <button
                key={cn}
                type="button"
                onClick={() => setColor(cn)}
                className={`w-7 h-7 rounded-full transition-all ${color === cn ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-110'}`}
                style={{ background: COLORS[cn].bar }}
                aria-label={cn}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
