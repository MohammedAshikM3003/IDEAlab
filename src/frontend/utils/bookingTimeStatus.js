export function parseTimeStrToMinutes(timeStr) {
  if (!timeStr) return -1;
  const match = String(timeStr).match(/(\d{1,2})[:\s.]?(\d{2})?\s*(am|pm)?/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  let m = parseInt(match[2] || '0', 10);
  let p = (match[3] || '').toUpperCase();
  if (!p) {
    if (String(timeStr).toUpperCase().includes('PM')) p = 'PM';
    if (String(timeStr).toUpperCase().includes('AM')) p = 'AM';
  }
  if (p === 'PM' && h < 12) h += 12;
  if (p === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

export function getBookingTimeStatus(dateISO, startTimeStr, endTimeStr) {
  if (!dateISO) {
    return 'completed'; // Fallback if data is missing
  }

  const today = new Date();
  
  // Parse dateISO (e.g. "2026-08-05")
  const [year, month, day] = dateISO.split('-');
  const bookingDate = new Date(year, month - 1, day);
  bookingDate.setHours(0, 0, 0, 0);
  
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  todayDate.setHours(0, 0, 0, 0);

  if (bookingDate > todayDate) {
    return 'upcoming';
  }
  
  if (bookingDate < todayDate) {
    return 'completed';
  }

  // It is today. We need to check minutes.
  const currentMins = today.getHours() * 60 + today.getMinutes();
  const startMins = parseTimeStrToMinutes(startTimeStr);
  const endMins = parseTimeStrToMinutes(endTimeStr);

  if (startMins !== -1 && endMins !== -1) {
    if (currentMins < startMins) {
      return 'upcoming';
    } else if (currentMins >= startMins && currentMins <= endMins) {
      return 'in_progress';
    } else {
      return 'completed';
    }
  }

  return 'completed';
}
