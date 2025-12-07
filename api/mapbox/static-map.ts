import type { VercelRequest, VercelResponse } from '@vercel/node'
import polyline from '@mapbox/polyline'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const {
    polyline: encodedPolyline,
    width = '400',
    height = '400',
    strokeWidth = '3',
    strokeColor = 'fc4c02',
    backgroundColor = '1a1f2e'
  } = req.query

  if (!encodedPolyline || typeof encodedPolyline !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid polyline parameter',
    })
  }

  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN

  if (!mapboxToken) {
    return res.status(500).json({
      error: 'Mapbox token not configured',
    })
  }

  try {
    // Décoder la polyline
    const coordinates = polyline.decode(encodedPolyline)

    // Simplifier modérément : garder 1 point sur 5-8 selon la longueur
    // Pour des miniatures 96x96, c'est largement suffisant et garde un bon rendu
    const simplificationFactor = coordinates.length > 500 ? 8 : 5
    const simplifiedCoordinates = coordinates.filter((_: any, index: number) =>
      index % simplificationFactor === 0 || index === coordinates.length - 1
    )

    // Ré-encoder la polyline simplifiée
    const simplifiedPolyline = polyline.encode(simplifiedCoordinates)

    // Construire l'URL Mapbox Static Images API
    // Format: path-{strokeWidth}+{strokeColor}({encodedPolyline})
    const pathOverlay = `path-${strokeWidth}+${strokeColor}(${encodeURIComponent(simplifiedPolyline)})`

    // Style basé sur le backgroundColor
    let style = 'mapbox/streets-v12' // défaut

    // Si fond sombre, utiliser le style dark
    if (backgroundColor && backgroundColor.toString().toLowerCase() !== 'ffffff') {
      style = 'mapbox/dark-v11'
    }

    // 'auto' permet à Mapbox de calculer automatiquement le zoom et centrage
    // attribution=false retire le watermark (mais il faut l'afficher ailleurs sur la page)
    const mapboxUrl = `https://api.mapbox.com/styles/v1/${style}/static/${pathOverlay}/auto/${width}x${height}@2x?attribution=false&logo=false&access_token=${mapboxToken}`

    console.log('Mapbox URL length:', mapboxUrl.length)

    // Fetch l'image depuis Mapbox
    const response = await fetch(mapboxUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mapbox error:', response.status, errorText)
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    // Récupérer l'image en tant que buffer
    const imageBuffer = await response.arrayBuffer()

    // Retourner l'image directement
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=86400') // Cache 24h
    res.send(Buffer.from(imageBuffer))
  } catch (error) {
    console.error('Error fetching Mapbox static map:', error)
    res.status(500).json({
      error: 'Erreur lors de la génération de la carte',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
