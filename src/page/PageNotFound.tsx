// frontend/src/components/PageNotFound.tsx
import { Link } from 'react-router-dom'

export default function PageNotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">
        Cette page n'existe pas :(
      </p>
      <Link
        to="/"
        className="mt-8 inline-block px-6 py-3 bg-blue-600 text-white rounded"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}
