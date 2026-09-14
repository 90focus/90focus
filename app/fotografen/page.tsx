'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/supabase'
import { useLanguage } from '@/app/context/LanguageContext'

export default function FotografenPage() {
  const { lang } = useLanguage()
  const [photographers, setPhotographers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [equipment, setEquipment] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [workAreas, setWorkAreas] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('photographers').select('*').order('created_at', { ascending: false })
    setPhotographers(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setLocation('')
    setEquipment(''); setSpecialization(''); setWorkAreas('')
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!firstName || !lastName) {
      alert(lang === 'de' ? 'Vor- und Nachname erforderlich' : 'First and last name required')
      return
    }
    setSaving(true)
    const { error } = await supabase.from('photographers').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      location,
      equipment,
      specialization,
      work_areas: workAreas,
    })
    setSaving(false)
    if (!error) {
      resetForm()
      load()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'de' ? 'Fotograf wirklich löschen?' : 'Really delete photographer?')) return
    await supabase.from('photographers').delete().eq('id', id)
    load()
  }

  const inputStyle = { width: '100%', padding: '10px', background: '#131e2a', border: '1px solid #1c2a38', borderRadius: 6, color: '#e8eef4', fontSize: 14, boxSizing: 'border-box' as any }
  const labelStyle = { display: 'block', marginBottom: 6, fontSize: 12, color: '#8899aa' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#070b0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e8eef4' }}>{lang === 'de' ? 'Lade...' : 'Loading...'}</p>
    </div>
  )

  return (
    <div style={{ background: '#070b0f', color: '#e8eef4', minHeight: '100vh', padding: '60px 24px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: 'uppercase', margin: 0 }}>
            {lang === 'de' ? 'Fotografen' : 'Photographers'}
          </h1>
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 4, padding: '10px 20px', fontWeight: 900, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase' }}>
            {showForm ? (lang === 'de' ? 'Abbrechen' : 'Cancel') : (lang === 'de' ? '+ Fotograf hinzufügen' : '+ Add Photographer')}
          </button>
        </div>

        {showForm && (
          <div style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>{lang === 'de' ? 'Vorname *' : 'First name *'}</label>
                <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'de' ? 'Nachname *' : 'Last name *'}</label>
                <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>{lang === 'de' ? 'Email' : 'Email'}</label>
                <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>{lang === 'de' ? 'Telefonnummer' : 'Phone number'}</label>
                <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{lang === 'de' ? 'Wohnort' : 'Home location'}</label>
              <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{lang === 'de' ? 'Equipment' : 'Equipment'}</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as any }} value={equipment} onChange={e => setEquipment(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{lang === 'de' ? 'Spezialisiert auf' : 'Specialized in'}</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as any }} value={specialization} onChange={e => setSpecialization(e.target.value)} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{lang === 'de' ? 'Orte für Arbeit' : 'Work areas'}</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' as any }} value={workAreas} onChange={e => setWorkAreas(e.target.value)} />
            </div>
            <button onClick={handleSave} disabled={saving}
              style={{ background: '#e8ff00', color: '#070b0f', border: 'none', borderRadius: 6, padding: '12px 24px', fontWeight: 900, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase' }}>
              {saving ? (lang === 'de' ? 'Speichern...' : 'Saving...') : (lang === 'de' ? 'Speichern' : 'Save')}
            </button>
          </div>
        )}

        {photographers.length === 0 ? (
          <div style={{ color: '#445566', padding: '40px 0', textAlign: 'center' }}>
            {lang === 'de' ? 'Noch keine Fotografen erfasst.' : 'No photographers yet.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {photographers.map((p) => (
              <div key={p.id} style={{ background: '#0d1219', border: '1px solid #1c2a38', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#e8ff00', margin: 0 }}>
                    {p.first_name} {p.last_name}
                  </h3>
                  <button onClick={() => handleDelete(p.id)}
                    style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                    {lang === 'de' ? 'Löschen' : 'Delete'}
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 12, fontSize: 13 }}>
                  {p.email && <div><span style={{ color: '#8899aa' }}>Email: </span>{p.email}</div>}
                  {p.phone && <div><span style={{ color: '#8899aa' }}>{lang === 'de' ? 'Tel: ' : 'Phone: '}</span>{p.phone}</div>}
                  {p.location && <div><span style={{ color: '#8899aa' }}>{lang === 'de' ? 'Ort: ' : 'Location: '}</span>{p.location}</div>}
                </div>
                {p.equipment && <div style={{ marginTop: 10, fontSize: 13 }}><span style={{ color: '#8899aa' }}>Equipment: </span>{p.equipment}</div>}
                {p.specialization && <div style={{ marginTop: 6, fontSize: 13 }}><span style={{ color: '#8899aa' }}>{lang === 'de' ? 'Spezialisiert: ' : 'Specialized: '}</span>{p.specialization}</div>}
                {p.work_areas && <div style={{ marginTop: 6, fontSize: 13 }}><span style={{ color: '#8899aa' }}>{lang === 'de' ? 'Arbeitsorte: ' : 'Work areas: '}</span>{p.work_areas}</div>}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}