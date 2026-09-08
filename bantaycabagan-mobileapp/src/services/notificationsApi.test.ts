import { fetchMyNotifications, markAllMyNotificationsRead } from './notificationsApi';
import { ApiRequestError } from './ApiRequestError';
import { requestJson } from './requestJson';
jest.mock('./requestJson', () => ({ requestJson: jest.fn() }));
it('preserves server status, error code, and field for actionable feedback', async () => {
  jest.mocked(requestJson).mockResolvedValueOnce({ response: { ok: false, status: 403 } as Response,
    payload: { code: 'FORBIDDEN', field: 'recipientId', message: 'This notification belongs to another account.' } });
  await expect(fetchMyNotifications('token')).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN', field: 'recipientId' });
});
it('rejects a failed mark-all request instead of treating it as success', async () => {
  jest.mocked(requestJson).mockResolvedValueOnce({ response: { ok: false, status: 503 } as Response, payload: {} });
  await expect(markAllMyNotificationsRead('token')).rejects.toBeInstanceOf(ApiRequestError);
});
