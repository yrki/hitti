export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinedAt: string;
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  status: string;
  joinedAt: string;
}

export interface UpdateMemberRequest {
  name: string;
  email: string;
  phone: string;
  status: string;
  joinedAt: string;
}
