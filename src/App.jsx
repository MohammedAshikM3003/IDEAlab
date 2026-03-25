import React, { useState } from 'react'
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
import { UserProfileProvider } from './frontend/UserProfileContext.jsx'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <UserProfileProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/venue/aicte-idea-lab" element={<AICTEVenuePage />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
        <Route path="/inbox" element={<RequestInboxPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
        <Route path="/status" element={<StatusPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
        <Route path="/facilities" element={<FacilitiesManagementPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
        <Route path="/facilities/add" element={<AddFacilityPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
        <Route path="/history" element={<HistoryPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
        <Route path="/settings" element={<SettingsPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProfileProvider>
  )
}

export default App