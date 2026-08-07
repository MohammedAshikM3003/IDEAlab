const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const FALLBACK_FACILITY_IMAGE = "https://placehold.co/800x450?text=Facility";

export const normalizeImageUrl = (value) => {
  if (!value || value === '/placeholder-venue.jpg') return '';
  if (String(value).startsWith('http://') || String(value).startsWith('https://')) return value;
  if (String(value).startsWith('/')) return `${API_URL}${value}`;
  return value;
};

export const resolveVenueImageSrc = (value) => {
  const normalized = normalizeImageUrl(value);
  return normalized || FALLBACK_FACILITY_IMAGE;
};
