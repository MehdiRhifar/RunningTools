import { Link, NavLink } from 'react-router-dom'
import { TimeToPacePage } from '../../page/TimeToPacePage/TimeToPacePage.tsx'
import { PaceToTimePage } from '../../page/PercentagePage/PaceToTimePage.tsx'
import { EquivalentPage } from '../../page/EquivalentPage/EquivalentPage.tsx'
import './NavBar.css'
import './Toggle.css'
import { BaremePage } from '../../page/BaremePage/BaremePage.tsx'
import { useMilliseconds } from '../../contexts/MillisecondsContext.tsx'
import { useEffect, useState } from 'react'

export const routesConfig = [
  {
    path: '/',
    label: 'Temps → Allure',
    component: <TimeToPacePage></TimeToPacePage>,
  },
  {
    path: '/PaceToTime',
    label: 'Allure → Temps',
    component: <PaceToTimePage></PaceToTimePage>,
  },
  {
    path: '/equivalent',
    label: 'Equivalent',
    component: <EquivalentPage></EquivalentPage>,
  },
  {
    path: '/bareme',
    label: 'Bareme',
    component: <BaremePage></BaremePage>,
  },
]

// NavBar.tsx - Version ultra simple
export function NavBar() {
  const { isMillisecondsMode, toggleMillisecondsMode } = useMilliseconds();
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Menu ouvert : Échap le ferme et la page derrière ne défile plus
  useEffect(() => {
    if (!isMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isMenuOpen])

  return (
    <nav className="navbar-container">
      {/* Header toujours visible mais s'adapte avec CSS */}
      <div className="navbar-header">
        <Link className="navbar-logo" to="/" onClick={closeMenu}>
          <img src="/logoRunner.svg" alt="logoRunner" />
        </Link>

        <button
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={isMenuOpen}
          aria-controls="navbar-menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Menu qui s'adapte avec CSS */}
      <ul
        id="navbar-menu"
        className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}
      >
        {routesConfig.map(({ path, label }) => (
          <li key={path} className="navbar-item">
            <NavLink
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'active' : ''}`
              }
              to={path}
              end
              onClick={closeMenu}
            >
              {label}
            </NavLink>
          </li>
        ))}

        <li className="navbar-item navbar-toggle">
          <label className="toggle-container">
            <input
              type="checkbox"
              checked={isMillisecondsMode}
              onChange={toggleMillisecondsMode}
              className="toggle-input"
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">mode MS</span>
          </label>
        </li>
      </ul>

      {/* Overlay pour fermer le menu */}
      <div
        className={`navbar-overlay ${isMenuOpen ? 'active' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      ></div>
    </nav>
  )
}

