import React, { useEffect, useState } from 'react'
import {
  BookOpen, CalendarCheck, Clock, CheckCircle2,
  TrendingUp, Plus, List, Wrench, ArrowRight,
  AlertCircle, Boxes, Users, TicketCheck, BarChart3,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const KEYFRAMES = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

function Sk({ w = '100%', h = 16, r = 6, mb = 0 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: '#334155', marginBottom: mb,
      animation: 'pulse 1.6s ease-in-out infinite',
    }} />
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px' }}>
      <Sk w={38} h={38} r={9} mb={14} />
      <Sk w={60} h={28} r={6} mb={8} />
      <Sk w={100} h={12} r={4} />
    </div>
  )
}

const STATUS_STYLE = {
  PENDING:   { color: '#fbbf24', bg: '#451a03' },
  APPROVED:  { color: '#34d399', bg: '#064e3b' },
  REJECTED:  { color: '#f87171', bg: '#450a0a' },
  CANCELLED: { color: '#94a3b8', bg: '#1e293b' },
}

function Badge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.CANCELLED
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
      color: s.color, background: s.bg,
      textTransform: 'uppercase', letterSpacing: '.05em', flexShrink: 0,
    }}>
      {status}
    </span>
  )
}

function EmptyState({ message }) {
  return (
    <div style={{ textAlign: 'center', padding: '28px 16px' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: '#1e293b',
        border: '1px solid #334155', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 12px',
      }}>
        <AlertCircle size={20} color="#475569" />
      </div>
      <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>{message}</p>
    </div>
  )
}

function QuickAction({ icon: Icon, label, color, bg, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 10, padding: '20px 14px', borderRadius: 12,
        background: hovered ? bg : '#1e293b',
        border: `1px solid ${hovered ? color : '#334155'}`,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all .2s', transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 6px 20px ${color}22` : 'none',
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 11,
        background: hovered ? color + '22' : '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${hovered ? color : '#334155'}`,
        transition: 'all .2s',
      }}>
        <Icon size={19} color={hovered ? color : '#64748b'} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: hovered ? color : '#94a3b8', transition: 'color .2s' }}>
        {label}
      </span>
    </button>
  )
}

