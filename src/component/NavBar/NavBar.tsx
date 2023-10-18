import {Link} from "react-router-dom";
import {CalculPacePage} from "../../page/CalculPacePage.tsx";
import {PercentagePage} from "../../page/PercentagePage/PercentagePage.tsx";
import {EquivalentPage} from "../../page/EquivalentPage/EquivalentPage.tsx";
import "./NavBar.css"

export const routesConfig = [
  { path: '/', label: 'Home', component: <CalculPacePage></CalculPacePage> },
  { path: '/percentage', label: 'Percentage', component: <PercentagePage></PercentagePage> },
  { path: '/equivalent', label: 'Equivalent', component: <EquivalentPage></EquivalentPage> },
];
export function NavBar() {
  return (
      <nav className="navbar-container">
            <ul className={"navbar-menu"}>
              {routesConfig.map(({ path, label }) => (
                  <li key={path} className={"navbar-item"}>
                    <Link className={"navbar-link"} to={path}>{label}</Link>
                  </li>
              ))}
            </ul>
      </nav>
  );
}