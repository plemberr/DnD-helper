import { useEffect, useMemo, useState } from 'react';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

import { roomsService, type JoinRequestListItemDto, type RoomDetailDto } from '../api/roomsService';
import { AppHeader } from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { fantasyPageBackground, fantasyTokens, ornateCornersSx } from '../theme/fantasyTheme';
import { readAccessToken } from '../utils/authSession';
import { readActiveAdminRoomId, saveActiveAdminRoomId } from '../utils/roomSession';

type RoomPageProps = {
  onOpenAdmin: () => void;
  onOpenRoom: () => void;
};

type MessageState = {
  text: string;
  severity: 'success' | 'error';
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getRoleLabel(role: string): string {
  if (role === 'master') {
    return 'Мастер';
  }

  if (role === 'co_master') {
    return 'Со-мастер';
  }

  return 'Игрок';
}

export function RoomPage({ onOpenAdmin, onOpenRoom }: RoomPageProps) {
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [room, setRoom] = useState<RoomDetailDto | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequestListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState<MessageState | null>(null);

  const { currentUser } = useAuth();
  const accessToken = readAccessToken();

  const master = useMemo(
    () => room?.members.find((member) => member.role === 'master') ?? null,
    [room],
  );
  const players = useMemo(
    () => room?.members.filter((member) => member.role !== 'master') ?? [],
    [room],
  );

  const loadRoomData = async (roomId: number, token: string) => {
    const [roomDetails, requestsResponse] = await Promise.all([
      roomsService.get(roomId),
      roomsService.listJoinRequests(roomId, token, 'pending'),
    ]);

    setRoom(roomDetails);
    setJoinRequests(requestsResponse.items);
  };

  const resolveActiveRoom = async () => {
    if (!accessToken) {
      setError('Сессия не найдена. Войдите снова, чтобы открыть комнату мастера.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const storedRoomId = readActiveAdminRoomId();

      if (storedRoomId) {
        setActiveRoomId(storedRoomId);
        await loadRoomData(storedRoomId, accessToken);
        return;
      }

      const myRoomsResponse = await roomsService.list({
        my: true,
        limit: 100,
        offset: 0,
        accessToken,
      });
      const ownerRoom =
        myRoomsResponse.items.find((item) => item.master_name === currentUser?.nickname) ??
        myRoomsResponse.items[0] ??
        null;

      if (!ownerRoom) {
        setActiveRoomId(null);
        setRoom(null);
        setJoinRequests([]);
        setError('Не найдена комната мастера. Создайте комнату на странице реестра.');
        return;
      }

      saveActiveAdminRoomId(ownerRoom.id);
      setActiveRoomId(ownerRoom.id);
      await loadRoomData(ownerRoom.id, accessToken);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Не удалось загрузить комнату и заявки.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRequests = async () => {
    if (!activeRoomId || !accessToken) {
      return;
    }

    setIsRequestsLoading(true);
    try {
      const requestsResponse = await roomsService.listJoinRequests(activeRoomId, accessToken, 'pending');
      setJoinRequests(requestsResponse.items);
    } catch (loadError) {
      setMessage({
        text:
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось обновить список заявок.',
        severity: 'error',
      });
    } finally {
      setIsRequestsLoading(false);
    }
  };

  useEffect(() => {
    void resolveActiveRoom();
  }, [accessToken, currentUser?.nickname]);

  const handleProcessRequest = async (
    request: JoinRequestListItemDto,
    status: 'accepted' | 'rejected',
  ) => {
    if (!activeRoomId || !accessToken) {
      setMessage({
        text: 'Сессия не найдена. Войдите снова.',
        severity: 'error',
      });
      return;
    }

    setProcessingRequestId(request.id);

    try {
      await roomsService.processJoinRequest(activeRoomId, request.id, status, accessToken);
      await loadRoomData(activeRoomId, accessToken);
      setMessage({
        text:
          status === 'accepted'
            ? `${request.username} принят в комнату.`
            : `Заявка ${request.username} отклонена.`,
        severity: 'success',
      });
    } catch (processError) {
      setMessage({
        text:
          processError instanceof Error
            ? processError.message
            : 'Не удалось обработать заявку.',
        severity: 'error',
      });
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        flexDirection: 'column',
        overflowX: 'hidden',
        background: fantasyPageBackground,
        color: 'text.primary',
      }}
    >
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <AppHeader isRoomScreen onOpenAdmin={onOpenAdmin} onOpenRoom={onOpenRoom} />

        <Box component="main" sx={{ display: 'flex', minHeight: 0, flex: 1, width: '100%' }}>
          <Box component="aside" sx={{ width: 260, flexShrink: 0, borderRight: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanel }}>
            <Box sx={{ px: 1.5, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Описание
              </Typography>
              <Paper variant="outlined" sx={{ mt: 1.5, p: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {room?.description?.trim() || 'Описание комнаты пока не добавлено.'}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ p: 1.5 }}>
              <Paper variant="outlined" sx={{ px: 1.5, py: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Мастер
                </Typography>
                <Typography variant="subtitle2">{master?.username ?? currentUser?.nickname ?? 'Не указан'}</Typography>
              </Paper>

              <Stack spacing={0.75} sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                  Участники
                </Typography>
                {players.length > 0 ? (
                  players.map((member) => (
                    <Box key={member.user_id} sx={{ px: 1, py: 0.75, borderRadius: 1, '&:hover': { bgcolor: 'background.paper' } }}>
                      <Typography variant="body2">{member.username}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getRoleLabel(member.role)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Игроков пока нет.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Box>

          <Box component="section" sx={{ display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column', borderRight: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanel }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ minHeight: 40, px: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanelRaised }}>
              <Chip size="small" label={room?.title ?? 'Комната мастера'} variant="outlined" />
              <Typography variant="body2" color="text.disabled">
                /
              </Typography>
              <Chip size="small" label="Публичный экран" variant="outlined" />
            </Stack>

            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 4, textAlign: 'center' }}>
              {isLoading ? (
                <CircularProgress />
              ) : error ? (
                <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 760, textAlign: 'left' }}>
                  <Alert severity="error">{error}</Alert>
                  <Button variant="outlined" color="warning" onClick={() => void resolveActiveRoom()}>
                    Повторить
                  </Button>
                </Stack>
              ) : (
                <Box sx={{ width: '100%', maxWidth: 760 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {room?.title ?? 'Комната'}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                    Экран для показа текста, картинок, музыки и звука участникам
                  </Typography>

                  <Paper variant="outlined" sx={{ ...ornateCornersSx, mt: 5, p: 2, textAlign: 'left' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2">Центральная область</Typography>
                      <Typography variant="body2" color="warning.light">
                        live
                      </Typography>
                    </Stack>
                    <Box sx={{ mt: 1.5, minHeight: 320, borderRadius: 2, border: 1, borderStyle: 'dashed', borderColor: 'divider', bgcolor: fantasyTokens.bgDeepest }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                      Здесь позже появится расширенный контент со стороны админки.
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          </Box>

          <Box component="aside" sx={{ display: 'flex', width: 360, flexShrink: 0, flexDirection: 'column', borderLeft: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanel }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 48, px: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanelRaised }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <GroupsRoundedIcon fontSize="small" color="warning" />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Игроки
                </Typography>
              </Stack>
              <Tooltip title="Обновить заявки">
                <span>
                  <IconButton size="small" onClick={() => void refreshRequests()} disabled={isRequestsLoading || !activeRoomId}>
                    {isRequestsLoading ? <CircularProgress size={18} /> : <RefreshRoundedIcon fontSize="small" />}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Stack spacing={1.5} sx={{ p: 1.5, overflowY: 'auto' }}>
              {players.length > 0 ? (
                players.map((member) => (
                  <Paper key={member.user_id} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2">{member.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getRoleLabel(member.role)}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Участник комнаты
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    В комнате пока нет игроков. Новые заявки появятся ниже.
                  </Typography>
                </Paper>
              )}

              <Divider />

              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">Заявки на вход</Typography>
                <Chip size="small" label={joinRequests.length} color={joinRequests.length ? 'warning' : 'default'} variant="outlined" />
              </Stack>

              {joinRequests.length > 0 ? (
                joinRequests.map((request) => {
                  const isProcessing = processingRequestId === request.id;

                  return (
                    <Paper key={request.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {request.username} хочет присоединиться
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Подана {formatDateTime(request.created_at)}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<CheckRoundedIcon />}
                          disabled={isProcessing}
                          onClick={() => void handleProcessRequest(request, 'accepted')}
                        >
                          Принять
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          startIcon={<CloseRoundedIcon />}
                          disabled={isProcessing}
                          onClick={() => void handleProcessRequest(request, 'rejected')}
                        >
                          Отклонить
                        </Button>
                      </Stack>
                    </Paper>
                  );
                })
              ) : (
                <Paper variant="outlined" sx={{ p: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Новых заявок нет.
                  </Typography>
                </Paper>
              )}

              <Paper variant="outlined" sx={{ mt: 2, p: 1.5 }}>
                <Button fullWidth variant="outlined" color="warning" sx={{ py: 1.5 }}>
                  Открыть полный лист персонажа
                </Button>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Box>

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
    </Box>
  );
}
