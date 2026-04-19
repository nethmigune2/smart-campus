import React from 'react'
import { GraduationCap, CheckCircle2, Wifi, ShieldCheck } from 'lucide-react'

const FEATURES = [
  { icon: CheckCircle2, text: 'Book lecture halls, labs & equipment instantly' },
  { icon: Wifi,         text: 'Real-time availability & conflict detection' },
  { icon: ShieldCheck,  text: 'Role-based access — Admin, Staff, Student' },
]

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#0f172a',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Left: sign-in panel */}
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
        <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 40, lineHeight: 1.6 }}>
          Sign in with your Google account to access campus resources, bookings, and more.
        </p>

        {/* Google sign-in button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: '13px 20px', borderRadius: 10,
            background: '#fff', border: '1px solid #e2e8f0',
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 15, fontWeight: 600, color: '#1e293b',
            transition: 'all .18s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          onMouseOver={e => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {/* Google SVG icon */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.08-6.08C34.62 3.1 29.6 1 24 1 14.82 1 6.96 6.48 3.28 14.34l7.08 5.5C12.18 13.56 17.6 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.52 24.5c0-1.64-.15-3.22-.42-4.74H24v9h12.72c-.55 2.94-2.2 5.44-4.7 7.12l7.22 5.6C43.28 37.58 46.52 31.5 46.52 24.5z"/>
            <path fill="#FBBC05" d="M10.36 28.16A14.44 14.44 0 0 1 9.5 24c0-1.44.25-2.84.68-4.16l-7.08-5.5A23.94 23.94 0 0 0 0 24c0 3.86.92 7.5 2.54 10.72l7.82-6.56z"/>
            <path fill="#34A853" d="M24 47c5.52 0 10.16-1.82 13.54-4.96l-7.22-5.6c-1.84 1.24-4.2 1.96-6.32 1.96-6.38 0-11.8-4.06-13.64-9.78l-7.82 6.56C6.92 41.48 14.82 47 24 47z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Sign in with Google
        </button>

        <p style={{ marginTop: 24, fontSize: 12, color: '#475569', textAlign: 'center', lineHeight: 1.6 }}>
          By signing in you agree to use this platform for authorised campus activities only.
        </p>
      </div>

      {/* Right: hero panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 56, position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 50%, #134e4a22 0%, transparent 60%), #0f172a',
      }}>
        {/* Grid overlay */}
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
