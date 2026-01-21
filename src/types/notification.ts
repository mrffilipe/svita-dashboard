export type NotificationType = 'Comunicado';

export interface SendNotificationRequest {
  title: string;
  body: string;
  type: NotificationType;
}
