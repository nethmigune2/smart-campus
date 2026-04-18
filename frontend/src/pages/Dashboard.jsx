import React, { useEffect, useState } from 'react'
import { BookOpen, CalendarCheck, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const S = {
  page: { padding: '32px 36px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" },
  heading: { fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 4, letterSpacing: '-0.4px' },
  sub: { fontSize: 13, color: '#64748b', marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px' },
  statVal: { fontSize: 28, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 2 },
  iconBox: (bg) => ({ width: 38, height: 38, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }),
  section: { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0f172a' },
  badge: (c, bg) => ({ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, color: c, background: bg, textTransform: 'uppercase', letterSpacing: '.05em' }),
}

const STATUS_BADGE = {
  PENDING:   S.badge('#fbbf24', '#451a03'),
  APPROVED:  S.badge('#34d399', '#064e3b'),
  REJECTED:  S.badge('#f87171', '#450a0a'),
  CANCELLED: S.badge('#94a3b8', '#1e293b'),
}

export default function Dashboard() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/resources').catch(() => ({ data: [] })),
      axios.get('/api/bookings').catch(() => ({ data: [] })),
    ]).then(([rRes, bRes]) => {
      setResources(rRes.data)
      setBookings(bRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const activeResources  = resources.filter(r => r.status === 'ACTIVE').length
  const pendingBookings  = bookings.filter(b => b.status === 'PENDING').length
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED').length
  const myBookings       = bookings.filter(b => b.user?.id === user?.id).slice(0, 5)
  const recentResources  = resources.slice(0, 4)

  const STATS = [
    { icon: BookOpen,      bg: '#134e4a', iconColor: '#2dd4bf', label: 'Total Resources',   val: resources.length },
    { icon: CheckCircle2,  bg: '#064e3b', iconColor: '#34d399', label: 'Active Resources',  val: activeResources },
    { icon: Clock,         bg: '#451a03', iconColor: '#fbbf24', label: 'Pending Bookings',  val: pendingBookings },
    { icon: CalendarCheck, bg: '#1e3a5f', iconColor: '#7dd3fc', label: 'Approved Bookings', val: approvedBookings },
  ]

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#64748b', fontSize: 14 }}>Loading dashboard…</div>
    </div>
  )

  return (
    <div style={S.page}>
      <div style={S.heading}>Welcome back, {user?.name?.split(' ')[0] || 'User'}</div>
      <div style={S.sub}>Here's what's happening on campus today.</div>

      {/* Stats */}
      <div style={S.grid}>
        {STATS.map(({ icon: Icon, bg, iconColor, label, val }) => (
          <div key={label} style={S.card}>
            <div style={S.iconBox(bg)}>
              <Icon size={17} color={iconColor} />
            </div>
            <div style={S.statVal}>{val}</div>
            <div style={S.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent resources */}
        <div style={S.section}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={S.sectionTitle}>Recent Resources</div>
            <TrendingUp size={14} color="#64748b" />
          </div>
          {recentResources.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 13 }}>No resources yet.</div>
          ) : recentResources.map(r => (
            <div key={r.id} style={S.row}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{r.location} · Cap: {r.capacity}</div>
              </div>
              <span style={r.status === 'ACTIVE' ? S.badge('#34d399', '#064e3b') : S.badge('#94a3b8', '#1e293b')}>
                {r.status}
              </span>
            </div>
          ))}
        </div>

        {/* My bookings */}
        <div style={S.section}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={S.sectionTitle}>My Bookings</div>
            <CalendarCheck size={14} color="#64748b" />
          </div>
          {myBookings.length === 0 ? (
            <div style={{ color: '#475569', fontSize: 13 }}>No bookings yet. Head to Resources to book.</div>
          ) : myBookings.map(b => (
            <div key={b.id} style={S.row}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{b.resource?.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{b.date} · {b.startTime}–{b.endTime}</div>
              </div>
              <span style={STATUS_BADGE[b.status]}>{b.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Role info */}
      {user?.role === 'ADMIN' && (
        <div style={{ ...S.section, marginTop: 0, background: '#134e4a22', borderColor: '#0d9488' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={16} color="#2dd4bf" />
            <span style={{ fontSize: 13, color: '#5eead4', fontWeight: 600 }}>
              Admin view — you can approve/reject bookings and manage all resources.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
