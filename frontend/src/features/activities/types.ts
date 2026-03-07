export interface Activity {
  id: string;
  title: string;
  description: string;
  activityDate: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  activityDate: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export interface UpdateActivityRequest {
  title: string;
  description: string;
  activityDate: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}
