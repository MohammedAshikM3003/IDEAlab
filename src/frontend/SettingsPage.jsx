import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'

import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import styles from './SettingsPage.module.css'
import { useUserProfile } from './UserProfileContext.jsx'
import { api } from './utils/api.js'

function IconShield({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2 20 6v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="M9.5 12.5 11 14l3.5-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  )
}

function IconDevices({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 7h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M6 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  )
}

function IconCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 12.5 11 14.5 15.5 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      />
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function IconCircle({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })
}

async function getCroppedImage(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  return canvas.toDataURL('image/png')
}

export default function SettingsPage({ isSidebarOpen, setIsSidebarOpen }) {
  const { userProfile, setUserProfile } = useUserProfile()
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [designation, setDesignation] = useState('')
  const [mobileNumberInput, setMobileNumberInput] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [toast, setToast] = useState(null)
  const [isUserLoading, setIsUserLoading] = useState(true)
  const [userError, setUserError] = useState('')
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
  const [mobileNumberError, setMobileNumberError] = useState('')
  const [mobileModalStep, setMobileModalStep] = useState('number')
  const [otpInput, setOtpInput] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendSeconds, setResendSeconds] = useState(30)
  const [pendingMobileNumber, setPendingMobileNumber] = useState('')
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorError, setTwoFactorError] = useState('')
  const [isSecurityLogModalOpen, setIsSecurityLogModalOpen] = useState(false)
  const [activity, setActivity] = useState([])
  const [isActivityLoading, setIsActivityLoading] = useState(true)
  const [activityError, setActivityError] = useState('')
  const [notifications, setNotifications] = useState([])
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true)
  const [notificationsError, setNotificationsError] = useState('')
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [isAvatarViewerOpen, setIsAvatarViewerOpen] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const avatarInputRef = useRef(null)
  const cropSourceObjectUrlRef = useRef(null)

  const tabs = useMemo(
    () => [
      { id: 'profile', label: 'Profile Details' },
      
    ],
    [],
  )

  const relativeTime = (timestamp) => {
    if (!timestamp) return 'Just now'
    const time = new Date(timestamp).getTime()
    const deltaSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000))

    if (deltaSeconds < 60) return 'Just now'
    if (deltaSeconds < 3600) return `${Math.floor(deltaSeconds / 60)}m ago`
    if (deltaSeconds < 86400) return `${Math.floor(deltaSeconds / 3600)}h ago`
    if (deltaSeconds < 172800) return 'Yesterday'
    return `${Math.floor(deltaSeconds / 86400)}d ago`
  }

  const activityWithPresentation = useMemo(
    () =>
      activity.map((item) => {
        const iconType = item.iconType || ''
        const isDevice = iconType === 'device' || /login|chrome|windows/i.test(item.action || '')
        const isSuccess = iconType === 'success' || /password|updated|verified/i.test(item.action || '')

        return {
          ...item,
          icon: isDevice ? IconDevices : isSuccess ? IconCheck : IconCircle,
          iconClass: isDevice ? styles.iconBlue : isSuccess ? styles.iconGreen : styles.iconGray,
          timeLabel: relativeTime(item.timestamp),
        }
      }),
    [activity],
  )

  const notificationsRead = useMemo(() => notifications.length > 0 && notifications.every((item) => item.read), [notifications])

  const getNotificationClass = (type) => {
    if (type === 'maintenance') return styles.notInfo
    if (type === 'approval') return styles.notWarn
    return styles.notOk
  }

  const syncUserProfileContext = useCallback((apiUser) => {
    if (!apiUser) {
      return
    }

    const nameParts = String(apiUser.name || 'Admin').trim().split(/\s+/)
    const nextFirstName = nameParts[0] || 'Admin'
    const nextLastName = nameParts.slice(1).join(' ')

    setUserProfile((previousProfile) => ({
      ...previousProfile,
      firstName: nextFirstName,
      lastName: nextLastName,
      email: apiUser.email || previousProfile.email,
      role: apiUser.designation || apiUser.role || previousProfile.role,
      avatarUrl: apiUser.avatar ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${apiUser.avatar}` : previousProfile.avatarUrl,
    }))
  }, [setUserProfile])

  const applySettingsResponse = useCallback((settingsData) => {
    const profile = settingsData?.profile || {}
    setUser(profile)

    const nameParts = String(profile.name || 'Admin').trim().split(/\s+/)
    setFirstName(nameParts[0] || '')
    setLastName(nameParts.slice(1).join(' '))
    setEmailAddress(profile.email || '')
    setDesignation(profile.designation || profile.role || '')
    setMobileNumberInput(profile.mobile || '')
    setNotifications(Array.isArray(settingsData?.notifications) ? settingsData.notifications : [])
    setActivity(Array.isArray(settingsData?.securityActivity) ? settingsData.securityActivity : [])
    syncUserProfileContext(profile)
  }, [syncUserProfileContext])

  const loadUser = useCallback(async () => {
    setIsUserLoading(true)
    setUserError('')

    try {
      const data = await api.get('/api/settings')
      applySettingsResponse(data)
    } catch (error) {
      setUserError(error.message || 'Failed to load')
    } finally {
      setIsUserLoading(false)
    }
  }, [applySettingsResponse])

  const loadSecurityActivity = useCallback(async () => {
    setIsActivityLoading(true)
    setActivityError('')

    try {
      const data = await api.get('/api/settings')
      setActivity(Array.isArray(data?.securityActivity) ? data.securityActivity : [])
    } catch (error) {
      setActivityError(error.message || 'Failed to load')
    } finally {
      setIsActivityLoading(false)
    }
  }, [])

  const loadNotifications = useCallback(async () => {
    setIsNotificationsLoading(true)
    setNotificationsError('')

    try {
      const data = await api.get('/api/settings')
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : [])
    } catch (error) {
      setNotificationsError(error.message || 'Failed to load')
    } finally {
      setIsNotificationsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()
    loadSecurityActivity()
    loadNotifications()
  }, [loadNotifications, loadSecurityActivity, loadUser])

  useEffect(() => {
    if (!toast) {
      return undefined
    }

    const timeoutId = setTimeout(() => {
      setToast(null)
    }, 3000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [toast])

  useEffect(() => {
    return () => {
      if (cropSourceObjectUrlRef.current) {
        URL.revokeObjectURL(cropSourceObjectUrlRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isAvatarViewerOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAvatarViewerOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAvatarViewerOpen])

  useEffect(() => {
    if (!isMobileModalOpen || mobileModalStep !== 'otp' || resendSeconds <= 0) {
      return undefined
    }

    const timerId = setTimeout(() => {
      setResendSeconds((previous) => Math.max(previous - 1, 0))
    }, 1000)

    return () => {
      clearTimeout(timerId)
    }
  }, [isMobileModalOpen, mobileModalStep, resendSeconds])

  const normalizeMobileNumber = (value) => {
    const digitsOnly = value.replace(/\D/g, '')

    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      return digitsOnly.slice(2)
    }

    if (digitsOnly.length === 10) {
      return digitsOnly
    }

    return ''
  }

  const maskMobileNumber = (number) => {
    if (!number || number.length < 4) {
      return '+91 ••••••0000'
    }

    const lastFourDigits = number.slice(-4)
    return `+91 ••••••${lastFourDigits}`
  }

  const formatResendCountdown = (seconds) => {
    const normalized = Math.max(seconds, 0)
    return `0:${String(normalized).padStart(2, '0')}`
  }

  const triggerAvatarPicker = () => {
    setAvatarError('')
    if (avatarInputRef.current) {
      avatarInputRef.current.click()
    }
  }

  const handleAvatarChange = (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    const isValidType = validTypes.includes(selectedFile.type)
    const isValidSize = selectedFile.size <= 1024 * 1024

    if (!isValidType || !isValidSize) {
      setAvatarError('File must be JPG, GIF or PNG and under 1MB.')
      event.target.value = ''
      return
    }

    if (cropSourceObjectUrlRef.current) {
      URL.revokeObjectURL(cropSourceObjectUrlRef.current)
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile)
    cropSourceObjectUrlRef.current = nextPreviewUrl
    setCropImageSrc(nextPreviewUrl)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setIsCropModalOpen(true)
    setAvatarError('')
    event.target.value = ''
  }

  const closeCropModal = () => {
    setIsCropModalOpen(false)
    setCropImageSrc('')
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)

    if (cropSourceObjectUrlRef.current) {
      URL.revokeObjectURL(cropSourceObjectUrlRef.current)
      cropSourceObjectUrlRef.current = null
    }
  }

  const handleCropApply = async () => {
    if (!cropImageSrc || !croppedAreaPixels) {
      return
    }

    try {
      const croppedImage = await getCroppedImage(cropImageSrc, croppedAreaPixels)
      const blob = await (await fetch(croppedImage)).blob()
      const formData = new FormData()
      formData.append('avatar', blob, `avatar-${Date.now()}.png`)

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/settings/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.message || 'Avatar update failed')
      }

      applySettingsResponse(payload)
      setToast({
        id: `toast-avatar-updated-${Date.now()}`,
        text: 'Profile photo updated.',
      })
      closeCropModal()
    } catch (error) {
      setAvatarError(error.message || 'Avatar update failed')
    }
  }

  const handleSaveProfile = async () => {
    if (!user) {
      return
    }

    const normalizedFirstName = firstName.trim()
    const normalizedLastName = lastName.trim()
    const combinedName = `${normalizedFirstName} ${normalizedLastName}`.trim() || user.name || 'Admin'

    try {
      const updated = await api.put('/api/settings/profile', {
        name: combinedName,
        designation,
        mobile: mobileNumberInput,
      })

      applySettingsResponse(updated)

      setToast({
        id: `toast-profile-updated-${Date.now()}`,
        text: 'Profile updated',
      })
    } catch (error) {
      setToast({
        id: `toast-profile-update-failed-${Date.now()}`,
        text: error.message || 'Update failed',
      })
    }
  }

  const closeMobileModal = () => {
    setIsMobileModalOpen(false)
    setMobileNumberInput('')
    setMobileNumberError('')
    setMobileModalStep('number')
    setOtpInput('')
    setOtpError('')
    setResendSeconds(30)
    setPendingMobileNumber('')
  }

  const handleSendOtp = () => {
    const normalizedMobileNumber = normalizeMobileNumber(mobileNumberInput)

    if (!normalizedMobileNumber) {
      setMobileNumberError('Please enter a valid 10-digit mobile number.')
      return
    }

    setMobileNumberError('')
    setPendingMobileNumber(normalizedMobileNumber)
    setMobileModalStep('otp')
    setOtpInput('')
    setOtpError('')
    setResendSeconds(30)
  }

  const handleResendOtp = () => {
    setOtpError('')
    setResendSeconds(30)
  }

  const handleVerifyAndSaveMobile = () => {
    if (!/^\d{6}$/.test(otpInput.trim())) {
      setOtpError('Please enter a valid 6-digit OTP.')
      return
    }

    setMobileNumberInput(pendingMobileNumber)
    closeMobileModal()

    setToast({
      id: `toast-mobile-verified-${Date.now()}`,
      text: 'Mobile verified. Click Save Changes to persist.',
    })
  }

  const openTwoFactorModal = () => {
    setTwoFactorCode('')
    setTwoFactorError('')
    setIsTwoFactorModalOpen(true)
  }

  const closeTwoFactorModal = () => {
    setIsTwoFactorModalOpen(false)
    setTwoFactorCode('')
    setTwoFactorError('')
  }

  const handleVerifyAndEnableTwoFactor = () => {
    if (!/^\d{6}$/.test(twoFactorCode.trim())) {
      setTwoFactorError('Please enter a valid 6-digit code.')
      return
    }

    setUser((previous) => (previous ? { ...previous, twoFactorEnabled: true } : previous))
    closeTwoFactorModal()
    setToast({
      id: `toast-2fa-enabled-${Date.now()}`,
      text: 'Two-Factor Authentication enabled.',
    })
  }

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await api.patch('/api/settings/notifications/read-all', {})
      setNotifications(Array.isArray(response?.settings?.notifications) ? response.settings.notifications : [])
      setToast({ id: `toast-notifications-read-${Date.now()}`, text: 'All marked as read' })
    } catch (error) {
      setToast({ id: `toast-notifications-read-failed-${Date.now()}`, text: error.message || 'Update failed' })
    }
  }

  const clearAllNotifications = async () => {
    try {
      const response = await api.delete('/api/settings/notifications')
      setNotifications(Array.isArray(response?.settings?.notifications) ? response.settings.notifications : [])
      setToast({ id: `toast-notifications-cleared-${Date.now()}`, text: 'Notifications cleared' })
    } catch (error) {
      setToast({ id: `toast-notifications-clear-failed-${Date.now()}`, text: error.message || 'Update failed' })
    }
  }

  const fullDisplayName = `${userProfile.titlePrefix} ${firstName || userProfile.firstName} ${lastName || userProfile.lastName}`

  const openAvatarViewer = () => {
    if (!userProfile.avatarUrl) {
      return
    }
    setIsAvatarViewerOpen(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Sidebar activePage="settings" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className={styles.main}>
          <PageHeader title="Account Settings" setIsSidebarOpen={setIsSidebarOpen} />

          <div className={styles.mainContent}>
            <section className={styles.panelGrid}>
              <div className={styles.card}>
                <div className={styles.cardHead}>Profile Management</div>

                <nav className={styles.tabs} aria-label="Settings tabs">
                  {tabs.map((t) => (
                    <button
                      key={t.id}
                      className={`${styles.tab} ${activeTab === t.id ? styles.tabOn : ''}`}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>

                {isUserLoading ? (
                  <div className={styles.form}>
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                    <div className={styles.skeletonLine} />
                  </div>
                ) : userError ? (
                  <div className={styles.formLoadError}>
                    <span>Failed to load.</span>
                    <button className={styles.linkBtn} onClick={loadUser} type="button">Retry</button>
                  </div>
                ) : (
                <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                  <div className={styles.avatarWrap}>
                    <div
                      className={`${styles.avatarLg} ${userProfile.avatarUrl ? styles.avatarClickable : ''}`}
                      aria-hidden="true"
                      onClick={openAvatarViewer}
                      style={userProfile.avatarUrl ? { backgroundImage: `url(${userProfile.avatarUrl})` } : undefined}
                    />
                    <div>
                      <input
                        accept=".jpg,.jpeg,.png,.gif,image/jpeg,image/png,image/gif"
                        className={styles.hiddenFileInput}
                        onChange={handleAvatarChange}
                        ref={avatarInputRef}
                        type="file"
                      />
                      <button className={styles.btnSecondary} onClick={triggerAvatarPicker} type="button">
                        Change Avatar
                      </button>
                      <div className={styles.hint}>JPG, GIF or PNG. 1MB Max.</div>
                      {avatarError ? <div className={styles.inlineError}>{avatarError}</div> : null}
                    </div>
                  </div>

                  <div className={styles.cols2}>
                    <label className={styles.field}>
                      <span className={styles.label}>First Name</span>
                      <input className={styles.input} onChange={(event) => setFirstName(event.target.value)} type="text" value={firstName} />
                    </label>
                    <label className={styles.field}>
                      <span className={styles.label}>Last Name</span>
                      <input className={styles.input} onChange={(event) => setLastName(event.target.value)} type="text" value={lastName} />
                    </label>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.label}>Email Address</span>
                    <input className={styles.input} onChange={(event) => setEmailAddress(event.target.value)} type="email" value={emailAddress} />
                  </label>

                  <label className={styles.field}>
                    <span className={styles.label}>Role Designation</span>
                    <input className={styles.input} onChange={(event) => setDesignation(event.target.value)} type="text" value={designation} />
                  </label>

                  <div className={styles.formBtns}>
                    <button className={styles.btnPrimary} onClick={handleSaveProfile} type="button">
                      Save Changes
                    </button>
                  </div>
                </form>
                )}
              </div>

              <div className={styles.rightCol}>
                <div className={`${styles.card} ${styles.profileCardWrap}`}>
                  <div className={styles.pcLastLogin}>Last Login: {user?.lastLogin ? relativeTime(user.lastLogin) : 'N/A'}</div>
                  <div className={styles.pcAvatarWrap}>
                    {userProfile.avatarUrl ? (
                      <img
                        alt="Settings Profile"
                        className={`${styles.pcAvatarImg} ${styles.avatarClickable}`}
                        onClick={openAvatarViewer}
                        src={userProfile.avatarUrl}
                      />
                    ) : (
                      <div className={styles.pcAvatar} aria-hidden="true" />
                    )}
                    <span className={styles.onlineDot} />
                  </div>
                  <div className={styles.pcName}>{fullDisplayName}</div>
                  <div className={styles.pcMeta}>
                    Member since {user?.memberSince ? new Date(user.memberSince).getFullYear() : 'N/A'}
                  </div>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${styles.tagBlue}`}>{user?.role || 'Admin'}</span>
                    <span className={`${styles.badge} ${styles.tagPurple}`}>{designation || 'Not set'}</span>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.verifyHead}>
                    <div className={styles.cardHead}>Verification Status</div>
                    <div className={styles.verifyDate}>
                      {user?.memberSince ? new Date(user.memberSince).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  <ul className={styles.verifyList}>
                    <li className={styles.verifyItem}>
                      <div className={styles.verifyLeft}>
                        {user?.emailVerified ? (
                          <IconCheck className={`${styles.verifyIco} ${styles.verifyIcoOk}`} />
                        ) : (
                          <IconCircle className={`${styles.verifyIco} ${styles.verifyIcoPend}`} />
                        )}
                        <span className={user?.emailVerified ? styles.verifyTxt : styles.verifyMuted}>Email Verified</span>
                      </div>
                    </li>
                    <li className={styles.verifyItem}>
                      <div className={styles.verifyLeft}>
                        {user?.mobile ? (
                          <IconCheck className={`${styles.verifyIco} ${styles.verifyIcoOk}`} />
                        ) : (
                          <IconCircle className={`${styles.verifyIco} ${styles.verifyIcoPend}`} />
                        )}
                        <span className={user?.mobile ? styles.verifyTxt : styles.verifyMuted}>Mobile Number</span>
                      </div>
                      <button className={styles.linkBtn} onClick={() => setIsMobileModalOpen(true)} type="button">
                        Update
                      </button>
                    </li>
                    <li className={styles.verifyItem}>
                      <div className={styles.verifyLeft}>
                        {user?.twoFactorEnabled ? (
                          <IconCheck className={`${styles.verifyIco} ${styles.verifyIcoOk}`} />
                        ) : (
                          <IconCircle className={`${styles.verifyIco} ${styles.verifyIcoPend}`} />
                        )}
                        <span className={user?.twoFactorEnabled ? styles.verifyTxt : styles.verifyMuted}>Two-Factor Auth (2FA)</span>
                      </div>
                      {user?.twoFactorEnabled ? (
                        <button className={styles.linkBtn} onClick={openTwoFactorModal} type="button">
                          Manage
                        </button>
                      ) : (
                        <button className={styles.linkBtn} onClick={openTwoFactorModal} type="button">
                          Enable
                        </button>
                      )}
                    </li>
                  </ul>

                  <div className={styles.verifyHint}>Complete verification to increase security score.</div>
                </div>
              </div>
            </section>

            

{/* BOTTOM SECTION */}

<section className={styles.activityGrid}>
  <div className={styles.card} id="system-notifications">
    <div className={styles.bottomHead}>
      <span>Recent Security Activity</span>
      <button className={styles.link} onClick={() => setIsSecurityLogModalOpen(true)} type="button">View Log</button>
    </div>

    <ul className={styles.activityList}>
      {isActivityLoading ? (
        <li className={styles.activityItem}><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></li>
      ) : activityError ? (
        <li className={styles.activityItem}><span>Failed to load.</span><button className={styles.linkBtn} onClick={loadSecurityActivity} type="button">Retry</button></li>
      ) : (
        activityWithPresentation.map((event) => {
          const EventIcon = event.icon
          return (
            <li className={styles.activityItem} key={event._id || event.id}>
              <EventIcon className={`${styles.actIcon} ${event.iconClass}`} />
              <div>
                <div>{event.action}</div>
                <div className={styles.activityTime}>{event.timeLabel}</div>
              </div>
            </li>
          )
        })
      )}
    </ul>
  </div>

  <div className={styles.card}>
    <div className={styles.bottomHead}>
      <span>System Notifications</span>
      <div className={styles.notificationsActions}>
        <button
          className={`${styles.link} ${notificationsRead ? styles.linkMuted : ''}`}
          onClick={markAllNotificationsAsRead}
          type="button"
        >
          {notificationsRead ? 'All read' : 'Mark all read'}
        </button>
        <button className={styles.link} onClick={clearAllNotifications} type="button">Clear all updates</button>
      </div>
    </div>

    <ul className={styles.notificationList}>
      {isNotificationsLoading ? (
        <li className={styles.notificationItem}><div className={styles.skeletonLine} /><div className={styles.skeletonLine} /></li>
      ) : notificationsError ? (
        <li className={styles.notificationItem}><span>Failed to load.</span><button className={styles.linkBtn} onClick={loadNotifications} type="button">Retry</button></li>
      ) : notifications.length === 0 ? (
        <li className={styles.notificationsEmpty}><IconCircle className={styles.notificationsEmptyIcon} /><span>No notifications</span></li>
      ) : (
        notifications.map((notification) => (
          <li
            className={`${styles.notificationItem} ${getNotificationClass(notification.type)} ${notification.read ? styles.notificationRead : ''}`}
            key={notification._id}
          >
            <div className={styles.notIconWrap}>
              <IconShield className={styles.notIcon} />
            </div>
            <div>
              <div className={styles.notTitle}>{notification.title}</div>
              <div className={styles.notDesc}>{notification.message}</div>
            </div>
          </li>
        ))
      )}
    </ul>
  </div>
</section>

          {toast ? (
            <div className={styles.toastWrap} role="status">
              <div className={styles.toastCard}>
                <IconCheck className={`${styles.toastIcon} ${styles.iconGreen}`} />
                <span className={styles.toastText}>{toast.text}</span>
              </div>
            </div>
          ) : null}

          {isMobileModalOpen ? (
            <div className={styles.modalOverlay} onClick={closeMobileModal} role="presentation">
              <div className={styles.modalCard} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                <button className={styles.modalClose} onClick={closeMobileModal} type="button" aria-label="Close">
                  x
                </button>
                <h3 className={styles.modalTitle}>Update Mobile Number</h3>

                {mobileModalStep === 'number' ? (
                  <>
                    <label className={styles.field}>
                      <span className={styles.label}>New Mobile Number</span>
                      <input
                        className={styles.input}
                        onChange={(event) => {
                          setMobileNumberInput(event.target.value)
                          if (mobileNumberError) {
                            setMobileNumberError('')
                          }
                        }}
                        placeholder="+91 XXXXX XXXXX"
                        type="text"
                        value={mobileNumberInput}
                      />
                    </label>
                    {mobileNumberError ? <div className={styles.inlineError}>{mobileNumberError}</div> : null}

                    <div className={styles.modalActions}>
                      <button className={styles.btnOutline} onClick={closeMobileModal} type="button">
                        Cancel
                      </button>
                      <button className={styles.btnPrimary} onClick={handleSendOtp} type="button">
                        Send OTP
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.hint}>OTP sent to {maskMobileNumber(pendingMobileNumber)}</p>

                    <label className={styles.field}>
                      <span className={styles.label}>Enter OTP</span>
                      <input
                        className={styles.input}
                        inputMode="numeric"
                        maxLength={6}
                        onChange={(event) => {
                          const onlyDigits = event.target.value.replace(/\D/g, '')
                          setOtpInput(onlyDigits)
                          if (otpError) {
                            setOtpError('')
                          }
                        }}
                        placeholder="Enter 6-digit OTP"
                        type="text"
                        value={otpInput}
                      />
                    </label>
                    {otpError ? <div className={styles.inlineError}>{otpError}</div> : null}

                    {resendSeconds > 0 ? (
                      <p className={styles.hint}>Resend OTP in {formatResendCountdown(resendSeconds)}</p>
                    ) : (
                      <button className={styles.linkBtn} onClick={handleResendOtp} type="button">
                        Resend OTP
                      </button>
                    )}

                    <div className={styles.modalActions}>
                      <button className={styles.btnOutline} onClick={closeMobileModal} type="button">
                        Cancel
                      </button>
                      <button className={styles.btnPrimary} onClick={handleVerifyAndSaveMobile} type="button">
                        Verify & Save
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}

          {isTwoFactorModalOpen ? (
            <div className={styles.modalOverlay} onClick={closeTwoFactorModal} role="presentation">
              <div className={styles.modalCard} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                <button className={styles.modalClose} onClick={closeTwoFactorModal} type="button" aria-label="Close">
                  x
                </button>
                <h3 className={styles.modalTitle}>Enable Two-Factor Authentication</h3>
                <p className={styles.modalText}>
                  Scan the QR code below with your authenticator app (Google Authenticator or Authy).
                </p>

                <div className={styles.qrPlaceholder}>QR Code</div>

                <label className={styles.field}>
                  <span className={styles.label}>Enter 6-digit code</span>
                  <input
                    className={styles.input}
                    inputMode="numeric"
                    maxLength={6}
                    onChange={(event) => {
                      const onlyDigits = event.target.value.replace(/\D/g, '')
                      setTwoFactorCode(onlyDigits)
                      if (twoFactorError) {
                        setTwoFactorError('')
                      }
                    }}
                    type="text"
                    value={twoFactorCode}
                  />
                </label>
                {twoFactorError ? <div className={styles.inlineError}>{twoFactorError}</div> : null}

                <div className={styles.modalActions}>
                  <button className={styles.btnOutline} onClick={closeTwoFactorModal} type="button">
                    Cancel
                  </button>
                  <button className={styles.btnPrimary} onClick={handleVerifyAndEnableTwoFactor} type="button">
                    Verify & Enable
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isSecurityLogModalOpen ? (
            <div className={styles.modalOverlay} onClick={() => setIsSecurityLogModalOpen(false)} role="presentation">
              <div className={styles.modalCard} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                <button
                  className={styles.modalClose}
                  onClick={() => setIsSecurityLogModalOpen(false)}
                  type="button"
                  aria-label="Close"
                >
                  x
                </button>
                <h3 className={styles.modalTitle}>Security Activity Log</h3>

                <ul className={styles.logList}>
                  {activityWithPresentation.map((event) => {
                    const EventIcon = event.icon
                    return (
                      <li className={styles.logItem} key={`log-${event._id || event.id}`}>
                        <EventIcon className={`${styles.actIcon} ${event.iconClass}`} />
                        <div>
                          <div>{event.action}</div>
                          <div className={styles.activityTime}>{event.timeLabel}</div>
                        </div>
                      </li>
                    )
                  })}
                </ul>

                <div className={styles.modalActions}>
                  <button className={styles.btnOutline} onClick={() => setIsSecurityLogModalOpen(false)} type="button">
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isCropModalOpen ? (
            <div className={styles.modalOverlay} onClick={closeCropModal} role="presentation">
              <div className={styles.cropModalCard} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
                <button className={styles.modalClose} onClick={closeCropModal} type="button" aria-label="Close">
                  x
                </button>
                <h3 className={styles.modalTitle}>Adjust Profile Photo</h3>

                <div className={styles.cropAreaWrap}>
                  <div className={styles.cropAreaBox}>
                    <Cropper
                      aspect={1}
                      crop={crop}
                      cropShape="round"
                      image={cropImageSrc}
                      onCropChange={setCrop}
                      onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                      onZoomChange={setZoom}
                      showGrid={false}
                      zoom={zoom}
                    />
                  </div>
                </div>

                <div className={styles.zoomWrap}>
                  <span className={styles.zoomLabel}>Zoom</span>
                  <button
                    className={styles.zoomBtn}
                    onClick={() => setZoom((prev) => Math.max(1, Number((prev - 0.1).toFixed(2))))}
                    type="button"
                  >
                    -
                  </button>
                  <input
                    className={styles.zoomSlider}
                    max={3}
                    min={1}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    step={0.1}
                    type="range"
                    value={zoom}
                  />
                  <button
                    className={styles.zoomBtn}
                    onClick={() => setZoom((prev) => Math.min(3, Number((prev + 0.1).toFixed(2))))}
                    type="button"
                  >
                    +
                  </button>
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.btnOutline} onClick={closeCropModal} type="button">
                    Cancel
                  </button>
                  <button className={styles.btnPrimary} onClick={handleCropApply} type="button">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {isAvatarViewerOpen && userProfile.avatarUrl ? (
            <div className={styles.avatarLightboxOverlay} onClick={() => setIsAvatarViewerOpen(false)} role="presentation">
              <button
                aria-label="Close profile image viewer"
                className={styles.avatarLightboxClose}
                onClick={() => setIsAvatarViewerOpen(false)}
                type="button"
              >
                x
              </button>
              <img
                alt="Enlarged profile"
                className={styles.avatarLightboxImage}
                onClick={(event) => event.stopPropagation()}
                src={userProfile.avatarUrl}
              />
            </div>
          ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
