'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleAuth = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        if (typeof window !== 'undefined' && window.pendo) {
          pendo.track('user_signed_in', {
            auth_method: 'email',
            success: true,
          })
        }
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        if (typeof window !== 'undefined' && window.pendo) {
          pendo.track('account_created', {
            auth_method: 'email',
            success: true,
          })
        }
        setMessage('Account created! You can now sign in.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#FDF6EC'}}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{backgroundColor: '#1B4332'}}>
            <span className="text-white text-xl font-bold">G</span>
          </div>
          <h1 className="text-3xl font-bold" style={{fontFamily: 'Georgia, serif', color: '#1B4332'}}>
            GrantPilot
          </h1>
          <p className="text-sm mt-1" style={{color: '#78716C'}}>
            Your African business deserves to be funded
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{backgroundColor: 'white', border: '1px solid #D6C4AF', boxShadow: '0 1px 8px rgba(0,0,0,0.06)'}}>

          {/* Toggle */}
          <div className="flex rounded-xl p-1 mb-6" style={{backgroundColor: '#F5E6D3'}}>
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={isLogin
                ? {backgroundColor: 'white', color: '#1B4332', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}
                : {color: '#78716C'}
              }
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={!isLogin
                ? {backgroundColor: 'white', color: '#1B4332', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}
                : {color: '#78716C'}
              }
            >
              Create Account
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#1C1917'}}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{border: '1px solid #D6C4AF', backgroundColor: '#FDF6EC'}}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{color: '#1C1917'}}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{border: '1px solid #D6C4AF', backgroundColor: '#FDF6EC'}}
              />
            </div>

            {error && (
              <div className="text-sm px-4 py-2.5 rounded-xl" style={{backgroundColor: '#FEF2F2', color: '#DC2626'}}>
                {error}
              </div>
            )}
            {message && (
              <div className="text-sm px-4 py-2.5 rounded-xl" style={{backgroundColor: '#F0FDF4', color: '#166534'}}>
                {message}
              </div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-xl text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{backgroundColor: '#1B4332'}}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{color: '#78716C'}}>
          Built for African founders 🌍
        </p>
      </div>
    </div>
  )
}