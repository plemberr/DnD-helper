import { useEffect, useMemo, useState } from 'react';
import AddHomeWorkRoundedIcon from '@mui/icons-material/AddHomeWorkRounded';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { roomsService, type RoomListItemDto } from '../api/roomsService';
import { CreateRoomDialog } from '../components/rooms/CreateRoomDialog';
import { RoomCard } from '../components/rooms/RoomCard';
import { RoomDetailsDialog } from '../components/rooms/RoomDetailsDialog';
import { RoomsToolbar, type RoomFilters } from '../components/rooms/RoomsToolbar';
import { useAuth } from '../context/AuthContext';
import type { CreateRoomData, Room } from '../types/room';

const initialFilters: RoomFilters = {
  mine: false,
  master: false,
  available: false,
};

const AUTH_SESSION_STORAGE_KEY = 'dnd-helper-session';
const DEFAULT_COVER_URL =
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80';

interface StoredSession {
  accessToken: string;
}

function readAccessToken(): string | null {
  try {
    const rawSession = localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const parsed = JSON.parse(rawSession) as StoredSession;
    if (typeof parsed.accessToken === 'string' && parsed.accessToken.trim()) {
      return parsed.accessToken;
    }

    return null;
  } catch {
    return null;
  }
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function mapRoom(
  item: RoomListItemDto,
  currentUserNickname: string | undefined,
  myRoomIds: Set<number>,
  pendingRoomIds: Set<number>,
): Room {
  const isMine = myRoomIds.has(item.id);
  const isOwner = isMine && currentUserNickname && item.master_name === currentUserNickname;

  return {
    id: item.id,
    title: item.title,
    description: item.description ?? 'Описание комнаты пока не добавлено.',
    masterName: item.master_name || 'Не указан',
    playersCount: item.current_players,
    playersLimit: item.player_limit,
    createdAt: formatCreatedAt(item.created_at),
    coverUrl: item.cover_image_url ?? DEFAULT_COVER_URL,
    membership: pendingRoomIds.has(item.id)
      ? 'pending'
      : isOwner
        ? 'owner'
        : isMine
          ? 'member'
          : item.is_full
            ? 'full'
            : 'available',
  };
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<RoomFilters>(initialFilters);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [pendingRoomIds, setPendingRoomIds] = useState<Set<number>>(new Set());
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const loadRooms = async () => {
    const accessToken = readAccessToken();

    setIsLoading(true);
    setLoadError('');

    try {
      const [allRoomsResponse, myRoomsResponse] = await Promise.all([
        roomsService.list({ limit: 100, offset: 0, accessToken }),
        accessToken ? roomsService.list({ my: true, limit: 100, offset: 0, accessToken }) : Promise.resolve(null),
      ]);

      const myIds = new Set((myRoomsResponse?.items ?? []).map((item) => item.id));
      const mappedRooms = allRoomsResponse.items.map((item) =>
        mapRoom(item, currentUser?.nickname, myIds, pendingRoomIds),
      );
      setRooms(mappedRooms);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить комнаты.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, [currentUser?.nickname]);

  useEffect(() => {
    if (rooms.length === 0) {
      return;
    }

    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        pendingRoomIds.has(room.id)
          ? { ...room, membership: 'pending' }
          : room.membership === 'pending'
            ? { ...room, membership: room.playersCount >= room.playersLimit ? 'full' : 'available' }
            : room,
      ),
    );
  }, [pendingRoomIds]);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch = !normalizedSearch || room.title.toLowerCase().includes(normalizedSearch);
      const matchesMine = !filters.mine || room.membership === 'owner' || room.membership === 'member';
      const matchesMaster = !filters.master || room.membership === 'owner';
      const matchesAvailable = !filters.available || room.membership === 'available';

      return matchesSearch && matchesMine && matchesMaster && matchesAvailable;
    });
  }, [filters, rooms, searchValue]);

  const handlePrimaryAction = (room: Room) => {
    if (room.membership === 'available') {
      const accessToken = readAccessToken();
      if (!accessToken) {
        setMessage({ text: 'Сессия не найдена. Войдите снова.', severity: 'error' });
        return;
      }

      void roomsService
        .join(room.id, accessToken)
        .then(() => {
          setPendingRoomIds((currentIds) => new Set(currentIds).add(room.id));
          setMessage({ text: `Заявка в комнату «${room.title}» отправлена.`, severity: 'success' });
        })
        .catch((error) => {
          setMessage({
            text: error instanceof Error ? error.message : 'Не удалось отправить заявку.',
            severity: 'error',
          });
        });
      return;
    }

    
    if (room.membership === 'owner') {
      navigate('/admin');
      return;
    }

    if (room.membership === 'member') {
      navigate(`/room/${room.id}`);
    }
  };

  const handleCreateRoom = async (data: CreateRoomData) => {
    const accessToken = readAccessToken();
    if (!accessToken) {
      setMessage({ text: 'Сессия не найдена. Войдите снова.', severity: 'error' });
      return;
    }

    try {
      await roomsService.create(
        {
          title: data.title,
          description: data.description,
          player_limit: data.playersLimit,
        },
        accessToken,
      );

      setMessage({ text: `Комната «${data.title}» создана.`, severity: 'success' });
      await loadRooms();
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Не удалось создать комнату.',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <Box sx={{ minHeight: '100vh', py: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <RoomsToolbar
              searchValue={searchValue}
              filters={filters}
              onSearchChange={setSearchValue}
              onFiltersChange={setFilters}
              onCreateClick={() => setIsCreateOpen(true)}
            />

            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}>
                <Box>
                  <Typography variant="h4">Реестр комнат</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Выберите кампанию, подайте заявку или создайте свою.
                  </Typography>
                </Box>
                <Typography color="text.secondary">Найдено: {filteredRooms.length}</Typography>
              </Stack>

              {isLoading ? (
                <Box sx={{ mt: 3, display: 'grid', placeItems: 'center', py: 8 }}>
                  <CircularProgress />
                </Box>
              ) : loadError ? (
                <Alert severity="error" sx={{ mt: 2.5 }}>
                  {loadError}
                </Alert>
              ) : filteredRooms.length > 0 ? (
                <Box
                  sx={{
                    mt: 2.5,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(255px, 1fr))',
                    gap: 2.25,
                  }}
                >
                  {filteredRooms.map((room) => (
                    <RoomCard key={room.id} room={room} onDetails={setDetailsRoom} onPrimaryAction={handlePrimaryAction} />
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    mt: 2.5,
                    py: 9,
                    px: 2,
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                  }}
                >
                  <AddHomeWorkRoundedIcon sx={{ fontSize: 46, color: 'text.secondary' }} />
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Ничего не найдено
                  </Typography>
                  <Typography color="text.secondary">Попробуйте изменить строку поиска или фильтры.</Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      <CreateRoomDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateRoom} />
      <RoomDetailsDialog room={detailsRoom} onClose={() => setDetailsRoom(null)} />
      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={message?.severity ?? 'success'} variant="filled" onClose={() => setMessage(null)}>
          {message?.text ?? ''}
        </Alert>
      </Snackbar>
    </>
  );
}
