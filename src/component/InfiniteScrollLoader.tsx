import { PAGINATION } from '../constants/pagination'

interface InfiniteScrollLoaderProps {
  isLoading: boolean
  hasMore: boolean
  itemCount: number
  observerRef: React.RefObject<HTMLDivElement>
}

export function InfiniteScrollLoader({
  isLoading,
  hasMore,
  itemCount,
  observerRef,
}: InfiniteScrollLoaderProps) {
  return (
    <>
      {/* Sentinel pour l'IntersectionObserver */}
      <div ref={observerRef} className="h-4" />

      {/* Spinner de chargement */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <svg
            className="animate-spin h-5 w-5 text-[#FC4C02]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="ml-2 text-sm text-gray-400">Chargement...</span>
        </div>
      )}

      {/* Message de fin */}
      {!hasMore && !isLoading && itemCount >= PAGINATION.MIN_ITEMS_FOR_END_MESSAGE && (
        <div className="text-center text-gray-500 py-3 text-sm">
          Toutes les activités chargées
        </div>
      )}
    </>
  )
}
