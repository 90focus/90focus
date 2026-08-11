import { NextRequest, NextResponse } from 'next/server'

const GERMAN_COUNTRIES = ['CH', 'DE', 'AT']

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const existingLang = request.cookies.get('lang')
  if (existingLang) return response

  const country = request.headers.get('x-vercel-ip-country') || ''
  const lang = GERMAN_COUNTRIES.includes(country) ? 'de' : 'en'
  response.cookies.set('lang', lang, { maxAge: 60 * 60 * 24 * 365 })
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|hero).*)'],
}