import { apiFetch } from '../../../shared/api';
import type { Member, CreateMemberRequest, UpdateMemberRequest } from '../types';

export function getMembers(): Promise<Member[]> {
  return apiFetch<Member[]>('/members');
}

export function getMember(id: string): Promise<Member> {
  return apiFetch<Member>(`/members/${id}`);
}

export function createMember(request: CreateMemberRequest): Promise<Member> {
  return apiFetch<Member>('/members', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export function updateMember(id: string, request: UpdateMemberRequest): Promise<Member> {
  return apiFetch<Member>(`/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export function deleteMember(id: string): Promise<void> {
  return apiFetch<void>(`/members/${id}`, {
    method: 'DELETE',
  });
}
