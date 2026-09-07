import { renderHook } from '@testing-library/react-native';
import * as math from '../../utils/officerMapMath';
import type { OfficerMapPerson } from '../../components/OfficerMapCanvas';
import { usePersonnelClusters } from './usePersonnelClusters';

const officer = (id: string, longitude = 121.7653): OfficerMapPerson => ({
  id, latitude: 17.4269, longitude,
} as OfficerMapPerson);

afterEach(() => jest.restoreAllMocks());

it('keeps memberships stable during animation and fractional zoom changes', async () => {
  const spatialSearch = jest.spyOn(math, 'clusterPersonnel');
  const personnel = [officer('a'), officer('b')];
  const view = await renderHook<math.PersonnelCluster[], { positions: OfficerMapPerson[]; zoom: number }>(({ positions, zoom }) => usePersonnelClusters(personnel, positions, null, zoom), {
    initialProps: { positions: personnel, zoom: 14.1 },
  });
  const originalId = view.result.current[0].id;
  await view.rerender({ positions: [officer('a', 121.7), officer('b', 121.9)], zoom: 14.8 });
  expect(spatialSearch).toHaveBeenCalledTimes(1);
  expect(view.result.current).toHaveLength(1);
  expect(view.result.current[0].id).toBe(originalId);
  expect(view.result.current[0].longitude).toBeCloseTo(121.8);
  await view.rerender({ positions: personnel, zoom: 18 });
  expect(spatialSearch).toHaveBeenCalledTimes(2);
  expect(view.result.current).toHaveLength(2);
});

it('regroups on GPS updates and excludes only the followed officer', async () => {
  const personnel = [officer('a'), officer('b'), officer('c')];
  const view = await renderHook<math.PersonnelCluster[], { members: OfficerMapPerson[]; followed: string | null }>(({ members, followed }) => usePersonnelClusters(members, members, followed, 14), {
    initialProps: { members: personnel, followed: 'a' as string | null },
  });
  expect(view.result.current.flatMap((cluster) => cluster.members.map((member) => member.id))).toEqual(['b', 'c']);
  await view.rerender({ members: [officer('a'), officer('b'), officer('c', 121.99)], followed: null });
  expect(view.result.current).toHaveLength(2);
  expect(view.result.current.flatMap((cluster) => cluster.members)).toHaveLength(3);
  await view.rerender({ members: [officer('a')], followed: null });
  expect(view.result.current).toHaveLength(1);
  expect(view.result.current[0].members[0].id).toBe('a');
});

it('uses the MapLibre pixel scale and rejects invalid coordinates', () => {
  const longitudePerPixel = 360 / (512 * 2 ** 14);
  expect(math.clusterPersonnel([officer('a'), officer('b', 121.7653 + 50 * longitudePerPixel)], 14)).toHaveLength(1);
  expect(math.clusterPersonnel([officer('a'), officer('b', 121.7653 + 90 * longitudePerPixel)], 14)).toHaveLength(2);
  const invalid = [null, undefined, NaN, 91].map((latitude, i) => ({ ...officer(String(i)), latitude } as OfficerMapPerson));
  expect(math.clusterPersonnel(invalid, 14)).toHaveLength(0);
  expect(math.clusterPersonnel([{ ...officer('bad'), longitude: 181 }], 18)).toHaveLength(0);
});
