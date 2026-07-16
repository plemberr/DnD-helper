import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import {
  Box,
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
import { alpha } from '@mui/material/styles';

import { fantasyColors } from '../../theme/fantasyTheme';
import type { Room } from '../../types/room';

interface RoomCardProps {
  room: Room;
  onDetails: (room: Room) => void;
  onPrimaryAction: (room: Room) => void;
}

type StatusTone = 'gold' | 'green' | 'amber' | 'red';

const statusMap: Record<
  Room['membership'],
  { label: string; tone: StatusTone }
> = {
  owner: { label: 'Вы мастер', tone: 'gold' },
  member: { label: 'Вы участник', tone: 'green' },
  pending: { label: 'Заявка отправлена', tone: 'amber' },
  available: { label: 'Есть места', tone: 'green' },
  full: { label: 'Мест нет', tone: 'red' },
};

const statusToneStyles: Record<
  StatusTone,
  {
    color: string;
    borderColor: string;
    backgroundColor: string;
  }
> = {
  gold: {
    color: fantasyColors.goldLight,
    borderColor: alpha(fantasyColors.gold, 0.56),
    backgroundColor: alpha(fantasyColors.burgundyDeep, 0.88),
  },
  green: {
    color: '#b9cdae',
    borderColor: alpha(fantasyColors.positive, 0.72),
    backgroundColor: alpha('#263125', 0.9),
  },
  amber: {
    color: '#e2bd83',
    borderColor: alpha('#c48b4f', 0.7),
    backgroundColor: alpha('#352719', 0.9),
  },
  red: {
    color: '#e0a0a1',
    borderColor: alpha('#c45b5f', 0.66),
    backgroundColor: alpha('#381b20', 0.9),
  },
};

function getPrimaryButton(
  room: Room,
): { label: string; disabled?: boolean } {
  switch (room.membership) {
    case 'owner':
      return { label: 'Открыть админку' };

    case 'member':
      return { label: 'Открыть комнату' };

    case 'pending':
      return {
        label: 'На рассмотрении',
        disabled: true,
      };

    case 'full':
      return {
        label: 'Мест нет',
        disabled: true,
      };

    default:
      return { label: 'Подать заявку' };
  }
}

export function RoomCard({
  room,
  onDetails,
  onPrimaryAction,
}: RoomCardProps) {
  const status = statusMap[room.membership];
  const primaryButton = getPrimaryButton(room);
  const hasCover = Boolean(room.coverUrl?.trim());

  return (
    <Card
      elevation={0}
      sx={{
        minHeight: 490,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderColor: alpha(fantasyColors.gold, 0.25),
        transition:
          'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',

        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(fantasyColors.gold, 0.52),
          boxShadow: `
            0 20px 45px ${alpha('#000000', 0.46)},
            0 0 24px ${alpha(fantasyColors.burgundy, 0.18)}
          `,
        },

        '&:hover .room-card-cover': {
          transform: 'scale(1.035)',
        },

        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',

          '&:hover': {
            transform: 'none',
          },

          '& .room-card-cover': {
            transition: 'none',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: 156,
          flexShrink: 0,
          overflow: 'hidden',
          backgroundColor: '#121014',
        }}
      >
        {hasCover && (
          <CardMedia
            className="room-card-cover"
            component="img"
            image={room.coverUrl}
            alt={`Обложка комнаты ${room.title}`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter:
                'saturate(0.72) contrast(1.08) brightness(0.78)',
              transition: 'transform 320ms ease',
            }}
          />
        )}

        {!hasCover && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#121014',
            }}
          />
        )}

        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, rgba(8, 6, 9, 0.08) 25%, rgba(8, 6, 9, 0.92) 100%)',
          }}
        />

        <Chip
          label={status.label}
          size="small"
          variant="outlined"
          sx={{
            position: 'absolute',
            zIndex: 2,
            top: 12,
            right: 12,
            maxWidth: 'calc(100% - 24px)',
            backdropFilter: 'blur(7px)',
            ...statusToneStyles[status.tone],
          }}
        />

        <Typography
          variant="overline"
          sx={{
            position: 'absolute',
            zIndex: 2,
            left: 16,
            right: 16,
            bottom: 10,
            color: 'primary.light',
            fontSize: '0.58rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textShadow: `0 1px 8px ${fantasyColors.void}`,
          }}
        >
          Кампания · {room.createdAt}
        </Typography>
      </Box>

      <CardContent
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          px: 2,
          pt: 1.75,
          pb: 1.5,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            minHeight: '2.4em',
            fontSize: '1.28rem',
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            overflowWrap: 'anywhere',
          }}
        >
          {room.title}
        </Typography>

        <Box
          aria-hidden="true"
          sx={{
            width: 72,
            height: '1px',
            flexShrink: 0,
            mt: 1.1,
            background: `linear-gradient(
              90deg,
              ${fantasyColors.gold},
              transparent
            )`,
            opacity: 0.52,
          }}
        />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1.25,
            minHeight: '4.5em',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            overflowWrap: 'anywhere',
          }}
        >
          {room.description || 'Описание комнаты пока не добавлено.'}
        </Typography>

        <Stack
          spacing={0.8}
          sx={{
            mt: 'auto',
            pt: 1.75,
            minWidth: 0,
          }}
        >
          <Stack
            direction="row"
            spacing={0.85}
            sx={{
              minWidth: 0,
              alignItems: 'center',
            }}
          >
            <PersonOutlineRoundedIcon
              fontSize="small"
              sx={{
                flexShrink: 0,
                color: 'primary.main',
                opacity: 0.8,
              }}
            />

            <Typography
              variant="body2"
              noWrap
              title={`Мастер: ${room.masterName}`}
            >
              Мастер: {room.masterName}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.85}
            sx={{
              minWidth: 0,
              alignItems: 'center',
            }}
          >
            <GroupOutlinedIcon
              fontSize="small"
              sx={{
                flexShrink: 0,
                color: 'primary.main',
                opacity: 0.8,
              }}
            />

            <Typography variant="body2" noWrap>
              {room.playersCount} / {room.playersLimit} игроков
            </Typography>
          </Stack>
        </Stack>
      </CardContent>

      <CardActions
        disableSpacing
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.5,
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 1,
          borderTop: `1px solid ${alpha(
            fantasyColors.gold,
            0.16,
          )}`,
          backgroundColor: alpha(fantasyColors.void, 0.88),
        }}
      >
        <Tooltip title={`Создана: ${room.createdAt}`}>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            onClick={() => onDetails(room)}
            sx={{
              minWidth: 0,
              minHeight: 38,
            }}
          >
            Подробнее
          </Button>
        </Tooltip>

        <Button
          size="small"
          variant="contained"
          fullWidth
          endIcon={
            room.membership === 'owner' ||
            room.membership === 'member' ? (
              <OpenInNewRoundedIcon />
            ) : undefined
          }
          onClick={() => onPrimaryAction(room)}
          disabled={primaryButton.disabled}
          sx={{
            minWidth: 0,
            minHeight: 40,
            lineHeight: 1.25,
            whiteSpace: 'normal',
          }}
        >
          {primaryButton.label}
        </Button>
      </CardActions>
    </Card>
  );
}