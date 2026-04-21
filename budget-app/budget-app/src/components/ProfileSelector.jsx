import { useState } from 'react'
import { Btn, Input } from './ui'

export default function ProfileSelector({ profiles, activeId, onCreate, onSwitch }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(profiles.length === 0)

  const submit = () => {
    if (!name.trim()) { setError('Enter a name'); return }
    onCreate(name.trim())
  }

  if (creating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-xs">
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Budget Tracker</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create your profile to get started.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              label="Your name"
              placeholder="e.g. Anthony"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && submit()}
              error={error}
              autoFocus
            />
            <Btn onClick={submit} disabled={!name.trim()} size="lg" className="w-full">
              Create profile →
            </Btn>
          </div>
          {profiles.length > 0 && (
            <button
              onClick={() => setCreating(false)}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mt-4 w-full text-center transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-xs">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Budget Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Who are you?</p>
        </div>
        <div className="flex flex-col gap-2 mb-5">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => onSwitch(p.id)}
              className="px-4 py-3.5 rounded-xl border text-left font-medium transition-all hover:scale-[1.01]
                bg-white dark:bg-slate-900
                border-slate-200 dark:border-slate-700
                hover:border-slate-900 dark:hover:border-white
                text-slate-800 dark:text-slate-200"
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setName(''); setCreating(true) }}
          className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          + Add profile
        </button>
      </div>
    </div>
  )
}
