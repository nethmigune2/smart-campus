import React, { useEffect, useState } from 'react'
import { Search, Plus, Edit2, Trash2, MapPin, Users, Clock, X, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

const TYPES = ['ALL', 'AUDITORIUM', 'LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'EQUIPMENT']
const STATUSES = ['ALL', 'AVAILABLE', 'MAINTENANCE', 'OCCUPIED']

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
  badge: (c, bg) => ({ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, color: c, background: bg, textTransform: 'uppercase', letterSpacing: '.05em' }),
}

const TYPE_LABEL = { AUDITORIUM: 'Auditorium', LAB: 'Lab', LECTURE_HALL: 'Lecture Hall', MEETING_ROOM: 'Meeting Room', EQUIPMENT: 'Equipment' }
const TYPE_COLOR = { AUDITORIUM: ['#fca5a5','#450a0a'], LAB: ['#a5f3fc','#164e63'], LECTURE_HALL: ['#7dd3fc','#1e3a5f'], MEETING_ROOM: ['#c4b5fd','#3b1f5e'], EQUIPMENT: ['#fdba74','#431407'] }

const STATUS_BADGE = {
  AVAILABLE:   { color: '#34d399', bg: '#064e3b', label: 'Available' },
  MAINTENANCE: { color: '#fbbf24', bg: '#451a03', label: 'Maintenance' },
  OCCUPIED:    { color: '#f87171', bg: '#450a0a', label: 'Occupied' },
}

const EMPTY_FORM = { name: '', type: 'LECTURE_HALL', capacity: '', location: '', description: '', availabilityStart: '08:00', availabilityEnd: '18:00', status: 'AVAILABLE' }

export default function ResourcesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [resources, setResources] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [typeFilter,   setTypeFilter]   = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editing,   setEditing]   = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [saving,    setSaving]    = useState(false)

  const load = () => {
    setLoading(true)
    axios.get('/api/resources')
      .then(r => setResources(r.data))
      .catch(() => toast.error('Failed to load resources'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = resources.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.location.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter   === 'ALL' || r.type   === typeFilter
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit   = (r) => { setEditing(r.id); setForm({ ...r, availabilityStart: r.availabilityStart || '08:00', availabilityEnd: r.availabilityEnd || '18:00' }); setShowModal(true) }
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM) }

  const handleSave = async () => {
    if (!form.name || !form.location || !form.capacity) { toast.error('Name, location and capacity are required'); return }
    setSaving(true)
    try {
      if (editing) {
        await axios.put(`/api/resources/${editing}`, { ...form, capacity: Number(form.capacity) })
        toast.success('Resource updated')
      } else {
        await axios.post('/api/resources', { ...form, capacity: Number(form.capacity) })
        toast.success('Resource created')
      }
      load(); closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await axios.delete(`/api/resources/${id}`)
      toast.success('Resource deleted')
      load()
    } catch { toast.error('Delete failed') }
  }

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={S.heading}>Facilities & Resources</div>
          <div style={S.sub}>{resources.length} resources in the campus catalogue</div>
        </div>
        {isAdmin && (
          <button style={S.btnPrimary} onClick={openCreate}>
            <Plus size={15} /> Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ ...S.card, marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={S.label}>Search</label>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input style={{ ...S.input, paddingLeft: 30 }} placeholder="Search by name or location…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ minWidth: 160 }}>
          <label style={S.label}>Type</label>
          <select style={S.select} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : TYPE_LABEL[t]}</option>)}
          </select>
        </div>
        <div style={{ minWidth: 140 }}>
          <label style={S.label}>Status</label>
          <select style={S.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
        {(search || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button style={S.btnGhost} onClick={() => { setSearch(''); setTypeFilter('ALL'); setStatusFilter('ALL') }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Resource grid */}
      {loading ? (
        <div style={{ color: '#64748b', fontSize: 14, textAlign: 'center', padding: 60 }}>Loading resources…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <BookOpen size={36} color="#334155" style={{ marginBottom: 12 }} />
          <div style={{ color: '#475569', fontSize: 14 }}>No resources found.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {filtered.map(r => {
            const [tc, tbg] = TYPE_COLOR[r.type] || ['#94a3b8', '#1e293b']
            return (
              <div key={r.id} style={{ ...S.card, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={S.badge(tc, tbg)}>{TYPE_LABEL[r.type] || r.type}</span>
                  <span style={S.badge(STATUS_BADGE[r.status]?.color ?? '#94a3b8', STATUS_BADGE[r.status]?.bg ?? '#1e293b')}>
                    {STATUS_BADGE[r.status]?.label ?? r.status}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{r.name}</div>
                {r.description && <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{r.description}</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                    <MapPin size={12} color="#64748b" /> {r.location}
                  </div>
                  {r.capacity && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                      <Users size={12} color="#64748b" /> Capacity: {r.capacity}
                    </div>
                  )}
                  {r.availabilityStart && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}>
                      <Clock size={12} color="#64748b" /> {r.availabilityStart} – {r.availabilityEnd}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, paddingTop: 12, borderTop: '1px solid #334155' }}>
                    <button style={{ ...S.btnGhost, flex: 1, justifyContent: 'center' }} onClick={() => openEdit(r)}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      style={{ ...S.btnGhost, flex: 1, justifyContent: 'center', color: '#f87171', borderColor: '#450a0a' }}
                      onClick={() => handleDelete(r.id, r.name)}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 28, width: 500, maxHeight: '90vh', overflowY: 'auto', fontFamily: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{editing ? 'Edit Resource' : 'Add New Resource'}</div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Name *</label>
                <input style={S.input} placeholder="e.g. Lab A-101" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Type *</label>
                <select style={S.select} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.filter(t => t !== 'ALL').map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Capacity *</label>
                <input style={S.input} type="number" min="1" placeholder="30" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Location *</label>
                <input style={S.input} placeholder="e.g. Building B, Floor 2" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Available From</label>
                <input style={S.input} type="time" value={form.availabilityStart} onChange={e => setForm(f => ({ ...f, availabilityStart: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Available Until</label>
                <input style={S.input} type="time" value={form.availabilityEnd} onChange={e => setForm(f => ({ ...f, availabilityEnd: e.target.value }))} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Description</label>
                <textarea style={{ ...S.input, resize: 'vertical', minHeight: 72 }} placeholder="Optional details…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={S.label}>Status</label>
                <select style={S.select} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="AVAILABLE">Available</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OCCUPIED">Occupied</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button style={S.btnGhost} onClick={closeModal}>Cancel</button>
              <button style={{ ...S.btnPrimary, opacity: saving ? 0.6 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? 'Update Resource' : 'Create Resource'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
