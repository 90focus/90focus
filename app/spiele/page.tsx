'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function SpielePage() {
  const [events, setEvents] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [ligaFilter, setLigaFilter] = useState('')
  const [datumFilter, setDatumFilter] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('date', { ascending: true })
      if (data) {
        setEvents(data)
        setFiltered(data)
      }
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    let result = events
    if (ligaFilter) result = result.filter((ev) => ev.liga === ligaFilter)
    if (datumFilter) result = result.filter((ev) => ev.date === datumFilter)
    setFiltered(result)
  }, [ligaFilter, datumFilter, events])

  return (
    <main style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif' }}>
      {/* NAV */}
      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <button style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 2, padding: '8px 18px', fontWeight: 900, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
          onClick={() => router.push('/suche')}>Meine Fotos →</button>
      </nav>

      <section style={{ padding: '60px 32px' }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Alle Events</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -2, marginBottom: 40 }}>Spiele</h1>

        {/* FILTER */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
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

        {/* SPIELE LISTE */}
        {filtered.length === 0 ? (
          <div style={{ color: '#445566', fontSize: 16, padding: '40px 0' }}>Keine Spiele gefunden. 🎯</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((ev) => (
              <div key={ev.id} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 4, padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#e8ff00', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{ev.liga}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, textTransform: 'uppercase' }}>{ev.home_team} vs {ev.away_team}</div>
                    <div style={{ color: '#445566', fontSize: 13, marginTop: 4 }}>📍 {ev.ort} · 📅 {ev.date} {ev.time && `· 🕐 ${ev.time}`}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    {ev.sponsor_logo_url && (
                      <img src={ev.sponsor_logo_url} alt={ev.sponsor_name || 'Sponsor'}
                        style={{ height: '32px', objectFit: 'contain', opacity: 0.8 }} />
                    )}
                    {ev.sponsor_name && (
                      <div style={{ fontSize: 10, color: '#445566', letterSpacing: 1 }}>powered by {ev.sponsor_name}</div>
                    )}
                    <button style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 2, padding: '10px 20px', fontWeight: 900, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      onClick={() => router.push(`/suche?eventId=${ev.id}`)}>Fotos finden →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #131e2a', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, background: '#e8ff00', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 11 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ color: '#1c2a38', fontSize: 12 }}>© 2026 90Focus - Luzern</div>
      </footer>
    </main>
  )
}