'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/supabase'
import { useRouter } from 'next/navigation'

export default function KundenDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState(0)
  const [hoveredFooter, setHoveredFooter] = useState<string | null>(null)
  const [hoveredSpiele, setHoveredSpiele] = useState(false)
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

  const footerLink = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, cursor: 'pointer',
    transition: 'color 0.15s ease'
  })

  const footerA = (key: string) => ({
    color: hoveredFooter === key ? '#e8ff00' : '#e8eef4',
    fontSize: 14, textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: 8,
    transition: 'color 0.15s ease'
  })

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
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(7,11,15,0.97)', borderBottom: '1px solid #131e2a', height: 60, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

      <div style={{ padding: '48px 32px', maxWidth: '960px', margin: '0 auto', flex: 1, width: '100%', marginTop: 60 }}>

        {/* BEGRÜSSUNG */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 42, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            Hey, {profile?.vorname}! 👋
          </h1>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
          <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #1c2a38', borderRadius: 12, padding: '28px 24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.05 }}>📸</div>
            <div style={{ color: '#445566', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Gekaufte Fotos</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#e8ff00', lineHeight: 1 }}>{purchases}</div>
            <div style={{ color: '#445566', fontSize: 12, marginTop: 8 }}>Fotos in deiner Sammlung</div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)', border: '1px solid #1c2a38', borderRadius: 12, padding: '28px 24px', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => router.push('/kunden-kaeufe')}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.05 }}>🖼️</div>
            <div style={{ color: '#445566', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Meine Käufe</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#e8eef4', lineHeight: 1 }}>Anzeigen →</div>
            <div style={{ color: '#445566', fontSize: 12, marginTop: 8 }}>Alle Fotos herunterladen</div>
          </div>
        </div>

        {/* FIND YOUR MOMENT CARD */}
        <div style={{
          background: 'linear-gradient(135deg, #0d1219 0%, #131e2a 100%)',
          border: '1px solid #1c2a38', borderRadius: 12, padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', letterSpacing: -1, marginBottom: 8 }}>
            Find your Moment
          </h2>
          <p style={{ color: '#667788', fontSize: 14, marginBottom: 28 }}>
            Durchsuche alle Spiele und finde deine Fotos mit einem Selfie.
          </p>
          <button
            onClick={() => router.push('/spiele')}
            onMouseEnter={() => setHoveredSpiele(true)}
            onMouseLeave={() => setHoveredSpiele(false)}
            style={{
              background: hoveredSpiele ? '#d4e800' : '#e8ff00',
              color: '#070b0f', border: 'none', borderRadius: 4,
              padding: '14px 36px', fontWeight: 900, fontSize: 14,
              cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase',
              transform: hoveredSpiele ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.15s ease',
              boxShadow: hoveredSpiele ? '0 0 20px rgba(232,255,0,0.3)' : 'none'
            }}>
            Zu den Spielen →
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #1c2a38", padding: "40px 48px 32px", background: "#070b0f" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, background: "#e8ff00", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#070b0f", fontWeight: 900, fontSize: 14 }}>90</span>
                </div>
                <span style={{ color: "#e8eef4", fontWeight: 900, fontSize: 20, letterSpacing: 2 }}>FOCUS</span>
              </div>
              <p style={{ color: "#e8eef4", fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
                Deine Momente für immer festgehalten.
              </p>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={footerLink('home')} onMouseEnter={() => setHoveredFooter('home')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/')}>Home</span>
                <span style={footerLink('spiele')} onMouseEnter={() => setHoveredFooter('spiele')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/spiele')}>Alle Spiele</span>
                <span style={footerLink('faq')} onMouseEnter={() => setHoveredFooter('faq')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/faq')}>FAQ</span>
                <span style={footerLink('kontakt')} onMouseEnter={() => setHoveredFooter('kontakt')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/kontakt')}>Kontakt</span>
              </div>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Rechtliches</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <span style={footerLink('impressum')} onMouseEnter={() => setHoveredFooter('impressum')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/impressum')}>Impressum</span>
                <span style={footerLink('datenschutz')} onMouseEnter={() => setHoveredFooter('datenschutz')} onMouseLeave={() => setHoveredFooter(null)} onClick={() => router.push('/datenschutz')}>Datenschutz</span>
              </div>
            </div>

            <div>
              <div style={{ color: "#e8eef4", fontWeight: 800, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Social Media</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="https://www.instagram.com/90focus" target="_blank" rel="noopener noreferrer"
                  style={footerA('instagram') as any}
                  onMouseEnter={() => setHoveredFooter('instagram')} onMouseLeave={() => setHoveredFooter(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  Instagram
                </a>
                <a href="https://www.facebook.com/90focus" target="_blank" rel="noopener noreferrer"
                  style={footerA('facebook') as any}
                  onMouseEnter={() => setHoveredFooter('facebook')} onMouseLeave={() => setHoveredFooter(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1c2a38", paddingTop: 20 }}>
            <span style={{ color: "#e8eef4", fontSize: 13 }}>© 2026 90Focus</span>
          </div>
        </div>
      </footer>
    </div>
  )
}