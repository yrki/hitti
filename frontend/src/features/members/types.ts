export const MemberStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
} as const;
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];

export const MemberRole = {
  Member: 'Member',
  Admin: 'Admin',
} as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: MemberStatus;
  role: MemberRole;
  joinedAt: string;
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  phone: string;
  status: MemberStatus;
  role: MemberRole;
  joinedAt: string;
  password?: string;
}

export interface UpdateMemberRequest {
  name: string;
  email: string;
  phone: string;
  status: MemberStatus;
  role: MemberRole;
  joinedAt: string;
  password?: string;
}
