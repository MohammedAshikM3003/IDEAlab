import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import venuesData from '../data/venuesData.js'
import PageHeader from './PageHeader'
import Sidebar from './Sidebar'
import styles from './FacilityVenueDetailPage.module.css'

const createEquipmentRow = (item = {}) => ({
  name: item.name || '',
  specs: item.specs || '',
  description: item.description || '',
  quantity: item.quantity ?? '',
  image: item.image || '',
})

const createEditableVenue = (baseVenue) => ({
  name: baseVenue.name || '',
  location: baseVenue.location || '',
  capacity: baseVenue.capacity ?? '',
  size: baseVenue.size || '',
  description: baseVenue.description || '',
  amenities: Array.isArray(baseVenue.amenities) ? [...baseVenue.amenities] : [],
  equipment: Array.isArray(baseVenue.equipment)
    ? baseVenue.equipment.map((item) => createEquipmentRow(item))
    : [],
  images: {
    hero: baseVenue.images?.hero || '',
    thumbnails: Array.isArray(baseVenue.images?.thumbnails) ? [...baseVenue.images.thumbnails] : [],
  },
})

export default function FacilityVenueDetailPage() {
  const navigate = useNavigate()
  const { venueId } = useParams()
  const venue = useMemo(() => venuesData.find((v) => v.id === venueId), [venueId])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [amenityInput, setAmenityInput] = useState('')
  const heroInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const objectUrlsRef = useRef([])
  const [savedVenueEdits, setSavedVenueEdits] = useState({})

  const baseVenueData = useMemo(() => (venue ? createEditableVenue(venue) : null), [venue])
  const venueData = savedVenueEdits[venueId] || baseVenueData
  const [draftVenue, setDraftVenue] = useState(null)

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!isEditModalOpen) return undefined

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsEditModalOpen(false)
        setDraftVenue(null)
        setAmenityInput('')
        setActiveTab('details')
      }
    }

    window.addEventListener('keydown', handleEscape)

    return () => window.removeEventListener('keydown', handleEscape)
  }, [isEditModalOpen])

  const registerObjectUrl = (file) => {
    const objectUrl = URL.createObjectURL(file)
    objectUrlsRef.current.push(objectUrl)
    return objectUrl
  }

  const safeThumbnails = useMemo(() => venueData?.images?.thumbnails || [], [venueData])

  const openEditModal = () => {
    if (!venueData) return
    const editable = JSON.parse(JSON.stringify(venueData))
    const heroImage = editable.heroImage || editable.images?.hero || ''
    const gallery = Array.isArray(editable.gallery)
      ? [...editable.gallery]
      : Array.isArray(editable.images?.thumbnails)
        ? [...editable.images.thumbnails]
        : []

    setDraftVenue({
      ...editable,
      heroImage,
      gallery,
    })
    setAmenityInput('')
    setActiveTab('details')
    setIsEditModalOpen(true)
  }

  const handleDiscardModalChanges = () => {
    setIsEditModalOpen(false)
    setDraftVenue(null)
    setAmenityInput('')
    setActiveTab('details')
  }

  const handleSaveChanges = (event) => {
    event.preventDefault()
    if (!draftVenue || !draftVenue.name.trim() || !draftVenue.location.trim()) return

    const cleanedHeroImage = draftVenue.heroImage || draftVenue.images?.hero || ''
    const cleanedGallery = Array.isArray(draftVenue.gallery)
      ? draftVenue.gallery
      : Array.isArray(draftVenue.images?.thumbnails)
        ? draftVenue.images.thumbnails
        : []

    setSavedVenueEdits((prev) => ({
      ...prev,
      [venueId]: {
        ...draftVenue,
        name: draftVenue.name.trim(),
        location: draftVenue.location.trim(),
        size: draftVenue.size.trim(),
        description: draftVenue.description.trim(),
        amenities: draftVenue.amenities.map((item) => item.trim()).filter(Boolean),
        equipment: draftVenue.equipment.map((item) => ({
          ...item,
          name: item.name.trim(),
          specs: item.specs.trim(),
          description: item.description.trim(),
        })),
        images: {
          hero: cleanedHeroImage,
          thumbnails: cleanedGallery,
        },
        heroImage: cleanedHeroImage,
        gallery: cleanedGallery,
      },
    }))

    setIsEditModalOpen(false)
    setDraftVenue(null)
    setAmenityInput('')
  }

  const handleDraftFieldChange = (field, value) => {
    setDraftVenue((prev) => ({ ...prev, [field]: value }))
  }

  const addAmenity = () => {
    const trimmed = amenityInput.trim()
    if (!trimmed) return

    setDraftVenue((prev) => ({
      ...prev,
      amenities: [...prev.amenities, trimmed],
    }))

    setAmenityInput('')
  }

  const removeAmenity = (indexToRemove) => {
    setDraftVenue((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, index) => index !== indexToRemove),
    }))
  }

  const updateEquipmentField = (equipmentIndex, field, value) => {
    setDraftVenue((prev) => ({
      ...prev,
      equipment: prev.equipment.map((item, index) =>
        index === equipmentIndex
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }))
  }

  const addEquipmentRow = () => {
    setDraftVenue((prev) => ({
      ...prev,
      equipment: [...prev.equipment, createEquipmentRow({ quantity: 1 })],
    }))
  }

  const removeEquipmentRow = (equipmentIndex) => {
    setDraftVenue((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((_, index) => index !== equipmentIndex),
    }))
  }

  const handleEquipmentImageChange = (equipmentIndex, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const objectUrl = registerObjectUrl(file)

    setDraftVenue((prev) => ({
      ...prev,
      equipment: prev.equipment.map((item, index) =>
        index === equipmentIndex
          ? {
              ...item,
              image: objectUrl,
            }
          : item,
      ),
    }))

    // reset so the same file can be chosen again if needed
    event.target.value = ''
  }

  const handleHeroImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const objectUrl = registerObjectUrl(file)

    setDraftVenue((prev) => ({
      ...prev,
      heroImage: objectUrl,
    }))

    event.target.value = ''
  }

  const handleGalleryImagesChange = (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const objectUrls = files.map((file) => registerObjectUrl(file))

    setDraftVenue((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), ...objectUrls],
    }))

    event.target.value = ''
  }

  const removeGalleryImage = (indexToRemove) => {
    setDraftVenue((prev) => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, index) => index !== indexToRemove),
    }))
  }

  const heroPreviewSrc = draftVenue?.heroImage || draftVenue?.images?.hero || ''
  const galleryImages =
    draftVenue?.gallery || (Array.isArray(draftVenue?.images?.thumbnails) ? draftVenue.images.thumbnails : [])

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
                  <h1 className={styles.notFoundTitle}>Venue not found</h1>
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

                <button className={styles.editButton} onClick={openEditModal} type="button">
                  Edit Details
                </button>
              </div>

              <section className={styles.headerSection}>
                <h1 className={styles.venueName}>{venueData?.name}</h1>
                <p className={styles.venueMeta}>{venueData?.location}</p>
              </section>

              <section className={styles.statsRow}>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Capacity</p>
                  <p className={styles.statValue}>{venueData?.capacity}</p>
                </div>
                <div className={styles.statCard}>
                  <p className={styles.statLabel}>Size</p>
                  <p className={styles.statValue}>{venueData?.size}</p>
                </div>
              </section>

              <section className={styles.heroSection}>
                <img alt={venueData?.name} className={styles.heroImage} src={venueData?.images?.hero} />
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Description</h2>
                <p className={styles.sectionBody}>{venueData?.description}</p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Amenities</h2>
                <div className={styles.amenitiesWrap}>
                  {venueData?.amenities?.map((amenity) => (
                    <span className={styles.amenityTag} key={amenity}>
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Equipment</h2>
                {venueData?.equipment?.length > 0 ? (
                  <div className={styles.equipmentGrid}>
                    {venueData.equipment.map((item) => (
                      <article className={styles.equipmentCard} key={item.id}>
                        {item.image ? (
                          <img alt={item.name} className={styles.equipmentImage} src={item.image} />
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
                <div className={styles.thumbnailGrid}>
                  {safeThumbnails.map((image, index) => (
                    <img
                      alt={`${venueData?.name} thumbnail ${index + 1}`}
                      className={styles.thumbnailImage}
                      key={`${venueId}-thumb-${index}`}
                      src={image}
                    />
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {isEditModalOpen ? (
        <div className={styles.modalOverlay} onClick={handleDiscardModalChanges} role="presentation">
          <div
            className={styles.modalBox}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Edit Venue Details</h3>
              <div className={styles.tabRow}>
                <button
                  type="button"
                  className={
                    activeTab === 'details'
                      ? `${styles.tabButton} ${styles.tabButtonActive}`
                      : styles.tabButton
                  }
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  type="button"
                  className={
                    activeTab === 'amenities'
                      ? `${styles.tabButton} ${styles.tabButtonActive}`
                      : styles.tabButton
                  }
                  onClick={() => setActiveTab('amenities')}
                >
                  Amenities &amp; Equipment
                </button>
                <button
                  type="button"
                  className={
                    activeTab === 'images'
                      ? `${styles.tabButton} ${styles.tabButtonActive}`
                      : styles.tabButton
                  }
                  onClick={() => setActiveTab('images')}
                >
                  Images
                </button>
              </div>
            </div>
            <form className={styles.modalForm} onSubmit={handleSaveChanges}>
              <div className={styles.modalBody}>
                {activeTab === 'details' && (
                  <>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="venue-name">
                        Venue Name
                      </label>
                      <input
                        id="venue-name"
                        className={styles.textInput}
                        type="text"
                        value={draftVenue?.name || ''}
                        onChange={(event) => handleDraftFieldChange('name', event.target.value)}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="venue-location">
                        Location
                      </label>
                      <input
                        id="venue-location"
                        className={styles.textInput}
                        type="text"
                        value={draftVenue?.location || ''}
                        onChange={(event) => handleDraftFieldChange('location', event.target.value)}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <div className={styles.fieldRowTwoColumn}>
                        <div>
                          <label className={styles.fieldLabel} htmlFor="venue-capacity">
                            Capacity
                          </label>
                          <input
                            id="venue-capacity"
                            className={styles.textInput}
                            type="number"
                            min="0"
                            value={draftVenue?.capacity || ''}
                            onChange={(event) => handleDraftFieldChange('capacity', event.target.value)}
                          />
                        </div>
                        <div>
                          <label className={styles.fieldLabel} htmlFor="venue-size">
                            Size
                          </label>
                          <input
                            id="venue-size"
                            className={styles.textInput}
                            type="text"
                            value={draftVenue?.size || ''}
                            onChange={(event) => handleDraftFieldChange('size', event.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="venue-description">
                        Description
                      </label>
                      <textarea
                        id="venue-description"
                        className={`${styles.textInput} ${styles.textarea}`}
                        rows={5}
                        value={draftVenue?.description || ''}
                        onChange={(event) => handleDraftFieldChange('description', event.target.value)}
                      />
                    </div>
                  </>
                )}

                {activeTab === 'amenities' && (
                  <>
                    <div className={styles.modalSubSection}>
                      <h4 className={styles.subSectionLabel}>Amenities</h4>
                      <div className={styles.amenitiesPillsRow}>
                        {draftVenue?.amenities?.map((amenity, index) => (
                          <span className={styles.amenityPill} key={`${amenity}-${index}`}>
                            <span className={styles.amenityText}>{amenity}</span>
                            <button
                              type="button"
                              className={styles.amenityRemoveButton}
                              onClick={() => removeAmenity(index)}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className={styles.amenitiesInputRow}>
                        <input
                          className={styles.textInput}
                          type="text"
                          placeholder="Add amenity"
                          value={amenityInput}
                          onChange={(event) => setAmenityInput(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              addAmenity()
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.addAmenityButton}
                          onClick={addAmenity}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className={styles.modalSectionDivider} />

                    <div className={styles.modalSubSection}>
                      <h4 className={styles.subSectionLabel}>Equipment</h4>
                      {draftVenue?.equipment?.map((item, index) => (
                        <div className={styles.equipmentEditCard} key={`equipment-${index}`}>
                          <div className={styles.fieldRowTwoColumn}>
                            <div>
                              <label className={styles.fieldLabel} htmlFor={`equipment-name-${index}`}>
                                Name
                              </label>
                              <input
                                id={`equipment-name-${index}`}
                                className={styles.textInput}
                                type="text"
                                value={item.name}
                                onChange={(event) =>
                                  updateEquipmentField(index, 'name', event.target.value)
                                }
                              />
                            </div>
                            <div>
                              <label className={styles.fieldLabel} htmlFor={`equipment-specs-${index}`}>
                                Specs
                              </label>
                              <input
                                id={`equipment-specs-${index}`}
                                className={styles.textInput}
                                type="text"
                                value={item.specs}
                                onChange={(event) =>
                                  updateEquipmentField(index, 'specs', event.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel} htmlFor={`equipment-description-${index}`}>
                              Description
                            </label>
                            <textarea
                              id={`equipment-description-${index}`}
                              className={`${styles.textInput} ${styles.textarea} ${styles.equipmentTextarea}`}
                              rows={3}
                              value={item.description}
                              onChange={(event) =>
                                updateEquipmentField(index, 'description', event.target.value)
                              }
                            />
                          </div>

                          {item.image ? (
                            <img
                              alt={`${item.name || 'Equipment'} image`}
                              className={styles.equipmentImagePreview}
                              src={item.image}
                            />
                          ) : null}

                          <div className={styles.equipmentImageRow}>
                            <input
                              id={`equipment-image-${index}`}
                              accept="image/*"
                              className={styles.fileInputHidden}
                              type="file"
                              onChange={(event) => handleEquipmentImageChange(index, event)}
                            />
                            <button
                              type="button"
                              className={styles.imageChangeButton}
                              onClick={() => {
                                const input = document.getElementById(`equipment-image-${index}`)
                                if (input) {
                                  input.click()
                                }
                              }}
                            >
                              {item.image ? 'Change Image' : 'Add Image'}
                            </button>
                          </div>

                          <div className={styles.equipmentBottomRow}>
                            <div>
                              <label
                                className={styles.fieldLabel}
                                htmlFor={`equipment-quantity-${index}`}
                              >
                                Quantity
                              </label>
                              <input
                                id={`equipment-quantity-${index}`}
                                className={`${styles.textInput} ${styles.quantityInput}`}
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(event) =>
                                  updateEquipmentField(index, 'quantity', event.target.value)
                                }
                              />
                            </div>
                            <button
                              type="button"
                              className={styles.equipmentRemoveButton}
                              onClick={() => removeEquipmentRow(index)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className={styles.addEquipmentButton}
                        onClick={addEquipmentRow}
                      >
                        + Add Equipment
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'images' && (
                  <>
                    <div className={styles.modalSubSection}>
                      <h4 className={styles.subSectionLabel}>Hero Image</h4>
                      {heroPreviewSrc ? (
                        <img
                          alt="Hero preview"
                          className={styles.heroPreview}
                          src={heroPreviewSrc}
                        />
                      ) : null}
                      <input
                        accept="image/*"
                        className={styles.fileInputHidden}
                        type="file"
                        ref={heroInputRef}
                        onChange={handleHeroImageChange}
                      />
                      <button
                        type="button"
                        className={styles.imageChangeButton}
                        onClick={() => heroInputRef.current?.click()}
                      >
                        Change Image
                      </button>
                    </div>

                    <div className={styles.modalSectionDivider} />

                    <div className={styles.modalSubSection}>
                      <h4 className={styles.subSectionLabel}>Gallery Images</h4>
                      <div className={styles.galleryGrid}>
                        {galleryImages.map((image, index) => (
                          <div className={styles.galleryItem} key={`gallery-${index}`}>
                            <img
                              alt={`Gallery ${index + 1}`}
                              className={styles.galleryImage}
                              src={image}
                            />
                            <button
                              type="button"
                              className={styles.galleryRemoveButton}
                              onClick={() => removeGalleryImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <input
                        accept="image/*"
                        className={styles.fileInputHidden}
                        type="file"
                        multiple
                        ref={galleryInputRef}
                        onChange={handleGalleryImagesChange}
                      />
                      <button
                        type="button"
                        className={styles.addImagesButton}
                        onClick={() => galleryInputRef.current?.click()}
                      >
                        + Add Images
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.footerButtonCancel}
                  onClick={handleDiscardModalChanges}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.footerButtonSave}
                  disabled={!draftVenue?.name?.trim() || !draftVenue?.location?.trim()}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
