'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ events: 0, fotos: 0 })
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
    if (data && data.length > 0) {
      const { count } = await supabase.from('event_fotos').select('*', { count: 'exact', head: true }).in('event_id', data.map((e: any) => e.id))
      setStats({ events: data.length, fotos: count || 0 })
    } else {
      setStats({ events: 0, fotos: 0 })
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>Lade...</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/meine-events')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/meine-events')}>Meine Events</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/admin')}>+ Spiel erstellen</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/profil')}>Profil</button>
          <button onClick={handleLogout}
            style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}>
            Abmelden
          </button>
        </div>
      </nav>

      <div style={{ padding: '40px 32px', maxWidth: '900px', margin: '60px auto 0', flex: 1, width: '100%' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Fotograf Dashboard</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'uppercase', marginBottom: 32 }}>Willkommen! 👋</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#445566', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Meine Events</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#e8ff00' }}>{stats.events}</div>
          </div>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: '24px' }}>
            <div style={{ color: '#445566', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Hochgeladene Fotos</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#e8ff00' }}>{stats.fotos}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <button onClick={() => router.push('/admin')}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '12px 24px', fontWeight: 900, fontSize: 14, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>
            + Neues Spiel erstellen
          </button>
          <button onClick={() => router.push('/meine-events')}
            style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 4, padding: '12px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Meine Events verwalten →
          </button>
        </div>

        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>Letzte Events</div>
        {events.length === 0 ? (
          <div style={{ color: '#445566', padding: '40px 0', textAlign: 'center' }}>Noch keine Events. Erstelle dein erstes Spiel!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.slice(0, 5).map((ev) => (
              <div key={ev.id} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 6, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 10, color: '#e8ff00', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{ev.liga}</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{ev.home_team} vs {ev.away_team}</div>
                  <div style={{ color: '#445566', fontSize: 12, marginTop: 2 }}>📅 {ev.date} {ev.ort && `· 📍 ${ev.ort}`}</div>
                </div>
                <button onClick={() => router.push(`/meine-events/${ev.id}`)}
                  style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
                  Verwalten →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #131e2a', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, background: '#e8ff00', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 11 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, color: '#445566' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/impressum')}>Impressum</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
          <span style={{ cursor: 'pointer' }} onClick={() => router.push('/kontakt')}>Kontakt</span>
        </div>
        <div style={{ color: '#1c2a38', fontSize: 12 }}>© 2026 90Focus - Luzern</div>
      </footer>
    </div>
  )
}