/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ADMIN_PROFILE_STORAGE_KEY = 'adminProfile'

const defaultUserProfile = {
  titlePrefix: 'Dr.',
  firstName: 'Arul',
  lastName: 'Kumaran',
  email: 'admin@ksrce.ac.in',
  role: 'Chief Administrator',
  avatarUrl: 'https://ui-avatars.com/api/?name=Arul+Kumaran&background=0D47A1&color=fff',
}

const UserProfileContext = createContext({
  userProfile: defaultUserProfile,
  setUserProfile: () => {},
})

function getInitialUserProfile() {
  try {
    const savedProfile = localStorage.getItem(ADMIN_PROFILE_STORAGE_KEY)

    if (!savedProfile) {
      return defaultUserProfile
    }

    const parsedProfile = JSON.parse(savedProfile)

    return {
      ...defaultUserProfile,
      firstName: parsedProfile.firstName || defaultUserProfile.firstName,
      lastName: parsedProfile.lastName || defaultUserProfile.lastName,
      email: parsedProfile.email || defaultUserProfile.email,
      avatarUrl: parsedProfile.avatarUrl || defaultUserProfile.avatarUrl,
    }
  } catch {
    return defaultUserProfile
  }
}

export function UserProfileProvider({ children }) {
  const [userProfile, setUserProfile] = useState(getInitialUserProfile)

  useEffect(() => {
    localStorage.setItem(
      ADMIN_PROFILE_STORAGE_KEY,
      JSON.stringify({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        avatarUrl: userProfile.avatarUrl,
      }),
    )
  }, [userProfile.firstName, userProfile.lastName, userProfile.email, userProfile.avatarUrl])

  const value = useMemo(() => ({ userProfile, setUserProfile }), [userProfile])

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
}

export function useUserProfile() {
  return useContext(UserProfileContext)
}
