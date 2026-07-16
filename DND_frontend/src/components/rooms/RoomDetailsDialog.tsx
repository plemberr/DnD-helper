import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { fantasyFrameSx } from '../../theme/fantasyTheme';
import type { Room } from '../../types/room';

interface RoomDetailsDialogProps {
  room: Room | null;
  onClose: () => void;
}

export function RoomDetailsDialog({ room, onClose }: RoomDetailsDialogProps) {
  return (
    <Dialog
      open={Boolean(room)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { elevation: 0, sx: fantasyFrameSx } }}
    >
      {room && (
        <>
          <Box component="img" src={room.coverUrl} alt={`Обложка комнаты ${room.title}`} sx={{ width: '100%', height: 220, objectFit: 'cover' }} />
          <DialogTitle>{room.title}</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">{room.description}</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <PersonOutlineRoundedIcon color="action" />
                <Typography>Мастер: {room.masterName}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <GroupOutlinedIcon color="action" />
                <Typography>
                  Участники: {room.playersCount} из {room.playersLimit}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Дата создания: {room.createdAt}
              </Typography>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose}>Закрыть</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
