'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '../context/LanguageContext'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { lang, setLang } = useLanguage()

useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
          setRole(profile?.role || null)
        } else {
          setRole(null)
        }
      } catch (e) {
        console.error('checkUser error:', e)
      }
    }
    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
        setRole(profile?.role || null)
      } else {
        setRole(null)
      }
    })

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

const handleLogout = async () => {
    setUser(null)
    setRole(null)
    setMenuOpen(false)
    router.push('/')
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Logout error:', e)
    }
  }

  const isPhotographer = role === 'photographer'
  const logoTarget = isPhotographer ? '/meine-events' : '/'

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
<nav className={isHome ? 'hero-nav' : ''} style={{
        position: isHome ? 'absolute' : 'fixed',
        top: 0, left: 0, right: 0, zIndex: 100,
        background: isHome ? 'transparent' : 'rgba(7,11,15,0.97)',
        borderBottom: isHome ? 'none' : '1px solid #131e2a',
        height: 60, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => go(logoTarget)}>
          <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: 1, fontStyle: "italic" }}>
            <span style={{ color: "#e8eef4" }}>SPORT</span><span style={{ color: "#e8ff00" }}>SHOT</span>
          </span>
        </div>

<div className="desktop-nav" style={{ display: "flex", gap: 12 }}>
          {isPhotographer ? (
            <>
              <button style={navBtn('/meine-events')} onClick={() => go('/meine-events')}>{lang === 'de' ? 'Meine Events' : 'My Events'}</button>
              <button style={navBtn('/admin')} onClick={() => go('/admin')}>{lang === 'de' ? '+ Event erstellen' : '+ Create Event'}</button>
              <button style={navBtn('/profil')} onClick={() => go('/profil')}>{lang === 'de' ? 'Profil' : 'Profile'}</button>
              <button style={navBtn('/kontakt')} onClick={() => go('/kontakt')}>{lang === 'de' ? 'Kontakt' : 'Contact'}</button>
              <button style={{ background: "transparent", color: "#ff4444", border: "1px solid #ff4444", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                onClick={handleLogout}>{lang === 'de' ? 'Abmelden' : 'Log Out'}</button>
            </>
          ) : (
            <>
              <button style={navBtn('/')} onClick={() => go('/')}>{lang === 'de' ? 'Home' : 'Home'}</button>
              <button style={navBtn('/spiele')} onClick={() => go('/spiele')}>{lang === 'de' ? 'Alle Events' : 'All Events'}</button>
              <button style={navBtn('/kontakt')} onClick={() => go('/kontakt')}>{lang === 'de' ? 'Kontakt' : 'Contact'}</button>
              {user ? (
                <>
                  <button style={navBtn('/kunden-dashboard')} onClick={() => go('/kunden-dashboard')}>{lang === 'de' ? 'Meine Fotos' : 'My Photos'}</button>
                  <button style={navBtn('/kunden-profil')} onClick={() => go('/kunden-profil')}>{lang === 'de' ? 'Profil' : 'Profile'}</button>
                  <button style={{ background: "transparent", color: "#ff4444", border: "1px solid #ff4444", borderRadius: 2, padding: "8px 18px", fontWeight: 700, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", cursor: "pointer" }}
                    onClick={handleLogout}>{lang === 'de' ? 'Abmelden' : 'Log Out'}</button>
                </>
              ) : (
                <>
                  <button style={navBtn('/login')} onClick={() => go('/login')}>Login</button>
                  <button style={navBtn('/register')} onClick={() => go('/register')}>Sign Up</button>
                </>
              )}
            </>
          )}

          <div style={{ position: 'relative' }}>
<button onClick={() => setLangOpen(!langOpen)}
              style={{ background: 'transparent', color: '#e8eef4', border: '1px solid #1c2a38', borderRadius: 2, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {lang === 'de' ? (
                <svg width="18" height="12" viewBox="0 0 18 12"><rect width="18" height="4" y="0" fill="#000"/><rect width="18" height="4" y="4" fill="#DD0000"/><rect width="18" height="4" y="8" fill="#FFCE00"/></svg>
              ) : (
                <svg width="18" height="12" viewBox="0 0 18 12"><rect width="18" height="12" fill="#00247d"/><path d="M0 0L18 12M18 0L0 12" stroke="#fff" strokeWidth="2"/><path d="M9 0V12M0 6H18" stroke="#fff" strokeWidth="3"/><path d="M9 0V12M0 6H18" stroke="#cf142b" strokeWidth="1.5"/></svg>
              )}
              {lang.toUpperCase()} ▾
            </button>
{langOpen && (
              <div style={{ position: 'absolute', top: 44, right: 0, background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 4, overflow: 'hidden', zIndex: 200, minWidth: 110 }}>
                <div onClick={() => { setLang('de'); setLangOpen(false) }} style={{ padding: '10px 14px', color: lang === 'de' ? '#e8ff00' : '#e8eef4', fontSize: 13, fontWeight: lang === 'de' ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="12" viewBox="0 0 18 12"><rect width="18" height="4" y="0" fill="#000"/><rect width="18" height="4" y="4" fill="#DD0000"/><rect width="18" height="4" y="8" fill="#FFCE00"/></svg>
                  DE
                </div>
                <div onClick={() => { setLang('en'); setLangOpen(false) }} style={{ padding: '10px 14px', color: lang === 'en' ? '#e8ff00' : '#e8eef4', fontSize: 13, fontWeight: lang === 'en' ? 700 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="12" viewBox="0 0 18 12"><rect width="18" height="12" fill="#00247d"/><path d="M0 0L18 12M18 0L0 12" stroke="#fff" strokeWidth="2"/><path d="M9 0V12M0 6H18" stroke="#fff" strokeWidth="3"/><path d="M9 0V12M0 6H18" stroke="#cf142b" strokeWidth="1.5"/></svg>
                  EN
                </div>

              </div>
            )}
          </div>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#070b0f', zIndex: 99, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: 60 }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #1c2a38', display: 'flex', gap: 16 }}>
            <div onClick={() => { setLang('de'); setMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: lang === 'de' ? '#e8ff00' : '#e8eef4', fontWeight: 700, fontSize: 14 }}>
              <svg width="20" height="14" viewBox="0 0 18 12"><rect width="18" height="4" y="0" fill="#000"/><rect width="18" height="4" y="4" fill="#DD0000"/><rect width="18" height="4" y="8" fill="#FFCE00"/></svg>
              DE
            </div>
            <div onClick={() => { setLang('en'); setMenuOpen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: lang === 'en' ? '#e8ff00' : '#e8eef4', fontWeight: 700, fontSize: 14 }}>
              <svg width="20" height="14" viewBox="0 0 18 12"><rect width="18" height="12" fill="#00247d"/><path d="M0 0L18 12M18 0L0 12" stroke="#fff" strokeWidth="2"/><path d="M9 0V12M0 6H18" stroke="#fff" strokeWidth="3"/><path d="M9 0V12M0 6H18" stroke="#cf142b" strokeWidth="1.5"/></svg>
              EN
            </div>
          </div>
{isPhotographer ? (
            <>
              <button style={mobileNavBtn('/meine-events')} onClick={() => go('/meine-events')}>{lang === 'de' ? 'Meine Events' : 'My Events'}</button>
              <button style={mobileNavBtn('/admin')} onClick={() => go('/admin')}>{lang === 'de' ? '+ Event erstellen' : '+ Create Event'}</button>
              <button style={mobileNavBtn('/profil')} onClick={() => go('/profil')}>{lang === 'de' ? 'Profil' : 'Profile'}</button>
              <button style={mobileNavBtn('/kontakt')} onClick={() => go('/kontakt')}>{lang === 'de' ? 'Kontakt' : 'Contact'}</button>
              <button style={{ ...mobileNavBtn(''), color: '#ff4444' }} onClick={handleLogout}>{lang === 'de' ? 'Abmelden' : 'Log Out'}</button>
            </>
          ) : (
            <>
              <button style={mobileNavBtn('/')} onClick={() => go('/')}>Home</button>
              <button style={mobileNavBtn('/spiele')} onClick={() => go('/spiele')}>{lang === 'de' ? 'Alle Events' : 'All Events'}</button>
              <button style={mobileNavBtn('/kontakt')} onClick={() => go('/kontakt')}>{lang === 'de' ? 'Kontakt' : 'Contact'}</button>
              {user ? (
                <>
                  <button style={mobileNavBtn('/kunden-dashboard')} onClick={() => go('/kunden-dashboard')}>{lang === 'de' ? 'Meine Fotos' : 'My Photos'}</button>
                  <button style={mobileNavBtn('/kunden-profil')} onClick={() => go('/kunden-profil')}>{lang === 'de' ? 'Profil' : 'Profile'}</button>
                  <button style={{ ...mobileNavBtn(''), color: '#ff4444' }} onClick={handleLogout}>{lang === 'de' ? 'Abmelden' : 'Log Out'}</button>
                </>
              ) : (
                <>
                  <button style={mobileNavBtn('/login')} onClick={() => go('/login')}>Login</button>
                  <button style={mobileNavBtn('/register')} onClick={() => go('/register')}>Sign Up</button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}