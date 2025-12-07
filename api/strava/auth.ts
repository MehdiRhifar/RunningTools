import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = process.env.STRAVA_CLIENT_ID

  // Détection automatique dev vs prod
  const isDev = process.env.NODE_ENV === 'development' || req.headers.host?.includes('localhost')
  const redirectUri = isDev
    ? 'http://localhost:3000/api/strava/callback'
    : (process.env.STRAVA_REDIRECT_URI || 'https://runningtools.fr/api/strava/callback')

  // Générer state pour CSRF protection
  const state = Math.random().toString(36).substring(7)

  const authUrl = `https://www.strava.com/oauth/authorize?` +
    `client_id=${clientId}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `approval_prompt=auto&` +
    `scope=activity:read_all,activity:write&` +
    `state=${state}`

  res.redirect(authUrl)
}
