import "./App.css";
import {Route, Routes} from "react-router-dom";
import {NavBar, routesConfig} from "./component/NavBar/NavBar.tsx";

function App() {
  return (
    <>
      <NavBar />
        <Routes>
            {routesConfig.map(({ path, component }) => (
                <Route key={path} path={path} element={component} />
            ))}
        </Routes>
    </>
  );
}

export default App;
