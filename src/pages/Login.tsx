import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const email = `${username.trim().toLowerCase()}@watatracker.app`

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      // Account doesn't exist yet — create it
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) setError(signUpError.message)
    }

    setLoading(false)
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-slate-900 px-6">
      <h1 className="mb-8 text-3xl font-bold text-white">WataTracker</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500"
          autoComplete="username"
          autoCapitalize="none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500"
          autoComplete="current-password"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white disabled:opacity-50 active:bg-sky-700"
        >
          {loading ? 'Please wait…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}
