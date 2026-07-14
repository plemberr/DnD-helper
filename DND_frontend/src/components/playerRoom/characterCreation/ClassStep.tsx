import { LocalFireDepartmentOutlined } from '@mui/icons-material';
import { Box, ButtonBase, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { playerRoomColors } from '../playerRoomTheme';
import { CreationStepFrame } from './CreationStepFrame';
import { classOptions } from './creationData';
import type { CreationStepProps } from './wizardTypes';

export function ClassStep({ draft, updateDraft }: CreationStepProps) {
  return (
    <CreationStepFrame
      eyebrow="Шаг 3 · Класс"
      title="Определите путь героя"
      description="Выберите боевое призвание, специализацию и текущий уровень."
      icon={<LocalFireDepartmentOutlined />}
    >
      <Box
        role="radiogroup"
        aria-label="Класс персонажа"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 0.75,
          alignContent: 'start',
        }}
      >
        {classOptions.map((option) => {
          const selected = draft.characterClass === option.name;
          return (
            <ButtonBase
              key={option.name}
              role="radio"
              aria-checked={selected}
              onClick={() => updateDraft((current) => ({ ...current, characterClass: option.name }))}
              sx={{
                minHeight: 65,
                px: 1.2,
                py: 0.9,
                justifyContent: 'stretch',
                textAlign: 'left',
                borderLeft: `2px solid ${selected ? playerRoomColors.gold : alpha(playerRoomColors.gold, 0.12)}`,
                borderTop: `1px solid ${alpha(playerRoomColors.gold, selected ? 0.35 : 0.1)}`,
                borderBottom: `1px solid ${alpha(playerRoomColors.gold, selected ? 0.35 : 0.1)}`,
                backgroundColor: selected ? alpha(playerRoomColors.gold, 0.075) : alpha('#000000', 0.1),
                '&:hover': { backgroundColor: alpha(playerRoomColors.gold, 0.045) },
                '&.Mui-focusVisible': { outline: `2px solid ${playerRoomColors.gold}`, outlineOffset: -2 },
              }}
            >
              <Box minWidth={0}>
                <Typography variant="body2" sx={{ color: selected ? 'primary.light' : 'text.primary', fontFamily: 'Georgia, serif' }}>
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {option.description}
                </Typography>
              </Box>
            </ButtonBase>
          );
        })}
      </Box>

      <Box
        sx={{
          mt: 1.5,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 190px' },
          gap: 1.5,
        }}
      >
        <TextField
          label="Подкласс"
          required
          fullWidth
          value={draft.subclass}
          onChange={(event) => updateDraft((current) => ({ ...current, subclass: event.target.value }))}
          placeholder="Например: Охотник"
          inputProps={{ maxLength: 100 }}
        />
        <TextField
          label="Уровень"
          type="number"
          required
          fullWidth
          value={draft.level}
          onChange={(event) => updateDraft((current) => ({ ...current, level: Number(event.target.value) }))}
          inputProps={{ min: 1, max: 20 }}
        />
      </Box>
    </CreationStepFrame>
  );
}
