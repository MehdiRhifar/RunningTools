import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { NavBar, routesConfig } from './component/NavBar/NavBar.tsx'
import { MillisecondsProvider } from './contexts/MillisecondsContext.tsx'

function App() {
  return (
    <>
      <MillisecondsProvider>
      <NavBar />
        <Routes>
          {routesConfig.map(({ path, component }) => (
            <Route key={path} path={path} element={component} />
          ))}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MillisecondsProvider>
    </>
  )
}

export default App
