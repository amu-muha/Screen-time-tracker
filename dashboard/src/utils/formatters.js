export function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours === 0 && minutes === 0) return `${seconds}s`;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatDigitalTime(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0:00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n) => String(n).padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

export const CATEGORIES = [
  'Development',
  'Browsing',
  'Communication',
  'Productivity',
  'Entertainment',
  'System',
  'Other'
];

export const CATEGORY_COLORS = {
  Development: '#6366F1',
  Communication: '#F59E0B',
  Browsing: '#EC4899',
  Productivity: '#10B981',
  Entertainment: '#F43F5E',
  System: '#06B6D4',
  Other: '#8B5CF6',
  Uncategorized: '#A855F7'
};

export const CATEGORY_GRADIENTS = {
  Development: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  Communication: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
  Browsing: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  Productivity: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  Entertainment: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
  System: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
  Other: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
  Uncategorized: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)'
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
}

export function getCategoryGradient(category) {
  return CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.Other;
}

export function cleanAppName(name) {
  if (!name) return 'Unknown App';
  // Strip duplicate extensions e.g. "firefox_firefox" -> "Firefox"
  const clean = name.replace(/_.*$/, '').replace(/-/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
