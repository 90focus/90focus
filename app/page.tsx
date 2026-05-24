'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase.from('events').select('*').order('datum', { ascending: false })
      setEvents(data || [])
      setLoading(false)
    }
    loadEvents()
  }, [])

  if (loading) return <p style={{ padding: '40px' }}>Lade...</p>

  return (
    <div style={{ padding: '40px', maxWidth: '700px', margin: '0 auto' }}>
      <h1>📸 90focus</h1>
      <p>Wähle dein Event und finde deine Fotos!</p>

      {events.length === 0 && (
        <p style={{ color: '#888' }}>Noch keine Events vorhanden.</p>
      )}

      <div style={{ marginTop: '20px' }}>
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => router.push(`/suche?eventId=${event.id}`)}
            style={{
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '15px',
              cursor: 'pointer',
              background: '#fff',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
          >
            <strong style={{ fontSize: '18px' }}>{event.name}</strong><br />
            📅 {event.datum} {event.ort && `— 📍 ${event.ort}`}
          </div>
        ))}
      </div>
    </div>
  )
}