import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { NotificationProvider, useNotifications } from './NotificationContext';
import { fetchMyNotifications, markAllMyNotificationsRead, markMyNotificationRead } from '../services/notificationsApi';
jest.mock('./AuthContext', () => ({ useAuth: () => ({ token: 'test' }) }));
jest.mock('../services/operationsApi', () => ({ operationsSocket: { on: jest.fn(), off: jest.fn() } }));
jest.mock('../services/notificationsApi', () => ({ fetchMyNotifications: jest.fn(), markAllMyNotificationsRead: jest.fn(), markMyNotificationRead: jest.fn() }));
jest.mock('expo-device', () => ({ isDevice: false }));
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(), setBadgeCountAsync: jest.fn(async () => {}),
  addNotificationReceivedListener: () => ({ remove() {} }),
  addNotificationResponseReceivedListener: () => ({ remove() {} }),
  getLastNotificationResponseAsync: jest.fn(async () => null),
}));
const notification = { id: 'one', type: 'backup', title: 'Backup', message: 'Help', timestamp: '2026-09-01', isRead: false, priority: 'normal' as const };
const payload = { notifications: [notification], unreadCount: 1, pagination: { limit: 10, hasNextPage: false, nextCursor: null } };
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(fetchMyNotifications).mockResolvedValue(payload);
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());
it('keeps unread state on failure and reconciles it after retry', async () => {
  jest.mocked(markAllMyNotificationsRead).mockRejectedValueOnce({ status: 408 }).mockResolvedValueOnce({ updated: 1 });
  const { result } = await renderHook(useNotifications, { wrapper: NotificationProvider });
  await act(async () => { await result.current.markAllRead(); });
  expect(result.current.unreadCount).toBe(1);
  expect(result.current.notificationsError).toMatch(/Could not confirm/);
  expect(Alert.alert).toHaveBeenCalled();
  jest.mocked(fetchMyNotifications).mockResolvedValueOnce({ ...payload, notifications: [{ ...notification, isRead: true }], unreadCount: 0 });
  await act(async () => { await result.current.markAllRead(); });
  expect(result.current.unreadCount).toBe(0);
  expect(result.current.notificationsError).toBe('');
});
it('opens the destination even if marking read fails, and reports the error', async () => {
  jest.mocked(markMyNotificationRead).mockRejectedValueOnce({ status: 403 });
  const { result } = await renderHook(useNotifications, { wrapper: NotificationProvider });
  await act(async () => { result.current.openNotification(notification); });
  expect(result.current.navigationRequest?.destination).toBe('Map');
  expect(result.current.notifications[0].isRead).toBe(false);
  expect(result.current.notificationsError).toMatch(/permission/);
});
