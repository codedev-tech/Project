import type { OfficerMapPerson } from '../components/OfficerMapCanvas';

export const MOCK_MAP_PERSONNEL_COUNT = 96;
export const MOCK_MAP_UPDATE_INTERVAL_MS = 10_000;

export const isMapPreviewAvailable = (
  isDevelopment = __DEV__,
  setting = process.env.EXPO_PUBLIC_MAP_PREVIEW,
) => isDevelopment || setting === 'true';

const CLUSTER_CENTERS = [
  [17.4104, 121.8008], [17.3952, 121.8295],
  [17.3758, 121.8138], [17.4062, 121.8554],
  [17.3655, 121.8462], [17.4246, 121.7698],
  [17.3868, 121.7808], [17.3998, 121.8742],
];
const MOVEMENT_PATH = [[0, 0], [0.00016, 0.00010], [0.00028, 0], [0.00014, -0.00012]];

// Map-only fixtures: never added to operational context or sent to the backend.
export const createDevelopmentMapPersonnel = ({
  tick = 0,
  recordedAt = new Date().toISOString(),
} = {}): OfficerMapPerson[] => {
  const movement = MOVEMENT_PATH[Math.abs(tick) % MOVEMENT_PATH.length];
  return Array.from({ length: MOCK_MAP_PERSONNEL_COUNT }, (_, index) => {
    const clusterIndex = index % CLUSTER_CENTERS.length;
    const positionInCluster = Math.floor(index / CLUSTER_CENTERS.length);
    const [latitude, longitude] = CLUSTER_CENTERS[clusterIndex];
    const angle = positionInCluster / 12 * Math.PI * 2;
    const radius = 0.000035 + positionInCluster * 0.000012;
    const number = String(index + 1).padStart(3, '0');
    const vehicle = clusterIndex % 2 === 1;
    const movementScale = vehicle ? 4 : 1;
    return {
      id: `mock-map-personnel-${number}`,
      badge: `TEST-${number}`,
      name: `Test Officer ${number}`,
      rank: 'Simulated personnel',
      status: 'Test marker',
      photoUrl: '',
      latitude: latitude + Math.sin(angle) * radius + movement[0] * movementScale,
      longitude: longitude + Math.cos(angle) * radius + movement[1] * movementScale,
      speed: vehicle ? 24 : 6,
      batteryLevel: 70 + index % 30,
      locationName: `Test cluster ${clusterIndex + 1}`,
      locationRecordedAt: recordedAt,
      lastUpdated: recordedAt,
      source: 'map-preview',
      isSimulated: true,
      isOnDuty: true,
      isVisibleOnMap: true,
      isLocationStale: false,
      locationStatus: 'current',
      emergencyActive: index % 29 === 0,
      operationActive: index % 11 === 0,
      outsideBoundary: index % 31 === 0,
    };
  });
};
