import "./App.css";
import { CalculPacePage } from "./page/CalculPacePage.tsx";
import { Route, Routes } from "react-router-dom";
import { Map } from "./page/Map.tsx";
import {NavBar} from "./component/NavBar.tsx";
import {PercentagePage} from "./page/PercentagePage.tsx";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<CalculPacePage />} />
        <Route path="/" element={<PercentagePage />} />
        <Route path="/map" element={<Map />} />
      </Routes>
    </>
  );
}

export default App;
