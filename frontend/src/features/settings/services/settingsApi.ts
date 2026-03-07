import { apiFetch } from '../../../shared/api';
import type { OrganizationSettings, UpdateSettingsRequest } from '../types';

export function getSettings(): Promise<OrganizationSettings> {
  return apiFetch<OrganizationSettings>('/settings');
}

export function updateSettings(request: UpdateSettingsRequest): Promise<OrganizationSettings> {
  return apiFetch<OrganizationSettings>('/settings', {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}
