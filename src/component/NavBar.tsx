import {Link} from "react-router-dom";
import {CalculPacePage} from "../page/CalculPacePage.tsx";
import {PercentagePage} from "../page/PercentagePage/PercentagePage.tsx";

export const routesConfig = [
  { path: '/', label: 'Home', component: <CalculPacePage></CalculPacePage> },
  { path: '/percentage', label: 'Percentage', component: <PercentagePage></PercentagePage> },
  // { path: '/converter', label: 'Converter', component: ConverterPage },
];
export function NavBar() {
  return (
      <nav>
        <ul>
          {routesConfig.map(({ path, label }) => (
              <li key={path}>
                <Link to={path}>{label}</Link>
              </li>
          ))}
        </ul>
      </nav>
  );
}