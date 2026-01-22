export type NotificationType = 'Comunicado';

export interface SendNotificationRequest {
  tenantKey: string;
  title: string;
  body: string;
  type: NotificationType;
}
