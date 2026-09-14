'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/supabase'
import { useLanguage } from '@/app/context/LanguageContext'

export default function OrganisatorAnfragenPage() {
  const { lang } = useLanguage()
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('organizer_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
      setInquiries(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{lang === 'de' ? 'Lade...' : 'Loading...'}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', minHeight: '100vh', padding: '60px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', marginBottom: 8 }}>
          {lang === 'de' ? 'Organisator-Anfragen' : 'Organizer Inquiries'}
        </h1>
        <p style={{ color: '#8899aa', marginBottom: 32, fontSize: 14 }}>
          {inquiries.length} {lang === 'de' ? 'Anfrage(n) insgesamt' : 'inquiries total'}
        </p>

        {inquiries.length === 0 ? (
          <div style={{ color: '#445566', padding: '40px 0', textAlign: 'center' }}>
            {lang === 'de' ? 'Noch keine Anfragen.' : 'No inquiries yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {inquiries.map((inq) => (
              <div key={inq.id} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: 24 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#e8ff00', margin: 0 }}>
                    {inq.event_name}
                  </h2>
                  <span style={{ color: '#667788', fontSize: 12 }}>
                    {new Date(inq.created_at).toLocaleDateString(lang === 'de' ? 'de-CH' : 'en-GB')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
                  <div>
                    <div style={{ color: '#8899aa', marginBottom: 4 }}>{lang === 'de' ? 'Datum' : 'Date'}</div>
                    <div>{inq.date_from} — {inq.date_to}</div>
                  </div>
                  <div>
                    <div style={{ color: '#8899aa', marginBottom: 4 }}>{lang === 'de' ? 'Ort' : 'Location'}</div>
                    <div>{inq.location}</div>
                  </div>
                  <div>
                    <div style={{ color: '#8899aa', marginBottom: 4 }}>{lang === 'de' ? 'Teilnehmer' : 'Participants'}</div>
                    <div>{inq.participant_count}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12, fontSize: 13 }}>
                  <div style={{ color: '#8899aa', marginBottom: 4 }}>{lang === 'de' ? 'Leistungen' : 'Services'}</div>
                  <div>{inq.services}</div>
                </div>

                {inq.remarks && (
                  <div style={{ marginTop: 12, fontSize: 13 }}>
                    <div style={{ color: '#8899aa', marginBottom: 4 }}>{lang === 'de' ? 'Details / Kontakt' : 'Details / Contact'}</div>
                    <div style={{ color: '#c5d0da', lineHeight: 1.5 }}>{inq.remarks}</div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}