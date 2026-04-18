import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, CalendarCheck, Wrench, Bell, LogOut, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/resources',     icon: BookOpen,         label: 'Resources'   },
  { to: '/bookings',      icon: CalendarCheck,    label: 'Bookings'    },
  { to: '/tickets',       icon: Wrench,           label: 'Maintenance' },
  { to: '/notifications', icon: Bell,             label: 'Alerts'      },
]

const ROLE_COLOR = {
  ADMIN:   '#2dd4bf',
  STAFF:   '#7dd3fc',
  STUDENT: '#c4b5fd',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <aside style={{
      width: 220, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#1e293b', borderRight: '1px solid #334155',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #0d9488, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <GraduationCap size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.2px' }}>
              UniHub Campus
            </div>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>Operations Hub</div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '14px 10px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', letterSpacing: '.12em', padding: '0 10px', marginBottom: 8 }}>
          NAVIGATION
        </div>
        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none', fontSize: 13, fontWeight: 500,
              background: isActive ? '#134e4a' : 'transparent',
              color: isActive ? '#2dd4bf' : '#94a3b8',
              transition: 'all .15s',
            })}
            onMouseOver={e => {
              if (!e.currentTarget.className.includes('active')) {
                e.currentTarget.style.background = '#0f172a'
                e.currentTarget.style.color = '#cbd5e1'
              }
            }}
            onMouseOut={e => {
              if (!e.currentTarget.style.color.includes('2dd4bf')) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#94a3b8'
              }
            }}
          >
            <Icon size={15} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #0d9488, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Guest'}
            </div>
            <div style={{ fontSize: 10, color: ROLE_COLOR[user?.role] || '#475569', fontWeight: 600 }}>
              {user?.role || ''}
            </div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#475569', padding: 4, borderRadius: 6, display: 'flex',
            }}
            onMouseOver={e => e.currentTarget.style.color = '#f87171'}
            onMouseOut={e => e.currentTarget.style.color = '#475569'}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
