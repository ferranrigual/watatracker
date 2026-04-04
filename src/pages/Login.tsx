import { useState, FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setError('Account created! You can now log in.')
    setLoading(false)
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-slate-900 px-6">
      <h1 className="mb-8 text-3xl font-bold text-white">WataTracker</h1>

      <form className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500"
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-slate-800 px-4 py-3 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500"
          autoComplete="current-password"
        />

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white disabled:opacity-50 active:bg-sky-700"
        >
          {loading ? 'Please wait…' : 'Log in'}
        </button>

        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full rounded-xl bg-slate-700 py-3 font-semibold text-white disabled:opacity-50 active:bg-slate-600"
        >
          Sign up
        </button>
      </form>
    </div>
  )
}
