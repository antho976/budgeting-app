export const DEFAULT_CATEGORIES = [
  { id: 'restaurants', name: 'Restaurants', budget: 200, color: 'coral' },
  { id: 'subscriptions', name: 'Subscriptions', budget: 80, color: 'purple' },
  { id: 'entertainment', name: 'Entertainment', budget: 150, color: 'pink' },
  { id: 'investing', name: 'Investing', budget: 2083, color: 'green' },
  { id: 'shopping', name: 'Shopping', budget: 200, color: 'amber' },
  { id: 'other', name: 'Other', budget: 200, color: 'blue' }
]

export const COLORS = {
  teal:   { bar: '#14b8a6', light: '#ccfbf1', dark: '#0f766e' },
  coral:  { bar: '#f97316', light: '#ffedd5', dark: '#c2410c' },
  amber:  { bar: '#f59e0b', light: '#fef3c7', dark: '#b45309' },
  gray:   { bar: '#64748b', light: '#f1f5f9', dark: '#334155' },
  purple: { bar: '#8b5cf6', light: '#ede9fe', dark: '#6d28d9' },
  pink:   { bar: '#ec4899', light: '#fce7f3', dark: '#be185d' },
  green:  { bar: '#22c55e', light: '#dcfce7', dark: '#15803d' },
  blue:   { bar: '#3b82f6', light: '#dbeafe', dark: '#1d4ed8' },
  red:    { bar: '#ef4444', light: '#fee2e2', dark: '#b91c1c' }
}

export const COLOR_NAMES = Object.keys(COLORS)
