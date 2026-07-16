import { CasinoOutlined, DeleteOutline, FlareOutlined } from '@mui/icons-material';
import { Box, Button, ButtonBase, IconButton, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { DICE, usePlayerRoomStore } from '../../../store/playerRoomStore';
import { formatModifier } from '../../../types/playerCharacter';
import { playerRoomColors } from '../playerRoomTheme';

export function CharacterDiceTab() {
  const selectedDie = usePlayerRoomStore((state) => state.selectedDie);
  const modifier = usePlayerRoomStore((state) => state.diceModifier);
  const history = usePlayerRoomStore((state) => state.rollHistory);
  const selectDie = usePlayerRoomStore((state) => state.selectDie);
  const setModifier = usePlayerRoomStore((state) => state.setDiceModifier);
  const rollDice = usePlayerRoomStore((state) => state.rollDice);
  const clearHistory = usePlayerRoomStore((state) => state.clearRollHistory);
  const latestRoll = history[0];

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 330px' },
        gap: 1.25,
      }}
    >
      <Paper
        elevation={0}
        className="pr-frame"
        sx={{
          minHeight: 0,
          overflow: 'hidden',
          p: { xs: 1.5, lg: 2.25 },
          display: 'grid',
          gridTemplateRows: 'auto auto minmax(0, 1fr)',
          gap: { xs: 1.25, lg: 1.75 },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CasinoOutlined color="primary" />
            <Box>
              <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', lg: '1.55rem' } }}>
                Зал бросков
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Выберите руну кубика и доверьтесь судьбе
              </Typography>
            </Box>
          </Stack>
          <Typography variant="overline" color="primary.main" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.62rem' }}>
            Комната приключения
          </Typography>
        </Stack>

        <Box
          role="group"
          aria-label="Выбор кубика"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(60px, 1fr))',
            gap: { xs: 0.55, lg: 1 },
          }}
        >
          {DICE.map((die) => {
            const active = selectedDie === die;
            return (
              <ButtonBase
                key={die}
                className="pr-die-token"
                onClick={() => selectDie(die)}
                aria-label={`Выбрать кубик d${die}`}
                aria-pressed={active}
                sx={{
                  minHeight: { xs: 58, lg: 72 },
                  color: active ? 'primary.light' : 'text.secondary',
                  border: `1px solid ${active ? alpha(playerRoomColors.gold, 0.9) : alpha(playerRoomColors.gold, 0.24)}`,
                  background: active
                    ? `radial-gradient(circle, ${alpha(playerRoomColors.gold, 0.22)}, ${alpha(playerRoomColors.burgundy, 0.58)})`
                    : `radial-gradient(circle, ${alpha(playerRoomColors.gold, 0.05)}, ${alpha('#000000', 0.26)})`,
                  filter: active ? `drop-shadow(0 0 9px ${alpha(playerRoomColors.gold, 0.3)})` : 'none',
                  transition: 'color 150ms ease, filter 150ms ease, transform 150ms ease',
                  '&:hover': { color: 'primary.light', transform: 'translateY(-2px)' },
                  '&.Mui-focusVisible': { outline: `2px solid ${playerRoomColors.gold}`, outlineOffset: 2 },
                }}
              >
                <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '0.9rem', lg: '1.05rem' } }}>
                  d{die}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>

        <Box
          sx={{
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(220px, 0.72fr) minmax(290px, 1.2fr)' },
            gap: { xs: 1.25, lg: 2 },
            alignItems: 'stretch',
          }}
        >
          <Stack
            justifyContent="center"
            spacing={1.4}
            sx={{
              p: { xs: 1.5, lg: 2.25 },
              border: `1px solid ${alpha(playerRoomColors.gold, 0.18)}`,
              backgroundColor: alpha('#000000', 0.14),
            }}
          >
            <TextField
              label="Модификатор"
              type="number"
              value={modifier}
              onChange={(event) => {
                const value = Number(event.target.value);
                setModifier(Number.isFinite(value) ? value : 0);
              }}
              inputProps={{ 'aria-label': 'Модификатор броска' }}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<CasinoOutlined />}
              onClick={rollDice}
              sx={{ minHeight: 50, fontFamily: 'Georgia, serif', letterSpacing: '0.06em' }}
            >
              Бросить d{selectedDie}
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Результат сохраняется в истории текущей комнаты
            </Typography>
          </Stack>

          <Box
            aria-live="polite"
            aria-atomic="true"
            sx={{
              position: 'relative',
              minHeight: 190,
              display: 'grid',
              placeItems: 'center',
              overflow: 'hidden',
              border: `1px solid ${alpha(playerRoomColors.gold, 0.24)}`,
              background: `radial-gradient(circle at 50% 48%, ${alpha(playerRoomColors.burgundy, 0.34)}, transparent 52%), ${alpha('#000000', 0.16)}`,
            }}
          >
            <FlareOutlined
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                p: 2,
                color: alpha(playerRoomColors.gold, 0.055),
              }}
            />
            {latestRoll ? (
              <Stack key={latestRoll.id} className="pr-roll-result" alignItems="center" spacing={0.7} sx={{ position: 'relative' }}>
                <Typography variant="overline" color="primary.main">Итог броска</Typography>
                <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '3.5rem', lg: '5rem' }, lineHeight: 0.92, textShadow: `0 0 24px ${alpha(playerRoomColors.gold, 0.32)}` }}>
                  {latestRoll.total}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary" display="block">Кубик</Typography>
                    <Typography sx={{ fontFamily: 'Georgia, serif' }}>{latestRoll.naturalRoll}</Typography>
                  </Box>
                  <Typography color="text.secondary">+</Typography>
                  <Box textAlign="center">
                    <Typography variant="caption" color="text.secondary" display="block">Модификатор</Typography>
                    <Typography sx={{ fontFamily: 'Georgia, serif' }}>{formatModifier(latestRoll.modifier)}</Typography>
                  </Box>
                </Stack>
              </Stack>
            ) : (
              <Stack alignItems="center" spacing={1} sx={{ position: 'relative', color: 'text.secondary' }}>
                <CasinoOutlined sx={{ fontSize: 48, opacity: 0.45 }} />
                <Typography variant="body2">Первый бросок ещё впереди</Typography>
              </Stack>
            )}
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        className="pr-frame"
        sx={{ minHeight: 0, overflow: 'hidden', p: 1.75, display: 'flex', flexDirection: 'column' }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Box>
            <Typography variant="h6">История</Typography>
            <Typography variant="caption" color="text.secondary">Последние десять бросков</Typography>
          </Box>
          {history.length > 0 && (
            <Tooltip title="Очистить историю">
              <IconButton aria-label="Очистить историю бросков" size="small" onClick={clearHistory}>
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        <Stack className="pr-scroll-region" spacing={0.65} sx={{ mt: 1.25, pr: 0.5 }}>
          {history.length > 0 ? history.map((roll, index) => (
            <Stack
              key={roll.id}
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{
                minHeight: 43,
                px: 1,
                borderLeft: `2px solid ${index === 0 ? playerRoomColors.gold : alpha(playerRoomColors.gold, 0.13)}`,
                backgroundColor: index === 0 ? alpha(playerRoomColors.gold, 0.055) : alpha('#000000', 0.1),
              }}
            >
              <Typography variant="caption" color="primary.main" sx={{ width: 35, fontFamily: 'Georgia, serif' }}>
                d{roll.die}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                {roll.naturalRoll} {formatModifier(roll.modifier)}
              </Typography>
              <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1.15rem' }}>{roll.total}</Typography>
            </Stack>
          )) : (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">История пока пуста.</Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
