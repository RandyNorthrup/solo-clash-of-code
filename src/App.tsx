import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AccountPage } from './pages/AccountPage'
import { HomePage } from './pages/HomePage'
import { NewPuzzlePage } from './pages/NewPuzzlePage'
import { SharePage } from './pages/SharePage'
import { SolvePage } from './pages/SolvePage'
import { StatsPage } from './pages/StatsPage'
import { ROUTES } from './routes'

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={ROUTES.home} element={<HomePage />} />
          <Route path={ROUTES.account} element={<AccountPage />} />
          <Route path={ROUTES.newPuzzle} element={<NewPuzzlePage />} />
          <Route path={ROUTES.stats} element={<StatsPage />} />
          <Route path={ROUTES.share} element={<SharePage />} />
          <Route path={ROUTES.solve} element={<SolvePage />} />
          <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
