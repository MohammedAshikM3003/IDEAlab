import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "./PageHeader";
import Sidebar from "./Sidebar";
import styles from "./FacilitiesAllPage.module.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FALLBACK_FACILITY_IMAGE = "https://placehold.co/800x450?text=Facility";

function resolveVenueImageSrc(value) {
  if (!value) {
    return FALLBACK_FACILITY_IMAGE;
  }

  if (String(value).startsWith("http://") || String(value).startsWith("https://")) {
    return value;
  }

  if (String(value).startsWith("/")) {
    return `${API_BASE}${value}`;
  }

  return value;
}

export default function FacilitiesAllPage({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/venues`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch venues");
      }

      const payload = await response.json();
      setVenues(Array.isArray(payload) ? payload : []);
    } catch {
      setError("Failed to load facilities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const filteredVenues = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) {
      return venues;
    }

    return venues.filter((venue) => String(venue?.name || "").toLowerCase().includes(keyword));
  }, [searchText, venues]);

  return (
    <div className={styles.page}>
      <div className={styles.mainContainer}>
        <Sidebar activePage="facilities" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <div className={styles.mainContent}>
          <PageHeader title="Facilities Management" setIsSidebarOpen={setIsSidebarOpen} />

          <main className={styles.content}>
            <div className={styles.headerRow}>
              <div>
                <h1 className={styles.pageTitle}>All Facilities</h1>
                <p className={styles.pageSubtitle}>Browse and manage all venues in one place.</p>
              </div>

              <button className={styles.btnAddFacility} onClick={() => navigate("/facilities/add")} type="button">
                <span className="material-icons">add</span>
                Add Facility
              </button>
            </div>

            <div className={styles.searchBarWrap}>
              <span className={`material-icons ${styles.searchIcon}`}>search</span>
              <input
                className={styles.searchInput}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search by venue name"
                type="text"
                value={searchText}
              />
            </div>

            {loading ? (
              <div className={styles.grid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div aria-hidden="true" className={styles.cardSkeleton} key={`skeleton-${index}`} />
                ))}
              </div>
            ) : null}

            {!loading && error ? (
              <div className={styles.statusWrap}>
                <p className={styles.statusText}>Failed to load facilities.</p>
                <button className={styles.btnRetry} onClick={fetchVenues} type="button">Retry</button>
              </div>
            ) : null}

            {!loading && !error && !filteredVenues.length ? (
              <div className={styles.statusWrap}>
                <p className={styles.statusText}>No facilities added yet.</p>
                <button className={styles.btnAddFacility} onClick={() => navigate("/facilities/add")} type="button">
                  <span className="material-icons">add</span>
                  Add Facility
                </button>
              </div>
            ) : null}

            {!loading && !error && filteredVenues.length ? (
              <div className={styles.grid}>
                {filteredVenues.map((venue) => (
                  <button className={styles.card} key={venue._id} onClick={() => navigate(`/facilities/venue/${venue._id}`)} type="button">
                    <div className={styles.cardImageWrap}>
                      <img
                        alt={venue.name}
                        className={styles.cardImage}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_FACILITY_IMAGE;
                        }}
                        src={resolveVenueImageSrc(venue.bannerImage)}
                      />
                      <span className={styles.cardStatus}>{venue.status || "active"}</span>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{venue.name}</h3>
                      <p className={styles.cardLocation}>{venue.location || "Location not set"}</p>

                      <div className={styles.cardStats}>
                        <span>{venue.currentOccupancy || 0}/{venue.capacity || 0} people</span>
                        <span>{venue.wifiStatus || "Good"} Wi-Fi</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
