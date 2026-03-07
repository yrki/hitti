import { apiFetch } from '../../../shared/api';
import type { Activity, CreateActivityRequest, UpdateActivityRequest, Participant, SendInvitationsRequest, SendInvitationsResponse } from '../types';

export function getActivities(): Promise<Activity[]> {
  return apiFetch<Activity[]>('/activities');
}

export function getActivity(id: string): Promise<Activity> {
  return apiFetch<Activity>(`/activities/${id}`);
}

export function createActivity(request: CreateActivityRequest): Promise<Activity> {
  return apiFetch<Activity>('/activities', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updateActivity(id: string, request: UpdateActivityRequest): Promise<Activity> {
  return apiFetch<Activity>(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export function deleteActivity(id: string): Promise<void> {
  return apiFetch<void>(`/activities/${id}`, {
    method: 'DELETE',
  });
}

export function getParticipants(activityId: string): Promise<Participant[]> {
  return apiFetch<Participant[]>(`/activities/${activityId}/participants`);
}

export function sendInvitations(activityId: string, request: SendInvitationsRequest): Promise<SendInvitationsResponse> {
  return apiFetch<SendInvitationsResponse>(`/activities/${activityId}/invitations`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
