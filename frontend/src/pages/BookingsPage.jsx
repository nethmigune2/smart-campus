import React, { useEffect, useState } from 'react'
import { CalendarCheck, Plus, X, CheckCircle2, XCircle, Ban, Clock, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const S = {
  page:   { padding: '32px 36px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" },
  heading: { fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 4, letterSpacing: '-0.4px' },
  sub:    { fontSize: 13, color: '#64748b', marginBottom: 28 },
  card:   { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '18px 20px' },
  label:  { fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em' },
  input:  { width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none' },
  select: { width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none' },
  btnPrimary: { padding: '9px 18px', background: 'linear-gradient(135deg,#0d9488,#0891b2)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' },
  btnGhost: { padding: '7px 10px', background: 'transparent', border: '1px solid #334155', borderRadius: 7, color: '#94a3b8', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' },
  badge: (c, bg) => ({ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, color: c, background: bg, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }),
  th: { fontSize: 11, fontWeight: 600, color: '#64748b', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #334155', textTransform: 'uppercase', letterSpacing: '.07em' },
  td: { fontSize: 13, color: '#e2e8f0', padding: '12px 14px', borderBottom: '1px solid #1e293b', verticalAlign: 'middle' },
}

const STATUS_BADGE = {
  PENDING:   S.badge('#fbbf24','#451a03'),
  APPROVED:  S.badge('#34d399','#064e3b'),
  REJECTED:  S.badge('#f87171','#450a0a'),
  CANCELLED: S.badge('#94a3b8','#0f172a'),
}

const EMPTY_FORM = { resourceId: '', date: '', startTime: '', endTime: '', purpose: '', attendees: '' }

export default function BookingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [bookings,   setBookings]   = useState([])
  const [resources,  setResources]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = () => {
    setLoading(true)
    const bookingUrl = isAdmin ? '/api/bookings' : `/api/bookings/user/${user?.id}`
    Promise.all([
      axios.get(bookingUrl).catch(() => ({ data: [] })),
      axios.get('/api/resources').catch(() => ({ data: [] })),
    ]).then(([bRes, rRes]) => {
      setBookings(bRes.data)
      setResources(rRes.data.filter(r => r.status === 'AVAILABLE'))
    }).finally(() => setLoading(false))
  }

  useEffect(() => { if (user?.id) load() }, [user])

  const filtered = statusFilter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === statusFilter)

  const openCreate = () => { setForm(EMPTY_FORM); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setForm(EMPTY_FORM) }

  const handleBook = async () => {
    if (!form.resourceId || !form.date || !form.startTime || !form.endTime || !form.purpose) {
      toast.error('Please fill in all required fields'); return
    }
    setSaving(true)
    try {
      await axios.post('/api/bookings', { ...form, userId: user.id })
      toast.success('Booking request submitted!')
      load(); closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally { setSaving(false) }
  }

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/api/bookings/${id}/approve`)
      toast.success('Booking approved'); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return }
    try {
      await axios.patch(`/api/bookings/${rejectModal}/reject`, { reason: rejectReason })
      toast.success('Booking rejected'); setRejectModal(null); setRejectReason(''); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await axios.patch(`/api/bookings/${id}/cancel`)
      toast.success('Booking cancelled'); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={S.heading}>{isAdmin ? 'All Bookings' : 'My Bookings'}</div>
          <div style={S.sub}>{filtered.length} booking{filtered.length !== 1 ? 's' : ''} shown</div>
        </div>
        <button style={S.btnPrimary} onClick={openCreate}>
          <Plus size={15} /> New Booking
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ ...S.card, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={13} color="#64748b" />
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginRight: 4 }}>STATUS:</span>
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 11, fontWeight: 600,
              background: statusFilter === s ? '#0d9488' : '#0f172a',
              color: statusFilter === s ? '#fff' : '#64748b',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 60, fontSize: 14 }}>Loading bookings…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <CalendarCheck size={36} color="#334155" style={{ marginBottom: 12 }} />
          <div style={{ color: '#475569', fontSize: 14 }}>No bookings found.</div>
        </div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={S.th}>Resource</th>
                {isAdmin && <th style={S.th}>Requested By</th>}
                <th style={S.th}>Date</th>
                <th style={S.th}>Time</th>
                <th style={S.th}>Purpose</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} style={{ transition: 'background .1s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#0f172a'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={S.td}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{b.resource?.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{b.resource?.location}</div>
                  </td>
                  {isAdmin && (
                    <td style={S.td}>
                      <div style={{ fontWeight: 500 }}>{b.user?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{b.user?.role}</div>
                    </td>
                  )}
                  <td style={S.td}>{b.date}</td>
                  <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={12} color="#64748b" />
                      {b.startTime} – {b.endTime}
                    </div>
                  </td>
                  <td style={{ ...S.td, maxWidth: 180 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#94a3b8' }}>
                      {b.purpose}
                    </div>
                    {b.attendees && <div style={{ fontSize: 11, color: '#64748b' }}>{b.attendees} attendees</div>}
                  </td>
                  <td style={S.td}>
                    <span style={STATUS_BADGE[b.status]}>{b.status}</span>
                    {b.rejectionReason && (
                      <div style={{ fontSize: 11, color: '#f87171', marginTop: 3 }} title={b.rejectionReason}>
                        Reason: {b.rejectionReason.slice(0, 30)}{b.rejectionReason.length > 30 ? '…' : ''}
                      </div>
                    )}
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isAdmin && b.status === 'PENDING' && (
                        <>
                          <button
                            style={{ ...S.btnGhost, color: '#34d399', borderColor: '#064e3b' }}
                            onClick={() => handleApprove(b.id)} title="Approve"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                          <button
                            style={{ ...S.btnGhost, color: '#f87171', borderColor: '#450a0a' }}
                            onClick={() => { setRejectModal(b.id); setRejectReason('') }} title="Reject"
                          >
                            <XCircle size={13} />
                          </button>
                        </>
                      )}
                      {!isAdmin && b.status === 'APPROVED' && (
                        <button
                          style={{ ...S.btnGhost, color: '#f87171', borderColor: '#450a0a' }}
                          onClick={() => handleCancel(b.id)} title="Cancel"
                        >
                          <Ban size={13} /> Cancel
                        </button>
                      )}
                      {b.status === 'PENDING' && !isAdmin && (
                        <span style={{ fontSize: 11, color: '#fbbf24' }}>Awaiting review</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Booking Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, width: 480, maxHeight: '90vh', overflowY: 'auto', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>New Booking Request</div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={S.label}>Resource *</label>
                <select style={S.select} value={form.resourceId} onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}>
                  <option value="">Select a resource…</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — {r.location} (cap: {r.capacity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={S.label}>Date *</label>
                <input style={S.input} type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={S.label}>Start Time *</label>
                  <input style={S.input} type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>End Time *</label>
                  <input style={S.input} type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={S.label}>Purpose *</label>
                <input style={S.input} placeholder="e.g. Lecture, Project meeting…" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Expected Attendees</label>
                <input style={S.input} type="number" min="1" placeholder="e.g. 25" value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: 8, padding: '10px 12px', background: '#134e4a22', border: '1px solid #0d9488', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: '#5eead4' }}>
                The system automatically checks for scheduling conflicts. Conflicting time slots will be rejected.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button style={S.btnGhost} onClick={closeModal}>Cancel</button>
              <button style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }} onClick={handleBook} disabled={saving}>
                {saving ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 24, width: 380, fontFamily: 'inherit' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>Reject Booking</div>
            <label style={S.label}>Reason for rejection *</label>
            <textarea
              style={{ ...S.input, resize: 'vertical', minHeight: 80 }}
              placeholder="Explain why this booking is being rejected…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
              <button style={S.btnGhost} onClick={() => setRejectModal(null)}>Cancel</button>
              <button
                style={{ ...S.btnPrimary, background: '#dc2626' }}
                onClick={handleReject}
              >
                <XCircle size={14} /> Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
