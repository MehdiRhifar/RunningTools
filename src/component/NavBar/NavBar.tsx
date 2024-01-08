import { Link } from 'react-router-dom'
import { TimeToPacePage } from '../../page/TimeToPacePage/TimeToPacePage.tsx'
import { PaceToTimePage } from '../../page/PercentagePage/PaceToTimePage.tsx'
import { EquivalentPage } from '../../page/EquivalentPage/EquivalentPage.tsx'
import './NavBar.css'

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
]
export function NavBar() {
  return (
    <nav className="navbar-container">
      <ul className={'navbar-menu'}>
        {routesConfig.map(({ path, label }) => (
          <li key={path} className={'navbar-item'}>
            <Link className={'navbar-link'} to={path}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
