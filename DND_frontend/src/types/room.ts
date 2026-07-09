export type RoomMembership = 'owner' | 'member' | 'pending' | 'available' | 'full';

export interface Room {
  id: number;
  title: string;
  description: string;
  masterName: string;
  playersCount: number;
  playersLimit: number;
  createdAt: string;
  coverUrl: string;
  membership: RoomMembership;
}

export interface CreateRoomData {
  title: string;
  description: string;
  playersLimit: number;
}
