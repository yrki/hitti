export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  joinedAt: string;
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  joinedAt: string;
  password?: string;
}

export interface UpdateMemberRequest {
  name: string;
  email: string;
  phone: string;
  status: string;
  role: string;
  joinedAt: string;
  password?: string;
}
