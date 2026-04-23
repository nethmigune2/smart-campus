import React, { useEffect, useState, useRef } from 'react'
import {
  Wrench, Plus, X, ChevronDown, Send, Edit2, Trash2,
  AlertCircle, Clock, CheckCircle2, XCircle, MessageSquare,
  Paperclip, User, Filter
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = 'http://localhost:8080'

const S = {
  page:   { padding: '32px 36px', background: '#0f172a', minHeight: '100vh', fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" },
  heading:{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 4, letterSpacing: '-0.4px' },
  sub:    { fontSize: 13, color: '#64748b', marginBottom: 28 },
  card:   { background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '18px 20px' },
  label:  { fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em' },
  input:  { width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  select: { width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none' },
  btnPrimary: { padding: '9px 18px', background: 'linear-gradient(135deg,#0d9488,#0891b2)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' },
  btnGhost:   { padding: '7px 10px', background: 'transparent', border: '1px solid #334155', borderRadius: 7, color: '#94a3b8', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit' },
  th: { fontSize: 11, fontWeight: 600, color: '#64748b', padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #334155', textTransform: 'uppercase', letterSpacing: '.07em' },
  td: { fontSize: 13, color: '#e2e8f0', padding: '12px 14px', borderBottom: '1px solid #1e293b', verticalAlign: 'middle' },
}

const PRIORITY_BADGE = {
  LOW:      { color: '#34d399', bg: '#064e3b' },
  MEDIUM:   { color: '#fbbf24', bg: '#451a03' },
  HIGH:     { color: '#f97316', bg: '#431407' },
  CRITICAL: { color: '#f87171', bg: '#450a0a' },
}
const STATUS_BADGE = {
  OPEN:        { color: '#7dd3fc', bg: '#1e3a5f' },
  IN_PROGRESS: { color: '#fbbf24', bg: '#451a03' },
  RESOLVED:    { color: '#34d399', bg: '#064e3b' },
  CLOSED:      { color: '#94a3b8', bg: '#1e293b' },
  REJECTED:    { color: '#f87171', bg: '#450a0a' },
}
const CATEGORIES = ['ELECTRICAL','PLUMBING','IT_EQUIPMENT','HVAC','FURNITURE','CLEANING','SECURITY','OTHER']
const PRIORITIES  = ['LOW','MEDIUM','HIGH','CRITICAL']
const STATUSES    = ['ALL','OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED']

const badge = (text, map) => {
  const s = map[text] || { color: '#94a3b8', bg: '#1e293b' }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
      color: s.color, background: s.bg, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>
      {text?.replace('_', ' ')}
    </span>
  )
}

const EMPTY_FORM = { title: '', description: '', category: 'IT_EQUIPMENT', priority: 'MEDIUM',
                     location: '', resourceId: '', contactName: '', contactPhone: '' }

export default function TicketsPage() {
  const { user } = useAuth()
  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF'
  const isAdmin = user?.role === 'ADMIN'

  const [tickets,      setTickets]      = useState([])
  const [resources,    setResources]    = useState([])
  const [staffList,    setStaffList]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreate,   setShowCreate]   = useState(false)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [files,        setFiles]        = useState([])
  const [saving,       setSaving]       = useState(false)
  const [detailTicket, setDetailTicket] = useState(null)
  const [comments,     setComments]     = useState([])
  const [newComment,   setNewComment]   = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [statusModal,  setStatusModal]  = useState(null)
  const [statusForm,   setStatusForm]   = useState({ status: '', reason: '', resolutionNotes: '' })
  const [assignModal,  setAssignModal]  = useState(null)
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const url = isAdminOrStaff ? '/api/tickets' : '/api/tickets/my'
      const [tRes, rRes] = await Promise.all([
        axios.get(url).catch(() => ({ data: [] })),
        axios.get('/api/resources').catch(() => ({ data: [] })),
      ])
      setTickets(tRes.data)
      setResources(rRes.data)
      if (isAdmin) {
        const uRes = await axios.get('/api/auth/users').catch(() => ({ data: [] }))
        setStaffList(uRes.data.filter(u => u.role === 'STAFF' || u.role === 'ADMIN'))
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { if (user?.id) load() }, [user])

  const loadComments = async (ticketId) => {
    const res = await axios.get(`/api/tickets/${ticketId}/comments`).catch(() => ({ data: [] }))
    setComments(res.data)
  }

  const openDetail = (ticket) => {
    setDetailTicket(ticket)
    loadComments(ticket.id)
    setNewComment('')
    setEditingComment(null)
  }

  const filtered = statusFilter === 'ALL' ? tickets : tickets.filter(t => t.status === statusFilter)

  // ── Create ticket ──
  const handleCreate = async () => {
    if (!form.title || !form.description || !form.category || !form.priority) {
      toast.error('Title, description, category and priority are required'); return
    }
    if (!form.resourceId && !form.location) {
      toast.error('Please select a resource or enter a location'); return
    }
    if (files.length > 3) { toast.error('Maximum 3 attachments'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v) })
      files.forEach(f => fd.append('attachments', f))
      await axios.post('/api/tickets', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Ticket submitted!')
      setShowCreate(false); setForm(EMPTY_FORM); setFiles([])
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket')
    } finally { setSaving(false) }
  }

  // ── Comments ──
  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await axios.post(`/api/tickets/${detailTicket.id}/comments`, { content: newComment })
      setNewComment('')
      loadComments(detailTicket.id)
    } catch { toast.error('Failed to add comment') }
  }

  const handleEditComment = async (commentId) => {
    try {
      await axios.put(`/api/tickets/${detailTicket.id}/comments/${commentId}`, { content: editingComment.content })
      setEditingComment(null)
      loadComments(detailTicket.id)
    } catch { toast.error('Failed to edit comment') }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await axios.delete(`/api/tickets/${detailTicket.id}/comments/${commentId}`)
      loadComments(detailTicket.id)
    } catch { toast.error('Failed to delete comment') }
  }

  // ── Admin: update status ──
  const handleUpdateStatus = async () => {
    if (!statusForm.status) { toast.error('Select a status'); return }
    try {
      const updated = await axios.patch(`/api/tickets/${statusModal.id}/status`, statusForm)
      toast.success('Status updated')
      setStatusModal(null)
      setDetailTicket(prev => prev?.id === updated.data.id ? updated.data : prev)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  // ── Admin: assign ──
  const handleAssign = async (assigneeId) => {
    try {
      const updated = await axios.patch(`/api/tickets/${assignModal.id}/assign`, { assigneeId: parseInt(assigneeId) })
      toast.success('Ticket assigned')
      setAssignModal(null)
      setDetailTicket(prev => prev?.id === updated.data.id ? updated.data : prev)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket?')) return
    try {
      await axios.delete(`/api/tickets/${id}`)
      toast.success('Ticket deleted')
      if (detailTicket?.id === id) setDetailTicket(null)
      load()
    } catch { toast.error('Delete failed') }
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Wrench size={20} color="#0d9488" />
            <div style={S.heading}>Maintenance Tickets</div>
          </div>
          <div style={S.sub}>{filtered.length} ticket{filtered.length !== 1 ? 's' : ''} shown</div>
        </div>
        <button style={S.btnPrimary} onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Ticket
        </button>
      </div>

      {/* Status filter */}
      <div style={{ ...S.card, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={13} color="#64748b" />
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>STATUS:</span>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 11, fontWeight: 600,
            background: statusFilter === s ? '#0d9488' : '#0f172a',
            color: statusFilter === s ? '#fff' : '#64748b',
          }}>{s}</button>
        ))}
      </div>

      {/* Tickets table */}
      {loading ? (
        <div style={{ color: '#64748b', textAlign: 'center', padding: 60, fontSize: 14 }}>Loading tickets…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Wrench size={36} color="#334155" style={{ marginBottom: 12 }} />
          <div style={{ color: '#475569', fontSize: 14 }}>No tickets found.</div>
        </div>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                <th style={S.th}>Title</th>
                {isAdminOrStaff && <th style={S.th}>Submitted By</th>}
                <th style={S.th}>Category</th>
                <th style={S.th}>Priority</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Assigned To</th>
                <th style={S.th}>Date</th>
                <th style={S.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}
                  onMouseOver={e => e.currentTarget.style.background = '#0f172a'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  style={{ cursor: 'pointer', transition: 'background .1s' }}
                >
                  <td style={S.td} onClick={() => openDetail(t)}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{t.resource?.name || t.location}</div>
                  </td>
                  {isAdminOrStaff && (
                    <td style={S.td} onClick={() => openDetail(t)}>
                      <div style={{ fontWeight: 500 }}>{t.createdBy?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{t.createdBy?.role}</div>
                    </td>
                  )}
                  <td style={S.td} onClick={() => openDetail(t)}>{badge(t.category, STATUS_BADGE)}</td>
                  <td style={S.td} onClick={() => openDetail(t)}>{badge(t.priority, PRIORITY_BADGE)}</td>
                  <td style={S.td} onClick={() => openDetail(t)}>{badge(t.status, STATUS_BADGE)}</td>
                  <td style={{ ...S.td }} onClick={() => openDetail(t)}>
                    {t.assignedTo
                      ? <span style={{ fontSize: 12, color: '#7dd3fc' }}>{t.assignedTo.name}</span>
                      : <span style={{ fontSize: 11, color: '#475569' }}>Unassigned</span>}
                  </td>
                  <td style={{ ...S.td, fontSize: 12, color: '#64748b' }} onClick={() => openDetail(t)}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isAdminOrStaff && (
                        <button style={{ ...S.btnGhost, color: '#fbbf24', borderColor: '#451a03' }}
                          onClick={() => { setStatusModal(t); setStatusForm({ status: t.status, reason: '', resolutionNotes: t.resolutionNotes || '' }) }}>
                          <ChevronDown size={12} /> Status
                        </button>
                      )}
                      {isAdmin && (
                        <>
                          <button style={{ ...S.btnGhost, color: '#7dd3fc', borderColor: '#1e3a5f' }}
                            onClick={() => setAssignModal(t)}>
                            <User size={12} /> Assign
                          </button>
                          <button style={{ ...S.btnGhost, color: '#f87171', borderColor: '#450a0a' }}
                            onClick={() => handleDelete(t.id)}>
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create Ticket Modal ── */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000099', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, width: 540, maxHeight: '90vh', overflowY: 'auto', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>New Maintenance Ticket</div>
              <button onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); setFiles([]) }}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={S.label}>Title *</label>
                <input style={S.input} placeholder="Brief description of the issue" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={S.label}>Category *</label>
                  <select style={S.select} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Priority *</label>
                  <select style={S.select} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={S.label}>Description *</label>
                <textarea style={{ ...S.input, resize: 'vertical', minHeight: 80 }}
                  placeholder="Describe the issue in detail…" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={S.label}>Resource (optional)</label>
                  <select style={S.select} value={form.resourceId} onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}>
                    <option value="">Select resource…</option>
                    {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Location {!form.resourceId ? '*' : ''}</label>
                  <input style={S.input} placeholder="e.g. Building A, Room 201"
                    value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={S.label}>Contact Name</label>
                  <input style={S.input} placeholder="Your name" value={form.contactName}
                    onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} />
                </div>
                <div>
                  <label style={S.label}>Contact Phone</label>
                  <input style={S.input} placeholder="07X XXXXXXX" value={form.contactPhone}
                    onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={S.label}>Attachments (max 3 images)</label>
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                  onChange={e => {
                    const selected = Array.from(e.target.files)
                    if (selected.length > 3) { toast.error('Max 3 files'); return }
                    setFiles(selected)
                  }} />
                <button style={{ ...S.btnGhost, width: '100%', justifyContent: 'center' }}
                  onClick={() => fileRef.current.click()}>
                  <Paperclip size={13} /> {files.length > 0 ? `${files.length} file(s) selected` : 'Choose images…'}
                </button>
                {files.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {files.map((f, i) => (
                      <span key={i} style={{ fontSize: 11, background: '#0f172a', border: '1px solid #334155', borderRadius: 4, padding: '2px 8px', color: '#94a3b8' }}>
                        {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button style={S.btnGhost} onClick={() => { setShowCreate(false); setForm(EMPTY_FORM); setFiles([]) }}>Cancel</button>
              <button style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }} onClick={handleCreate} disabled={saving}>
                {saving ? 'Submitting…' : 'Submit Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ticket Detail Modal ── */}
      {detailTicket && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000099', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, width: 620, maxHeight: '90vh', overflowY: 'auto', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{detailTicket.title}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {badge(detailTicket.status, STATUS_BADGE)}
                  {badge(detailTicket.priority, PRIORITY_BADGE)}
                  {badge(detailTicket.category, STATUS_BADGE)}
                </div>
              </div>
              <button onClick={() => setDetailTicket(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}><X size={18} /></button>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, padding: '14px', background: '#0f172a', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>SUBMITTED BY</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>{detailTicket.createdBy?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>LOCATION</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>{detailTicket.resource?.name || detailTicket.location || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>ASSIGNED TO</div>
                <div style={{ fontSize: 13, color: detailTicket.assignedTo ? '#7dd3fc' : '#475569' }}>
                  {detailTicket.assignedTo?.name || 'Unassigned'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>CONTACT</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>{detailTicket.contactName || '—'} {detailTicket.contactPhone ? `· ${detailTicket.contactPhone}` : ''}</div>
              </div>
            </div>

            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 14 }}>{detailTicket.description}</div>

            {detailTicket.rejectionReason && (
              <div style={{ padding: '10px 12px', background: '#450a0a22', border: '1px solid #450a0a', borderRadius: 8, fontSize: 12, color: '#f87171', marginBottom: 12 }}>
                Rejection reason: {detailTicket.rejectionReason}
              </div>
            )}
            {detailTicket.resolutionNotes && (
              <div style={{ padding: '10px 12px', background: '#064e3b22', border: '1px solid #0d9488', borderRadius: 8, fontSize: 12, color: '#34d399', marginBottom: 12 }}>
                Resolution: {detailTicket.resolutionNotes}
              </div>
            )}

            {/* Attachments */}
            {detailTicket.attachments?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>ATTACHMENTS</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {detailTicket.attachments.map((fn, i) => (
                    <a key={i} href={`${API}/api/tickets/files/${fn}`} target="_blank" rel="noreferrer"
                      style={{ display: 'block', border: '1px solid #334155', borderRadius: 8, overflow: 'hidden' }}>
                      <img src={`${API}/api/tickets/files/${fn}`} alt={`attachment-${i}`}
                        style={{ width: 80, height: 80, objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} color="#0d9488" /> Comments ({comments.length})
              </div>

              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {c.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, background: '#0f172a', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#7dd3fc' }}>{c.author?.name}</span>
                      <span style={{ fontSize: 11, color: '#475569' }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</span>
                    </div>
                    {editingComment?.id === c.id ? (
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <input style={{ ...S.input, flex: 1 }} value={editingComment.content}
                          onChange={e => setEditingComment(ec => ({ ...ec, content: e.target.value }))} />
                        <button style={{ ...S.btnPrimary, padding: '6px 10px' }} onClick={() => handleEditComment(c.id)}>Save</button>
                        <button style={S.btnGhost} onClick={() => setEditingComment(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: '#e2e8f0' }}>{c.content}</div>
                    )}
                    {(c.author?.id === user?.id || isAdmin) && editingComment?.id !== c.id && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        {c.author?.id === user?.id && (
                          <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}
                            onClick={() => setEditingComment({ id: c.id, content: c.content })}>
                            <Edit2 size={11} /> Edit
                          </button>
                        )}
                        <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}
                          onClick={() => handleDeleteComment(c.id)}>
                          <Trash2 size={11} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input style={{ ...S.input, flex: 1 }} placeholder="Write a comment…"
                  value={newComment} onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleAddComment() }} />
                <button style={{ ...S.btnPrimary, padding: '9px 12px' }} onClick={handleAddComment}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Update Modal ── */}
      {statusModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000099', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 24, width: 420, fontFamily: 'inherit' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Update Status — {statusModal.title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={S.label}>New Status *</label>
                <select style={S.select} value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                  {['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              {statusForm.status === 'REJECTED' && (
                <div>
                  <label style={S.label}>Rejection Reason</label>
                  <textarea style={{ ...S.input, resize: 'vertical', minHeight: 60 }}
                    value={statusForm.reason} onChange={e => setStatusForm(f => ({ ...f, reason: e.target.value }))} />
                </div>
              )}
              {(statusForm.status === 'RESOLVED' || statusForm.status === 'CLOSED') && (
                <div>
                  <label style={S.label}>Resolution Notes</label>
                  <textarea style={{ ...S.input, resize: 'vertical', minHeight: 60 }}
                    placeholder="Describe what was done to resolve the issue…"
                    value={statusForm.resolutionNotes} onChange={e => setStatusForm(f => ({ ...f, resolutionNotes: e.target.value }))} />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
              <button style={S.btnGhost} onClick={() => setStatusModal(null)}>Cancel</button>
              <button style={S.btnPrimary} onClick={handleUpdateStatus}>Update Status</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign Modal ── */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000099', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 24, width: 360, fontFamily: 'inherit' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Assign Ticket</div>
            <label style={S.label}>Assign to</label>
            <select style={S.select} defaultValue="" onChange={e => { if (e.target.value) handleAssign(e.target.value) }}>
              <option value="">Select staff member…</option>
              {staffList.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
              <button style={S.btnGhost} onClick={() => setAssignModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
