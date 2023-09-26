import {Link} from "react-router-dom";

export function NavBar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/map">Map</Link>
        </li>
        <li>
          <Link to="/converter">Converter</Link>
        </li>
      </ul>
    </nav>
  );
}
