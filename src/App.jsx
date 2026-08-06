import React, { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './frontend/landingpage.jsx'
import LoginPage from './frontend/LoginPage.jsx'
import DashboardPage from './frontend/DashboardPage.jsx'
import RequestInboxPage from './frontend/RequestInboxPage.jsx'
import StatusPage from './frontend/StatusPage.jsx'
import FacilitiesManagementPage from './frontend/FacilitiesManagementPage.jsx'
import FacilitiesAllPage from './frontend/FacilitiesAllPage.jsx'
import AddFacilityPage from './frontend/AddFacilityPage.jsx'
import EditFacilityPage from './frontend/EditFacilityPage.jsx'
import HistoryPage from './frontend/HistoryPage.jsx'
import SettingsPage from './frontend/SettingsPage.jsx'
import FacilityVenueDetailPage from './frontend/FacilityVenueDetailPage.jsx'
import BookingFormPage from './frontend/BookingFormPage.jsx'

import { UserProfileProvider } from './frontend/UserProfileContext.jsx'

import VenueDetailPage from './frontend/VenueDetailPage.jsx'
// PublicVenuesPage removed — /venues route retired; carousel lives on landing page

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <UserProfileProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/venue/:venueId" element={<VenueDetailPage />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/booking-form" element={<BookingFormPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="/inbox" element={<ProtectedRoute><RequestInboxPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="/status" element={<ProtectedRoute><StatusPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="/facilities" element={<ProtectedRoute><FacilitiesManagementPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="/facilities/all" element={<ProtectedRoute><FacilitiesAllPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="/facilities/venue/:venueId" element={<ProtectedRoute><FacilityVenueDetailPage /></ProtectedRoute>} />
        <Route path="/facilities/venue/:id/edit" element={<ProtectedRoute><EditFacilityPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="/facilities/add" element={<ProtectedRoute><AddFacilityPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </UserProfileProvider>
  )
}

export default App