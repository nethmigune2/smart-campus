import React, { useEffect, useState } from 'react'
import { ShieldCheck, Users, UserCog, GraduationCap, Wrench, ChevronDown } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const S = {
  page:    { padding: '32px 36px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" },
  heading: { fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 4, letterSpacing: '-0.4px' },
  sub:     { fontSize: 13, color: '#64748b', marginBottom: 28 },
  card:    { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '18px 20px' },
  th:      { fontSize: 11, fontWeight: 600, color: '#64748b', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid #334155', textTransform: 'uppercase', letterSpacing: '.07em' },
  td:      { fontSize: 13, color: '#e2e8f0', padding: '13px 16px', borderBottom: '1px solid #1e293b', verticalAlign: 'middle' },
}

const ROLE_STYLE = {
  ADMIN:   { color: '#2dd4bf', bg: '#134e4a' },
  STAFF:   { color: '#7dd3fc', bg: '#1e3a5f' },
  STUDENT: { color: '#c4b5fd', bg: '#3b0764' },
}

const ROLES = ['STUDENT', 'STAFF', 'ADMIN']

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [updating,   setUpdating]   = useState(null)
  const [roleFilter, setRoleFilter] = useState('ALL')

  const load = () => {
    setLoading(true)
    axios.get('/api/auth/users', { withCredentials: true })
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.id) {
      toast.error("You can't change your own role")
      return
    }
    setUpdating(userId)
    try {
      await axios.patch(`/api/auth/users/${userId}/role`, { role: newRole }, { withCredentials: true })
      toast.success('Role updated')
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  const stats = [
    { label: 'Total Users',  value: users.length,                                    icon: Users,       color: '#0d9488', bg: '#134e4a' },
    { label: 'Admins',       value: users.filter(u => u.role === 'ADMIN').length,    icon: ShieldCheck,  color: '#2dd4bf', bg: '#134e4a' },
    { label: 'Staff',        value: users.filter(u => u.role === 'STAFF').length,    icon: UserCog,      color: '#7dd3fc', bg: '#1e3a5f' },
    { label: 'Students',     value: users.filter(u => u.role === 'STUDENT').length,  icon: GraduationCap,color: '#c4b5fd', bg: '#3b0764' },
  ]

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <ShieldCheck size={20} color="#0d9488" />
          <div style={S.heading}>Admin Panel</div>
        </div>
        <div style={S.sub}>Manage user accounts and role assignments</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Users size={15} color="#0d9488" />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Registered Users</span>
          {/* Role filter buttons */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            {['ALL', 'ADMIN', 'STAFF', 'STUDENT'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
                  background: roleFilter === r ? '#0d9488' : '#0f172a',
                  color: roleFilter === r ? '#fff' : '#64748b',
                }}
              >
                {r === 'ALL' ? `All (${users.length})` : `${r} (${users.filter(u => u.role === r).length})`}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 14 }}>Loading users…</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={S.th}>User</th>
                <th style={S.th}>Email</th>
                <th style={S.th}>Provider</th>
                <th style={S.th}>Joined</th>
                <th style={S.th}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => roleFilter === 'ALL' || u.role === roleFilter).map(u => {
                const rs = ROLE_STYLE[u.role] || { color: '#94a3b8', bg: '#1e293b' }
                const initials = u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
                const isSelf = u.id === currentUser?.id
                return (
                  <tr key={u.id}
                    onMouseOver={e => e.currentTarget.style.background = '#0f172a'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    style={{ transition: 'background .1s' }}
                  >
                    {/* Avatar + name */}
                    <td style={S.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid #334155' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {initials}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{u.name}</div>
                          {isSelf && <span style={{ fontSize: 9, color: '#0d9488', fontWeight: 700 }}>YOU</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...S.td, color: '#94a3b8' }}>{u.email}</td>
                    <td style={S.td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: '#0f172a', color: '#64748b', border: '1px solid #334155', textTransform: 'uppercase' }}>
                        {u.provider || 'local'}
                      </span>
                    </td>
                    <td style={{ ...S.td, color: '#64748b', fontSize: 12 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    {/* Role selector */}
                    <td style={S.td}>
                      {isSelf ? (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, color: rs.color, background: rs.bg, textTransform: 'uppercase' }}>
                          {u.role}
                        </span>
                      ) : (
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                          <select
                            value={u.role}
                            disabled={updating === u.id}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            style={{
                              appearance: 'none', padding: '4px 28px 4px 10px',
                              background: rs.bg, color: rs.color,
                              border: `1px solid ${rs.color}40`, borderRadius: 6,
                              fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
                              cursor: updating === u.id ? 'not-allowed' : 'pointer',
                              textTransform: 'uppercase', outline: 'none',
                              opacity: updating === u.id ? 0.6 : 1,
                            }}
                          >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <ChevronDown size={11} color={rs.color} style={{ position: 'absolute', right: 8, pointerEvents: 'none' }} />
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
