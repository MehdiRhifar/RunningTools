import { Link } from 'react-router-dom'
import { TimeToPacePage } from '../../page/TimeToPacePage/TimeToPacePage.tsx'
import { PaceToTimePage } from '../../page/PercentagePage/PaceToTimePage.tsx'
import { EquivalentPage } from '../../page/EquivalentPage/EquivalentPage.tsx'
import './NavBar.css'
import { BaremePage } from '../../page/BaremePage/BaremePage.tsx'
import { useMilliseconds } from '../../contexts/MillisecondsContext.tsx'

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

export function NavBar() {

  // const toggleMenu = () => {
  //   setIsMenuOpen(!isMenuOpen);
  // };

  const { isMillisecondsMode, toggleMillisecondsMode } = useMilliseconds();

  return (
    <nav className="navbar-container">
      <ul className={`navbar-menu`}>
        <li className="navbar-item">
          <Link className="navbar-link" to={'/'}>
            <img src="/logoRunner.svg" className="h-10" alt="logoRunner" />
          </Link>
        </li>
        {routesConfig.map(({ path, label }) => (
          <li key={path} className="navbar-item">
            <Link className="navbar-link" to={path}>
              {label}
            </Link>
          </li>
        ))}
        <li className={'navbar-item'}>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isMillisecondsMode}
              onChange={toggleMillisecondsMode}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              mode MS
            </span>
          </label>
        </li>
      </ul>
    </nav>
  )
}
