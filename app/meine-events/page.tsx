'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/context/LanguageContext'

export default function MeineEventsPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [stats, setStats] = useState({ events: 0, fotos: 0 })
  const [fotoCounts, setFotoCounts] = useState<Record<string, number>>({})
  const [ligaFilter, setLigaFilter] = useState('')
  const [datumFilter, setDatumFilter] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const { lang } = useLanguage()

  const t = {
    myEvents: lang === 'de' ? 'Meine Events' : 'My Events',
    uploadedPhotos: lang === 'de' ? 'Hochgeladene Fotos' : 'Uploaded Photos',
    newEvent: lang === 'de' ? '+ Neues Event erstellen' : '+ Create New Event',
    sportType: lang === 'de' ? 'Sportart' : 'Sport',
    allSports: lang === 'de' ? 'Alle Sportarten' : 'All Sports',
    date: lang === 'de' ? 'Datum' : 'Date',
    resetFilter: lang === 'de' ? 'Filter zurücksetzen' : 'Reset filter',
    noEvents: lang === 'de' ? 'Noch keine Events vorhanden.' : 'No events yet.',
    createFirst: lang === 'de' ? 'Erstes Event erstellen' : 'Create first event',
    completed: lang === 'de' ? 'Abgeschlossen' : 'Completed',
    photo: lang === 'de' ? 'Foto' : 'photo',
    manage: lang === 'de' ? 'Verwalten' : 'Manage',
    deleteConfirm: lang === 'de' ? 'Event und alle Fotos löschen?' : 'Delete event and all photos?',
    eventDeleted: lang === 'de' ? '✅ Event gelöscht!' : '✅ Event deleted!',
    loading: lang === 'de' ? 'Lade...' : 'Loading...',
  }

useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { router.push('/login'); return }
        setUser(session.user)
        await loadEvents(session.user.id)
      } catch (e) {
        console.error('init error:', e)
      }
      setLoading(false)
    }
    init()

    const failsafe = setTimeout(() => setLoading(false), 5000)
    return () => clearTimeout(failsafe)
  }, [router])

  useEffect(() => {
    let result = events
    if (ligaFilter) result = result.filter((ev) => ev.liga === ligaFilter)
    if (datumFilter) result = result.filter((ev) => ev.date === datumFilter)
    setFiltered(result)
  }, [ligaFilter, datumFilter, events])

  const loadEvents = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const { data: upcoming } = await supabase.from('events').select('*')
      .eq('user_id', userId).gte('date', today).order('date', { ascending: true })
    const { data: past } = await supabase.from('events').select('*')
      .eq('user_id', userId).lt('date', today).order('date', { ascending: false })
    const combined = [...(upcoming || []), ...(past || [])]
    setEvents(combined)
    setFiltered(combined)
    if (combined.length > 0) {
      const { count } = await supabase.from('event_fotos').select('*', { count: 'exact', head: true }).in('event_id', combined.map((e: any) => e.id))
      setStats({ events: combined.length, fotos: count || 0 })

      const { data: fotoRows } = await supabase.from('event_fotos').select('event_id').in('event_id', combined.map((e: any) => e.id))
      const counts: Record<string, number> = {}
      fotoRows?.forEach((row: any) => {
        counts[row.event_id] = (counts[row.event_id] || 0) + 1
      })
      setFotoCounts(counts)
    } else {
      setStats({ events: 0, fotos: 0 })
      setFotoCounts({})
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm(t.deleteConfirm)) return
    await supabase.from('event_fotos').delete().eq('event_id', eventId)
    await supabase.from('events').delete().eq('id', eventId)
    setMessage(t.eventDeleted)
    loadEvents(user.id)
  }

  const today = new Date().toISOString().split('T')[0]

  const mobileNavBtn = {
    background: 'transparent', color: '#e8eef4', border: 'none',
    borderBottom: '1px solid #1c2a38', padding: '18px 24px',
    fontWeight: 700, fontSize: 15, letterSpacing: 1,
    textTransform: 'uppercase' as any, cursor: 'pointer',
    textAlign: 'left' as any, width: '100%'
  }

  const go = (path: string) => {
    router.push(path)
    setMenuOpen(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{t.loading}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>

      <div style={{ padding: '40px 48px', maxWidth: '1200px', margin: '60px auto 0', width: '100%' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>{t.myEvents}</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#445566', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t.myEvents}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#e8ff00' }}>{stats.events}</div>
          </div>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#445566', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t.uploadedPhotos}</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#e8ff00' }}>{stats.fotos}</div>
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <button onClick={() => router.push('/admin')}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>
            {t.newEvent}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#445566', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t.sportType}</div>
            <select value={ligaFilter} onChange={(e) => setLigaFilter(e.target.value)}
              style={{ background: '#0d1219', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '10px 16px', fontSize: 14, cursor: 'pointer', minWidth: 200 }}>
              <option value="">{t.allSports}</option>
              <option value="Fussball">Fussball</option>
              <option value="Handball">Handball</option>
              <option value="Hybrid Sport">Hybrid Sport</option>
              <option value="Laufsport">Laufsport</option>
              <option value="Volleyball">Volleyball</option>
              <option value="Basketball">Basketball</option>
              <option value="Sonstige">Sonstige</option>
            </select>
          </div>
          <div>
            <div style={{ color: '#445566', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{t.date}</div>
            <input type="date" value={datumFilter} onChange={(e) => setDatumFilter(e.target.value)}
              style={{ background: '#0d1219', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '10px 16px', fontSize: 14, cursor: 'pointer' }} />
          </div>
          {(ligaFilter || datumFilter) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setLigaFilter(''); setDatumFilter('') }}
                style={{ background: 'transparent', color: '#667788', border: '1px solid #1c2a38', borderRadius: 4, padding: '10px 16px', fontSize: 13, cursor: 'pointer' }}>
                {t.resetFilter} ✕
              </button>
            </div>
          )}
        </div>

        {message && (
          <div style={{ padding: '16px', background: 'rgba(68,255,136,0.1)', border: '1px solid #44ff88', borderRadius: '8px', color: '#44ff88', fontWeight: 'bold', marginBottom: 24 }}>
            {message}
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ color: '#445566', padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 18, marginBottom: 16 }}>{t.noEvents}</div>
            <button onClick={() => router.push('/admin')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 900 }}>
              {t.createFirst}
            </button>
          </div>
        ) : (
          <div className="events-grid">
            {filtered.map((ev) => {
              const isPast = ev.date < today
              return (
                <div key={ev.id}
                  onMouseEnter={() => setHoveredCard(ev.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: '#0d1219',
                    border: hoveredCard === ev.id ? '1px solid #e8ff00' : '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    transform: hoveredCard === ev.id ? 'translateY(-4px)' : 'translateY(0)',
                    transition: 'all 0.2s ease'
                  }}>
                  <div style={{ aspectRatio: '4 / 3', background: '#131e2a', position: 'relative', overflow: 'hidden' }}>
                    {ev.bild_url ? (
                      <img src={ev.bild_url} alt={ev.home_team}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%' }}></div>
                    )}
                    {isPast && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.75)', color: '#aabbcc', fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2 }}>
                        {t.completed}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6, color: '#fff' }}>{ev.home_team}</div>
                    <div style={{ fontSize: 12, color: '#fff', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8eef4" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span>{new Date(ev.date).toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB')}</span>
                      {ev.ort && (
                        <>
                          <span style={{ color: '#334455' }}>·</span>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e8eef4" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                          <span>{ev.ort}</span>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#667788', marginBottom: 8 }}>{fotoCounts[ev.id] || 0} {t.photo}{fotoCounts[ev.id] === 1 ? '' : 's'}</div>
                    {ev.sponsor_name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, background: '#131e2a', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>
                        {ev.sponsor_logo_url && <img src={ev.sponsor_logo_url} alt={ev.sponsor_name} style={{ height: '14px', objectFit: 'contain' }} />}
                        <span style={{ fontSize: 10, color: '#e8eef4', fontWeight: 700 }}>⭐ {ev.sponsor_name}</span>
                      </div>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <button onClick={() => router.push(`/meine-events/${ev.id}`)}
                        style={{ width: '100%', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px', cursor: 'pointer', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {t.manage}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}