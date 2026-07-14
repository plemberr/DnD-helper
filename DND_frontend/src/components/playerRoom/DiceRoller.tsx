import { CasinoOutlined, DeleteOutline } from '@mui/icons-material';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DICE, usePlayerRoomStore } from '../../store/playerRoomStore';
import { formatModifier } from '../../types/playerCharacter';

export function DiceRoller() {
  const selectedDie = usePlayerRoomStore((state) => state.selectedDie);
  const modifier = usePlayerRoomStore((state) => state.diceModifier);
  const history = usePlayerRoomStore((state) => state.rollHistory);
  const selectDie = usePlayerRoomStore((state) => state.selectDie);
  const setModifier = usePlayerRoomStore((state) => state.setDiceModifier);
  const rollDice = usePlayerRoomStore((state) => state.rollDice);
  const clearHistory = usePlayerRoomStore((state) => state.clearRollHistory);

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Dice Roller
          </Typography>
          <CasinoOutlined color="primary" />
        </Stack>

        <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
          {DICE.map((die) => (
            <Button
              key={die}
              size="small"
              variant={selectedDie === die ? 'contained' : 'outlined'}
              onClick={() => selectDie(die)}
            >
              d{die}
            </Button>
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
          <TextField
            label="Модификатор"
            type="number"
            size="small"
            value={modifier}
            onChange={(event) => {
              const nextModifier = Number(event.target.value);
              setModifier(Number.isFinite(nextModifier) ? nextModifier : 0);
            }}
            sx={{ width: { sm: 150 } }}
          />
          <Button variant="contained" startIcon={<CasinoOutlined />} onClick={rollDice} fullWidth>
            Бросить d{selectedDie}
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" color="text.secondary">
            Последние броски
          </Typography>
          {history.length > 0 && (
            <Button size="small" color="inherit" startIcon={<DeleteOutline />} onClick={clearHistory}>
              Очистить
            </Button>
          )}
        </Stack>

        {history.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Выберите кубик и сделайте первый бросок.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mt: 1 }}>
            {history.map((roll) => (
              <Stack
                key={roll.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Chip size="small" color="primary" variant="outlined" label={`d${roll.die}`} />
                  <Typography variant="body2">
                    {roll.naturalRoll} {formatModifier(roll.modifier)}
                  </Typography>
                </Stack>
                <Typography variant="h6" component="span" sx={{ fontWeight: 800 }}>
                  {roll.total}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
