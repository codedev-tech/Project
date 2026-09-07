import { act, cleanup, renderHook } from '@testing-library/react-native';
import * as previewConfig from '../../utils/mockMapPersonnel';
import { useDevelopmentMapPersonnel } from './useDevelopmentMapPersonnel';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-07T00:00:00.000Z'));
  jest.spyOn(previewConfig, 'isMapPreviewAvailable').mockReturnValue(true);
});
afterEach(async () => {
  await cleanup();
  jest.restoreAllMocks();
  jest.useRealTimers();
});

it('starts empty, updates every ten seconds only while enabled, and removes markers on disable', async () => {
  const intervals = jest.spyOn(globalThis, 'setInterval');
  const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');
  const view = await renderHook(() => useDevelopmentMapPersonnel(true));
  expect(view.result.current.personnel).toEqual([]);
  await act(() => view.result.current.toggle());
  expect(view.result.current.personnel).toHaveLength(96);
  const first = view.result.current.personnel;
  const timer = intervals.mock.results[intervals.mock.calls.findIndex((call) => call[1] === 10_000)].value;
  await act(() => jest.advanceTimersByTime(9999));
  expect(view.result.current.personnel).toBe(first);
  await act(() => jest.advanceTimersByTime(1));
  expect(view.result.current.personnel[0].locationRecordedAt).toBe('2026-09-07T00:00:10.000Z');
  expect(view.result.current.personnel[0].latitude).not.toBe(first[0].latitude);
  await act(() => view.result.current.toggle());
  expect(view.result.current.personnel).toEqual([]);
  expect(clearIntervalSpy).toHaveBeenCalledWith(timer);
});

it('pauses when the map loses focus and refuses activation when unavailable', async () => {
  const view = await renderHook<ReturnType<typeof useDevelopmentMapPersonnel>, boolean>(
    (focused) => useDevelopmentMapPersonnel(focused), { initialProps: true },
  );
  await act(() => view.result.current.toggle());
  const first = view.result.current.personnel;
  await view.rerender(false);
  await act(() => jest.advanceTimersByTime(20_000));
  expect(view.result.current.personnel).toBe(first);
  await view.rerender(true);
  await act(() => jest.advanceTimersByTime(10_000));
  expect(view.result.current.personnel[0].locationRecordedAt).toBe('2026-09-07T00:00:30.000Z');
  jest.mocked(previewConfig.isMapPreviewAvailable).mockReturnValue(false);
  await view.rerender(true);
  await act(() => view.result.current.toggle());
  expect(view.result.current.enabled).toBe(false);
  expect(view.result.current.personnel).toEqual([]);
});
