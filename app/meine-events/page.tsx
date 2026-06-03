'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function MeineEventsPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
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

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '60px auto 0' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Fotograf</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>Meine Events</h1>

        {message && (
          <div style={{ padding: '16px', background: message.startsWith('Fehler') ? 'rgba(255,68,68,0.1)' : 'rgba(68,255,136,0.1)', border: `1px solid ${message.startsWith('Fehler') ? '#ff4444' : '#44ff88'}`, borderRadius: '8px', color: message.startsWith('Fehler') ? '#ff4444' : '#44ff88', fontWeight: 'bold', marginBottom: 24 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map((ev) => (
              <div key={ev.id} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#e8ff00', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{ev.liga}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase' }}>{ev.home_team} vs {ev.away_team}</div>
                    <div style={{ color: '#445566', fontSize: 13, marginTop: 4 }}>
                      📅 {ev.date} {ev.time && `· 🕐 ${ev.time}`} {ev.ort && `· 📍 ${ev.ort}`}
                    </div>
                    {ev.sponsor_name && (
                      <div style={{ fontSize: 12, color: '#667788', marginTop: 4 }}>⭐ Sponsor: {ev.sponsor_name}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => router.push(`/meine-events/${ev.id}`)}
                      style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 900 }}>
                      Fotos verwalten →
                    </button>
                    <button onClick={() => router.push(`/meine-events/${ev.id}/bearbeiten`)}
                      style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
                      Bearbeiten
                    </button>
                    <button onClick={() => deleteEvent(ev.id)}
                      style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}>
                      Löschen
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