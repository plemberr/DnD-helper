import { PublicOutlined } from '@mui/icons-material';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { playerRoomColors } from '../playerRoomTheme';
import { CreationStepFrame } from './CreationStepFrame';
import { raceOptions } from './creationData';
import type { CreationStepProps } from './wizardTypes';

export function OriginStep({ draft, updateDraft }: CreationStepProps) {
  return (
    <CreationStepFrame
      eyebrow="Шаг 2 · Происхождение"
      title="Выберите народ героя"
      description="Происхождение определяет наследие и место персонажа в мире."
      icon={<PublicOutlined />}
    >
      <Box
        role="radiogroup"
        aria-label="Раса персонажа"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.15,
          alignContent: 'start',
          pt: 0.5,
        }}
      >
        {raceOptions.map((race) => {
          const selected = draft.race === race.name;
          return (
            <ButtonBase
              key={race.name}
              role="radio"
              aria-checked={selected}
              onClick={() => updateDraft((current) => ({ ...current, race: race.name }))}
              sx={{
                minHeight: { xs: 106, lg: 126 },
                p: 1.5,
                alignItems: 'stretch',
                justifyContent: 'stretch',
                textAlign: 'left',
                border: `1px solid ${selected ? alpha(playerRoomColors.gold, 0.78) : alpha(playerRoomColors.gold, 0.18)}`,
                background: selected
                  ? `linear-gradient(145deg, ${alpha(playerRoomColors.gold, 0.13)}, ${alpha(playerRoomColors.burgundy, 0.23)})`
                  : alpha('#000000', 0.12),
                boxShadow: selected ? `inset 0 0 22px ${alpha(playerRoomColors.gold, 0.05)}` : 'none',
                '&:hover': { borderColor: alpha(playerRoomColors.gold, 0.55), backgroundColor: alpha(playerRoomColors.gold, 0.045) },
                '&.Mui-focusVisible': { outline: `2px solid ${playerRoomColors.gold}`, outlineOffset: -2 },
              }}
            >
              <Stack spacing={0.75} sx={{ width: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      color: selected ? playerRoomColors.void : 'primary.main',
                      borderRadius: '50%',
                      border: `1px solid ${alpha(playerRoomColors.gold, 0.45)}`,
                      backgroundColor: selected ? 'primary.main' : alpha(playerRoomColors.gold, 0.04),
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {race.name.charAt(0)}
                  </Box>
                  <Typography sx={{ fontFamily: 'Georgia, serif', color: selected ? 'primary.light' : 'text.primary' }}>
                    {race.name}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
                  {race.description}
                </Typography>
              </Stack>
            </ButtonBase>
          );
        })}
      </Box>
    </CreationStepFrame>
  );
}
