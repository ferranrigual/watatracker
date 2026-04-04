type Category = 'water' | 'strength' | 'cardio'

interface Tab {
  id: Category
  label: string
  emoji: string
}

const TABS: Tab[] = [
  { id: 'water',    label: 'Water',    emoji: '💧' },
  { id: 'strength', label: 'Strength', emoji: '🏋️' },
  { id: 'cardio',   label: 'Cardio',   emoji: '🏃' },
]

interface Props {
  active: Category
  onChange: (tab: Category) => void
}

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-slate-700 bg-slate-900">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
            active === tab.id
              ? 'text-sky-400'
              : 'text-slate-500 active:text-slate-300'
          }`}
        >
          <span className="text-xl">{tab.emoji}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

export type { Category }
