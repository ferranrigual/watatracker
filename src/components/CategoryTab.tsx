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

interface Props {
  category: Category
  session: Session
}

export default function CategoryTab({ category, session }: Props) {
  const [total, setTotal] = useState<number | null>(null)
  const config = CONFIG[category]
  const pendingRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function fetchTotal() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const { data } = await supabase
      .from('tracking_entries')
      .select('amount')
      .eq('category', category)
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())

    const sum = data?.reduce((acc, row) => acc + row.amount, 0) ?? 0
    setTotal(sum)
  }

  useEffect(() => {
    setTotal(null)
    fetchTotal()
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

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(flush, FLUSH_DELAY)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 pb-20">
      <div className="text-center">
        <div className="text-6xl">{config.emoji}</div>
        <h2 className="mt-4 text-2xl font-bold text-white">{config.label}</h2>
        <p className="mt-1 text-sm text-slate-400">+{config.increment} {config.unit} per tap</p>
      </div>

      <div className="text-center">
        <div className="text-7xl font-bold tabular-nums text-white">
          {total === null ? '—' : total}
        </div>
        <div className="mt-2 text-lg text-slate-400">{config.unit} today</div>
      </div>

      <button
        onClick={handleAdd}
        className="flex h-24 w-24 items-center justify-center rounded-full bg-sky-600 text-5xl font-bold text-white shadow-lg shadow-sky-900/50 transition-transform active:scale-95"
        aria-label={`Add ${config.increment} ${config.unit}`}
      >
        +
      </button>
    </div>
  )
}
