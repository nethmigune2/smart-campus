import React, { useEffect, useState } from 'react'
import { Bell, CheckCheck, Trash2, BookOpen, Wrench, MessageSquare, CheckCircle2, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const S = {
  page:    { padding: '32px 36px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" },
  heading: { fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 4, letterSpacing: '-0.4px' },
  sub:     { fontSize: 13, color: '#64748b', marginBottom: 28 },
  btnPrimary: { padding: '9px 18px', background: 'linear-gradient(135deg,#0d9488,#0891b2)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' },
  btnGhost:   { padding: '7px 10px', background: 'transparent', border: '1px solid #334155', borderRadius: 7, color: '#94a3b8', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' },
}

const TYPE_CONFIG = {
  BOOKING_APPROVED:      { icon: CheckCircle2, color: '#34d399', bg: '#064e3b', label: 'Booking Approved' },
  BOOKING_REJECTED:      { icon: XCircle,      color: '#f87171', bg: '#450a0a', label: 'Booking Rejected' },
  TICKET_STATUS_CHANGED: { icon: Wrench,        color: '#fbbf24', bg: '#451a03', label: 'Ticket Updated'   },
  TICKET_ASSIGNED:       { icon: Wrench,        color: '#7dd3fc', bg: '#1e3a5f', label: 'Ticket Assigned'  },
  NEW_COMMENT:           { icon: MessageSquare, color: '#c4b5fd', bg: '#3b0764', label: 'New Comment'       },
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [filter,        setFilter]        = useState('ALL')

  const load = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/notifications')
      setNotifications(res.data)
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user?.id) load() }, [user])

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { toast.error('Failed') }
  }

  const handleMarkAllRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      toast.success('All marked as read')
    } catch { toast.error('Failed') }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch { toast.error('Failed to delete') }
  }

  const filtered = filter === 'ALL'
    ? notifications
    : filter === 'UNREAD'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read)

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Bell size={20} color="#0d9488" />
            <div style={S.heading}>Notifications</div>
            {unreadCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                background: '#ef4444', color: '#fff' }}>{unreadCount}</span>
            )}
          </div>
          <div style={S.sub}>{notifications.length} total · {unreadCount} unread</div>
        </div>
        {unreadCount > 0 && (
          <button style={S.btnPrimary} onClick={handleMarkAllRead}>
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 8 }}>
        {['ALL', 'UNREAD', 'READ'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
            background: filter === f ? '#0d9488' : '#0f172a',
            color: filter === f ? '#fff' : '#64748b',
          }}>{f}</button>
        ))}
      </div>

      {/* Notification list */}
      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 60, fontSize: 14 }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Bell size={36} color="#334155" style={{ marginBottom: 12 }} />
          <div style={{ color: '#475569', fontSize: 14 }}>No notifications here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(n => {
            const cfg = TYPE_CONFIG[n.type] || { icon: Bell, color: '#94a3b8', bg: '#1e293b', label: n.type }
            const Icon = cfg.icon
            return (
              <div key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                style={{
                  background: n.read ? '#1e293b' : '#1e293b',
                  border: `1px solid ${n.read ? '#334155' : '#0d9488'}`,
                  borderLeft: `4px solid ${n.read ? '#334155' : cfg.color}`,
                  borderRadius: 10, padding: '14px 16px',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  cursor: n.read ? 'default' : 'pointer',
                  opacity: n.read ? 0.7 : 1,
                  transition: 'opacity .15s',
                }}
              >
                {/* Icon */}
                <div style={{ width: 36, height: 36, borderRadius: 9, background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={cfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                      color: cfg.color, background: cfg.bg, textTransform: 'uppercase' }}>
                      {cfg.label}
                    </span>
                    {!n.read && (
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488', flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 3 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {!n.read && (
                    <button
                      style={{ ...S.btnGhost, color: '#34d399', borderColor: '#064e3b' }}
                      onClick={e => { e.stopPropagation(); handleMarkRead(n.id) }}
                      title="Mark as read"
                    >
                      <CheckCircle2 size={13} />
                    </button>
                  )}
                  <button
                    style={{ ...S.btnGhost, color: '#f87171', borderColor: '#450a0a' }}
                    onClick={e => { e.stopPropagation(); handleDelete(n.id) }}
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
