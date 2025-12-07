import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { activity_id, access_token } = req.query

  if (!activity_id || !access_token) {
    return res.status(400).json({
      error: 'Missing activity_id or access_token',
    })
  }

  try {
    // 1. Récupérer les détails de l'activité
    const activityResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${activity_id}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    )

    if (!activityResponse.ok) {
      if (activityResponse.status === 401) {
        return res.status(401).json({
          error: 'Token invalide ou expiré. Générez un nouveau token.',
        })
      }
      throw new Error(`Strava API error: ${activityResponse.status}`)
    }

    const activity = await activityResponse.json()

    // 2. Retourner les laps Strava bruts
    // La transformation vers un format normalisé se fera côté client
    res.json({
      laps: activity.laps || [],
      activity: {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        start_date: activity.start_date,
      },
    })
  } catch (error) {
    console.error('Error fetching Strava activity:', error)
    res.status(500).json({
      error: "Erreur lors de la récupération de l'activité",
    })
  }
}
