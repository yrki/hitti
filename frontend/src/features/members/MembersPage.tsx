import { MemberTable } from './components/MemberTable';
import type { Member } from './types';

const sampleMembers: Member[] = [
  { id: '1', name: 'Kari Nordmann', email: 'kari@example.com', phone: '912 34 567', status: 'active', joinedAt: '2024-01-15' },
  { id: '2', name: 'Ola Hansen', email: 'ola@example.com', phone: '923 45 678', status: 'active', joinedAt: '2024-03-22' },
  { id: '3', name: 'Per Olsen', email: 'per@example.com', phone: '934 56 789', status: 'inactive', joinedAt: '2023-11-10' },
  { id: '4', name: 'Lise Berg', email: 'lise@example.com', phone: '945 67 890', status: 'active', joinedAt: '2025-06-01' },
  { id: '5', name: 'Erik Johansen', email: 'erik@example.com', phone: '956 78 901', status: 'inactive', joinedAt: '2023-08-30' },
];

export function MembersPage() {
  return (
    <div>
      <MemberTable members={sampleMembers} />
    </div>
  );
}
