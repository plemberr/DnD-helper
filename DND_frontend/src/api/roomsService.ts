const ROOMS_API_BASE_URL = import.meta.env.VITE_ROOMS_API_BASE_URL ?? '/api/rooms';

interface ApiErrorBody {
  detail?: string;
}

interface RoomListItemDto {
  id: number;
  title: string;
  description: string | null;
  player_limit: number;
  current_players: number;
  master_name: string;
  cover_image_url: string | null;
  created_at: string;
  is_full: boolean;
}

interface RoomsListResponseDto {
  items: RoomListItemDto[];
  total: number;
  limit: number;
  offset: number;
}

interface RoomOutDto {
  id: number;
  title: string;
  description: string | null;
  player_limit: number;
  cover_image_url: string | null;
  created_at: string;
  current_players: number;
  master_id: number;
}

type RoomMemberRole = 'master' | 'co_master' | 'player';
type JoinRequestStatus = 'pending' | 'accepted' | 'rejected';

interface RoomMemberDto {
  user_id: number;
  username: string;
  role: RoomMemberRole;
}

interface RoomDetailDto {
  id: number;
  title: string;
  description: string | null;
  player_limit: number;
  cover_image_url: string | null;
  created_at: string;
  members: RoomMemberDto[];
}

interface JoinRequestDto {
  id: number;
  room_id: number;
  user_id: number;
  status: JoinRequestStatus;
}

interface JoinRequestListItemDto extends JoinRequestDto {
  username: string;
  created_at: string;
}

interface JoinRequestsListResponseDto {
  items: JoinRequestListItemDto[];
}

async function parseError(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === 'string' && body.detail.trim()) {
      message = body.detail;
    }
  } catch {
    // Intentionally ignored: fallback error message is used.
  }

  throw new Error(message);
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
  accessToken?: string | null,
): Promise<TResponse> {
  const response = await fetch(`${ROOMS_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    return parseError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const roomsService = {
  list(params?: { limit?: number; offset?: number; my?: boolean; openOnly?: boolean; accessToken?: string | null }) {
    const searchParams = new URLSearchParams();

    if (typeof params?.limit === 'number') {
      searchParams.set('limit', String(params.limit));
    }
    if (typeof params?.offset === 'number') {
      searchParams.set('offset', String(params.offset));
    }
    if (params?.my) {
      searchParams.set('my', 'true');
    }
    if (params?.openOnly) {
      searchParams.set('open_only', 'true');
    }

    const query = searchParams.toString();
    return request<RoomsListResponseDto>(query ? `?${query}` : '', undefined, params?.accessToken);
  },

  create(
    payload: {
      title: string;
      description?: string;
      player_limit: number;
      cover_image_url?: string;
    },
    accessToken: string,
  ) {
    return request<RoomOutDto>(
      '',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      accessToken,
    );
  },

  join(roomId: number, accessToken: string) {
    return request<void>(
      `/${roomId}/requests`,
      {
        method: 'POST',
      },
      accessToken,
    );
  },

  get(roomId: number) {
    return request<RoomDetailDto>(`/${roomId}`);
  },

  listJoinRequests(roomId: number, accessToken: string, status: JoinRequestStatus = 'pending') {
    const searchParams = new URLSearchParams({ status });
    return request<JoinRequestsListResponseDto>(
      `/${roomId}/requests?${searchParams.toString()}`,
      undefined,
      accessToken,
    );
  },

  processJoinRequest(
    roomId: number,
    requestId: number,
    status: Extract<JoinRequestStatus, 'accepted' | 'rejected'>,
    accessToken: string,
  ) {
    return request<JoinRequestDto>(
      `/${roomId}/requests/${requestId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      accessToken,
    );
  },
};

export type {
  JoinRequestListItemDto,
  JoinRequestStatus,
  RoomDetailDto,
  RoomListItemDto,
  RoomMemberDto,
  RoomMemberRole,
  RoomOutDto,
  RoomsListResponseDto,
};
