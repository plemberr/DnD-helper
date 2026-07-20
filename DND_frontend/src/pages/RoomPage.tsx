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
import {
  fantasyColors,
  fantasyGradients,
  fantasyPageBackground,
  fantasyShadows,
  fantasyTokens,
  ornateCornersSx,
} from '../theme/fantasyTheme';

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
          <Box
            component="aside"
            sx={{
              width: 240,
              flexShrink: 0,
              borderRight: 1,
              borderColor: fantasyColors.border,
              color: fantasyColors.text,
              backgroundColor: '#21191b',
              backgroundImage:
                'linear-gradient(180deg, rgba(87, 37, 45, 0.18), transparent 34%), linear-gradient(180deg, #21191b 0%, #171215 100%)',
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                borderBottom: 1,
                borderColor: fantasyColors.border,
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  fontWeight: 700,
                  color: fantasyColors.gold,
                }}
              >
                Описание
              </Typography>

              <Paper
                variant="outlined"
                sx={{
                  mt: 1.5,
                  p: 1.5,
                  color: fantasyColors.text,
                  backgroundColor: '#2a211d',
                  backgroundImage:
                    'linear-gradient(145deg, rgba(234, 211, 158, 0.035), transparent 38%)',
                  borderColor: fantasyColors.border,
                  boxShadow: fantasyShadows.panel,
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Здесь мастер сможет кратко описать сцену, правила или подсказки для участников.
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ p: 1.5 }}>
              <Paper
                variant="outlined"
                sx={{
                  px: 1.5,
                  py: 1,
                  color: fantasyColors.goldLight,
                  backgroundColor: '#241a1d',
                  borderColor: fantasyColors.borderStrong,
                  boxShadow: 'inset 3px 0 0 rgba(210, 173, 103, 0.72)',
                }}
              >
                <Typography variant="subtitle2">Дм</Typography>
              </Paper>

              <Stack spacing={0.5} sx={{ mt: 2 }}>
                {['Участник1', 'Участник1', 'Участник1', 'Участник1'].map((name, index) => (
                  <Box
                    key={`${name}-${index}`}
                    sx={{
                      px: 1,
                      py: 0.75,
                      borderRadius: 1,
                      color: fantasyColors.textMuted,
                      transition: 'color 150ms ease, background-color 150ms ease',
                      '&:hover': {
                        color: fantasyColors.text,
                        backgroundColor: 'rgba(210, 173, 103, 0.065)',
                      },
                    }}
                  >
                    <Typography variant="body2">{name}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box
            component="section"
            sx={{
              display: 'flex',
              minWidth: 0,
              flex: 1,
              flexDirection: 'column',
              borderRight: 1,
              borderColor: fantasyColors.border,
              backgroundColor: fantasyColors.backdrop,
              backgroundImage:
                'radial-gradient(circle at 50% 18%, rgba(87, 37, 45, 0.15), transparent 40%), linear-gradient(180deg, #151015 0%, #100d11 100%)',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                height: 40,
                px: 1.5,
                borderBottom: 1,
                borderColor: fantasyColors.border,
                backgroundColor: fantasyColors.panelRaised,
                backgroundImage: fantasyGradients.panelRaised,
                boxShadow: 'inset 0 -1px 0 rgba(210, 173, 103, 0.08)',
              }}
            >
              <Chip size="small" label="Комната мастера" variant="outlined" />
              <Typography variant="body2" color="text.disabled">
                /
              </Typography>
              <Chip size="small" label="Публичный экран" variant="outlined" />
            </Stack>

            <Box
              sx={{
                display: 'flex',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                px: 3,
                py: 4,
                textAlign: 'center',
              }}
            >
              <Box sx={{ width: '100%', maxWidth: 760 }}>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  Комната
                </Typography>

                <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                  Экран для показа текста, картинок, музыки и звука участникам
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    ...ornateCornersSx,
                    mt: 5,
                    p: 2,
                    textAlign: 'left',
                    color: fantasyColors.text,
                    backgroundColor: '#241a1d',
                    backgroundImage:
                      'linear-gradient(145deg, rgba(210, 173, 103, 0.04), transparent 32%), linear-gradient(180deg, rgba(87, 37, 45, 0.12), transparent 64%)',
                    borderColor: fantasyColors.borderStrong,
                    boxShadow: fantasyShadows.panel,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      pb: 1,
                      borderBottom: 1,
                      borderColor: fantasyColors.border,
                    }}
                  >
                    <Typography variant="subtitle2">Центральная область</Typography>

                    <Typography variant="body2" color="warning.light">
                      live
                    </Typography>
                  </Stack>

                  <Box
                    sx={{
                      mt: 1.5,
                      minHeight: 320,
                      borderRadius: 2,
                      border: 1,
                      borderStyle: 'dashed',
                      borderColor: fantasyColors.border,
                      bgcolor: fantasyTokens.bgDeepest,
                      boxShadow: 'inset 0 1px 24px rgba(0, 0, 0, 0.42)',
                    }}
                  />

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                    Здесь позже появится расшаренный контент со стороны админки.
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Box>

          <Box
            component="aside"
            sx={{
              display: 'flex',
              width: 340,
              flexShrink: 0,
              flexDirection: 'column',
              borderLeft: 1,
              borderColor: fantasyColors.border,
              color: fantasyColors.text,
              backgroundColor: '#17141a',
              backgroundImage:
                'radial-gradient(circle at 100% 0%, rgba(125, 141, 162, 0.07), transparent 38%), linear-gradient(180deg, #1b161c 0%, #100d11 100%)',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                height: 48,
                px: 1.5,
                borderBottom: 1,
                borderColor: fantasyColors.border,
                backgroundColor: fantasyColors.panelRaised,
                backgroundImage: fantasyGradients.panelRaised,
                boxShadow: 'inset 0 -1px 0 rgba(210, 173, 103, 0.08)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Игроки
              </Typography>

              <IconButton size="small">
                <AddIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={1.5} sx={{ p: 1.5 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  backgroundColor: '#241a1d',
                  borderColor: fantasyColors.border,
                  boxShadow: fantasyShadows.panel,
                }}
              >
                <Typography variant="subtitle2">Имя игрока</Typography>
                <Typography variant="body2" color="text.secondary">
                  Класс
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  34/34 hp
                </Typography>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  backgroundColor: '#21191b',
                  borderColor: fantasyColors.border,
                  boxShadow: fantasyShadows.panel,
                }}
              >
                <Typography variant="subtitle2">Имя игрока</Typography>
                <Typography variant="body2" color="text.secondary">
                  Класс
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" color="text.secondary">
                  34/34 hp
                </Typography>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  backgroundColor: '#281b1f',
                  backgroundImage:
                    'linear-gradient(145deg, rgba(87, 37, 45, 0.2), transparent 48%)',
                  borderColor: fantasyColors.borderStrong,
                  boxShadow: fantasyShadows.panel,
                }}
              >
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

              <Paper
                variant="outlined"
                sx={{
                  mt: 2,
                  p: 1.5,
                  backgroundColor: '#1d1519',
                  borderColor: fantasyColors.border,
                  boxShadow: fantasyShadows.panel,
                }}
              >
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