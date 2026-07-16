import { Add, Remove, TuneOutlined } from '@mui/icons-material';
import { Box, IconButton, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  calculateCharacterStats,
  formatModifier,
  getAbilityModifier,
} from '../../../types/playerCharacter';
import { playerRoomColors } from '../playerRoomTheme';
import { CreationStepFrame } from './CreationStepFrame';
import type { CreationStepProps } from './wizardTypes';

export function AbilitiesStep({ draft, updateDraft }: CreationStepProps) {
  const stats = calculateCharacterStats(draft);

  const changeAbility = (ability: (typeof ABILITY_NAMES)[number], value: number) => {
    updateDraft((current) => ({
      ...current,
      abilities: { ...current.abilities, [ability]: value },
    }));
  };

  return (
    <CreationStepFrame
      eyebrow="Шаг 4 · Характеристики"
      title="Распределите сильные стороны"
      description="Допустимы значения от 1 до 30. Модификаторы и производные показатели рассчитываются автоматически."
      icon={<TuneOutlined />}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {ABILITY_NAMES.map((ability) => {
          const score = draft.abilities[ability];
          return (
            <Paper
              key={ability}
              elevation={0}
              className="pr-medallion"
              sx={{
                minHeight: { xs: 142, xl: 180 },
                p: 1.25,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                background: `radial-gradient(circle at 50% 35%, ${alpha(playerRoomColors.gold, 0.09)}, transparent 62%), ${playerRoomColors.panel}`,
              }}
            >
              <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.62rem' }}>
                {ABILITY_LABELS[ability]}
              </Typography>
              <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '2rem', lineHeight: 1.05 }}>
                {formatModifier(getAbilityModifier(score))}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                <Tooltip title="Уменьшить">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Уменьшить: ${ABILITY_LABELS[ability]}`}
                      disabled={score <= 1}
                      onClick={() => changeAbility(ability, Math.max(1, score - 1))}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <TextField
                  type="number"
                  size="small"
                  value={score}
                  onChange={(event) => changeAbility(ability, Number(event.target.value))}
                  inputProps={{
                    min: 1,
                    max: 30,
                    'aria-label': `Значение характеристики ${ABILITY_LABELS[ability]}`,
                    style: { textAlign: 'center', paddingInline: 2 },
                  }}
                  sx={{ width: 58 }}
                />
                <Tooltip title="Увеличить">
                  <span>
                    <IconButton
                      size="small"
                      aria-label={`Увеличить: ${ABILITY_LABELS[ability]}`}
                      disabled={score >= 30}
                      onClick={() => changeAbility(ability, Math.min(30, score + 1))}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Paper>
          );
        })}
      </Box>

      <Box
        sx={{
          mt: 1.25,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 0.75,
        }}
      >
        {[
          ['Класс доспеха', stats.armorClass],
          ['Инициатива', formatModifier(stats.initiative)],
          ['Максимум HP', stats.maxHp],
          ['Бонус владения', formatModifier(stats.proficiencyBonus)],
        ].map(([label, value]) => (
          <Stack
            key={label}
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={0.5}
            sx={{ px: 1.25, py: 0.75, border: `1px solid ${alpha(playerRoomColors.gold, 0.14)}`, backgroundColor: alpha('#000000', 0.1) }}
          >
            <Typography variant="caption" color="text.secondary" textAlign="center">{label}</Typography>
            <Typography sx={{ color: 'primary.main', fontFamily: 'Georgia, serif' }}>{value}</Typography>
          </Stack>
        ))}
      </Box>
    </CreationStepFrame>
  );
}
