import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, CalendarCheck, Wrench, Bell, LogOut, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/resources',     icon: BookOpen,         label: 'Resources'   },
  { to: '/bookings',      icon: CalendarCheck,    label: 'Bookings'    },
  { to: '/tickets',       icon: Wrench,           label: 'Maintenance' },
  { to: '/notifications', icon: Bell,             label: 'Alerts'      },
]

const ROLE_STYLE = {
  ADMIN:   { color: '#2dd4bf', bg: '#134e4a' },
  STAFF:   { color: '#7dd3fc', bg: '#1e3a5f' },
  STUDENT: { color: '#c4b5fd', bg: '#3b0764' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hoveredLink, setHoveredLink]   = useState(null)
  const [logoutHovered, setLogoutHovered] = useState(false)
  const [bellHovered, setBellHovered]   = useState(false)

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const avatar    = user?.picture || user?.imageUrl || null
  const roleStyle = ROLE_STYLE[user?.role] || { color: '#475569', bg: '#1e293b' }

  return (
    <aside style={{
      width: 226, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: '#1e293b', borderRight: '1px solid #334155',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif",
    }}>
      {/* ── Logo ── */}
      <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0d9488, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 3px 10px rgba(13,148,136,0.35)',
          }}>
            <GraduationCap size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.2px' }}>
              UniHub Campus
            </div>
            <div style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>Operations Hub</div>
          </div>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav style={{ flex: 1, padding: '14px 10px' }}>
        <div style={{
          fontSize: 9, fontWeight: 700, color: '#475569',
          letterSpacing: '.12em', padding: '0 10px', marginBottom: 8,
        }}>
          NAVIGATION
        </div>

        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onMouseEnter={() => setHoveredLink(to)}
            onMouseLeave={() => setHoveredLink(null)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none',
              fontSize: 13, fontWeight: isActive ? 600 : 500,
              background: isActive ? '#134e4a' : hoveredLink === to ? '#0f172a' : 'transparent',
              color: isActive ? '#2dd4bf' : hoveredLink === to ? '#e2e8f0' : '#94a3b8',
              transition: 'all .15s',
              borderLeft: `3px solid ${isActive ? '#0d9488' : 'transparent'}`,
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} />
                <span style={{ flex: 1 }}>{label}</span>
                {/* Notification dot on Alerts link */}
                {to === '/notifications' && !isActive && (
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: '#ef4444', flexShrink: 0,
                    boxShadow: '0 0 0 2px #1e293b',
                  }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Notification shortcut ── */}
      <div style={{ padding: '4px 10px 10px' }}>
        <button
          onMouseEnter={() => setBellHovered(true)}
          onMouseLeave={() => setBellHovered(false)}
          onClick={() => navigate('/notifications')}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 10px', borderRadius: 8,
            background: bellHovered ? '#0f172a' : 'none',
            border: '1px solid ' + (bellHovered ? '#334155' : 'transparent'),
            cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 500,
            color: bellHovered ? '#e2e8f0' : '#64748b',
            transition: 'all .15s',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Bell size={15} />
            <span style={{
              position: 'absolute', top: -3, right: -3,
              width: 7, height: 7, borderRadius: '50%',
              background: '#ef4444', border: '1.5px solid #1e293b',
            }} />
          </div>
          <span>Notifications</span>
        </button>
      </div>

      {/* ── User profile footer ── */}
      <div style={{ padding: '10px', borderTop: '1px solid #334155' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 8,
          background: '#0f172a',
        }}>
          {/* Avatar */}
          {avatar ? (
            <img
              src={avatar}
              alt={user?.name}
              style={{
                width: 34, height: 34, borderRadius: '50%',
                objectFit: 'cover', flexShrink: 0,
                border: '2px solid #0d9488',
              }}
            />
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #0d9488, #0891b2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              border: '2px solid #0d9488',
            }}>
              {initials}
            </div>
          )}

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#e2e8f0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name || 'Guest'}
            </div>
            {user?.role && (
              <span style={{
                display: 'inline-block', fontSize: 9, fontWeight: 700,
                padding: '1px 6px', borderRadius: 4, marginTop: 2,
                color: roleStyle.color, background: roleStyle.bg,
                textTransform: 'uppercase', letterSpacing: '.05em',
              }}>
                {user.role}
              </span>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Logout"
            onMouseEnter={() => setLogoutHovered(true)}
            onMouseLeave={() => setLogoutHovered(false)}
            style={{
              background: logoutHovered ? '#450a0a' : 'none',
              border: `1px solid ${logoutHovered ? '#7f1d1d' : 'transparent'}`,
              cursor: 'pointer',
              color: logoutHovered ? '#f87171' : '#475569',
              padding: 5, borderRadius: 6, display: 'flex',
              transition: 'all .15s',
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
