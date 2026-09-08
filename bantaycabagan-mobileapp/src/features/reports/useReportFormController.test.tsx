import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useReportFormController } from './useReportFormController';
jest.mock('expo-image-picker', () => ({ requestCameraPermissionsAsync: jest.fn(), launchCameraAsync: jest.fn(), CameraType: { back: 'back', front: 'front' } }));
jest.mock('../../services/offlineReportQueue', () => ({ discardTemporaryEvidence: jest.fn(async () => {}) }));
const options = { currentPersonnelId: 'one', deployments: [], personnel: [], resolveReport: jest.fn(), submitReport: jest.fn() };
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  jest.mocked(ImagePicker.requestCameraPermissionsAsync).mockResolvedValue({ granted: true } as Awaited<ReturnType<typeof ImagePicker.requestCameraPermissionsAsync>>);
});
afterEach(() => jest.restoreAllMocks());
it('reports a camera launch failure without losing the report form', async () => {
  jest.mocked(ImagePicker.launchCameraAsync).mockRejectedValueOnce(new Error('Camera busy'));
  const { result } = await renderHook(() => useReportFormController(options));
  await act(async () => { result.current.updateForm('title', 'Incident draft'); result.current.chooseEvidenceCamera(); });
  const button = jest.mocked(Alert.alert).mock.calls[0][2]?.[0];
  await act(async () => { await button?.onPress?.(); });
  expect(Alert.alert).toHaveBeenLastCalledWith('Camera unavailable', expect.stringMatching(/try again/));
  expect(result.current.form.title).toBe('Incident draft');
  expect(result.current.evidencePhoto).toBeNull();
});
it('keeps cancelling the camera silent', async () => {
  jest.mocked(ImagePicker.launchCameraAsync).mockResolvedValueOnce({ canceled: true, assets: null });
  const { result } = await renderHook(() => useReportFormController(options));
  await act(async () => { result.current.chooseEvidenceCamera(); });
  const button = jest.mocked(Alert.alert).mock.calls[0][2]?.[0];
  await act(async () => { await button?.onPress?.(); });
  expect(Alert.alert).toHaveBeenCalledTimes(1);
});
