import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    fetch('http://localhost:8080/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
      })
      .then(user => {
        login(user)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => {
        navigate('/login', { replace: true })
      })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#0f172a', fontFamily: "'Inter', sans-serif",
    }}>
      {/* Spinner */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid #1e293b',
        borderTop: '3px solid #0d9488',
        animation: 'spin 0.8s linear infinite',
        marginBottom: 20,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Completing sign-in…</p>
    </div>
  )
}
