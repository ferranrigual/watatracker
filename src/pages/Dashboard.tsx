import { useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import BottomNav, { Category } from '../components/BottomNav'
import CategoryTab from '../components/CategoryTab'

interface Props {
  session: Session
}

export default function Dashboard({ session }: Props) {
  const [activeTab, setActiveTab] = useState<Category>('water')

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <span className="text-sm font-semibold text-white">WataTracker</span>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-1 text-sm text-slate-400 active:text-white"
        >
          Log out
        </button>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <CategoryTab key={activeTab} category={activeTab} session={session} />
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
