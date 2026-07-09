import { useMemo, useState } from 'react';
import AddHomeWorkRoundedIcon from '@mui/icons-material/AddHomeWorkRounded';
import {
  Alert,
  Box,
  Container,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { CreateRoomDialog } from '../components/rooms/CreateRoomDialog';
import { RoomCard } from '../components/rooms/RoomCard';
import { RoomDetailsDialog } from '../components/rooms/RoomDetailsDialog';
import { RoomsToolbar, type RoomFilters } from '../components/rooms/RoomsToolbar';
import { mockRooms } from '../data/mockRooms';
import type { CreateRoomData, Room } from '../types/room';
import { useNavigate } from 'react-router-dom';

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

              {filteredRooms.length > 0 ? (
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
      <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setMessage('')}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}
