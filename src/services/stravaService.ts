const STRAVA_TOKEN_KEY = 'strava_access_token'
const STRAVA_REFRESH_TOKEN_KEY = 'strava_refresh_token'
const STRAVA_EXPIRES_AT_KEY = 'strava_expires_at'

export class StravaService {
  // Stocker les tokens
  saveTokens(accessToken: string, refreshToken: string, expiresAt: number): void {
    localStorage.setItem(STRAVA_TOKEN_KEY, accessToken)
    localStorage.setItem(STRAVA_REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(STRAVA_EXPIRES_AT_KEY, expiresAt.toString())
  }

  // Récupérer le token
  getToken(): string | null {
    return localStorage.getItem(STRAVA_TOKEN_KEY)
  }

  // Vérifier si token est expiré
  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(STRAVA_EXPIRES_AT_KEY)
    if (!expiresAt) return true
    return Date.now() / 1000 > parseInt(expiresAt)
  }

  // Refresh le token si expiré
  async ensureValidToken(): Promise<string> {
    const token = this.getToken()

    if (!token) {
      throw new Error('Not authenticated')
    }

    if (!this.isTokenExpired()) {
      return token
    }

    // Token expiré, le refresh
    const refreshToken = localStorage.getItem(STRAVA_REFRESH_TOKEN_KEY)
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('/api/strava/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!response.ok) {
      // Token refresh échoué, l'utilisateur doit se reconnecter
      this.clearTokens()
      throw new Error('Token expired. Please reconnect to Strava.')
    }

    const data = await response.json()
    this.saveTokens(data.access_token, data.refresh_token, data.expires_at)

    return data.access_token
  }

  // Supprimer les tokens
  clearTokens(): void {
    localStorage.removeItem(STRAVA_TOKEN_KEY)
    localStorage.removeItem(STRAVA_REFRESH_TOKEN_KEY)
    localStorage.removeItem(STRAVA_EXPIRES_AT_KEY)
  }

  // Démarrer OAuth
  startAuth(): void {
    window.location.href = '/api/strava/auth'
  }

  // Extraire l'ID d'activité depuis une URL Strava
  // Exemples d'URLs valides:
  // - https://www.strava.com/activities/123456789
  // - www.strava.com/activities/123456789
  // - strava.com/activities/123456789
  extractActivityId(url: string): string | null {
    const match = url.match(/activities\/(\d+)/)
    return match ? match[1] : null
  }

  // Récupérer une activité depuis Strava
  async fetchActivity(url: string): Promise<any> {
    const activityId = this.extractActivityId(url)

    if (!activityId) {
      throw new Error(
        'URL Strava invalide. Format attendu : https://www.strava.com/activities/123456789'
      )
    }

    // Assurer que le token est valide
    const token = await this.ensureValidToken()

    const response = await fetch(
      `/api/strava/activity?activity_id=${activityId}&access_token=${token}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la récupération')
    }

    return response.json()
  }

  // Récupérer une activité par ID directement
  async fetchActivityById(activityId: string): Promise<any> {
    // Assurer que le token est valide
    const token = await this.ensureValidToken()

    const response = await fetch(
      `/api/strava/activity?activity_id=${activityId}&access_token=${token}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la récupération')
    }

    return response.json()
  }

  // Récupérer la liste des activités de l'utilisateur
  async fetchUserActivities(page: number, perPage: number): Promise<any[]> {
    // Assurer que le token est valide
    const token = await this.ensureValidToken()

    const response = await fetch(
      `/api/strava/activities?access_token=${token}&page=${page}&per_page=${perPage}`
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erreur lors de la récupération des activités')
    }

    return response.json()
  }

  // Mettre à jour une activité Strava (titre et/ou description)
  async updateActivity(activityId: string, name?: string, description?: string): Promise<any> {
    // Assurer que le token est valide
    const token = await this.ensureValidToken()

    const response = await fetch('/api/strava/update-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activity_id: activityId,
        access_token: token,
        name,
        description,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Erreur lors de la mise à jour de l'activité")
    }

    return response.json()
  }
}

export const stravaService = new StravaService()
