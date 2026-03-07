export interface Activity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface UpdateActivityRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export const ParticipantStatus = {
  Invited: 'Invited',
  Accepted: 'Accepted',
  Declined: 'Declined',
} as const;
export type ParticipantStatus = (typeof ParticipantStatus)[keyof typeof ParticipantStatus];

export const InvitationChannel = {
  Sms: 'Sms',
  Email: 'Email',
} as const;
export type InvitationChannel = (typeof InvitationChannel)[keyof typeof InvitationChannel];

export const NotificationStatus = {
  Pending: 'Pending',
  Sent: 'Sent',
  Failed: 'Failed',
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];

export interface Participant {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  status: ParticipantStatus;
  invitationChannel: InvitationChannel;
  notificationStatus: NotificationStatus;
  invitedAt: string;
  respondedAt: string | null;
  notificationSentAt: string | null;
  notificationFailedAt: string | null;
}

export interface SendInvitationsRequest {
  channel: InvitationChannel;
}

export interface SendInvitationsResponse {
  invitedCount: number;
  alreadyInvitedCount: number;
}

export interface RsvpResult {
  activityTitle: string;
  startTime: string;
  endTime: string;
  activityLocation: string;
  accepted: boolean;
}
