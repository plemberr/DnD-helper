import { BadgeOutlined } from '@mui/icons-material';
import { Avatar, Box, Stack, TextField, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { playerRoomColors } from '../playerRoomTheme';
import { CreationStepFrame } from './CreationStepFrame';
import type { CreationStepProps } from './wizardTypes';

export function IdentityStep({ draft, updateDraft }: CreationStepProps) {
  const initial = draft.name.trim().charAt(0).toLocaleUpperCase('ru-RU') || '?';

  return (
    <CreationStepFrame
      eyebrow="Шаг 1 · Личность"
      title="Кем запомнят вашего героя?"
      description="Имя и предыстория задают первое впечатление о персонаже."
      icon={<BadgeOutlined />}
    >
      <Box
        sx={{
          minHeight: '100%',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 270px' },
          gap: { xs: 2, lg: 4 },
          alignItems: 'center',
        }}
      >
        <Stack spacing={2.2} sx={{ maxWidth: 760 }}>
          <TextField
            label="Имя персонажа"
            required
            autoFocus
            fullWidth
            value={draft.name}
            onChange={(event) => updateDraft((current) => ({ ...current, name: event.target.value }))}
            inputProps={{ maxLength: 80 }}
            helperText="Это имя будет отображаться в шапке комнаты."
          />
          <TextField
            label="Предыстория"
            required
            fullWidth
            value={draft.background}
            onChange={(event) => updateDraft((current) => ({ ...current, background: event.target.value }))}
            inputProps={{ maxLength: 120 }}
            placeholder="Например: Чужеземец, Мудрец, Народный герой"
            helperText="Коротко укажите прошлое или призвание героя."
          />
        </Stack>

        <Stack alignItems="center" spacing={1.5}>
          <Avatar
            aria-label="Заглушка портрета персонажа"
            sx={{
              width: { xs: 120, lg: 154 },
              height: { xs: 120, lg: 154 },
              color: 'primary.main',
              fontFamily: 'Georgia, serif',
              fontSize: '4rem',
              border: `1px solid ${alpha(playerRoomColors.gold, 0.72)}`,
              outline: `7px double ${alpha(playerRoomColors.brass, 0.28)}`,
              background: `radial-gradient(circle at 38% 28%, ${playerRoomColors.burgundy}, ${playerRoomColors.burgundyDeep} 54%, ${playerRoomColors.void})`,
              boxShadow: `0 0 36px ${alpha(playerRoomColors.burgundy, 0.42)}`,
            }}
          >
            {initial}
          </Avatar>
          <Box textAlign="center">
            <Typography sx={{ fontFamily: 'Georgia, serif' }}>{draft.name.trim() || 'Безымянный герой'}</Typography>
            <Typography variant="caption" color="text.secondary">Декоративный портрет</Typography>
          </Box>
        </Stack>
      </Box>
    </CreationStepFrame>
  );
}
