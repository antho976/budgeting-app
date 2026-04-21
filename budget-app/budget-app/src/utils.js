export const fmt = (n) => '$' + Math.round(n).toLocaleString('en-CA')

export const offsetMonthKey = (offset = 0) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

export const monthKeyToLabel = (key) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleString('en-CA', { month: 'long', year: 'numeric' })
}

export const daysInMonth = (key) => {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}
