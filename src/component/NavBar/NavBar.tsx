import { Link } from 'react-router-dom'
import { TimeToPacePage } from '../../page/TimeToPacePage/TimeToPacePage.tsx'
import { PaceToTimePage } from '../../page/PercentagePage/PaceToTimePage.tsx'
import { EquivalentPage } from '../../page/EquivalentPage/EquivalentPage.tsx'
import './NavBar.css'
import './Toggle.css'
import { BaremePage } from '../../page/BaremePage/BaremePage.tsx'
import { FitParserPage } from '../../page/FitParserPage/FitParserPage.tsx'
import { useMilliseconds } from '../../contexts/MillisecondsContext.tsx'
import { useState } from 'react'

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
  {
    path: '/strava-analysis',
    label: 'Analyse Strava',
    component: <FitParserPage></FitParserPage>,
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
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Menu qui s'adapte avec CSS */}
      <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
        {routesConfig.map(({ path, label }) => (
          <li key={path} className="navbar-item">
            <Link
              className="navbar-link"
              to={path}
              onClick={closeMenu}
            >
              {label}
            </Link>
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
      {isMenuOpen && (
        <div className="navbar-overlay" onClick={closeMenu}></div>
      )}
    </nav>
  )
}

