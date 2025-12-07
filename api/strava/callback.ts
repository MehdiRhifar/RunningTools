import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error } = req.query

  // Détection automatique dev vs prod
  const isDev = process.env.NODE_ENV === 'development' || req.headers.host?.includes('localhost')
  const frontendUrl = isDev
    ? 'http://localhost:3000'
    : (process.env.FRONTEND_URL || 'https://runningtools.fr')

  // Gérer l'annulation par l'utilisateur
  if (error === 'access_denied') {
    return res.redirect(`${frontendUrl}/strava-analysis?auth_cancelled=true`)
  }

  if (!code) {
    return res.redirect(`${frontendUrl}/strava-analysis?auth_error=true`)
  }

  try {
    // Échanger code contre tokens
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    })

    if (!response.ok) {
      throw new Error(`OAuth token exchange failed: ${response.status}`)
    }

    const data = await response.json()

    // Rediriger vers frontend avec tokens
    res.redirect(
      `${frontendUrl}/strava-analysis?` +
      `strava_access_token=${data.access_token}&` +
      `strava_refresh_token=${data.refresh_token}&` +
      `strava_expires_at=${data.expires_at}`
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    res.redirect(`${frontendUrl}/strava-analysis?auth_error=true`)
  }
}
