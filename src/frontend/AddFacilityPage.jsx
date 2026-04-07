import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageHeader from "./PageHeader";
import Sidebar from "./Sidebar";
import styles from "./AddFacilityPage.module.css";

const INVENTORY_CONDITIONS = ["Good", "Fair", "Poor"];
const FACILITY_TYPES = ["Seminar Hall", "Conference Room", "Lab", "Auditorium", "Classroom", "Studio"];
const MAX_BANNER_SIZE_BYTES = 10 * 1024 * 1024;
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AMENITY_PRESET = [
  { id: "amenity-ac", name: "Air Conditioning", icon: "ac_unit", selected: true },
  { id: "amenity-projector", name: "Projector", icon: "videocam", selected: false },
  { id: "amenity-smartboard", name: "Smart Board", icon: "desktop_windows", selected: false },
  { id: "amenity-audio", name: "Audio System", icon: "speaker", selected: true },
  { id: "amenity-wifi", name: "High-Speed Wi-Fi", icon: "wifi", selected: true },
];

function createInventoryRow(id) {
  return { id, name: "", quantity: "", condition: "Good" };
}

function createEquipmentRow(id) {
  return { id, name: "", quantity: "", condition: "Good", description: "", image: null };
}

export default function AddFacilityPage({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const locationState = useLocation();

  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [rules, setRules] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState("");
  const [equipmentUploadError, setEquipmentUploadError] = useState("");
  const [amenities, setAmenities] = useState(AMENITY_PRESET);
  const [facilityNameError, setFacilityNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isVenueLoading, setIsVenueLoading] = useState(false);

  const [inventoryRows, setInventoryRows] = useState([createInventoryRow("inv-1"), createInventoryRow("inv-2")]);
  const [equipmentRows, setEquipmentRows] = useState([createEquipmentRow("eq-1"), createEquipmentRow("eq-2")]);

  const inventoryId = useRef(3);
  const equipmentId = useRef(3);

  const hiddenBannerInput = useRef(null);
  const hiddenGalleryInput = useRef(null);

  const searchParams = useMemo(() => new URLSearchParams(locationState.search), [locationState.search]);
  const venueId = searchParams.get("venueId") || "";

  const selectedAmenityCount = useMemo(() => amenities.filter((item) => item.selected).length, [amenities]);

  useEffect(() => {
    if (!submitError) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSubmitError("");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [submitError]);

  const updateInventoryRow = (rowId, key, value) => {
    setInventoryRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  };

  const updateEquipmentRow = (rowId, key, value) => {
    setEquipmentRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [key]: value } : row)));
  };

  const addInventoryRow = () => {
    const nextId = `inv-${inventoryId.current}`;
    inventoryId.current += 1;
    setInventoryRows((prev) => [...prev, createInventoryRow(nextId)]);
  };

  const addEquipmentRow = () => {
    const nextId = `eq-${equipmentId.current}`;
    equipmentId.current += 1;
    setEquipmentRows((prev) => [...prev, createEquipmentRow(nextId)]);
  };

  const removeInventoryRow = (rowId) => {
    setInventoryRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== rowId) : prev));
  };

  const removeEquipmentRow = (rowId) => {
    setEquipmentRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== rowId) : prev));
  };

  const onSelectBanner = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setBannerUploadError("Only image files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_BANNER_SIZE_BYTES) {
      setBannerUploadError("Banner image is too large. Max size is 10MB.");
      event.target.value = "";
      return;
    }

    setBannerUploadError("");
    setIsBannerUploading(true);

    try {
      const formData = new FormData();
      formData.append("banner", file);

      const response = await fetch(`${API_BASE_URL}/api/facilities/media/banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const rawText = await response.text();
      const payload = (() => {
        try {
          return rawText ? JSON.parse(rawText) : {};
        } catch {
          return { message: rawText };
        }
      })();

      if (!response.ok) {
        throw new Error(payload?.message || "Banner upload failed");
      }

      setBannerImage(`${API_BASE_URL}${payload.url}`);
    } catch (error) {
      setBannerUploadError(error.message || "Banner upload failed");
    } finally {
      setIsBannerUploading(false);
      event.target.value = "";
    }
  };

  const uploadFacilityImage = async (endpoint, formField, file) => {
    const formData = new FormData();
    formData.append(formField, file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const rawText = await response.text();
    const payload = (() => {
      try {
        return rawText ? JSON.parse(rawText) : {};
      } catch {
        return { message: rawText };
      }
    })();

    if (!response.ok) {
      throw new Error(payload?.message || "Image upload failed");
    }

    return `${API_BASE_URL}${payload.url}`;
  };

  const uploadGalleryFiles = async (files) => {
    if (!files.length) {
      return;
    }

    setGalleryUploadError("");
    setIsGalleryUploading(true);

    try {
      const validFiles = files
        .filter((file) => String(file.type || "").startsWith("image/"))
        .slice(0, Math.max(0, 8 - galleryImages.length));

      const uploadedUrls = [];
      for (const file of validFiles) {
        if (file.size > MAX_BANNER_SIZE_BYTES) {
          throw new Error("Each gallery image must be 10MB or smaller.");
        }
        const imageUrl = await uploadFacilityImage("/api/facilities/media/gallery", "gallery", file);
        uploadedUrls.push(imageUrl);
      }

      setGalleryImages((prev) => [...prev, ...uploadedUrls].slice(0, 8));
    } catch (error) {
      setGalleryUploadError(error.message || "Gallery upload failed");
    } finally {
      setIsGalleryUploading(false);
    }
  };

  const onSelectGallery = async (event) => {
    const files = Array.from(event.target.files || []);
    await uploadGalleryFiles(files);
    event.target.value = "";
  };

  const onDropGallery = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    await uploadGalleryFiles(files);
  };

  const onEquipmentImage = async (rowId, file) => {
    if (!file) {
      return;
    }

    if (!String(file.type || "").startsWith("image/")) {
      return;
    }

    if (file.size > MAX_BANNER_SIZE_BYTES) {
      setEquipmentUploadError("Each equipment image must be 10MB or smaller.");
      return;
    }

    try {
      setEquipmentUploadError("");
      const imageUrl = await uploadFacilityImage("/api/facilities/media/equipment", "equipment", file);
      updateEquipmentRow(rowId, "image", imageUrl);
    } catch (error) {
      setEquipmentUploadError(error.message || "Equipment image upload failed");
    }
  };

  const toggleAmenity = (amenityId) => {
    setAmenities((prev) => prev.map((item) => (item.id === amenityId ? { ...item, selected: !item.selected } : item)));
  };

  const addAmenityItem = () => {
    const name = window.prompt("Add amenity name");
    if (!name || !name.trim()) {
      return;
    }
    const key = name.trim().toLowerCase().replace(/\s+/g, "-");
    setAmenities((prev) => [
      ...prev,
      { id: `amenity-${key}-${Date.now()}`, name: name.trim(), icon: "check_circle", selected: false },
    ]);
  };

  const resetForm = () => {
    setFacilityName("");
    setFacilityType("");
    setCapacity("");
    setLocation("");
    setRules("");
    setBannerImage(null);
    setGalleryImages([]);
    setGalleryUploadError("");
    setEquipmentUploadError("");
    setAmenities(AMENITY_PRESET.map((item) => ({ ...item })));
    setInventoryRows([createInventoryRow("inv-1"), createInventoryRow("inv-2")]);
    setEquipmentRows([createEquipmentRow("eq-1"), createEquipmentRow("eq-2")]);
    setFacilityNameError("");
    setBannerUploadError("");
    setSubmitError("");
    inventoryId.current = 3;
    equipmentId.current = 3;
  };

  const normalizeImageUrl = (value) => {
    if (!value) {
      return "";
    }

    if (String(value).startsWith("http://") || String(value).startsWith("https://")) {
      return value;
    }

    if (String(value).startsWith("/")) {
      return `${API_BASE_URL}${value}`;
    }

    return value;
  };

  const normalizeCondition = (value) => {
    if (value === "Good" || value === "Fair" || value === "Poor") {
      return value;
    }

    return "Good";
  };

  useEffect(() => {
    const loadVenueForEdit = async () => {
      if (!venueId) {
        setIsVenueLoading(false);
        return;
      }

      setIsVenueLoading(true);
      setSubmitError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/venues/${venueId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const rawText = await response.text();
        const payload = (() => {
          try {
            return rawText ? JSON.parse(rawText) : {};
          } catch {
            return { message: rawText };
          }
        })();

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load facility data");
        }

        setFacilityName(payload?.name || "");
        setFacilityType(payload?.facilityType || "");
        setCapacity(payload?.capacity ? String(payload.capacity) : "");
        setLocation(payload?.location || "");
        setRules(payload?.description || "");
        setBannerImage(normalizeImageUrl(payload?.bannerImage));
        setGalleryImages(Array.isArray(payload?.gallery) ? payload.gallery.map((item) => normalizeImageUrl(item)).filter(Boolean) : []);

        const incomingAmenities = Array.isArray(payload?.amenities) ? payload.amenities : [];
        const existingAmenityNames = new Set(AMENITY_PRESET.map((item) => item.name));
        const presetWithSelection = AMENITY_PRESET.map((item) => ({
          ...item,
          selected: incomingAmenities.includes(item.name),
        }));
        const extraAmenities = incomingAmenities
          .filter((name) => !existingAmenityNames.has(name))
          .map((name) => ({
            id: `amenity-${String(name).toLowerCase().replace(/\s+/g, "-")}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name,
            icon: "check_circle",
            selected: true,
          }));
        setAmenities([...presetWithSelection, ...extraAmenities]);

        const mappedInventory = Array.isArray(payload?.inventory)
          ? payload.inventory.map((item, index) => ({
              id: `inv-${index + 1}`,
              name: item?.itemName || "",
              quantity: item?.quantity ? String(item.quantity) : "",
              condition: normalizeCondition(item?.condition),
            }))
          : [];
        setInventoryRows(mappedInventory.length ? mappedInventory : [createInventoryRow("inv-1")]);

        const mappedEquipment = Array.isArray(payload?.equipment)
          ? payload.equipment.map((item, index) => ({
              id: `eq-${index + 1}`,
              name: item?.itemDetails || "",
              quantity: item?.quantity ? String(item.quantity) : "",
              condition: normalizeCondition(item?.condition),
              description: item?.description || "",
              image: normalizeImageUrl(item?.image),
            }))
          : [];
        setEquipmentRows(mappedEquipment.length ? mappedEquipment : [createEquipmentRow("eq-1")]);

        inventoryId.current = (mappedInventory.length || 1) + 1;
        equipmentId.current = (mappedEquipment.length || 1) + 1;
      } catch (error) {
        setSubmitError(error.message || "Failed to load facility data");
      } finally {
        setIsVenueLoading(false);
      }
    };

    loadVenueForEdit();
  }, [venueId]);

  const mapInventoryCondition = (value) => {
    if (value === "Good" || value === "Fair" || value === "Poor") {
      return value;
    }

    return "Good";
  };

  const handlePublish = async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedName = facilityName.trim();
    if (!trimmedName) {
      setFacilityNameError("Facility name is required");
      setSubmitError("");
      return;
    }

    setFacilityNameError("");
    setIsSubmitting(true);
    setSubmitError("");

    const venueData = {
      name: trimmedName,
      facilityType: facilityType || "",
      capacity: capacity ? Number(capacity) : undefined,
      location: location || "",
      description: rules || "",
      inventory: inventoryRows.map((item) => ({
        itemName: item.name || "",
        quantity: item.quantity ? Number(item.quantity) : 0,
        condition: mapInventoryCondition(item.condition),
      })),
      equipment: equipmentRows.map((item) => ({
        image: item.image || "",
        itemDetails: item.name || "",
        quantity: item.quantity ? Number(item.quantity) : 0,
        condition: item.condition || "",
        description: item.description || "",
      })),
      amenities: amenities.filter((item) => item.selected).map((item) => item.name),
      bannerImage: bannerImage || "",
      gallery: galleryImages,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/venues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(venueData),
      });

      const rawText = await response.text();
      const payload = (() => {
        try {
          return rawText ? JSON.parse(rawText) : {};
        } catch {
          return { message: rawText };
        }
      })();

      if (!response.ok) {
        throw new Error(payload?.message || `Failed to publish (HTTP ${response.status})`);
      }

      setIsSuccessModalOpen(true);
    } catch (error) {
      setSubmitError(error.message || "Failed to publish facility. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAnotherFacility = () => {
    resetForm();
    setIsSuccessModalOpen(false);
  };

  const handleViewFacilities = () => {
    setIsSuccessModalOpen(false);
    navigate("/facilities");
  };

  return (
    <div className={styles.page}>
      <div className={styles.mainContainer}>
        <Sidebar activePage="facilities" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={styles.mainContent}>
          <PageHeader title="Facilities Management" setIsSidebarOpen={setIsSidebarOpen} />

          <main className={styles.content}>
            <header className={styles.topBar}>
              <div className={styles.topLeft}>
                <button aria-label="Back to Facilities" className={styles.backBtn} onClick={() => navigate("/facilities")} type="button">
                  <span className="material-icons">arrow_back</span>
                </button>
                <div>
                  <h1 className={styles.pageTitle}>{venueId ? "Edit Facility" : "Add New Facility"}</h1>
                  <p className={styles.pageSubtitle}>
                    {isVenueLoading
                      ? "Loading facility details..."
                      : venueId
                        ? "Update facility details fetched from database."
                        : "Create a new space for students and staff to book."}
                  </p>
                </div>
              </div>

              <div className={styles.topActions}>
                <button className={styles.btnSecondary} onClick={() => navigate("/facilities")} type="button">Cancel</button>
                <button className={styles.btnPrimary} disabled={isSubmitting} onClick={handlePublish} type="button">
                  <span className={`material-icons ${isSubmitting ? styles.spinning : ""}`}>{isSubmitting ? "autorenew" : "check"}</span>
                  {isSubmitting ? "Publishing..." : "Publish Facility"}
                </button>
              </div>
            </header>

            <section className={styles.layout}>
              <div className={styles.leftCol}>
                <section className={styles.card}>
                  <div className={styles.cardTitleRow}>
                    <span className={`material-icons ${styles.cardTitleIcon}`}>info</span>
                    <h2 className={styles.cardTitle}>Basic Information</h2>
                  </div>

                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span className={styles.label}>Facility Name</span>
                      <input
                        className={facilityNameError ? `${styles.input} ${styles.inputError}` : styles.input}
                        onChange={(event) => {
                          setFacilityName(event.target.value);
                          if (facilityNameError && event.target.value.trim()) {
                            setFacilityNameError("");
                          }
                        }}
                        placeholder="e.g. Main Auditorium"
                        type="text"
                        value={facilityName}
                      />
                      {facilityNameError ? <span className={styles.fieldError}>{facilityNameError}</span> : null}
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Facility Type</span>
                      <select className={styles.input} onChange={(event) => setFacilityType(event.target.value)} value={facilityType}>
                        <option value="">Select type...</option>
                        {FACILITY_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>Capacity (Persons)</span>
                      <input className={styles.input} min="0" onChange={(event) => setCapacity(event.target.value)} placeholder="e.g. 200" type="number" value={capacity} />
                    </label>

                    <label className={`${styles.field} ${styles.fieldFull}`}>
                      <span className={styles.label}>Location / Building</span>
                      <input className={styles.input} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Block A, 1st Floor, Wing B" type="text" value={location} />
                    </label>
                  </div>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardTitleRow}>
                    <span className={`material-icons ${styles.cardTitleIcon}`}>description</span>
                    <h2 className={styles.cardTitle}>Details &amp; Rules</h2>
                  </div>

                  <label className={styles.field}>
                    <span className={styles.label}>Description &amp; Booking Rules</span>
                    <textarea
                      className={styles.textarea}
                      maxLength={500}
                      onChange={(event) => setRules(event.target.value)}
                      placeholder="Describe the facility and list any booking rules, restrictions, or usage guidelines..."
                      rows={6}
                      value={rules}
                    />
                    <span className={styles.charCount}>{rules.length}/500 characters</span>
                  </label>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardTitleRowBetween}>
                    <div className={styles.cardTitleRowInner}>
                      <span className={`material-icons ${styles.cardTitleIcon}`}>inventory_2</span>
                      <h2 className={styles.cardTitle}>Inventory</h2>
                    </div>
                    <button className={styles.inlineAddBtn} onClick={addInventoryRow} type="button">
                      <span className="material-icons">add_circle_outline</span>
                      Add Item
                    </button>
                  </div>

                  <div className={styles.inventoryHead}>
                    <span>Item Name</span>
                    <span>Quantity</span>
                    <span>Condition</span>
                    <span className={styles.sr}>Actions</span>
                  </div>

                  <div className={styles.inventoryList}>
                    {inventoryRows.map((row) => (
                      <div className={styles.inventoryRow} key={row.id}>
                        <input className={styles.input} onChange={(event) => updateInventoryRow(row.id, "name", event.target.value)} placeholder="Standard Chairs" type="text" value={row.name} />
                        <input className={styles.input} min="0" onChange={(event) => updateInventoryRow(row.id, "quantity", event.target.value)} placeholder="150" type="number" value={row.quantity} />
                        <select className={styles.input} onChange={(event) => updateInventoryRow(row.id, "condition", event.target.value)} value={row.condition}>
                          {INVENTORY_CONDITIONS.map((condition) => (
                            <option key={condition} value={condition}>{condition}</option>
                          ))}
                        </select>
                        <button aria-label="Delete inventory item" className={styles.deleteBtn} onClick={() => removeInventoryRow(row.id)} type="button">
                          <span className="material-icons">delete_outline</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardTitleRowBetween}>
                    <div className={styles.cardTitleRowInner}>
                      <span className={`material-icons ${styles.cardTitleIcon}`}>handyman</span>
                      <h2 className={styles.cardTitle}>Equipment</h2>
                    </div>
                    <button className={styles.inlineAddBtn} onClick={addEquipmentRow} type="button">
                      <span className="material-icons">add_circle_outline</span>
                      Add Item
                    </button>
                  </div>

                  <div className={styles.equipmentScroll}>
                    <div className={styles.equipmentList}>
                      {equipmentRows.map((row) => (
                        <div className={styles.equipmentRow} key={row.id}>
                          <label className={styles.imageUpload}>
                            {row.image ? <img alt="Equipment" className={styles.uploadPreview} src={row.image} /> : <span className="material-icons">photo_camera</span>}
                            <input
                              accept="image/*"
                              className={styles.hide}
                              onChange={(event) => onEquipmentImage(row.id, event.target.files?.[0])}
                              type="file"
                            />
                          </label>

                          <div className={styles.equipmentFields}>
                            <div className={styles.equipmentTop}>
                              <input className={styles.input} onChange={(event) => updateEquipmentRow(row.id, "name", event.target.value)} placeholder="Item details" type="text" value={row.name} />
                              <input className={styles.inputSmall} min="0" onChange={(event) => updateEquipmentRow(row.id, "quantity", event.target.value)} placeholder="2" type="number" value={row.quantity} />
                              <select className={styles.inputSmall} onChange={(event) => updateEquipmentRow(row.id, "condition", event.target.value)} value={row.condition}>
                                {INVENTORY_CONDITIONS.map((condition) => (
                                  <option key={condition} value={condition}>{condition}</option>
                                ))}
                              </select>
                              <button aria-label="Delete equipment" className={styles.deleteBtn} onClick={() => removeEquipmentRow(row.id)} type="button">
                                <span className="material-icons">delete_outline</span>
                              </button>
                            </div>

                            <textarea
                              className={styles.textareaSmall}
                              onChange={(event) => updateEquipmentRow(row.id, "description", event.target.value)}
                              placeholder="Describe equipment usage and specifications."
                              rows={3}
                              value={row.description}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </div>

              <aside className={styles.rightCol}>
                <section className={styles.card}>
                  <div className={styles.cardTitleRow}>
                    <span className={`material-icons ${styles.cardTitleIcon}`}>image</span>
                    <h2 className={styles.cardTitle}>Featured Banner Image</h2>
                  </div>
                  <p className={styles.helper}>This image will appear on the landing page under Featured Venues.</p>

                  <button className={styles.bannerUpload} onClick={() => hiddenBannerInput.current?.click()} type="button">
                    {isBannerUploading ? (
                      <span className={styles.bannerUploading}>Uploading...</span>
                    ) : bannerImage ? (
                      <img alt="Banner" className={styles.bannerPreview} src={bannerImage} />
                    ) : (
                      <span className="material-icons">add_photo_alternate</span>
                    )}
                  </button>
                  <input accept="image/*" className={styles.hide} onChange={onSelectBanner} ref={hiddenBannerInput} type="file" />
                  {bannerUploadError ? <p className={styles.bannerUploadError}>{bannerUploadError}</p> : null}
                </section>

                <section className={styles.card}>
                  <div className={styles.cardTitleRow}>
                    <span className={`material-icons ${styles.cardTitleIcon}`}>image</span>
                    <h2 className={styles.cardTitle}>Facility Gallery</h2>
                  </div>
                  <p className={styles.helper}>Additional photos showing interior, layout, and equipment.</p>

                  <label
                    className={styles.galleryDrop}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={onDropGallery}
                  >
                    <span className={`material-icons ${styles.galleryIcon}`}>add_photo_alternate</span>
                    <span className={styles.galleryMain}>{isGalleryUploading ? "Uploading photos..." : "Click to upload photos"}</span>
                    <span className={styles.gallerySub}>or drag and drop multiple images (PNG, JPG, SVG up to 10MB each)</span>
                    <input accept="image/*" className={styles.hide} multiple onChange={onSelectGallery} ref={hiddenGalleryInput} type="file" />
                  </label>
                  {galleryUploadError ? <p className={styles.bannerUploadError}>{galleryUploadError}</p> : null}

                  <div className={styles.thumbGrid}>
                    {galleryImages.slice(0, 3).map((src, index) => (
                      <img alt={`Gallery ${index + 1}`} className={styles.thumb} key={src} src={src} />
                    ))}
                    <button className={styles.thumbAdd} onClick={() => hiddenGalleryInput.current?.click()} type="button">+ Add</button>
                  </div>
                </section>

                <section className={styles.card}>
                  <div className={styles.cardTitleRowBetween}>
                    <div className={styles.cardTitleRowInner}>
                      <span className={`material-icons ${styles.cardTitleIcon}`}>wifi</span>
                      <h2 className={styles.cardTitle}>Amenities</h2>
                    </div>
                    <button className={styles.inlineAddBtn} onClick={addAmenityItem} type="button">
                      <span className="material-icons">add_circle_outline</span>
                      Add Item
                    </button>
                  </div>

                  <div className={styles.amenityList}>
                    {amenities.map((item) => (
                      <button
                        className={`${styles.amenityItem} ${item.selected ? styles.amenityActive : ""}`}
                        key={item.id}
                        onClick={() => toggleAmenity(item.id)}
                        type="button"
                      >
                        <span className="material-icons">{item.selected ? "check_circle" : "radio_button_unchecked"}</span>
                        <span className={styles.amenityText}>{item.name}</span>
                        <span className={`material-icons ${styles.amenityRight}`}>{item.icon}</span>
                      </button>
                    ))}
                  </div>

                  <p className={styles.helper}>{selectedAmenityCount} amenities selected</p>
                  {equipmentUploadError ? <p className={styles.bannerUploadError}>{equipmentUploadError}</p> : null}
                </section>
              </aside>
            </section>
          </main>
        </div>
      </div>

      {isSuccessModalOpen ? (
        <div className={styles.publishModalBackdrop} role="presentation">
          <div aria-modal="true" className={styles.publishModalCard} role="dialog">
            <>
              <div className={styles.publishSuccessIconWrap}>
                <span className={`material-icons ${styles.publishSuccessIcon}`}>check</span>
              </div>
              <h3 className={styles.publishModalTitle}>Facility Published!</h3>
              <p className={styles.publishModalMessage}>Your new facility is now available for booking.</p>
              <div className={styles.publishModalActions}>
                <button className={styles.publishBtnSecondary} onClick={handleViewFacilities} type="button">
                  View Facilities List
                </button>
                <button className={styles.publishBtnPrimary} onClick={handleAddAnotherFacility} type="button">
                  Add Another Facility
                </button>
              </div>
            </>
          </div>
        </div>
      ) : null}

      {submitError ? <div className={styles.toastError}>{submitError}</div> : null}
    </div>
  );
}
