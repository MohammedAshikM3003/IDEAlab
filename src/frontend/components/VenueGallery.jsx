import React, { useState } from 'react';
import s from '../VenueDetailPage.module.css';

export default function VenueGallery({ venue, onOpenLightbox }) {
  const images = [];
  if (venue.bannerImage) images.push(venue.bannerImage);
  if (venue.gallery && Array.isArray(venue.gallery)) {
    venue.gallery.forEach(img => {
      if (!images.includes(img)) images.push(img);
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // If there are no images at all, or if the active image fails to load
  if (images.length === 0 || imageError) {
    return (
      <div className={s.galleryPlaceholder}>
        <span className="material-icons" style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '12px' }}>
          {imageError ? 'broken_image' : 'photo_library'}
        </span>
        <h3 style={{ color: '#4b5563', fontSize: '1.25rem', fontWeight: '600', margin: '0 0 4px 0' }}>
          {imageError ? 'Image Unavailable' : 'Photos coming soon'}
        </h3>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
          {imageError ? 'The image could not be loaded.' : 'We are currently updating our gallery for this venue.'}
        </p>
      </div>
    );
  }

  return (
    <div className={s.galleryContainer}>
      <div 
        className={s.hero} 
        style={{ cursor: 'pointer', position: 'relative' }}
        onClick={() => onOpenLightbox(images, activeIndex, 'Gallery')}
      >
        <img
          alt={venue.name}
          className={s.heroImg}
          src={images[activeIndex]}
          onError={() => setImageError(true)}
        />
        <div className={s.expandOverlay}>
           <span className="material-icons">open_in_full</span>
        </div>
      </div>

      {images.length > 1 && (
        <div className={s.thumbRow}>
          {images.map((thumb, index) => (
            <div 
              className={index === activeIndex ? s.thumbOn : s.thumb} 
              key={index}
              onClick={() => {
                setActiveIndex(index);
                setImageError(false); // Reset error state when switching images
              }}
              role="button"
              tabIndex={0}
            >
              <img
                alt={`Thumbnail ${index + 1}`}
                className={s.thumbImg}
                src={thumb}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
