import { useEffect, useRef, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { Category } from './BottomNav'

interface CategoryConfig {
  label: string
  emoji: string
  increment: number
  unit: string
}

const CONFIG: Record<Category, CategoryConfig> = {
  water:    { label: 'Water',          emoji: '💧', increment: 100, unit: 'ml'      },
  strength: { label: 'Strength',       emoji: '🏋️', increment: 10,  unit: 'minutes' },
  cardio:   { label: 'Cardio',         emoji: '🏃', increment: 10,  unit: 'minutes' },
}

const FLUSH_DELAY = 600
const HISTORY_DAYS = 14
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function localDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface DayTotal {
  date: string
  label: string
  total: number
  isToday: boolean
}

interface Props {
  category: Category
  session: Session
}

export default function CategoryTab({ category, session }: Props) {
  const [total, setTotal] = useState<number | null>(null)
  const [history, setHistory] = useState<DayTotal[]>([])
  const config = CONFIG[category]
  const pendingRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function fetchData() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - (HISTORY_DAYS - 1))

    const { data } = await supabase
      .from('tracking_entries')
      .select('amount, created_at')
      .eq('category', category)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', tomorrow.toISOString())

    // Group by LOCAL date
    const byDate: Record<string, number> = {}
    for (const row of data ?? []) {
      const d = new Date(row.created_at)
      const date = localDateStr(d)
      byDate[date] = (byDate[date] ?? 0) + row.amount
    }

    // Build history using local dates
    const todayStr = localDateStr(today)
    const days: DayTotal[] = []
    for (let i = 0; i < HISTORY_DAYS; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      const dateStr = localDateStr(d)
      days.push({
        date: dateStr,
        label: DAY_LABELS[d.getDay()],
        total: byDate[dateStr] ?? 0,
        isToday: dateStr === todayStr,
      })
    }

    setTotal(byDate[todayStr] ?? 0)
    setHistory(days)
  }

  useEffect(() => {
    setTotal(null)
    setHistory([])
    fetchData()
  }, [category])

  // Flush pending presses on unmount (e.g. switching tabs)
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pendingRef.current > 0) flush()
    }
  }, [category])

  async function flush() {
    const amount = pendingRef.current * config.increment
    pendingRef.current = 0
    if (amount === 0) return
    await supabase.from('tracking_entries').insert({
      user_id: session.user.id,
      category,
      amount,
    })
  }

  function handleAdd() {
    pendingRef.current += 1
    setTotal((prev) => (prev ?? 0) + config.increment)
    setHistory((prev) =>
      prev.map((day) =>
        day.isToday ? { ...day, total: day.total + config.increment } : day
      )
    )

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, FLUSH_DELAY)
  }

  const maxTotal = Math.max(...history.map((d) => d.total), 1)

  return (
    <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto pb-24 pt-6">
      <div className="text-center">
        <div className="text-5xl">{config.emoji}</div>
        <h2 className="mt-2 text-2xl font-bold text-white">{config.label}</h2>
        <p className="mt-1 text-sm text-slate-400">+{config.increment} {config.unit} per tap</p>
      </div>

      <div className="text-center">
        <div className="text-6xl font-bold tabular-nums text-white">
          {total === null ? '—' : total}
        </div>
        <div className="mt-1 text-lg text-slate-400">{config.unit} today</div>
      </div>

      <button
        onClick={handleAdd}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-600 text-4xl font-bold text-white shadow-lg shadow-sky-900/50 transition-transform active:scale-95"
        aria-label={`Add ${config.increment} ${config.unit}`}
      >
        +
      </button>

      {history.length > 0 && (
        <div className="w-full max-w-sm px-4">
          <h3 className="mb-3 text-center text-sm font-medium text-slate-400">Last {HISTORY_DAYS} days</h3>
          <div className="flex items-end gap-1" style={{ height: 120 }}>
            {history.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={`w-full rounded-t ${day.isToday ? 'bg-sky-500' : 'bg-slate-600'}`}
                  style={{
                    height: day.total > 0 ? Math.max((day.total / maxTotal) * 100, 4) : 0,
                    transition: 'height 0.2s ease',
                  }}
                />
                <span className={`text-[10px] ${day.isToday ? 'text-sky-400 font-bold' : 'text-slate-500'}`}>
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
