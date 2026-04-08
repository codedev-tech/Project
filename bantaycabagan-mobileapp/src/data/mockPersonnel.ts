import { Personnel } from '../types/personnel';

export const MOCK_PERSONNEL: Personnel[] = [
  {
    id: 'P-1001',
    name: 'SPO1 Juan dela Cruz',
    unit: 'Traffic Unit',
    contact: '09171234567',
    status: 'IN_FIELD',
    lastSeen: '2026-04-08T07:30:00.000Z',
    location: 'Centro 1, Cabagan',
  },
  {
    id: 'P-1002',
    name: 'Cpl. Maria Santos',
    unit: 'Patrol Unit',
    contact: '09181234567',
    status: 'AT_BASE',
    lastSeen: '2026-04-08T07:20:00.000Z',
    location: 'Municipal Hall Outpost',
  },
  {
    id: 'P-1003',
    name: 'PO2 Kevin Ramos',
    unit: 'Quick Response Team',
    contact: '09191234567',
    status: 'OFF_DUTY',
    lastSeen: '2026-04-08T03:45:00.000Z',
    location: 'San Fermin, Cabagan',
  },
  {
    id: 'P-1004',
    name: 'PO1 Alyssa Flores',
    unit: 'Patrol Unit',
    contact: '09201234567',
    status: 'IN_FIELD',
    lastSeen: '2026-04-08T07:26:00.000Z',
    location: 'Catabayungan, Cabagan',
  },
];
