export const getGpsReadingStatus = (recordedAt?: string | null, now = Date.now()) => {
  const timestamp = recordedAt ? new Date(recordedAt).getTime() : NaN;
  // Use the fix timestamp, never the socket delivery or profile update time.
  if (!Number.isFinite(timestamp) || timestamp <= 0 || timestamp - now > 300_000) {
    return { label: 'GPS reading: unavailable', delayed: false };
  }
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  const delayed = seconds >= 30;
  const age = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return { label: `GPS reading: ${age} ago${delayed ? ' · Delayed' : ''}`, delayed };
};
