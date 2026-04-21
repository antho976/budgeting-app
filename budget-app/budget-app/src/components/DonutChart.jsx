import { useRef, useEffect } from 'react'
import { COLORS } from '../constants'

// Donut chart built on Canvas — no external library
export default function DonutChart({ categories, spentByCat }) {
  const canvasRef = useRef(null)

  const segments = categories
    .map(cat => ({
      cat,
      value: spentByCat[cat.id] || 0,
      color: (COLORS[cat.color] || COLORS.gray).bar
    }))
    .filter(s => s.value > 0)

  const total = segments.reduce((s, x) => s + x.value, 0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const size = canvas.offsetWidth
    canvas.width = size * dpr
    canvas.height = size * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)

    const cx = size / 2
    const cy = size / 2
    const outerR = size * 0.42
    const innerR = size * 0.27
    const gap = 0.025

    if (segments.length === 0) {
      ctx.beginPath()
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2)
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true)
      ctx.fillStyle = '#e2e8f0'
      ctx.fill()
      return
    }

    let startAngle = -Math.PI / 2
    segments.forEach(seg => {
      const slice = (seg.value / total) * (Math.PI * 2) - gap
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, outerR, startAngle, startAngle + slice)
      ctx.arc(cx, cy, innerR, startAngle + slice, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      startAngle += slice + gap
    })
  }, [segments, total])

  return (
    <div className="relative flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full aspect-square max-w-[180px]" />
      <div className="absolute text-center pointer-events-none">
        <div className="text-xs text-slate-500 dark:text-slate-400">Spent</div>
        <div className="text-lg font-bold tabular-nums">${Math.round(total).toLocaleString('en-CA')}</div>
      </div>
    </div>
  )
}
