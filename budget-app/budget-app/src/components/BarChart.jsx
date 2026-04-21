import { useRef, useEffect } from 'react'

function drawRoundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export default function BarChart({ monthKeys, spentByMonth, incomeByMonth }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      if (w === 0 || h === 0) return
      canvas.width = w * dpr
      canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      const textColor = '#94a3b8'
      const gridColor = 'rgba(148,163,184,0.15)'
      const barColor = '#6366f1'
      const overColor = '#ef4444'
      const incomeLineColor = '#22c55e'

      const padL = 42, padR = 8, padT = 16, padB = 32
      const chartW = w - padL - padR
      const chartH = h - padT - padB

      const totals = monthKeys.map(m => spentByMonth[m] || 0)
      const incomes = monthKeys.map(m => incomeByMonth[m] ?? incomeByMonth.default ?? 0)
      const maxVal = Math.max(...totals, ...incomes.filter(Boolean), 100)

      const barSlot = chartW / monthKeys.length
      const barW = barSlot * 0.55
      const barOffset = (barSlot - barW) / 2

      // Horizontal grid lines + Y labels
      const ySteps = 4
      for (let i = 0; i <= ySteps; i++) {
        const val = (maxVal / ySteps) * i
        const y = padT + chartH - (val / maxVal) * chartH
        ctx.strokeStyle = gridColor
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(padL, y)
        ctx.lineTo(padL + chartW, y)
        ctx.stroke()

        ctx.fillStyle = textColor
        ctx.font = '9px -apple-system,sans-serif'
        ctx.textAlign = 'right'
        const lbl = val >= 1000 ? '$' + Math.round(val / 1000) + 'k' : '$' + Math.round(val)
        ctx.fillText(lbl, padL - 5, y + 3)
      }

      // Bars
      monthKeys.forEach((m, i) => {
        const total = spentByMonth[m] || 0
        const inc = incomeByMonth[m] ?? incomeByMonth.default ?? 0
        const barH = Math.max(total > 0 ? 3 : 0, (total / maxVal) * chartH)
        const x = padL + i * barSlot + barOffset
        const y = padT + chartH - barH
        const isOver = inc > 0 && total > inc

        ctx.fillStyle = isOver ? overColor : barColor
        ctx.globalAlpha = 0.85
        drawRoundRect(ctx, x, y, barW, barH, 4)
        ctx.fill()
        ctx.globalAlpha = 1

        // Month label
        ctx.fillStyle = textColor
        ctx.font = '10px -apple-system,sans-serif'
        ctx.textAlign = 'center'
        const [yr, mo] = m.split('-').map(Number)
        const lbl = new Date(yr, mo - 1).toLocaleString('en-CA', { month: 'short' })
        ctx.fillText(lbl, x + barW / 2, h - padB + 16)

        // Amount on top
        if (barH > 22 && total > 0) {
          ctx.fillStyle = textColor
          ctx.font = '8px -apple-system,sans-serif'
          ctx.textAlign = 'center'
          const amt = total >= 1000 ? '$' + (total / 1000).toFixed(1) + 'k' : '$' + Math.round(total)
          ctx.fillText(amt, x + barW / 2, y - 3)
        }
      })

      // Income dashed line
      const defaultInc = incomeByMonth.default || 0
      if (defaultInc > 0) {
        const y = padT + chartH - (defaultInc / maxVal) * chartH
        ctx.strokeStyle = incomeLineColor
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 3])
        ctx.beginPath()
        ctx.moveTo(padL, y)
        ctx.lineTo(padL + chartW, y)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = incomeLineColor
        ctx.font = '9px -apple-system,sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('Income', padL + 3, y - 4)
      }
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [monthKeys, spentByMonth, incomeByMonth])

  return <canvas ref={canvasRef} className="w-full" style={{ height: '180px' }} />
}
