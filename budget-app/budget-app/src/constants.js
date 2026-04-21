export const DEFAULT_CATEGORIES = [
  { id: 'restaurants', name: 'Restaurants', budget: 200, color: 'coral' },
  { id: 'subscriptions', name: 'Subscriptions', budget: 80, color: 'purple' },
  { id: 'entertainment', name: 'Entertainment', budget: 150, color: 'pink' },
  { id: 'investing', name: 'Investing', budget: 2083, color: 'green' },
  { id: 'shopping', name: 'Shopping', budget: 200, color: 'amber' },
  { id: 'other', name: 'Other', budget: 200, color: 'blue' }
]

export const COLORS = {
  teal:   { bar: '#14b8a6', light: '#99f6e4', dark: '#0f766e' },
  coral:  { bar: '#f97316', light: '#fed7aa', dark: '#c2410c' },
  amber:  { bar: '#f59e0b', light: '#fde68a', dark: '#b45309' },
  gray:   { bar: '#64748b', light: '#cbd5e1', dark: '#334155' },
  purple: { bar: '#8b5cf6', light: '#ddd6fe', dark: '#6d28d9' },
  pink:   { bar: '#ec4899', light: '#fbcfe8', dark: '#be185d' },
  green:  { bar: '#22c55e', light: '#bbf7d0', dark: '#15803d' },
  blue:   { bar: '#3b82f6', light: '#bfdbfe', dark: '#1d4ed8' },
  red:    { bar: '#ef4444', light: '#fecaca', dark: '#b91c1c' },
  indigo: { bar: '#6366f1', light: '#c7d2fe', dark: '#4338ca' },
  sky:    { bar: '#0ea5e9', light: '#bae6fd', dark: '#0369a1' },
  lime:   { bar: '#84cc16', light: '#d9f99d', dark: '#4d7c0f' }
}

export const COLOR_NAMES = Object.keys(COLORS)

// Navigation tabs
export const TABS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: 'home' },
  { id: 'transactions', label: 'Transactions', icon: 'list' },
  { id: 'categories',   label: 'Categories',   icon: 'tag' },
  { id: 'settings',     label: 'Settings',     icon: 'settings' }
]
