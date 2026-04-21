// Shared primitive UI components

export function Btn({ children, onClick, variant = 'primary', size = 'md', type = 'button', disabled, className = '' }) {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1',
    md: 'px-4 py-2.5 text-sm gap-1.5',
    lg: 'px-5 py-3 text-base gap-2'
  }
  const variants = {
    primary:   'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 focus-visible:ring-slate-900',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 focus-visible:ring-slate-500',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
    ghost:     'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:ring-slate-500'
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>}
      <input
        {...props}
        className={`px-3 py-2.5 rounded-xl border text-sm transition-colors
          bg-slate-50 dark:bg-slate-800
          border-slate-200 dark:border-slate-700
          focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent
          placeholder:text-slate-400
          ${error ? 'border-red-400 focus:ring-red-500' : ''}
          ${className}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-slate-600 dark:text-slate-400">{label}</label>}
      <select
        {...props}
        className={`px-3 py-2.5 rounded-xl border text-sm transition-colors
          bg-slate-50 dark:bg-slate-800
          border-slate-200 dark:border-slate-700
          focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent
          ${error ? 'border-red-400' : ''}
          ${className}`}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, sub, tone }) {
  const tones = {
    danger:  'text-red-500',
    success: 'text-green-500',
    normal:  'text-slate-900 dark:text-white'
  }
  return (
    <Card className="p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${tones[tone] || tones.normal}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </Card>
  )
}
