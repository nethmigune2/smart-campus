import React, { useState } from 'react'
import { GraduationCap, CheckCircle2, Wifi, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const DEMO_ACCOUNTS = [
  { label: 'Admin',   email: 'admin@campus.edu',  role: 'ADMIN'   },
  { label: 'Staff',   email: 'bob@campus.edu',     role: 'STAFF'   },
  { label: 'Student', email: 'alice@campus.edu',   role: 'STUDENT' },
  { label: 'Student', email: 'carol@campus.edu',   role: 'STUDENT' },
]

const ROLE_TAG = {
  ADMIN:   { bg: '#134e4a', color: '#5eead4' },
  STAFF:   { bg: '#1e3a5f', color: '#7dd3fc' },
  STUDENT: { bg: '#3b1f5e', color: '#c4b5fd' },
}

const FEATURES = [
  { icon: CheckCircle2, text: 'Book lecture halls, labs & equipment instantly' },
  { icon: Wifi,         text: 'Real-time availability & conflict detection' },
  { icon: ShieldCheck,  text: 'Role-based access — Admin, Staff, Student' },
]

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]   = useState('')
  const [error,    setError]   = useState('')
  const [loading,  setLoading] = useState(false)

  const doLogin = async (emailVal) => {
    setError(''); setLoading(true)
    try {
      const res = await axios.post('/api/auth/login', { email: emailVal })
      login(res.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'No account found with that email.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#0f172a',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Left: form panel */}
      <div style={{
        width: 460, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '56px 48px',
        background: '#1e293b',
        borderRight: '1px solid #334155',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #0d9488, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>
              UniHub Campus
            </div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Operations Hub</div>
          </div>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f8fafc', marginBottom: 6, letterSpacing: '-0.5px' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32, lineHeight: 1.5 }}>
          Sign in with your campus email to access resources and bookings.
        </p>

        {/* Email input */}
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Email address
        </label>
        <input
          type="email"
          placeholder="you@campus.edu"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && email && doLogin(email)}
          autoFocus
          style={{
            width: '100%', padding: '11px 14px', marginBottom: 12,
            background: '#0f172a', border: '1px solid #334155',
            borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
            fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = '#0d9488'}
          onBlur={e => e.target.style.borderColor = '#334155'}
        />

        {error && (
          <div style={{
            background: '#450a0a', border: '1px solid #991b1b',
            borderRadius: 8, padding: '9px 12px', color: '#fca5a5',
            fontSize: 13, marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <button
          onClick={() => email && doLogin(email)}
          disabled={loading || !email}
          style={{
            width: '100%', padding: '11px', borderRadius: 8, border: 'none',
            background: email && !loading
              ? 'linear-gradient(135deg, #0d9488, #0891b2)'
              : '#1e3a5f',
            color: email && !loading ? '#fff' : '#475569',
            fontSize: 14, fontWeight: 600, cursor: email && !loading ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', transition: 'all .2s',
          }}
        >
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        {/* Demo accounts */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#334155' }} />
            <span style={{ fontSize: 10, color: '#475569', fontWeight: 600, letterSpacing: '.08em' }}>DEMO ACCOUNTS</span>
            <div style={{ flex: 1, height: 1, background: '#334155' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DEMO_ACCOUNTS.map(acc => {
              const tag = ROLE_TAG[acc.role]
              return (
                <button
                  key={acc.email}
                  onClick={() => doLogin(acc.email)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px', background: '#0f172a',
                    border: '1px solid #334155', borderRadius: 8,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s',
                  }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#0d9488'}
                  onMouseOut={e => e.currentTarget.style.borderColor = '#334155'}
                >
                  <span style={{ fontSize: 13, color: '#cbd5e1' }}>{acc.email}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                    background: tag.bg, color: tag.color, textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>
                    {acc.role}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right: hero panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 56, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 50%, #134e4a22 0%, transparent 60%), #0f172a',
      }}>
        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#0d9488 1px, transparent 1px), linear-gradient(90deg, #0d9488 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Glow orb */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, #0d948822 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 420, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#134e4a', border: '1px solid #0d9488', borderRadius: 20,
            padding: '5px 14px', marginBottom: 24,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9488' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#5eead4', letterSpacing: '.06em' }}>
              SMART CAMPUS SYSTEM
            </span>
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#f8fafc', lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.8px' }}>
            Manage your campus<br />
            <span style={{ color: '#2dd4bf' }}>smarter, faster.</span>
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, marginBottom: 40 }}>
            One unified platform for resource bookings, facility management, and incident handling across your entire university.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 10, padding: '12px 16px',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: '#134e4a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={15} color="#2dd4bf" />
                </div>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
