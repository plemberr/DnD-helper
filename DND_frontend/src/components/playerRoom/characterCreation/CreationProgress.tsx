import { Check, RadioButtonUnchecked } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { playerRoomColors } from '../playerRoomTheme';

export const creationSteps = [
  'Личность',
  'Происхождение',
  'Класс',
  'Характеристики',
  'Навыки',
  'Снаряжение',
  'Подтверждение',
] as const;

type CreationProgressProps = {
  activeStep: number;
};

export function CreationProgress({ activeStep }: CreationProgressProps) {
  return (
    <Box
      component="aside"
      aria-label="Этапы создания персонажа"
      sx={{
        minHeight: 0,
        px: { md: 1.5, lg: 2 },
        py: 1.5,
        borderRight: { md: `1px solid ${alpha(playerRoomColors.gold, 0.18)}` },
        background: `linear-gradient(180deg, ${alpha(playerRoomColors.burgundyDeep, 0.42)}, ${alpha('#000000', 0.12)})`,
      }}
    >
      <Stack
        component="ol"
        direction={{ xs: 'row', md: 'column' }}
        spacing={{ xs: 0.5, md: 0.35 }}
        sx={{ listStyle: 'none', m: 0, p: 0, overflowX: 'auto' }}
      >
        {creationSteps.map((step, index) => {
          const active = index === activeStep;
          const completed = index < activeStep;
          return (
            <Stack
              component="li"
              key={step}
              direction="row"
              alignItems="center"
              spacing={1.1}
              aria-current={active ? 'step' : undefined}
              sx={{
                position: 'relative',
                minWidth: { xs: 130, md: 0 },
                minHeight: { xs: 40, md: 48 },
                px: 1,
                color: active ? 'primary.light' : completed ? 'text.primary' : 'text.secondary',
                borderLeft: { md: `2px solid ${active ? playerRoomColors.gold : 'transparent'}` },
                backgroundColor: active ? alpha(playerRoomColors.gold, 0.07) : 'transparent',
              }}
            >
              <Box
                sx={{
                  width: 25,
                  height: 25,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  color: completed || active ? 'primary.main' : 'text.secondary',
                  border: `1px solid ${completed || active ? alpha(playerRoomColors.gold, 0.65) : alpha(playerRoomColors.textMuted, 0.22)}`,
                  fontSize: '0.72rem',
                }}
              >
                {completed ? <Check sx={{ fontSize: 15 }} /> : active ? index + 1 : <RadioButtonUnchecked sx={{ fontSize: 13 }} />}
              </Box>
              <Box minWidth={0}>
                <Typography variant="caption" color="inherit" noWrap display="block">
                  {step}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', lg: 'block' }, fontSize: '0.62rem' }}>
                  {completed ? 'Завершено' : active ? 'Текущий этап' : `Шаг ${index + 1}`}
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
