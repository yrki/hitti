export interface OrganizationSettings {
  id: string;
  organizationName: string;
  email: string;
  phone: string;
}

export interface UpdateSettingsRequest {
  organizationName: string;
  email: string;
  phone: string;
}