function StatCard({ icon: Icon, bg, iconColor, label, val, delay = 0 }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#1e293b',
        border: `1px solid ${hovered ? iconColor + '66' : '#334155'}`,
        borderRadius: 12, padding: '20px 22px',
        transition: 'all .2s',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 6px 20px ${iconColor}18` : 'none',
        animation: `fadeUp 0.4s ${delay}ms both`,
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: 9, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <Icon size={17} color={iconColor} />
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.6px' }}>{val}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 3 }}>{label}</div>
    </div>
  )
}

/* ── CSS bar chart row ── */
function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'capitalize' }}>
          {label.replace(/_/g, ' ')}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{value}</span>
      </div>
      <div style={{ height: 7, background: '#0f172a', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: 4, transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════ */

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [bookings,  setBookings]  = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] || 'there'
  const avatar    = user?.avatarUrl || null
  const initials  = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  useEffect(() => {
    if (!user?.id) return
    const bookingUrl = user.role === 'ADMIN' ? '/api/bookings' : `/api/bookings/user/${user.id}`
    const requests = [
      axios.get('/api/resources').catch(() => ({ data: [] })),
      axios.get(bookingUrl).catch(() => ({ data: [] })),
    ]
    if (user.role === 'ADMIN') {
      requests.push(axios.get('/api/analytics/summary').catch(() => ({ data: null })))
    }
    Promise.all(requests).then(([rRes, bRes, aRes]) => {
      setResources(rRes.data)
      setBookings(bRes.data)
      if (aRes) setAnalytics(aRes.data)
    }).finally(() => setLoading(false))
  }, [user])

  const availableNow  = resources.filter(r => r.status === 'AVAILABLE').length
  const pendingCount  = bookings.filter(b => b.status === 'PENDING').length
  const allMyBookings = user?.role === 'ADMIN'
    ? bookings
    : bookings.filter(b => b.user?.id === user?.id || b.user?.email === user?.email)
  const recentActivity = allMyBookings.slice(0, 5)

  const STATS = [
    { icon: Boxes,        bg: '#134e4a', iconColor: '#2dd4bf', label: 'Total Resources',  val: resources.length,     delay: 0   },
    { icon: CalendarCheck, bg: '#1e3a5f', iconColor: '#7dd3fc', label: 'My Bookings',      val: allMyBookings.length, delay: 60  },
    ...(user?.role === 'ADMIN'
      ? [{ icon: Clock, bg: '#451a03', iconColor: '#fbbf24', label: 'Pending Approvals', val: pendingCount, delay: 120 }]
      : []),
    { icon: CheckCircle2, bg: '#064e3b', iconColor: '#34d399', label: 'Available Now',    val: availableNow,         delay: user?.role === 'ADMIN' ? 180 : 120 },
  ]

  const BOOKING_COLORS = { PENDING: '#fbbf24', APPROVED: '#34d399', REJECTED: '#f87171', CANCELLED: '#64748b' }
  const TICKET_STATUS_COLORS = { OPEN: '#7dd3fc', IN_PROGRESS: '#fbbf24', RESOLVED: '#34d399', CLOSED: '#94a3b8', REJECTED: '#f87171' }
  const CATEGORY_COLOR = '#a78bfa'

  const maxBooking = analytics ? Math.max(...Object.values(analytics.bookingsByStatus), 1) : 1
  const maxTicket  = analytics ? Math.max(...Object.values(analytics.ticketsByStatus),  1) : 1
  const maxCat     = analytics ? Math.max(...Object.values(analytics.ticketsByCategory), 1) : 1

  if (loading) return (
    <div style={{ padding: '32px 36px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <style>{KEYFRAMES}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
        <Sk w={48} h={48} r={24} />
        <div><Sk w={180} h={22} r={6} mb={8} /><Sk w={120} h={14} r={4} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {[0,1,2,3].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  )

  return (
    <div style={{ padding: '32px 36px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <style>{KEYFRAMES}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {avatar ? (
            <img src={avatar} alt={user?.name}
              style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #0d9488', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #0d9488, #0891b2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#fff', border: '2px solid #0d9488',
            }}>{initials}</div>
          )}
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.4px' }}>
              {greeting}, {firstName}!
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
              Here's what's happening on campus today.
            </p>
          </div>
        </div>
        {user?.role === 'ADMIN' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#134e4a', border: '1px solid #0d9488', borderRadius: 8, padding: '6px 12px' }}>
            <CheckCircle2 size={13} color="#2dd4bf" />
            <span style={{ fontSize: 12, color: '#5eead4', fontWeight: 600 }}>Admin View</span>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 16, marginBottom: 28 }}>
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── ADMIN ANALYTICS ── */}
      {user?.role === 'ADMIN' && analytics && (
        <>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <BarChart3 size={16} color="#0d9488" />
            <span style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>Campus Analytics</span>
          </div>

          {/* Overview totals — only stats not already shown in top cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Total Users',   val: analytics.totalUsers,   icon: Users,       color: '#c4b5fd', bg: '#3b0764' },
              { label: 'Total Tickets', val: analytics.totalTickets, icon: TicketCheck, color: '#fbbf24', bg: '#451a03' },
            ].map(({ label, val, icon: Icon, color, bg }) => (
              <div key={label} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' }}>{val}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>

            {/* Bookings by status */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Bookings by Status</div>
              {Object.entries(analytics.bookingsByStatus).map(([status, count]) => (
                <BarRow key={status} label={status} value={count} max={maxBooking} color={BOOKING_COLORS[status] || '#94a3b8'} />
              ))}
            </div>

            {/* Tickets by status */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Tickets by Status</div>
              {Object.entries(analytics.ticketsByStatus).map(([status, count]) => (
                <BarRow key={status} label={status} value={count} max={maxTicket} color={TICKET_STATUS_COLORS[status] || '#94a3b8'} />
              ))}
            </div>

            {/* Tickets by category */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Tickets by Category</div>
              {Object.keys(analytics.ticketsByCategory).length === 0
                ? <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', paddingTop: 20 }}>No tickets yet</div>
                : Object.entries(analytics.ticketsByCategory).map(([cat, count]) => (
                  <BarRow key={cat} label={cat} value={count} max={maxCat} color={CATEGORY_COLOR} />
                ))
              }
            </div>
          </div>

          {/* Top Resources */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '18px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>
              Most Booked Resources
            </div>
            {analytics.topResources.length === 0
              ? <div style={{ fontSize: 12, color: '#475569', textAlign: 'center', padding: '16px 0' }}>No bookings yet</div>
              : analytics.topResources.map((r, i) => {
                  const maxTop = analytics.topResources[0]?.count || 1
                  const pct = (r.count / maxTop) * 100
                  return (
                    <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', width: 16 }}>#{i + 1}</span>
                      <span style={{ fontSize: 13, color: '#e2e8f0', width: 160, flexShrink: 0 }}>{r.name}</span>
                      <div style={{ flex: 1, height: 7, background: '#0f172a', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#0d9488,#0891b2)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2dd4bf', width: 30, textAlign: 'right' }}>{r.count}</span>
                    </div>
                  )
                })
            }
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Quick Actions</span>
          <TrendingUp size={14} color="#64748b" />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <QuickAction icon={Plus}   label="Book a Room"      color="#2dd4bf" bg="#134e4a" onClick={() => navigate('/resources')} />
          <QuickAction icon={List}   label="View My Bookings" color="#7dd3fc" bg="#1e3a5f" onClick={() => navigate('/bookings')} />
          <QuickAction icon={Wrench} label="Report Issue"     color="#fbbf24" bg="#451a03" onClick={() => navigate('/tickets')} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent Resources */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Recent Resources</span>
            <button onClick={() => navigate('/resources')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2dd4bf', fontFamily: 'inherit', padding: 0 }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {resources.length === 0 ? (
            <EmptyState message="No resources have been added yet." />
          ) : resources.slice(0, 4).map(r => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0f172a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: r.status === 'AVAILABLE' ? '#34d399' : '#475569', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{r.location} · Cap: {r.capacity}</div>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, color: r.status === 'AVAILABLE' ? '#34d399' : '#94a3b8', background: r.status === 'AVAILABLE' ? '#064e3b' : '#1e293b', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {r.status}
              </span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Recent Activity</span>
            <button onClick={() => navigate('/bookings')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2dd4bf', fontFamily: 'inherit', padding: 0 }}>
              View all <ArrowRight size={12} />
            </button>
          </div>
          {recentActivity.length === 0 ? (
            <EmptyState message="No bookings yet. Head to Resources to book." />
          ) : recentActivity.map(b => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #0f172a' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{b.resource?.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{b.date} · {b.startTime}–{b.endTime}</div>
              </div>
              <Badge status={b.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
