import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "./PageHeader";
import Sidebar from "./Sidebar";
import styles from "./AddFacilityPage.module.css";

const INVENTORY_CONDITIONS = ["Good", "Needs Repair", "Out of Service"];
const FACILITY_TYPES = ["Seminar Hall", "Conference Room", "Lab", "Auditorium", "Classroom", "Studio"];

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

  const [facilityName, setFacilityName] = useState("");
  const [facilityType, setFacilityType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [rules, setRules] = useState("");
  const [bannerImage, setBannerImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [amenities, setAmenities] = useState(AMENITY_PRESET);

  const [inventoryRows, setInventoryRows] = useState([createInventoryRow("inv-1"), createInventoryRow("inv-2")]);
  const [equipmentRows, setEquipmentRows] = useState([createEquipmentRow("eq-1"), createEquipmentRow("eq-2")]);

  const inventoryId = useRef(3);
  const equipmentId = useRef(3);
  const publishTimeoutRef = useRef(null);

  const hiddenBannerInput = useRef(null);
  const hiddenGalleryInput = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");

  const selectedAmenityCount = useMemo(() => amenities.filter((item) => item.selected).length, [amenities]);

  useEffect(() => {
    return () => {
      if (publishTimeoutRef.current) {
        window.clearTimeout(publishTimeoutRef.current);
      }
    };
  }, []);

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

  const onSelectBanner = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setBannerImage(URL.createObjectURL(file));
  };

  const onSelectGallery = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }
    const previews = files.map((file) => URL.createObjectURL(file));
    setGalleryImages((prev) => [...prev, ...previews].slice(0, 8));
  };

  const onDropGallery = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    if (!files.length) {
      return;
    }
    const previews = files.map((file) => URL.createObjectURL(file));
    setGalleryImages((prev) => [...prev, ...previews].slice(0, 8));
  };

  const onEquipmentImage = (rowId, file) => {
    if (!file) {
      return;
    }
    updateEquipmentRow(rowId, "image", URL.createObjectURL(file));
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
    setAmenities(AMENITY_PRESET.map((item) => ({ ...item })));
    setInventoryRows([createInventoryRow("inv-1"), createInventoryRow("inv-2")]);
    setEquipmentRows([createEquipmentRow("eq-1"), createEquipmentRow("eq-2")]);
    inventoryId.current = 3;
    equipmentId.current = 3;
  };

  const openPublishModal = () => {
    setSubmitStatus("idle");
    setIsModalOpen(true);
  };

  const closePublishModal = () => {
    if (submitStatus === "submitting") {
      return;
    }
    if (publishTimeoutRef.current) {
      window.clearTimeout(publishTimeoutRef.current);
      publishTimeoutRef.current = null;
    }
    setIsModalOpen(false);
    setSubmitStatus("idle");
  };

  const confirmPublish = () => {
    if (submitStatus === "submitting") {
      return;
    }

    setSubmitStatus("submitting");
    publishTimeoutRef.current = window.setTimeout(() => {
      setSubmitStatus("success");
      publishTimeoutRef.current = null;
    }, 1500);
  };

  const handleAddAnotherFacility = () => {
    resetForm();
    setIsModalOpen(false);
    setSubmitStatus("idle");
  };

  const handleViewFacilities = () => {
    setIsModalOpen(false);
    setSubmitStatus("idle");
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
                  <h1 className={styles.pageTitle}>Add New Facility</h1>
                  <p className={styles.pageSubtitle}>Create a new space for students and staff to book.</p>
                </div>
              </div>

              <div className={styles.topActions}>
                <button className={styles.btnSecondary} onClick={() => navigate("/facilities")} type="button">Cancel</button>
                <button className={styles.btnPrimary} onClick={openPublishModal} type="button">
                  <span className="material-icons">check</span>
                  Publish Facility
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
                      <input className={styles.input} onChange={(event) => setFacilityName(event.target.value)} placeholder="e.g. Main Auditorium" type="text" value={facilityName} />
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
                    {bannerImage ? <img alt="Banner" className={styles.bannerPreview} src={bannerImage} /> : <span className="material-icons">add_photo_alternate</span>}
                  </button>
                  <input accept="image/*" className={styles.hide} onChange={onSelectBanner} ref={hiddenBannerInput} type="file" />
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
                    <span className={styles.galleryMain}>Click to upload photos</span>
                    <span className={styles.gallerySub}>or drag and drop multiple images (PNG, JPG, SVG up to 5MB)</span>
                    <input accept="image/*" className={styles.hide} multiple onChange={onSelectGallery} ref={hiddenGalleryInput} type="file" />
                  </label>

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
                </section>
              </aside>
            </section>
          </main>
        </div>
      </div>

      {isModalOpen ? (
        <div className={styles.publishModalBackdrop} role="presentation">
          <div aria-modal="true" className={styles.publishModalCard} role="dialog">
            {submitStatus === "success" ? (
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
            ) : (
              <>
                <h3 className={styles.publishModalTitle}>Confirm Publication</h3>
                <p className={styles.publishModalMessage}>
                  Are you sure you want to publish this new facility and make it available for booking?
                </p>
                <div className={styles.publishModalActions}>
                  <button className={styles.publishBtnSecondary} onClick={closePublishModal} type="button">
                    Cancel
                  </button>
                  <button
                    className={styles.publishBtnPrimary}
                    disabled={submitStatus === "submitting"}
                    onClick={confirmPublish}
                    type="button"
                  >
                    {submitStatus === "submitting" ? "Publishing..." : "Confirm & Publish"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
