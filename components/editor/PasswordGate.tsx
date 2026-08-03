'use client'

import { useState, useRef, useEffect } from 'react'
import { Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const SESSION_KEY = 'dsj-editor-auth'

interface PasswordGateProps {
  children: React.ReactNode
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored === 'true') {
      setAuthed(true)
    }
    setChecking(false)
  }, [])

  // Auto-focus password input
  useEffect(() => {
    if (!checking && !authed && inputRef.current) {
      inputRef.current.focus()
    }
  }, [checking, authed])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim() || verifying) return

    setVerifying(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (data.ok) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        setAuthed(true)
      } else {
        setError(data.error || 'Incorrect password.')
        setPassword('')
        inputRef.current?.focus()
      }
    } catch {
      setError('Network error — please try again.')
    } finally {
      setVerifying(false)
    }
  }

  // Still checking session — show nothing
  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 size={20} className="animate-spin text-[color:var(--text-muted)]" />
      </div>
    )
  }

  // Authed — render children
  if (authed) {
    return <>{children}</>
  }

  // Password modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--text-muted) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div className="bg-[color:var(--surface)] border border-[color:var(--border)] rounded-xl p-8 shadow-lg">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--surface-raised)] border border-[color:var(--border)] mx-auto mb-6">
            <Lock size={18} className="text-[color:var(--text-muted)]" />
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-[color:var(--text-primary)] mb-1.5">
              Editor Access
            </h2>
            <p className="text-[0.8125rem] text-[color:var(--text-muted)] leading-relaxed">
              Enter the password to edit chapters.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError('')
                }}
                placeholder="Password"
                autoComplete="off"
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-[color:var(--surface-raised)] border text-[0.9375rem]',
                  'text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)]',
                  'outline-none transition-all duration-150',
                  error
                    ? 'border-red-500/50 focus:border-red-500/70 focus:ring-2 focus:ring-red-500/10'
                    : 'border-[color:var(--border)] focus:border-[color:var(--border-strong)] focus:ring-2 focus:ring-[color:var(--ring)]/10',
                )}
                aria-label="Editor password"
                aria-invalid={!!error}
              />
              {error && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AlertCircle size={16} className="text-red-400" />
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <p className="text-[0.8125rem] text-red-400 flex items-center gap-1.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!password.trim() || verifying}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg',
                'text-[0.875rem] font-medium transition-all duration-150',
                password.trim() && !verifying
                  ? 'bg-[color:var(--accent)] text-[color:var(--accent-foreground)] hover:opacity-90 active:scale-[0.98]'
                  : 'bg-[color:var(--surface-raised)] text-[color:var(--text-muted)] cursor-not-allowed opacity-50',
              )}
            >
              {verifying ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ShieldCheck size={15} />
              )}
              {verifying ? 'Verifying…' : 'Unlock Editor'}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center mt-5 text-[11px] font-mono tracking-wide text-[color:var(--text-muted)] opacity-60">
          Session persists until tab is closed
        </p>
      </div>
    </div>
  )
}
