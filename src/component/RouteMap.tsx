import { useEffect, useState } from 'react'

interface RouteMapProps {
  encodedPolyline: string
  width?: number
  height?: number
  strokeColor?: string
  strokeWidth?: number
  backgroundColor?: string
}

export function RouteMap({
  encodedPolyline,
  width = 96,
  height = 96,
  strokeColor = '#FC4C02',
  strokeWidth = 3,
  backgroundColor = '#1a1f2e',
}: RouteMapProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMap = async () => {
      try {
        setLoading(true)
        setError(null)

        // Nettoyer le # des couleurs pour Mapbox
        const color = strokeColor.replace('#', '')
        const bgColor = backgroundColor.replace('#', '')

        // Appeler notre API route qui fait le proxy vers Mapbox
        const params = new URLSearchParams({
          polyline: encodedPolyline,
          width: width.toString(),
          height: height.toString(),
          strokeWidth: strokeWidth.toString(),
          strokeColor: color,
          backgroundColor: bgColor,
        })

        const response = await fetch(`/api/mapbox/static-map?${params}`)

        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la carte')
        }

        // Créer un blob URL depuis l'image
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setImageUrl(url)
      } catch (err) {
        console.error('Error loading map:', err)
        setError('Impossible de charger la carte')
      } finally {
        setLoading(false)
      }
    }

    fetchMap()

    // Cleanup: révoquer l'URL du blob quand le composant est démonté
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [encodedPolyline, width, height, strokeColor, strokeWidth, backgroundColor])

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-gray-900"
        style={{ width, height }}
      >
        <span className="text-gray-500 text-xs">...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="w-full h-full flex items-center justify-center bg-gray-900"
        style={{ width, height }}
      >
        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
        </svg>
      </div>
    )
  }

  return (
    <img
      src={imageUrl || ''}
      alt="Route map"
      className="w-full h-full object-cover"
      style={{ width, height }}
    />
  )
}
