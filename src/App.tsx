import './App.css'
import { Route, Routes } from 'react-router-dom'
import { NavBar, routesConfig } from './component/NavBar/NavBar.tsx'
import { MillisecondsProvider } from './contexts/MillisecondsContext.tsx'
import PageNotFound from './page/PageNotFound.tsx'

function App() {
  return (
    <>
      <MillisecondsProvider>
        <NavBar />
        <Routes>
          {routesConfig.map(({ path, component }) => (
            <Route key={path} path={path} element={component} />
          ))}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </MillisecondsProvider>
    </>
  )
}

export default App
