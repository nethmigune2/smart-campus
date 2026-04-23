import React, { useEffect, useState } from 'react'
import { MapPin, Users, Clock, X, CalendarPlus, Building2, FlaskConical, MonitorPlay, Presentation, Package } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const KEYFRAMES = `
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.4); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

const STATUS = {
  AVAILABLE:   { color: '#34d399', bg: '#064e3b', border: '#065f46', label: 'Available',   dot: '#34d399' },
  OCCUPIED:    { color: '#fbbf24', bg: '#451a03', border: '#78350f', label: 'Occupied',    dot: '#fbbf24' },
  MAINTENANCE: { color: '#f87171', bg: '#450a0a', border: '#7f1d1d', label: 'Maintenance', dot: '#f87171' },
}

const TYPE_CONFIG = {
  LECTURE_HALL: { icon: Presentation, label: 'Lecture Halls',  wing: 'Wing A', color: '#7dd3fc', accent: '#1e3a5f' },
  LAB:          { icon: FlaskConical, label: 'Laboratories',   wing: 'Wing B', color: '#a78bfa', accent: '#3b0764' },
  MEETING_ROOM: { icon: Users,        label: 'Meeting Rooms',  wing: 'Wing C', color: '#34d399', accent: '#064e3b' },
  AUDITORIUM:   { icon: MonitorPlay,  label: 'Auditoriums',    wing: 'Wing D', color: '#fb923c', accent: '#431407' },
  EQUIPMENT:    { icon: Package,      label: 'Equipment',      wing: 'Wing E', color: '#f472b6', accent: '#500724' },
}

function PulseDot({ color }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4,
        animation: 'pulse-dot 1.8s ease-in-out infinite',
      }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, position: 'relative' }} />
    </span>
  )
}

function RoomCard({ resource, onClick, isSelected }) {
  const [hovered, setHovered] = useState(false)
  const s = STATUS[resource.status] || STATUS.MAINTENANCE

  return (
    <div
      onClick={() => onClick(resource)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 130, minHeight: 100,
        background: isSelected ? s.bg : hovered ? '#1e293b' : '#162032',
        border: `2px solid ${isSelected ? s.color : hovered ? s.border : '#1e293b'}`,
        borderRadius: 10, padding: '12px 12px 10px',
        cursor: 'pointer', transition: 'all .18s',
        transform: hovered || isSelected ? 'translateY(-3px)' : 'none',
        boxShadow: isSelected ? `0 6px 24px ${s.color}33` : hovered ? '0 4px 14px #0008' : 'none',
        display: 'flex', flexDirection: 'column', gap: 6,
        animation: 'slideUp 0.3s both',
      }}
    >
      {/* Status dot + name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0', lineHeight: 1.3, flex: 1 }}>
          {resource.name}
        </span>
        <PulseDot color={s.dot} />
      </div>

      {/* Capacity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Users size={10} color="#475569" />
        <span style={{ fontSize: 10, color: '#64748b' }}>Cap: {resource.capacity}</span>
      </div>

      {/* Location */}
      {resource.location && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={10} color="#475569" />
          <span style={{ fontSize: 10, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {resource.location}
          </span>
        </div>
      )}

      {/* Status badge */}
      <div style={{
        marginTop: 'auto', alignSelf: 'flex-start',
        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
        color: s.color, background: s.bg, textTransform: 'uppercase', letterSpacing: '.06em',
      }}>
        {s.label}
      </div>
    </div>
  )
}

function DetailPanel({ resource, onClose, onBook }) {
  if (!resource) return null
  const s = STATUS[resource.status] || STATUS.MAINTENANCE
  const cfg = TYPE_CONFIG[resource.type] || TYPE_CONFIG.EQUIPMENT
  const Icon = cfg.icon

  return (
    <div style={{
      width: 280, background: '#1e293b', border: '1px solid #334155',
      borderRadius: 14, padding: 22, flexShrink: 0,
      animation: 'fadeIn 0.2s both', alignSelf: 'flex-start',
      position: 'sticky', top: 24,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: cfg.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={cfg.color} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{resource.name}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{cfg.label}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 2 }}>
          <X size={16} />
        </button>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: s.bg, borderRadius: 8, border: `1px solid ${s.border}`, marginBottom: 14 }}>
        <PulseDot color={s.dot} />
        <span style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.label}</span>
      </div>

      {/* Info rows */}
      {[
        { icon: Users,    label: 'Capacity',     val: `${resource.capacity} people` },
        { icon: MapPin,   label: 'Location',     val: resource.location || '—' },
        { icon: Clock,    label: 'Available',    val: resource.availabilityStart && resource.availabilityEnd ? `${resource.availabilityStart} – ${resource.availabilityEnd}` : 'All day' },
        { icon: Building2, label: 'Wing',        val: cfg.wing },
      ].map(({ icon: I, label, val }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <I size={13} color="#475569" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 1 }}>{label}</div>
            <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500 }}>{val}</div>
          </div>
        </div>
      ))}

      {resource.description && (
        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: '10px 0', padding: '10px 12px', background: '#0f172a', borderRadius: 8 }}>
          {resource.description}
        </div>
      )}

      {/* Book button */}
      <button
        onClick={() => onBook(resource)}
        disabled={resource.status !== 'AVAILABLE'}
        style={{
          width: '100%', padding: '11px 0', borderRadius: 9, border: 'none',
          background: resource.status === 'AVAILABLE'
            ? 'linear-gradient(135deg, #0d9488, #0891b2)'
            : '#1e293b',
          color: resource.status === 'AVAILABLE' ? '#fff' : '#475569',
          fontSize: 13, fontWeight: 700, cursor: resource.status === 'AVAILABLE' ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          fontFamily: 'inherit', marginTop: 14,
          border: resource.status !== 'AVAILABLE' ? '1px solid #334155' : 'none',
        }}
      >
        <CalendarPlus size={15} />
        {resource.status === 'AVAILABLE' ? 'Book Now' : 'Not Available'}
      </button>
    </div>
  )
}

const EMPTY_FORM = { date: '', startTime: '', endTime: '', purpose: '', attendees: '' }

const S = {
  label:  { fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em' },
  input:  { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '9px 12px', color: '#f1f5f9', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' },
}

function BookingModal({ resource, onClose, userId }) {
  const [form,    setForm]    = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const avStart = resource.availabilityStart?.slice(0, 5)
  const avEnd   = resource.availabilityEnd?.slice(0, 5)

  const handleSubmit = async () => {
    if (!form.date || !form.startTime || !form.endTime || !form.purpose) {
      toast.error('Please fill in all required fields'); return
    }
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time'); return
    }
    if (resource.capacity && form.attendees && parseInt(form.attendees) > resource.capacity) {
      toast.error(`Max capacity is ${resource.capacity}`); return
    }
    setLoading(true)
    try {
      await axios.post('/api/bookings', { ...form, resourceId: resource.id, userId })
      toast.success('Booking request submitted!')
      onClose()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Booking failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000a', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 28, width: 420, animation: 'fadeIn 0.2s both', fontFamily: "'Inter',sans-serif" }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Book — {resource.name}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {avStart && avEnd ? `Available ${avStart}–${avEnd}` : 'All day'} · Cap: {resource.capacity}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}><X size={18} /></button>
        </div>

        {/* Date */}
        <label style={S.label}>Date *</label>
        <input style={{ ...S.input, marginBottom: 14 }} type="date" min={new Date().toISOString().split('T')[0]}
          value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />

        {/* Time range */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={S.label}>Start Time *</label>
            <input style={{ ...S.input, borderColor: avStart && form.startTime && form.startTime < avStart ? '#ef4444' : '#334155' }}
              type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            {avStart && form.startTime && form.startTime < avStart &&
              <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3 }}>Before availability ({avStart})</div>}
          </div>
          <div>
            <label style={S.label}>End Time *</label>
            <input style={{ ...S.input, borderColor: avEnd && form.endTime && form.endTime > avEnd ? '#ef4444' : '#334155' }}
              type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            {avEnd && form.endTime && form.endTime > avEnd &&
              <div style={{ fontSize: 10, color: '#ef4444', marginTop: 3 }}>After availability ({avEnd})</div>}
          </div>
        </div>

        {/* Purpose */}
        <label style={S.label}>Purpose *</label>
        <input style={{ ...S.input, marginBottom: 14 }} placeholder="e.g. Lecture, Project meeting…"
          value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />

        {/* Attendees */}
        <label style={S.label}>Expected Attendees</label>
        <input style={{ ...S.input, marginBottom: 20, borderColor: resource.capacity && form.attendees && parseInt(form.attendees) > resource.capacity ? '#ef4444' : '#334155' }}
          type="number" min="1" max={resource.capacity} placeholder={`Max ${resource.capacity}`}
          value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} />
        {resource.capacity && form.attendees && parseInt(form.attendees) > resource.capacity &&
          <div style={{ fontSize: 10, color: '#ef4444', marginTop: -16, marginBottom: 14 }}>Exceeds capacity of {resource.capacity}</div>}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: '1px solid #334155', background: 'none', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '10px 0', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#0d9488,#0891b2)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: loading ? 0.7 : 1 }}>
            <CalendarPlus size={14} />{loading ? 'Submitting…' : 'Submit Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ResourceMapPage() {
  const { user } = useAuth()
  const [resources,    setResources]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [selected,     setSelected]     = useState(null)
  const [bookingFor,   setBookingFor]   = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    axios.get('/api/resources')
      .then(r => setResources(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filterStatus === 'ALL'
    ? resources
    : resources.filter(r => r.status === filterStatus)

  const grouped = Object.keys(TYPE_CONFIG).reduce((acc, type) => {
    acc[type] = filtered.filter(r => r.type === type)
    return acc
  }, {})

  const counts = {
    available:   resources.filter(r => r.status === 'AVAILABLE').length,
    occupied:    resources.filter(r => r.status === 'OCCUPIED').length,
    maintenance: resources.filter(r => r.status === 'MAINTENANCE').length,
  }

  const handleBook = (resource) => {
    setBookingFor(resource)
  }

  return (
    <div style={{ padding: '28px 32px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <style>{KEYFRAMES}</style>

      {bookingFor && (
        <BookingModal
          resource={bookingFor}
          userId={user?.id}
          onClose={() => setBookingFor(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Building2 size={20} color="#0d9488" />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', margin: 0, letterSpacing: '-0.4px' }}>Campus Resource Map</h1>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Live view of all campus spaces — click any room to view details or book.</p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: '10px 16px' }}>
          {Object.entries(STATUS).map(([key, s]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              onClick={() => setFilterStatus(filterStatus === key ? 'ALL' : key)}>
              <PulseDot color={s.dot} />
              <span style={{ fontSize: 11, fontWeight: 600, color: filterStatus === key ? s.color : '#64748b' }}>
                {s.label} ({key === 'AVAILABLE' ? counts.available : key === 'OCCUPIED' ? counts.occupied : counts.maintenance})
              </span>
            </div>
          ))}
          {filterStatus !== 'ALL' && (
            <button onClick={() => setFilterStatus('ALL')} style={{ fontSize: 10, color: '#0d9488', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              Clear filter ×
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 80, fontSize: 14 }}>Loading campus map…</div>
      ) : (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* Map area */}
          <div style={{ flex: 1 }}>
            {/* Building outline */}
            <div style={{ background: '#111827', border: '2px solid #1e293b', borderRadius: 16, padding: 24, position: 'relative' }}>

              {/* Building label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #1e293b' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0d9488' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: '.1em' }}>
                  UNIHUB CAMPUS — INTERACTIVE FLOOR PLAN
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#334155' }}>{resources.length} spaces total</span>
              </div>

              {/* Wings grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                  const rooms = grouped[type] || []
                  const Icon = cfg.icon
                  return (
                    <div key={type} style={{
                      background: '#0f172a', border: `1px solid #1e293b`,
                      borderTop: `3px solid ${cfg.color}33`,
                      borderRadius: 12, padding: '14px 16px',
                    }}>
                      {/* Wing header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: cfg.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={13} color={cfg.color} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: '.06em' }}>
                          {cfg.wing} — {cfg.label.toUpperCase()}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#334155' }}>{rooms.length} rooms</span>
                      </div>

                      {rooms.length === 0 ? (
                        <div style={{ fontSize: 12, color: '#334155', padding: '16px 0', textAlign: 'center' }}>
                          {filterStatus !== 'ALL' ? `No ${filterStatus.toLowerCase()} rooms` : 'No rooms added'}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                          {rooms.map(r => (
                            <RoomCard
                              key={r.id}
                              resource={r}
                              onClick={setSelected}
                              isSelected={selected?.id === r.id}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Floor stats bar */}
              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #1e293b', display: 'flex', gap: 24 }}>
                {[
                  { label: 'Available', count: counts.available,   color: '#34d399' },
                  { label: 'Occupied',  count: counts.occupied,    color: '#fbbf24' },
                  { label: 'Maintenance', count: counts.maintenance, color: '#f87171' },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ height: 4, width: 32, borderRadius: 2, background: color }} />
                    <span style={{ fontSize: 11, color: '#475569' }}>{count} {label}</span>
                  </div>
                ))}
                <div style={{ marginLeft: 'auto', fontSize: 11, color: '#334155' }}>
                  Click legend items to filter · Click a room to view details
                </div>
              </div>
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <DetailPanel
              resource={selected}
              onClose={() => setSelected(null)}
              onBook={handleBook}
            />
          )}
        </div>
      )}
    </div>
  )
}
