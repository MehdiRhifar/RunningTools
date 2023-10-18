import {Link} from "react-router-dom";
import {CalculPacePage} from "../../page/CalculPacePage.tsx";
import {PercentagePage} from "../../page/PercentagePage/PercentagePage.tsx";
import {EquivalentPage} from "../../page/EquivalentPage/EquivalentPage.tsx";

export const routesConfig = [
  { path: '/', label: 'Home', component: <CalculPacePage></CalculPacePage> },
  { path: '/percentage', label: 'Percentage', component: <PercentagePage></PercentagePage> },
  { path: '/equivalent', label: 'Equivalent', component: <EquivalentPage></EquivalentPage> },
  // { path: '/converter', label: 'Converter', component: ConverterPage },
];
export function NavBar() {
  return (
      <nav className={"nav-bar"}>
          <div className="navbar-container">
            <a href="/" className="navbar-logo">Mon Application</a>
            <ul>
              {routesConfig.map(({ path, label }) => (
                  <li key={path} className={"navbar-item"}>
                    <Link className={"navbar-link"} to={path}>{label}</Link>
                  </li>
              ))}
            </ul>
          </div>
      </nav>
  );
}