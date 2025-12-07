import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { access_token, page = '1', per_page = '30' } = req.query

  if (!access_token) {
    return res.status(400).json({
      error: 'Missing access_token',
    })
  }

  try {
    // Récupérer les activités de l'athlète connecté
    const response = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${per_page}`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        return res.status(401).json({
          error: 'Token invalide ou expiré.',
        })
      }
      throw new Error(`Strava API error: ${response.status}`)
    }

    const activities = await response.json()

    // Filtrer pour ne garder que les activités de type "Run"
    const runActivities = activities
      .filter((activity: any) => activity.type === 'Run')
      .map((activity: any) => ({
        id: activity.id,
        name: activity.name,
        distance: activity.distance,
        moving_time: activity.moving_time,
        elapsed_time: activity.elapsed_time,
        start_date: activity.start_date,
        start_date_local: activity.start_date_local,
        type: activity.type,
        has_laps: activity.laps_count > 0,
        map: activity.map ? {
          summary_polyline: activity.map.summary_polyline,
          resource_state: activity.map.resource_state
        } : null,
      }))

    res.json(runActivities)
  } catch (error) {
    console.error('Error fetching Strava activities:', error)
    res.status(500).json({
      error: 'Erreur lors de la récupération des activités',
    })
  }
}
