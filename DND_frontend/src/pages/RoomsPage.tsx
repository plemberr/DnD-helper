import { useMemo, useState } from 'react';
import AddHomeWorkRoundedIcon from '@mui/icons-material/AddHomeWorkRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import { Alert, Box, Container, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { FantasyPageShell } from '../components/fantasy/FantasyPageShell';
import { CreateRoomDialog } from '../components/rooms/CreateRoomDialog';
import { RoomCard } from '../components/rooms/RoomCard';
import { RoomDetailsDialog } from '../components/rooms/RoomDetailsDialog';
import { RoomsToolbar, type RoomFilters } from '../components/rooms/RoomsToolbar';
import { mockRooms } from '../data/mockRooms';
import {
  fantasyColors,
  fantasyFrameSx,
  fantasyGradients,
  fantasyInsetSx,
} from '../theme/fantasyTheme';
import type { CreateRoomData, Room } from '../types/room';

const initialFilters: RoomFilters = {
  mine: false,
  master: false,
  available: false,
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<RoomFilters>(initialFilters);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
      setRooms((currentRooms) =>
        currentRooms.map((currentRoom) =>
          currentRoom.id === room.id ? { ...currentRoom, membership: 'pending' } : currentRoom,
        ),
      );
      setMessage(`Заявка в комнату «${room.title}» отправлена.`);
      return;
    }

    if (room.membership === 'owner') {
      navigate('/admin');
      return;
    }

    if (room.membership === 'member') {
      navigate('/room');
    }
  };

  const handleCreateRoom = (data: CreateRoomData) => {
    const newRoom: Room = {
      id: Date.now(),
      title: data.title,
      description: data.description || 'Описание комнаты пока не добавлено.',
      masterName: 'Админ',
      playersCount: 1,
      playersLimit: data.playersLimit,
      createdAt: 'Только что',
      coverUrl:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80',
      membership: 'owner',
    };

    setRooms((currentRooms) => [newRoom, ...currentRooms]);
    setMessage(`Комната «${newRoom.title}» создана.`);
  };

  return (
    <FantasyPageShell>
      <Box component="main" sx={{ minHeight: '100dvh', py: { xs: 2, md: 4 } }}>
        <Container maxWidth="xl">
          <Stack spacing={{ xs: 2.25, md: 3 }}>
            <Stack
              component="header"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={1.75} sx={{ minWidth: 0, alignItems: 'center' }}>
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
                    background: `radial-gradient(circle, ${alpha(fantasyColors.burgundy, 0.64)}, ${fantasyColors.burgundyDeep})`,
                    boxShadow: `0 0 30px ${alpha(fantasyColors.burgundy, 0.38)}`,
                    '& svg': { fontSize: 30, transform: 'rotate(-45deg)' },
                  }}
                >
                  <AutoStoriesRoundedIcon />
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.65rem' }}>
                    Архив приключений
                  </Typography>
                  <Typography
                    id="rooms-page-title"
                    component="h1"
                    variant="h3"
                    sx={{ fontSize: { xs: '2rem', md: '2.65rem' }, lineHeight: 1.05 }}
                  >
                    Реестр комнат
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ mt: 0.7, maxWidth: 680, lineHeight: 1.55, overflowWrap: 'anywhere' }}
                  >
                    Выберите кампанию, подайте заявку или станьте мастером собственной истории.
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
                <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.58rem', lineHeight: 1.2 }}>
                  Найдено
                </Typography>
                <Typography variant="h4" color="primary.main" sx={{ lineHeight: 1.05 }}>
                  {filteredRooms.length}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ height: 1, background: fantasyGradients.ornament }} />

            <RoomsToolbar
              searchValue={searchValue}
              filters={filters}
              onSearchChange={setSearchValue}
              onFiltersChange={setFilters}
              onCreateClick={() => setIsCreateOpen(true)}
            />

            <Box component="section" aria-labelledby="rooms-page-title">
              {filteredRooms.length > 0 ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
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
                      border: `1px solid ${alpha(fantasyColors.gold, 0.32)}`,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${alpha(fantasyColors.gold, 0.1)}, transparent 68%)`,
                      boxShadow: `0 0 28px ${alpha(fantasyColors.burgundy, 0.28)}`,
                    }}
                  >
                    <AddHomeWorkRoundedIcon sx={{ fontSize: 38 }} />
                  </Box>
                  <Typography variant="h5" sx={{ mt: 2 }}>
                    Ничего не найдено
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    Попробуйте изменить строку поиска или выбранные фильтры.
                  </Typography>
                </Paper>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      <CreateRoomDialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreateRoom} />
      <RoomDetailsDialog room={detailsRoom} onClose={() => setDetailsRoom(null)} />
      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3500}
        onClose={() => setMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </FantasyPageShell>
  );
}
