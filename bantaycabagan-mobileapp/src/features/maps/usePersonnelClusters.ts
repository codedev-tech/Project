import { useMemo } from 'react';
import type { OfficerMapPerson } from '../../components/OfficerMapCanvas';
import { clusterPersonnel, positionPersonnelClusters } from '../../utils/officerMapMath';

export function usePersonnelClusters(
  personnel: OfficerMapPerson[],
  interpolatedPersonnel: OfficerMapPerson[],
  followedOfficerId: string | null,
  zoom: number,
) {
  const zoomBucket = Math.floor(zoom);
  const membership = useMemo(() => clusterPersonnel(
    personnel.filter((member) => member.id !== followedOfficerId),
    zoomBucket,
  ), [personnel, followedOfficerId, zoomBucket]);
  return useMemo(() => positionPersonnelClusters(membership, interpolatedPersonnel),
    [membership, interpolatedPersonnel]);
}
