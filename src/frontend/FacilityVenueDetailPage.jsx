import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import styles from './FacilityVenueDetailPage.module.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const normalizeImageUrl = (value) => {
  if (!value) return ''
  if (String(value).startsWith('http://') || String(value).startsWith('https://')) return value
  if (String(value).startsWith('/')) return `${API_BASE}${value}`
  return value
}

const toViewVenue = (payload = {}) => ({
  id: payload._id || payload.id || '',
  name: payload.name || '',
  location: payload.location || '',
  capacity: payload.capacity ?? '',
  size: payload.size || '',
  description: payload.description || '',
  amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
  equipment: Array.isArray(payload.equipment)
    ? payload.equipment.map((item, index) => ({
        id: item?._id || `eq-${index + 1}`,
        name: item?.itemDetails || item?.name || '',
        specs: item?.condition || item?.specs || '',
        description: item?.description || '',
        quantity: item?.quantity ?? '',
        image: normalizeImageUrl(item?.image),
      }))
    : [],
  images: {
    hero: normalizeImageUrl(payload.bannerImage),
    thumbnails: Array.isArray(payload.gallery) ? payload.gallery.map((image) => normalizeImageUrl(image)).filter(Boolean) : [],
  },
})

export default function FacilityVenueDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { venueId } = useParams()
  const preload = location.state?.preload || null
  const [venue, setVenue] = useState(() => (preload ? toViewVenue(preload) : null))
  const [venueLoadError, setVenueLoadError] = useState('')
  const [fullDataLoading, setFullDataLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [galleryLoadedMap, setGalleryLoadedMap] = useState({})
  const [lightbox, setLightbox] = useState({
    open: false,
    images: [],
    currentIndex: 0,
    title: '',
  })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const skeletonStyle = {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'fmShimmer 1.5s infinite linear',
    borderRadius: '6px',
  }

  useEffect(() => {
    const loadVenue = async () => {
      if (!venueId) {
        setVenue(null)
        setVenueLoadError('Venue not found')
        setFullDataLoading(false)
        return
      }

      setFullDataLoading(true)
      setVenueLoadError('')
      if (preload) {
        setVenue(toViewVenue(preload))
      }

      try {
        const response = await fetch(`${API_BASE}/api/venues/${venueId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        const rawText = await response.text()
        const payload = (() => {
          try {
            return rawText ? JSON.parse(rawText) : {}
          } catch {
            return { message: rawText }
          }
        })()

        if (!response.ok) {
          throw new Error(payload?.message || 'Failed to load venue')
        }

        setVenue(toViewVenue(payload))
      } catch (error) {
        if (!preload) {
          setVenue(null)
        }
        setVenueLoadError(error.message || 'Venue not found')
      } finally {
        setFullDataLoading(false)
      }
    }

    loadVenue()
  }, [preload, venueId])

  useEffect(() => {
    setImageLoaded(false)
  }, [venue?.images?.hero])

  useEffect(() => {
    setGalleryLoadedMap({})
  }, [venue?.id])

  const safeThumbnails = useMemo(() => venue?.images?.thumbnails || [], [venue])
  const equipmentImages = useMemo(
    () => (venue?.equipment || []).filter((item) => item?.image).map((item) => item.image),
    [venue],
  )

  const openLightbox = (images, index, title) => {
    const sanitizedImages = Array.isArray(images) ? images.filter(Boolean) : []
    if (!sanitizedImages.length) {
      return
    }

    const boundedIndex = Math.max(0, Math.min(index, sanitizedImages.length - 1))
    setLightbox({
      open: true,
      images: sanitizedImages,
      currentIndex: boundedIndex,
      title,
    })
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightbox((previous) => ({ ...previous, open: false }))
    document.body.style.overflow = ''
  }

  const nextImage = () => {
    setLightbox((previous) => {
      if (!previous.images.length) {
        return previous
      }

      return {
        ...previous,
        currentIndex: (previous.currentIndex + 1) % previous.images.length,
      }
    })
  }

  const prevImage = () => {
    setLightbox((previous) => {
      if (!previous.images.length) {
        return previous
      }

      return {
        ...previous,
        currentIndex: (previous.currentIndex - 1 + previous.images.length) % previous.images.length,
      }
    })
  }

  useEffect(() => {
    const handleKey = (event) => {
      if (!lightbox.open) {
        return
      }

      if (event.key === 'Escape') {
        closeLightbox()
      }

      if (event.key === 'ArrowRight') {
        nextImage()
      }

      if (event.key === 'ArrowLeft') {
        prevImage()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox.currentIndex, lightbox.open])

  useEffect(
    () => () => {
      document.body.style.overflow = ''
    },
    [],
  )

  if (!preload && fullDataLoading) {
    return (
      <div className={styles.page}>
        <style>{`@keyframes fmShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <div className={styles.mainContainer}>
          <Sidebar
            activePage="facilities"
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <div className={styles.mainContent}>
            <PageHeader title="Facilities Management" setIsSidebarOpen={setIsSidebarOpen} />
            <main className={styles.content}>
              <div className={styles.card}>
                <div className={styles.topBar}>
                  <div style={{ ...skeletonStyle, height: 36, width: 170 }} />
                  <div style={{ ...skeletonStyle, height: 36, width: 120 }} />
                </div>

                <section className={styles.headerSection}>
                  <div style={{ ...skeletonStyle, height: 34, width: 200 }} />
                  <div style={{ ...skeletonStyle, height: 18, width: 120, marginTop: 8 }} />
                </section>

                <section className={styles.statsRow}>
                  <div style={{ ...skeletonStyle, height: 76, width: '100%' }} />
                  <div style={{ ...skeletonStyle, height: 76, width: '100%' }} />
                </section>

                <section className={styles.heroSection}>
                  <div style={{ ...skeletonStyle, height: 300, width: '100%' }} />
                </section>

                <section className={styles.section}>
                  <div style={{ ...skeletonStyle, height: 16, width: '100%' }} />
                  <div style={{ ...skeletonStyle, height: 16, width: '80%', marginTop: 8 }} />
                  <div style={{ ...skeletonStyle, height: 16, width: '60%', marginTop: 8 }} />
                </section>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className={styles.page}>
        <div className={styles.mainContainer}>
          <Sidebar
            activePage="facilities"
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
          />
          <div className={styles.mainContent}>
            <PageHeader title="Facilities Management" setIsSidebarOpen={setIsSidebarOpen} />
            <main className={styles.content}>
              <div className={styles.card}>
                <div className={styles.notFoundContainer}>
                  <h1 className={styles.notFoundTitle}>{venueLoadError || 'Venue not found'}</h1>
                  <button
                    className={styles.backButton}
                    onClick={() => navigate('/facilities')}
                    type="button"
                  >
                    ← Back to Facilities
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <style>{`@keyframes fmShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      <div className={styles.mainContainer}>
        <Sidebar
          activePage="facilities"
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />

        <div className={styles.mainContent}>
          <PageHeader title="Facilities Management" setIsSidebarOpen={setIsSidebarOpen} />

          <main className={styles.content}>
            <div className={styles.card}>
              <div className={styles.topBar}>
                <button
                  className={styles.backButton}
                  onClick={() => navigate('/facilities')}
                  type="button"
                >
                  ← Back to Facilities
                </button>

                <button
                  className={styles.editButton}
                  onClick={() => navigate(`/facilities/venue/${venueId}/edit`)}
                  type="button"
                >
                  Edit Details
                </button>
              </div>

              <section className={styles.headerSection}>
                <h1 className={styles.venueName}>{venue?.name}</h1>
                <p className={styles.venueMeta}>{venue?.location}</p>
              </section>

              <section className={styles.statsRow}>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Capacity</p>
                  <p className={styles.statValue}>{venue?.capacity}</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Size</p>
                  <p className={styles.statValue}>{venue?.size}</p>
                </div>
              </section>

              <section className={styles.heroSection}>
                <div style={{ background: '#f0f0f0', borderRadius: 8 }}>
                  <img
                    alt={venue?.name}
                    className={`${styles.heroImage} ${styles.clickableImage}`}
                    onError={() => setImageLoaded(true)}
                    onLoad={() => setImageLoaded(true)}
                    onClick={() => openLightbox([venue?.images?.hero], 0, venue?.name || 'Venue')}
                    src={venue?.images?.hero}
                    style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                    title="Click to view full size"
                  />
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Description</h2>
                {fullDataLoading ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ ...skeletonStyle, height: 16, width: '100%' }} />
                    <div style={{ ...skeletonStyle, height: 16, width: '80%' }} />
                    <div style={{ ...skeletonStyle, height: 16, width: '60%' }} />
                  </div>
                ) : (
                  <p className={styles.sectionBody}>{venue?.description}</p>
                )}
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Amenities</h2>
                {fullDataLoading ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={`amenity-skeleton-${index}`} style={{ ...skeletonStyle, width: 80, height: 28 }} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.amenitiesWrap}>
                    {venue?.amenities?.map((amenity) => (
                      <span className={styles.amenityTag} key={amenity}>
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Equipment</h2>
                {fullDataLoading ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ ...skeletonStyle, height: 80, width: '100%' }} />
                    <div style={{ ...skeletonStyle, height: 80, width: '100%' }} />
                  </div>
                ) : venue?.equipment?.length > 0 ? (
                  <div className={styles.equipmentGrid}>
                    {venue.equipment.map((item) => (
                      <article className={styles.equipmentCard} key={item.id}>
                        {item.image ? (
                          <img
                            alt={item.name}
                            className={`${styles.equipmentImage} ${styles.clickableImage}`}
                            onClick={() =>
                              openLightbox(
                                equipmentImages,
                                Math.max(0, equipmentImages.findIndex((image) => image === item.image)),
                                'Equipment',
                              )
                            }
                            src={item.image}
                            title="Click to view full size"
                          />
                        ) : null}
                        <div className={styles.equipmentBody}>
                          <h3 className={styles.equipmentName}>{item.name}</h3>
                          <p className={styles.equipmentText}>Specs: {item.specs}</p>
                          <p className={styles.equipmentText}>{item.description}</p>
                          <p className={styles.equipmentText}>Quantity: {item.quantity}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className={styles.sectionBody}>No equipment listed for this venue.</p>
                )}
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Images</h2>
                {fullDataLoading ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={`gallery-skeleton-${index}`} style={{ ...skeletonStyle, width: 120, height: 90 }} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.thumbnailGrid}>
                    {safeThumbnails.map((image, index) => (
                      <div key={`${venueId}-thumb-wrap-${index}`} style={{ background: '#f0f0f0', borderRadius: 8 }}>
                        <img
                          alt={`${venue?.name} thumbnail ${index + 1}`}
                          className={`${styles.thumbnailImage} ${styles.clickableImage}`}
                          key={`${venueId}-thumb-${index}`}
                          onError={() =>
                            setGalleryLoadedMap((previous) => ({
                              ...previous,
                              [index]: true,
                            }))
                          }
                          onLoad={() =>
                            setGalleryLoadedMap((previous) => ({
                              ...previous,
                              [index]: true,
                            }))
                          }
                          onClick={() => openLightbox(safeThumbnails, index, 'Gallery')}
                          src={image}
                          style={{ opacity: galleryLoadedMap[index] ? 1 : 0, transition: 'opacity 0.3s ease' }}
                          title="Click to view full size"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>

      {lightbox.open && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button
            aria-label="Close"
            className={styles.lightboxClose}
            onClick={(event) => {
              event.stopPropagation()
              closeLightbox()
            }}
            type="button"
          >
            ✕
          </button>

          {lightbox.images.length > 1 ? (
            <div className={styles.lightboxCounter}>
              {lightbox.currentIndex + 1} / {lightbox.images.length}
            </div>
          ) : null}

          <div className={styles.lightboxTitle}>{lightbox.title}</div>

          <div
            className={styles.lightboxContent}
            onClick={(event) => {
              event.stopPropagation()
            }}
            role="presentation"
          >
            {lightbox.images.length > 1 ? (
              <button
                aria-label="Previous"
                className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`}
                onClick={prevImage}
                type="button"
              >
                ‹
              </button>
            ) : null}

            <img
              alt={`${lightbox.title} ${lightbox.currentIndex + 1}`}
              className={styles.lightboxImage}
              src={lightbox.images[lightbox.currentIndex]}
            />

            {lightbox.images.length > 1 ? (
              <button
                aria-label="Next"
                className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`}
                onClick={nextImage}
                type="button"
              >
                ›
              </button>
            ) : null}
          </div>

          {lightbox.images.length > 1 ? (
            <div
              className={styles.lightboxThumbnails}
              onClick={(event) => {
                event.stopPropagation()
              }}
              role="presentation"
            >
              {lightbox.images.map((image, index) => (
                <img
                  alt={`thumb ${index + 1}`}
                  className={
                    index === lightbox.currentIndex
                      ? `${styles.lightboxThumb} ${styles.lightboxThumbActive}`
                      : styles.lightboxThumb
                  }
                  key={image + String(index)}
                  onClick={() =>
                    setLightbox((previous) => ({
                      ...previous,
                      currentIndex: index,
                    }))
                  }
                  src={image}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

    </div>
  )
}
