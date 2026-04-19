import React, { createContext, useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

const SESSION_KEY = 'smartcampus_user'

function AuthProviderInner({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Verify the server session on every page load/refresh
  useEffect(() => {
    fetch('http://localhost:8080/api/auth/me', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Unauthenticated')
        return res.json()
      })
      .then(serverUser => {
        localStorage.setItem(SESSION_KEY, JSON.stringify(serverUser))
        setUser(serverUser)
      })
      .catch(() => {
        // Session expired or not logged in — clear local state
        localStorage.removeItem(SESSION_KEY)
        setUser(null)
        const isPublic = window.location.pathname === '/login' ||
                         window.location.pathname.startsWith('/auth/')
        if (!isPublic) navigate('/login', { replace: true })
      })
  }, [])

  const login = (userData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }) {
  return <AuthProviderInner>{children}</AuthProviderInner>
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
