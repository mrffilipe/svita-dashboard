import { api } from '../config';
import type { SendNotificationRequest } from '../types';

export const notificationService = {
  sendNotification: async (data: SendNotificationRequest): Promise<void> => {
    await api.post('/api/tenants/{tenantKey}/TenantUsers/send-notification', data);
  },
};
