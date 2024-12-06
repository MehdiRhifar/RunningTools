import { Link } from 'react-router-dom'
import { TimeToPacePage } from '../../page/TimeToPacePage/TimeToPacePage.tsx'
import { PaceToTimePage } from '../../page/PercentagePage/PaceToTimePage.tsx'
import { EquivalentPage } from '../../page/EquivalentPage/EquivalentPage.tsx'
import './NavBar.css'
import { BaremePage } from '../../page/BaremePage/BaremePage.tsx'

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

  return (
    <nav className="navbar-container">
      <ul className={`navbar-menu`}>
        <li className="navbar-item">
          <Link className="navbar-link" to={"/"}>
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
      </ul>
    </nav>
  );
}
