export const formatReportDate = (value?: string) => value && Number.isFinite(new Date(value).getTime()) ? new Date(value).toLocaleString() : 'Not recorded';
export const reportHistoryLabel = (field: string) => ({ title: 'Title', description: 'Description', locationName: 'Place / landmark', reportType: 'Report type', barangayCode: 'Barangay', severity: 'Severity', incidentAt: 'Incident / activity time', locationSource: 'Location source', location: 'Coordinates', validationStatus: 'Review status', caseStatus: 'Case status', isIncident: 'Incident classification' }[field] || field);
export const historyValue = (value: unknown): string => {
  if (value == null || value === '') return 'Not recorded';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object' && 'coordinates' in value && Array.isArray(value.coordinates)) return [...value.coordinates].reverse().join(', ');
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return formatReportDate(value);
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
};
