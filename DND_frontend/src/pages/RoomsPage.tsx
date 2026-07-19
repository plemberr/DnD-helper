import { useEffect, useMemo, useState } from 'react';
import AddHomeWorkRoundedIcon from '@mui/icons-material/AddHomeWorkRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import { roomsService, type RoomListItemDto } from '../api/roomsService';
import { FantasyPageShell } from '../components/fantasy/FantasyPageShell';
import { CreateRoomDialog } from '../components/rooms/CreateRoomDialog';
import { RoomCard } from '../components/rooms/RoomCard';
import { RoomDetailsDialog } from '../components/rooms/RoomDetailsDialog';
import { RoomsToolbar, type RoomFilters } from '../components/rooms/RoomsToolbar';
import { useAuth } from '../context/AuthContext';
import {
  fantasyColors,
  fantasyFrameSx,
  fantasyGradients,
  fantasyInsetSx,
} from '../theme/fantasyTheme';
import type { CreateRoomData, Room } from '../types/room';
import { readAccessToken } from '../utils/authSession';
import { saveActiveAdminRoomId } from '../utils/roomSession';

const initialFilters: RoomFilters = {
  mine: false,
  master: false,
  available: false,
};

const DEFAULT_COVER_URL =
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80';

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
  const isOwner =
    isMine &&
    Boolean(currentUserNickname) &&
    item.master_name === currentUserNickname;

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
  const [message, setMessage] = useState<{
    text: string;
    severity: 'success' | 'error';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [pendingRoomIds, setPendingRoomIds] = useState<Set<number>>(
    new Set(),
  );

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const loadRooms = async () => {
    const accessToken = readAccessToken();

    setIsLoading(true);
    setLoadError('');

    try {
      const [allRoomsResponse, myRoomsResponse] = await Promise.all([
        roomsService.list({
          limit: 100,
          offset: 0,
          accessToken,
        }),
        accessToken
          ? roomsService.list({
              my: true,
              limit: 100,
              offset: 0,
              accessToken,
            })
          : Promise.resolve(null),
      ]);

      const myRoomIds = new Set(
        (myRoomsResponse?.items ?? []).map((item) => item.id),
      );

      setRooms(
        allRoomsResponse.items.map((item) =>
          mapRoom(
            item,
            currentUser?.nickname,
            myRoomIds,
            pendingRoomIds,
          ),
        ),
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить комнаты.',
      );
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
      currentRooms.map((room) => {
        if (pendingRoomIds.has(room.id)) {
          return {
            ...room,
            membership: 'pending',
          };
        }

        if (room.membership !== 'pending') {
          return room;
        }

        return {
          ...room,
          membership:
            room.playersCount >= room.playersLimit ? 'full' : 'available',
        };
      }),
    );
  }, [pendingRoomIds]);

  const filteredRooms = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        !normalizedSearch ||
        room.title.toLowerCase().includes(normalizedSearch);
      const matchesMine =
        !filters.mine ||
        room.membership === 'owner' ||
        room.membership === 'member';
      const matchesMaster =
        !filters.master || room.membership === 'owner';
      const matchesAvailable =
        !filters.available || room.membership === 'available';

      return (
        matchesSearch &&
        matchesMine &&
        matchesMaster &&
        matchesAvailable
      );
    });
  }, [filters, rooms, searchValue]);

  const handlePrimaryAction = (room: Room) => {
    if (room.membership === 'available') {
      const accessToken = readAccessToken();

      if (!accessToken) {
        setMessage({
          text: 'Сессия не найдена. Войдите снова.',
          severity: 'error',
        });
        return;
      }

      void roomsService
        .join(room.id, accessToken)
        .then(() => {
          setPendingRoomIds(
            (currentIds) => new Set(currentIds).add(room.id),
          );
          setMessage({
            text: `Заявка в комнату «${room.title}» отправлена.`,
            severity: 'success',
          });
        })
        .catch((error) => {
          setMessage({
            text:
              error instanceof Error
                ? error.message
                : 'Не удалось отправить заявку.',
            severity: 'error',
          });
        });

      return;
    }

    if (room.membership === 'owner') {
      saveActiveAdminRoomId(room.id);
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
      setMessage({
        text: 'Сессия не найдена. Войдите снова.',
        severity: 'error',
      });
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

      setMessage({
        text: `Комната «${data.title}» создана.`,
        severity: 'success',
      });
      setIsCreateOpen(false);
      await loadRooms();
    } catch (error) {
      setMessage({
        text:
          error instanceof Error
            ? error.message
            : 'Не удалось создать комнату.',
        severity: 'error',
      });
    }
  };

  return (
    <FantasyPageShell>
      <Box
        component="main"
        sx={{ minHeight: '100dvh', py: { xs: 2, md: 4 } }}
      >
        <Container maxWidth="xl">
          <Stack spacing={{ xs: 2.25, md: 3 }}>
            <Stack
              component="header"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Stack
                direction="row"
                spacing={1.75}
                sx={{ minWidth: 0, alignItems: 'center' }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    width: { xs: 52, sm: 58 },
                    height: { xs: 52, sm: 58 },
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    border: `1px solid ${alpha(fantasyColors.gold, 0.5)}`,
                    outline: `4px double ${alpha(fantasyColors.brass, 0.24)}`,
                    transform: 'rotate(45deg)',
                    background: `radial-gradient(circle, ${alpha(
                      fantasyColors.burgundy,
                      0.64,
                    )}, ${fantasyColors.burgundyDeep})`,
                    boxShadow: `0 0 30px ${alpha(
                      fantasyColors.burgundy,
                      0.38,
                    )}`,
                    '& svg': {
                      fontSize: 30,
                      transform: 'rotate(-45deg)',
                    },
                  }}
                >
                  <AutoStoriesRoundedIcon />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    color="primary.main"
                    sx={{ fontSize: '0.65rem' }}
                  >
                    Архив приключений
                  </Typography>

                  <Typography
                    id="rooms-page-title"
                    component="h1"
                    variant="h3"
                    sx={{
                      fontSize: { xs: '2rem', md: '2.65rem' },
                      lineHeight: 1.05,
                    }}
                  >
                    Реестр комнат
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.7,
                      maxWidth: 680,
                      lineHeight: 1.55,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    Выберите кампанию, подайте заявку или станьте мастером
                    собственной истории.
                  </Typography>
                </Box>
              </Stack>

              <Box
                aria-label={`Найдено комнат: ${filteredRooms.length}`}
                sx={{
                  ...fantasyInsetSx,
                  minWidth: { sm: 132 },
                  alignSelf: { xs: 'flex-start', sm: 'stretch' },
                  display: 'grid',
                  placeItems: 'center',
                  px: 2.5,
                  py: 1.25,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontSize: '0.58rem', lineHeight: 1.2 }}
                >
                  Найдено
                </Typography>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{ lineHeight: 1.05 }}
                >
                  {filteredRooms.length}
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                height: 1,
                background: fantasyGradients.ornament,
              }}
            />

            <RoomsToolbar
              searchValue={searchValue}
              filters={filters}
              onSearchChange={setSearchValue}
              onFiltersChange={setFilters}
              onCreateClick={() => setIsCreateOpen(true)}
            />

            <Box
              component="section"
              aria-labelledby="rooms-page-title"
            >
              {isLoading ? (
                <Box
                  sx={{
                    minHeight: 300,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : loadError ? (
                <Alert severity="error" variant="outlined">
                  {loadError}
                </Alert>
              ) : filteredRooms.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                    gap: { xs: 1.75, md: 2.25 },
                  }}
                >
                  {filteredRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onDetails={setDetailsRoom}
                      onPrimaryAction={handlePrimaryAction}
                    />
                  ))}
                </Box>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    ...fantasyFrameSx,
                    py: { xs: 7, md: 9 },
                    px: 2,
                    overflow: 'hidden',
                    textAlign: 'center',
                    background: fantasyGradients.panelRaised,
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      mx: 'auto',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'primary.main',
                      border: `1px solid ${alpha(
                        fantasyColors.gold,
                        0.32,
                      )}`,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(
                        fantasyColors.gold,
                        0.1,
                      )}, transparent 68%)`,
                      boxShadow: `0 0 28px ${alpha(
                        fantasyColors.burgundy,
                        0.28,
                      )}`,
                    }}
                  >
                    <AddHomeWorkRoundedIcon sx={{ fontSize: 38 }} />
                  </Box>

                  <Typography variant="h5" sx={{ mt: 2 }}>
                    Ничего не найдено
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.75 }}
                  >
                    Попробуйте изменить строку поиска или выбранные
                    фильтры.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      <CreateRoomDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateRoom}
      />

      <RoomDetailsDialog
        room={detailsRoom}
        onClose={() => setDetailsRoom(null)}
      />

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3500}
        onClose={() => setMessage(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Alert
          severity={message?.severity ?? 'success'}
          variant="filled"
          onClose={() => setMessage(null)}
        >
          {message?.text ?? ''}
        </Alert>
      </Snackbar>
    </FantasyPageShell>
  );
}