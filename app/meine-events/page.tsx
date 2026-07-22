'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function MeineEventsPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [stats, setStats] = useState({ events: 0, fotos: 0 })
  const [ligaFilter, setLigaFilter] = useState('')
  const [datumFilter, setDatumFilter] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      await loadEvents(session.user.id)
      setLoading(false)
    }
    init()
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
    } else {
      setStats({ events: 0, fotos: 0 })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Event und alle Fotos löschen?')) return
    await supabase.from('event_fotos').delete().eq('event_id', eventId)
    await supabase.from('events').delete().eq('id', eventId)
    setMessage('✅ Event gelöscht!')
    loadEvents(user.id)
  }

  const today = new Date().toISOString().split('T')[0]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/meine-events')}>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, fontStyle: 'italic' }}>
            <span style={{ color: '#e8eef4' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/meine-events')}>Meine Events</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/admin')}>+ Event erstellen</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/profil')}>Profil</button>
          <button onClick={handleLogout}
            style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}>
            Abmelden
          </button>
        </div>
      </nav>

      <div style={{ padding: '40px 48px', maxWidth: '1200px', margin: '60px auto 0', flex: 1, width: '100%' }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>Meine Events</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#445566', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Meine Events</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#e8ff00' }}>{stats.events}</div>
          </div>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#445566', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Hochgeladene Fotos</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#e8ff00' }}>{stats.fotos}</div>
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <button onClick={() => router.push('/admin')}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>
            + Neues Event erstellen
          </button>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#445566', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Liga</div>
            <select value={ligaFilter} onChange={(e) => setLigaFilter(e.target.value)}
              style={{ background: '#0d1219', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '10px 16px', fontSize: 14, cursor: 'pointer', minWidth: 200 }}>
              <option value="">Alle Ligen</option>
              <option value="Super League">Super League</option>
              <option value="Challenge League">Challenge League</option>
              <option value="Promotion League">Promotion League</option>
              <option value="1. Liga">1. Liga</option>
              <option value="2. Liga interregional">2. Liga interregional</option>
              <option value="2. Liga regional">2. Liga regional</option>
              <option value="3. Liga">3. Liga</option>
              <option value="4. Liga">4. Liga</option>
              <option value="5. Liga">5. Liga</option>
              <option value="6. Liga">6. Liga</option>
            </select>
          </div>
          <div>
            <div style={{ color: '#445566', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Datum</div>
            <input type="date" value={datumFilter} onChange={(e) => setDatumFilter(e.target.value)}
              style={{ background: '#0d1219', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '10px 16px', fontSize: 14, cursor: 'pointer' }} />
          </div>
          {(ligaFilter || datumFilter) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button onClick={() => { setLigaFilter(''); setDatumFilter('') }}
                style={{ background: 'transparent', color: '#667788', border: '1px solid #1c2a38', borderRadius: 4, padding: '10px 16px', fontSize: 13, cursor: 'pointer' }}>
                Filter zurücksetzen ✕
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
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
            <div style={{ fontSize: 18, marginBottom: 16 }}>Noch keine Events vorhanden.</div>
            <button onClick={() => router.push('/admin')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 900 }}>
              Erstes Event erstellen
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filtered.map((ev) => {
              const isPast = ev.date < today
              return (
                <div key={ev.id}
                  onMouseEnter={() => setHoveredCard(ev.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: '#0d1219',
                    border: hoveredCard === ev.id ? '1px solid #e8ff00' : '1px solid #1c2a38',
                    borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                    transform: hoveredCard === ev.id ? 'translateY(-4px)' : 'translateY(0)',
                    transition: 'all 0.2s ease'
                  }}>
                  <div style={{ height: 180, background: '#131e2a', position: 'relative', overflow: 'hidden' }}>
                    {ev.bild_url ? (
                      <img src={ev.bild_url} alt={`${ev.home_team} vs ${ev.away_team}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 48 }}>⚽</span>
                      </div>
                    )}
                    <div style={{ position: 'absolute', top: 10, left: 10, background: '#e8ff00', color: '#070b0f', fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 8px', borderRadius: 2 }}>
                      {ev.liga}
                    </div>
                    {isPast && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.75)', color: '#aabbcc', fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2 }}>
                        Abgeschlossen
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>{ev.home_team} vs {ev.away_team}</div>
                    <div style={{ fontSize: 12, color: '#8899aa', marginBottom: 6 }}>📅 {ev.date} {ev.ort && `· 📍 ${ev.ort}`}</div>
                    {ev.sponsor_name && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, background: '#131e2a', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>
                        {ev.sponsor_logo_url && <img src={ev.sponsor_logo_url} alt={ev.sponsor_name} style={{ height: '14px', objectFit: 'contain' }} />}
                        <span style={{ fontSize: 10, color: '#e8eef4', fontWeight: 700 }}>⭐ {ev.sponsor_name}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => router.push(`/meine-events/${ev.id}`)}
                        style={{ flex: 1, background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Verwalten
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/meine-events/${ev.id}/bearbeiten`) }}
                        style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 12px', cursor: 'pointer', fontSize: 12 }}>
                        ✏️
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id) }}
                        style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 4, padding: '8px 12px', cursor: 'pointer', fontSize: 12 }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #131e2a', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: 1, fontStyle: 'italic' }}>
            <span style={{ color: '#e8eef4' }}>SPORT</span><span style={{ color: '#e8ff00' }}>SHOT</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#445566' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/impressum')}>Impressum</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/kontakt')}>Kontakt</span>
        </div>
        <div style={{ color: '#1c2a38', fontSize: 12 }}>© 2026 SportShot</div>
      </footer>
    </div>
  )
}