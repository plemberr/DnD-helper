import { AppHeader } from '../components/AppHeader';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { fantasyPageBackground, fantasyTokens, ornateCornersSx } from '../theme/fantasyTheme';

type RoomPageProps = {
  onOpenAdmin: () => void;
  onOpenRoom: () => void;
};

export function RoomPage({ onOpenAdmin, onOpenRoom }: RoomPageProps) {
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
          <Box component="aside" sx={{ width: 240, flexShrink: 0, borderRight: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanel }}>
            <Box sx={{ px: 1.5, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                Описание
              </Typography>
              <Paper variant="outlined" sx={{ mt: 1.5, p: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Здесь мастер сможет кратко описать сцену, правила или подсказки для участников.
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ p: 1.5 }}>
              <Paper variant="outlined" sx={{ px: 1.5, py: 1 }}>
                <Typography variant="subtitle2">Дм</Typography>
              </Paper>

              <Stack spacing={0.5} sx={{ mt: 2 }}>
                {['Участник1', 'Участник1', 'Участник1', 'Участник1'].map((name, index) => (
                  <Box key={`${name}-${index}`} sx={{ px: 1, py: 0.75, borderRadius: 1, '&:hover': { bgcolor: 'background.paper' } }}>
                    <Typography variant="body2">{name}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box component="section" sx={{ display: 'flex', minWidth: 0, flex: 1, flexDirection: 'column', borderRight: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanel }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ height: 40, px: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanelRaised }}>
              <Chip size="small" label="Комната мастера" variant="outlined" />
              <Typography variant="body2" color="text.disabled">
                /
              </Typography>
              <Chip size="small" label="Публичный экран" variant="outlined" />
            </Stack>

            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', px: 3, py: 4, textAlign: 'center' }}>
              <Box sx={{ width: '100%', maxWidth: 760 }}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  Комната
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
                    Здесь позже появится расшаренный контент со стороны админки.
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>

          <Box component="aside" sx={{ display: 'flex', width: 340, flexShrink: 0, flexDirection: 'column', borderLeft: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanel }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 48, px: 1.5, borderBottom: 1, borderColor: 'divider', bgcolor: fantasyTokens.bgPanelRaised }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Игроки
              </Typography>
              <IconButton size="small">
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={1.5} sx={{ p: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="subtitle2">Имя игрока</Typography>
                <Typography variant="body2" color="text.secondary">
                  Класс
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  34/34 hp
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="subtitle2">Имя игрока</Typography>
                <Typography variant="body2" color="text.secondary">
                  Класс
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  34/34 hp
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Typography variant="body2">Имя игрока хочет присоединиться</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button size="small" variant="outlined" color="warning">
                    Принять
                  </Button>
                  <Button size="small" variant="outlined" color="inherit">
                    Отклонить
                  </Button>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ mt: 2, p: 1.5 }}>
                <Button fullWidth variant="outlined" color="warning" sx={{ py: 1.5 }}>
                  Открыть полный лист персонажа
                </Button>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
