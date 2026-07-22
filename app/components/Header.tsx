'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const navBtn = (path: string) => ({
    background: 'transparent',
    color: pathname === path ? '#e8ff00' : '#e8eef4',
    border: pathname === path ? '1px solid #e8ff00' : '1px solid #1c2a38',
    borderRadius: 2, padding: '8px 18px', fontWeight: 700, fontSize: 13,
    letterSpacing: 1.5, textTransform: 'uppercase' as any, cursor: 'pointer'
  })

  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(7,11,15,0.97)", borderBottom: "1px solid #131e2a", height: 60, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => router.push('/')}>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, fontStyle: "italic" }}>
          <span style={{ color: "#e8eef4" }}>SPORT</span><span style={{ color: "#e8ff00" }}>SHOT</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button style={navBtn('/')} onClick={() => router.push('/')}>Home</button>
        <button style={navBtn('/spiele')} onClick={() => router.push('/spiele')}>Alle Events</button>
        {user ? (
          <>
            <button style={navBtn('/kunden-dashboard')} onClick={() => router.push('/kunden-dashboard')}>Meine Fotos</button>
            <button style={navBtn('/kunden-profil')} onClick={() => router.push('/kunden-profil')}>Profil</button>
            <button style={{ background: "transparent", color: "#ff4444", border: "1px solid #ff4444", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
              onClick={handleLogout}>Abmelden</button>
          </>
        ) : (
          <>
            <button style={navBtn('/login')} onClick={() => router.push('/login')}>Login</button>
            <button style={navBtn('/register')} onClick={() => router.push('/register')}>Sign Up</button>
          </>
        )}
      </div>
    </nav>
  )
}