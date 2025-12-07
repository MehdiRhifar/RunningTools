import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Seulement POST est autorisé
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { activity_id, access_token, name, description } = req.body

  if (!activity_id || !access_token) {
    return res.status(400).json({
      error: 'Missing activity_id or access_token',
    })
  }

  try {
    // Préparer les données à mettre à jour
    const updateData: any = {}
    if (name) updateData.name = name
    if (description) updateData.description = description

    // Appeler l'API Strava pour mettre à jour l'activité
    const response = await fetch(
      `https://www.strava.com/api/v3/activities/${activity_id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        console.log(response)
        return res.status(401).json({
          error: 'Token invalide ou expiré.',
        })
      }
      if (response.status === 404) {
        return res.status(404).json({
          error: 'Activité non trouvée.',
        })
      }
      throw new Error(`Strava API error: ${response.status}`)
    }

    const updatedActivity = await response.json()

    res.json({
      success: true,
      activity: updatedActivity,
    })
  } catch (error) {
    console.error('Error updating Strava activity:', error)
    res.status(500).json({
      error: "Erreur lors de la mise à jour de l'activité",
    })
  }
}
