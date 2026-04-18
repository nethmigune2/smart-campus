import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/NavBar'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ResourcesPage from './pages/ResourcesPage'
import BookingsPage from './pages/BookingsPage'

function AppLayout() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <Navbar />
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/resources"     element={<ResourcesPage />} />
          <Route path="/bookings"      element={<BookingsPage />} />
          <Route path="/tickets"       element={<PlaceholderPage title="Maintenance Tickets" desc="Incident ticketing module — coming soon." />} />
          <Route path="/notifications" element={<PlaceholderPage title="Alerts & Notifications" desc="Notification centre — coming soon." />} />
          <Route path="*"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function PlaceholderPage({ title, desc }) {
  return (
    <div style={{ padding: '32px 36px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, color: '#475569' }}>{desc}</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155', fontFamily: "'Inter',sans-serif" },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*"     element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
