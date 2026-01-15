import { api } from '../config';
import type { StartOccurrenceRequest } from '../types';

export const dispatchService = {
  startOccurrence: async (requestId: string, data: StartOccurrenceRequest): Promise<void> => {
    await api.post(`/api/tenants/{tenantKey}/dispatch/requests/${requestId}/occurrence`, data);
  },

  enRouteToPatient: async (requestId: string): Promise<void> => {
    await api.post(`/api/tenants/{tenantKey}/dispatch/requests/${requestId}/trip/en-route-to-patient`);
  },

  enRouteToDestination: async (requestId: string): Promise<void> => {
    await api.post(`/api/tenants/{tenantKey}/dispatch/requests/${requestId}/trip/en-route-to-destination`);
  },

  completeTrip: async (requestId: string): Promise<void> => {
    await api.post(`/api/tenants/{tenantKey}/dispatch/requests/${requestId}/trip/complete`);
  },
};
