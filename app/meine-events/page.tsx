'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function MeineEventsPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
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

  const loadEvents = async (userId: string) => {
    const { data } = await supabase.from('events').select('*').eq('user_id', userId).order('date', { ascending: false })
    setEvents(data || [])
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Event und alle Fotos löschen?')) return
    await supabase.from('event_fotos').delete().eq('event_id', eventId)
    await supabase.from('events').delete().eq('id', eventId)
    setMessage('✅ Event gelöscht!')
    loadEvents(user.id)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      {/* NAV FIXED */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
            ← Dashboard
          </button>
          <button onClick={() => router.push('/admin')}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 900 }}>
            + Neues Spiel
          </button>
        </div>
      </nav>

      <div style={{ padding: '40px 48px', maxWidth: '1200px', margin: '60px auto 0' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Fotograf</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>Meine Events</h1>

        {message && (
          <div style={{ padding: '16px', background: 'rgba(68,255,136,0.1)', border: '1px solid #44ff88', borderRadius: '8px', color: '#44ff88', fontWeight: 'bold', marginBottom: 24 }}>
            {message}
          </div>
        )}

        {events.length === 0 ? (
          <div style={{ color: '#445566', padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
            <div style={{ fontSize: 18, marginBottom: 16 }}>Noch keine Events vorhanden.</div>
            <button onClick={() => router.push('/admin')}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 900 }}>
              Erstes Spiel erstellen →
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {events.map((ev) => (
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
                {/* BILD */}
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
                </div>
                {/* INFO */}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>{ev.home_team} vs {ev.away_team}</div>
                  <div style={{ fontSize: 12, color: '#8899aa', marginBottom: 6 }}>📅 {ev.date} {ev.ort && `· 📍 ${ev.ort}`}</div>
                  {ev.sponsor_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, background: '#131e2a', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>
                      {ev.sponsor_logo_url && <img src={ev.sponsor_logo_url} alt={ev.sponsor_name} style={{ height: '14px', objectFit: 'contain' }} />}
                      <span style={{ fontSize: 10, color: '#e8eef4', fontWeight: 700 }}>⭐ {ev.sponsor_name}</span>
                    </div>
                  )}
                  {/* BUTTONS */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => router.push(`/meine-events/${ev.id}`)}
                      style={{ flex: 1, background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '8px', cursor: 'pointer', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Verwalten →
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}