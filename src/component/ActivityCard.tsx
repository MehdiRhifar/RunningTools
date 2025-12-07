import { RouteMap } from './RouteMap'
import type { StravaActivity } from '../types/strava'

interface ActivityCardProps {
  activity: StravaActivity
  onSelect: (activityId: string) => void
  disabled?: boolean
}

export function ActivityCard({ activity, onSelect, disabled = false }: ActivityCardProps) {
  return (
    <button
      onClick={() => onSelect(activity.id.toString())}
      disabled={disabled}
      className="w-full bg-gray-800 hover:bg-gray-700 text-left rounded-lg transition-colors border-2 border-gray-700 hover:border-[#FC4C02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
    >
      <div className="flex">
        {/* Mini carte du tracé */}
        {activity.map?.summary_polyline ? (
          <div className="w-24 h-24 flex-shrink-0 bg-gray-900 relative overflow-hidden">
            <RouteMap
              encodedPolyline={activity.map.summary_polyline}
              width={96}
              height={96}
              strokeColor="#FC4C02"
              strokeWidth={2}
              backgroundColor="#1a1f2e"
            />
          </div>
        ) : (
          <div className="w-24 h-24 flex-shrink-0 bg-gray-900 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              ></path>
            </svg>
          </div>
        )}

        {/* Contenu de l'activité */}
        <div className="flex-1 px-4 py-3 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <div className="font-semibold text-white truncate pr-2 group-hover:text-[#FC4C02] transition-colors">
              {activity.name}
            </div>
            {activity.has_laps && (
              <span className="text-xs bg-[#FC4C02]/20 text-[#FC4C02] px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                Laps
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400 flex flex-wrap gap-x-3 gap-y-1">
            <span>
              {new Date(activity.start_date_local).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <span className="font-semibold text-gray-300">
              {(activity.distance / 1000).toFixed(2)} km
            </span>
            <span>{Math.floor(activity.moving_time / 60)}min</span>
          </div>
        </div>
      </div>
    </button>
  )
}
