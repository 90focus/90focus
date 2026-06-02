'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function KundenDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
      setProfile(prof)
      const { count } = await supabase.from('purchases').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id)
      setPurchases(count || 0)
      setLoading(false)
    }
    init()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 16 }}>90</span>
        </div>
        <p style={{ color: '#445566' }}>Lade...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#070b0f', color: '#e8eef4', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* NAV */}
      <nav style={{ background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: 34, height: 34, background: '#e8ff00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#070b0f', fontWeight: 900, fontSize: 14 }}>90</span>
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/')}>Home</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/spiele')}>Alle Spiele</button>
          <button style={{ background: 'transparent', color: '#e8ff00', border: '1px solid #e8ff00', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/kunden-dashboard')}>Meine Fotos</button>
          <button style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}
            onClick={() => router.push('/kunden-profil')}>Profil</button>
          <button onClick={handleLogout}
            style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer' }}>
            Abmelden
          </button>
        </div>
      </nav>

      <div style={{ padding: '48px 32px', maxWidth: '960px', margin: '0 auto', flex: 1, width: '100%' }}>

        {/* HEADER */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Kunden Dashboard</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            Hey, {profile?.vorname}! 👋
          </h1>
          <p style={{ color: '#445566', fontSize: 15, marginTop: 8 }}>Willkommen zurück – hier findest du alles auf einen Blick.</p>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
          <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #1c2a38', borderRadius: 12, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.05 }}>📸</div>
            <div style={{ color: '#445566', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Gekaufte Fotos</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#e8ff00', lineHeight: 1 }}>{purchases}</div>
            <div style={{ color: '#445566', fontSize: 12, marginTop: 8 }}>Fotos in deiner Sammlung</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #1c2a38', borderRadius: 12, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.05 }}>⚽</div>
            <div style={{ color: '#445566', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Meine Käufe</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#e8ff00', lineHeight: 1 }}>{purchases}</div>
            <div style={{ color: '#445566', fontSize: 12, marginTop: 8 }}>Bestellungen insgesamt</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #e8ff00', borderRadius: 12, padding: '28px 24px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onClick={() => router.push('/spiele')}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.05 }}>🔍</div>
            <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Neue Fotos</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#e8eef4', lineHeight: 1 }}>Finden →</div>
            <div style={{ color: '#667788', fontSize: 12, marginTop: 8 }}>Spiele durchsuchen</div>
          </div>
        </div>

        {/* AKTIONEN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
          <div style={{ background: '#e8ff00', borderRadius: 12, padding: '24px', cursor: 'pointer', transition: 'transform 0.2s' }}
            onClick={() => router.push('/spiele')}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚽</div>
            <div style={{ color: '#070b0f', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Spiele durchsuchen</div>
            <div style={{ color: '#1a2000', fontSize: 13 }}>Finde das Spiel bei dem du dabei warst</div>
          </div>
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 12, padding: '24px', cursor: 'pointer' }}
            onClick={() => router.push('/kunden-kaeufe')}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🖼️</div>
            <div style={{ color: '#e8eef4', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Meine Käufe</div>
            <div style={{ color: '#445566', fontSize: 13 }}>Alle gekauften Fotos herunterladen</div>
          </div>
        </div>

        {/* WIE ES FUNKTIONIERT */}
        <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 12, padding: '32px' }}>
          <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24 }}>So funktioniert es</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '⚽', n: '01', t: 'Spiel auswählen', d: 'Wähle das Spiel bei dem du dabei warst aus der Liste.' },
              { icon: '🤳', n: '02', t: 'Selfie hochladen', d: 'Lade ein Selfie hoch – unsere KI findet automatisch alle Bilder von dir.' },
              { icon: '💳', n: '03', t: 'Fotos kaufen', d: 'Kaufe deine Fotos und lade sie ohne Wasserzeichen herunter.' },
            ].map(item => (
              <div key={item.n} style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ color: '#e8ff00', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{item.n}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{item.t}</div>
                <div style={{ color: '#445566', fontSize: 13, lineHeight: 1.6 }}>{item.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
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