import { NextResponse } from 'next/server'

// Social media and search crawlers that must be allowed through
const ALLOWED_BOTS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'telegrambot',
  'whatsapp',
  'googlebot',
  'bingbot',
  'applebot',
  'discordbot',
]

export function middleware(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase()
  const isCrawler = ALLOWED_BOTS.some(bot => ua.includes(bot))

  const response = NextResponse.next()

  if (isCrawler) {
    // Ensure crawlers get proper caching headers and are not challenged
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    response.headers.set('X-Robots-Tag', 'index, follow')
    response.headers.set('Vary', 'User-Agent')
  }

  return response
}

export const config = {
  // Run on all routes except static assets and API
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|og-image.png|robots.txt).*)',
  ],
}
