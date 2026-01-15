export type PriorityOccurrence = 'VeryHigh' | 'High' | 'Medium' | 'Low' | 'VeryLow';

export interface StartOccurrenceRequest {
  driverShiftId: string;
  priority: PriorityOccurrence;
}
