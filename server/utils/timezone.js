/**
 * Timezone Utility for IST (Indian Standard Time)
 * IST is UTC+5:30
 */

// Get current date and time in IST
export const getCurrentISTTime = () => {
  const now = new Date();
  // Get UTC time and add IST offset
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istTime = new Date(utcTime + istOffset);
  return istTime;
};

// Get current date in IST (without time)
export const getCurrentISTDate = () => {
  const istTime = getCurrentISTTime();
  istTime.setHours(0, 0, 0, 0);
  return istTime;
};

// Convert any date to IST
export const toIST = (date) => {
  if (!date) return null;
  const d = new Date(date);
  // Get UTC time and add IST offset
  const utcTime = d.getTime() + (d.getTimezoneOffset() * 60 * 1000);
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(utcTime + istOffset);
};

// Get IST time string (HH:MM format)
export const getISTTimeString = (date = new Date()) => {
  const istDate = toIST(date);
  const hours = String(istDate.getHours()).padStart(2, '0');
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Get IST date string (YYYY-MM-DD format)
export const getISTDateString = (date = new Date()) => {
  const istDate = toIST(date);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get day name in IST
export const getISTDayName = (date = new Date()) => {
  const istDate = toIST(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[istDate.getDay()];
};

// Format date for display (IST)
export const formatISTDateTime = (date = new Date()) => {
  const istDate = toIST(date);
  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Check if time is between two times (HH:MM format)
export const isTimeBetween = (currentTime, startTime, endTime) => {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return current >= start && current <= end;
};

// Convert HH:MM to minutes since midnight
export const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes since midnight to HH:MM
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Calculate duration between two times in minutes
export const calculateDuration = (startTime, endTime) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return end - start;
};

// Get start and end of day in IST
export const getISTDayBounds = (date = new Date()) => {
  const istDate = toIST(date);
  const startOfDay = new Date(istDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  
  const endOfDay = new Date(istDate);
  endOfDay.setUTCHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

// Check if a date is today in IST
export const isToday = (date) => {
  const today = getISTDateString();
  const checkDate = getISTDateString(date);
  return today === checkDate;
};

// Get relative time string (e.g., "2 hours ago")
export const getRelativeTime = (date) => {
  const now = getCurrentISTTime();
  const past = toIST(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
};

export default {
  getCurrentISTTime,
  getCurrentISTDate,
  toIST,
  getISTTimeString,
  getISTDateString,
  getISTDayName,
  formatISTDateTime,
  isTimeBetween,
  timeToMinutes,
  minutesToTime,
  calculateDuration,
  getISTDayBounds,
  isToday,
  getRelativeTime
};
