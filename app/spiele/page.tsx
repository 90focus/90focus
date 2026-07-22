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
      const { data } = await supabase.from('events').select('*').order('date', { ascending: false })
      if (data) { setEvents(data); setFiltered(data) }
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
      <section style={{ padding: '60px 32px', marginTop: 60 }}>
        <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Alle Events</div>
        <h1 style={{ fontSize: 48, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -2, marginBottom: 40 }}>Events</h1>

        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Liga</div>
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
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Datum</div>
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

        {filtered.length === 0 ? (
          <div style={{ color: '#445566', fontSize: 16, padding: '40px 0' }}>Keine Events gefunden. 🎯</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {filtered.map((ev) => (
              <div key={ev.id} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => router.push(`/suche?eventId=${ev.id}`)}>
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
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>{ev.home_team} vs {ev.away_team}</div>
                  <div style={{ fontSize: 12, color: '#8899aa', marginBottom: 12 }}>📅 {ev.date} {ev.ort && `· 📍 ${ev.ort}`}</div>
                  {ev.sponsor_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, background: '#131e2a', padding: '4px 8px', borderRadius: 4, width: 'fit-content' }}>
                      {ev.sponsor_logo_url && <img src={ev.sponsor_logo_url} alt={ev.sponsor_name} style={{ height: '16px', objectFit: 'contain' }} />}
                      <span style={{ fontSize: 11, color: '#e8eef4', fontWeight: 700 }}>⭐ {ev.sponsor_name}</span>
                    </div>
                  )}
                  <button style={{ width: '100%', background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 2, padding: '10px', fontWeight: 900, fontSize: 12, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Zu den Fotos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}