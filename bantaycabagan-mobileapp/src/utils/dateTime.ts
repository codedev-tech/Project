export const formatTimestamp = (iso: string): string => {
  const date = new Date(iso);

  return date.toLocaleString('en-PH', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
