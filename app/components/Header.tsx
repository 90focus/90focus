'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    setMenuOpen(false)
  }

  const navBtn = (path: string) => ({
    background: 'transparent',
    color: pathname === path ? '#e8ff00' : '#e8eef4',
    border: pathname === path ? '1px solid #e8ff00' : '1px solid #1c2a38',
    borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13,
    letterSpacing: 1.5, textTransform: 'uppercase' as any, cursor: 'pointer'
  })

  const mobileNavBtn = (path: string) => ({
    background: 'transparent',
    color: pathname === path ? '#e8ff00' : '#e8eef4',
    border: 'none', borderBottom: '1px solid #1c2a38',
    padding: '18px 24px', fontWeight: 700, fontSize: 15,
    letterSpacing: 1, textTransform: 'uppercase' as any, cursor: 'pointer',
    textAlign: 'left' as any, width: '100%'
  })

  const go = (path: string) => {
    router.push(path)
    setMenuOpen(false)
  }

  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(7,11,15,0.97)", borderBottom: "1px solid #131e2a", height: 60, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go('/')}>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, fontStyle: "italic" }}>
            <span style={{ color: "#e8eef4" }}>SPORT</span><span style={{ color: "#e8ff00" }}>SHOT</span>
          </span>
        </div>

        <div className="desktop-nav" style={{ display: "flex", gap: 12 }}>
          <button style={navBtn('/')} onClick={() => go('/')}>Home</button>
          <button style={navBtn('/spiele')} onClick={() => go('/spiele')}>Alle Events</button>
          <button style={navBtn('/kontakt')} onClick={() => go('/kontakt')}>Kontakt</button>
          {user ? (
            <>
              <button style={navBtn('/kunden-dashboard')} onClick={() => go('/kunden-dashboard')}>Meine Fotos</button>
              <button style={navBtn('/kunden-profil')} onClick={() => go('/kunden-profil')}>Profil</button>
              <button style={{ background: "transparent", color: "#ff4444", border: "1px solid #ff4444", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={handleLogout}>Abmelden</button>
            </>
          ) : (
            <>
              <button style={navBtn('/login')} onClick={() => go('/login')}>Login</button>
              <button style={navBtn('/register')} onClick={() => go('/register')}>Sign Up</button>
            </>
          )}
        </div>

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8, flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 22, height: 2, background: '#e8eef4', display: 'block' }} />
          <span style={{ width: 22, height: 2, background: '#e8eef4', display: 'block' }} />
          <span style={{ width: 22, height: 2, background: '#e8eef4', display: 'block' }} />
        </button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, bottom: 0, background: '#070b0f', zIndex: 99, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <button style={mobileNavBtn('/')} onClick={() => go('/')}>Home</button>
          <button style={mobileNavBtn('/spiele')} onClick={() => go('/spiele')}>Alle Events</button>
          <button style={mobileNavBtn('/kontakt')} onClick={() => go('/kontakt')}>Kontakt</button>
          {user ? (
            <>
              <button style={mobileNavBtn('/kunden-dashboard')} onClick={() => go('/kunden-dashboard')}>Meine Fotos</button>
              <button style={mobileNavBtn('/kunden-profil')} onClick={() => go('/kunden-profil')}>Profil</button>
              <button style={{ ...mobileNavBtn(''), color: '#ff4444' }} onClick={handleLogout}>Abmelden</button>
            </>
          ) : (
            <>
              <button style={mobileNavBtn('/login')} onClick={() => go('/login')}>Login</button>
              <button style={mobileNavBtn('/register')} onClick={() => go('/register')}>Sign Up</button>
            </>
          )}
        </div>
      )}
    </>
  )
}