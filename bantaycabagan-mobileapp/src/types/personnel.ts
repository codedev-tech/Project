export type PersonnelStatus = 'IN_FIELD' | 'AT_BASE' | 'OFF_DUTY';

export type Personnel = {
  id: string;
  name: string;
  unit: string;
  contact: string;
  status: PersonnelStatus;
  lastSeen: string;
  location: string;
};
