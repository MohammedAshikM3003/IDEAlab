import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './frontend/landingpage.jsx'
import LoginPage from './frontend/LoginPage.jsx'
import DashboardPage from './frontend/DashboardPage.jsx'
import RequestInboxPage from './frontend/RequestInboxPage.jsx'
import StatusPage from './frontend/StatusPage.jsx'
import FacilitiesManagementPage from './frontend/FacilitiesManagementPage.jsx'
import AddFacilityPage from './frontend/AddFacilityPage.jsx'
import HistoryPage from './frontend/HistoryPage.jsx'
import SettingsPage from './frontend/SettingsPage.jsx'
import AICTEVenuePage from './frontend/AICTEVenuePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/venue/aicte-idea-lab" element={<AICTEVenuePage />} />
      <Route path="/landing" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/inbox" element={<RequestInboxPage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/facilities" element={<FacilitiesManagementPage />} />
      <Route path="/facilities/add" element={<AddFacilityPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
