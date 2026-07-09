import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import type { Room } from '../../types/room';

interface RoomCardProps {
  room: Room;
  onDetails: (room: Room) => void;
  onPrimaryAction: (room: Room) => void;
}

const statusMap: Record<Room['membership'], { label: string; color: 'default' | 'success' | 'warning' | 'error' | 'primary' }> = {
  owner: { label: 'Вы мастер', color: 'primary' },
  member: { label: 'Вы участник', color: 'success' },
  pending: { label: 'Заявка отправлена', color: 'warning' },
  available: { label: 'Есть места', color: 'success' },
  full: { label: 'Мест нет', color: 'error' },
};

function getPrimaryButton(room: Room): { label: string; disabled?: boolean } {
  switch (room.membership) {
    case 'owner':
      return { label: 'Открыть админку' };
    case 'member':
      return { label: 'Открыть комнату' };
    case 'pending':
      return { label: 'На рассмотрении', disabled: true };
    case 'full':
      return { label: 'Мест нет', disabled: true };
    default:
      return { label: 'Подать заявку' };
  }
}

export function RoomCard({ room, onDetails, onPrimaryAction }: RoomCardProps) {
  const status = statusMap[room.membership];
  const primaryButton = getPrimaryButton(room);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardMedia component="img" height="148" image={room.coverUrl} alt={`Обложка комнаты ${room.title}`} />

      <CardContent sx={{ flexGrow: 1, pb: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h2" sx={{ lineHeight: 1.2 }}>
            {room.title}
          </Typography>
          <Chip label={status.label} size="small" color={status.color} variant="outlined" />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1.25,
            minHeight: 58,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {room.description}
        </Typography>

        <Stack spacing={0.65} sx={{ mt: 1.5 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <PersonOutlineRoundedIcon fontSize="small" color="action" />
            <Typography variant="body2">Мастер: {room.masterName}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <GroupOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {room.playersCount} / {room.playersLimit} игроков
              </Typography>
            </Stack>
            <Tooltip title={`Создана: ${room.createdAt}`}>
              <Typography variant="caption" color="text.secondary">
                {room.createdAt}
              </Typography>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button size="small" variant="outlined" onClick={() => onDetails(room)}>
          Подробнее
        </Button>
        <Button
          size="small"
          variant="contained"
          endIcon={room.membership === 'owner' || room.membership === 'member' ? <OpenInNewRoundedIcon /> : undefined}
          onClick={() => onPrimaryAction(room)}
          disabled={primaryButton.disabled}
          sx={{ ml: 'auto' }}
        >
          {primaryButton.label}
        </Button>
      </CardActions>
    </Card>
  );
}
