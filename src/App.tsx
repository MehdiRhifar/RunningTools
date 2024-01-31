import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { NavBar, routesConfig } from './component/NavBar/NavBar.tsx'

function App() {
  return (
    <>
      <NavBar />
      <div className={'main-container'}>
        <Routes>
          {routesConfig.map(({ path, component }) => (
            <Route key={path} path={path} element={component} />
          ))}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  )
}

export default App
