import {
  DirectionsRunOutlined,
  ExploreOutlined,
  ShieldOutlined,
  VisibilityOutlined,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import { Avatar, Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { formatModifier, type PlayerCharacter } from '../../types/playerCharacter';
import { playerRoomColors } from './playerRoomTheme';

type CharacterHeroHeaderProps = {
  character: PlayerCharacter;
};

type HeaderStat = {
  label: string;
  value: string;
  icon: ReactNode;
};

export function CharacterHeroHeader({ character }: CharacterHeroHeaderProps) {
  const hpPercent = character.maxHp > 0
    ? Math.max(0, Math.min(100, (character.currentHp / character.maxHp) * 100))
    : 0;
  const initial = character.name.trim().charAt(0).toLocaleUpperCase('ru-RU') || '?';
  const stats: HeaderStat[] = [
    { label: 'Класс доспеха', value: String(character.armorClass), icon: <ShieldOutlined /> },
    { label: 'Инициатива', value: formatModifier(character.initiative), icon: <ExploreOutlined /> },
    { label: 'Скорость', value: `${character.speed} фт.`, icon: <DirectionsRunOutlined /> },
    {
      label: 'Бонус владения',
      value: formatModifier(character.proficiencyBonus),
      icon: <WorkspacePremiumOutlined />,
    },
    { label: 'Пасс. восприятие', value: String(character.passivePerception), icon: <VisibilityOutlined /> },
  ];

  return (
    <Paper
      component="header"
      elevation={0}
      className="pr-frame"
      sx={{
        minHeight: { xs: 154, lg: 142 },
        overflow: 'hidden',
        background: `linear-gradient(112deg, ${alpha(playerRoomColors.burgundyDeep, 0.92)} 0%, ${alpha(playerRoomColors.panelRaised, 0.98)} 42%, ${alpha(playerRoomColors.void, 0.96)} 100%)`,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(330px, 0.95fr) minmax(500px, 1.5fr)' },
          alignItems: 'stretch',
          height: '100%',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 1.5, lg: 2.25 }}
          sx={{ px: { xs: 2, lg: 3 }, py: { xs: 1.5, lg: 2 }, minWidth: 0 }}
        >
          <Avatar
            aria-label={`Портрет персонажа ${character.name}`}
            sx={{
              width: { xs: 70, lg: 86 },
              height: { xs: 70, lg: 86 },
              flexShrink: 0,
              color: playerRoomColors.gold,
              fontFamily: 'Georgia, Palatino, serif',
              fontSize: { xs: '2rem', lg: '2.5rem' },
              border: `1px solid ${alpha(playerRoomColors.gold, 0.72)}`,
              outline: `4px double ${alpha(playerRoomColors.brass, 0.36)}`,
              background: `radial-gradient(circle at 38% 28%, ${playerRoomColors.burgundy}, ${playerRoomColors.burgundyDeep} 52%, #0b090c 100%)`,
              boxShadow: `0 0 28px ${alpha(playerRoomColors.burgundy, 0.5)}`,
            }}
          >
            {initial}
          </Avatar>

          <Box minWidth={0} flex={1}>
            <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.66rem' }}>
              Персонаж · уровень {character.level}
            </Typography>
            <Typography
              component="h1"
              variant="h4"
              noWrap
              title={character.name}
              sx={{ fontSize: { xs: '1.55rem', lg: '2rem' }, lineHeight: 1.08 }}
            >
              {character.name}
            </Typography>
            <Typography color="text.secondary" noWrap sx={{ mt: 0.45, fontSize: '0.83rem' }}>
              {character.race} · {character.characterClass}, {character.subclass}
            </Typography>
            <Typography color="text.secondary" noWrap sx={{ fontSize: '0.75rem', opacity: 0.82 }}>
              {character.background}
            </Typography>

            <Box sx={{ mt: 1.1 }}>
              <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={1}>
                <Typography variant="caption" sx={{ color: '#d9b3aa', letterSpacing: '0.08em' }}>
                  ЗДОРОВЬЕ
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Georgia, serif', fontWeight: 700 }}>
                  {character.currentHp} / {character.maxHp}
                </Typography>
              </Stack>
              <LinearProgress
                aria-label={`Здоровье: ${character.currentHp} из ${character.maxHp}`}
                variant="determinate"
                value={hpPercent}
                sx={{ mt: 0.35 }}
              />
            </Box>
          </Box>
        </Stack>

        <Box
          sx={{
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: 'repeat(5, minmax(88px, 1fr))',
            alignItems: 'center',
            gap: { md: 0.75, lg: 1.25 },
            px: { md: 2, lg: 3 },
            py: 2,
            borderLeft: `1px solid ${alpha(playerRoomColors.gold, 0.17)}`,
            background: `linear-gradient(90deg, ${alpha('#000000', 0.08)}, ${alpha('#000000', 0.28)})`,
          }}
        >
          {stats.map((stat) => (
            <Stack
              key={stat.label}
              className="pr-medallion"
              alignItems="center"
              justifyContent="center"
              spacing={0.25}
              sx={{
                minHeight: 84,
                px: 1,
                border: `1px solid ${alpha(playerRoomColors.gold, 0.27)}`,
                borderRadius: '44% 44% 6px 6px',
                color: 'primary.main',
                background: `radial-gradient(circle at 50% 5%, ${alpha(playerRoomColors.gold, 0.09)}, transparent 58%), ${alpha(playerRoomColors.void, 0.34)}`,
              }}
            >
              <Box sx={{ display: 'flex', '& svg': { fontSize: 20 } }}>{stat.icon}</Box>
              <Typography sx={{ color: 'text.primary', fontFamily: 'Georgia, serif', fontSize: '1.28rem' }}>
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                align="center"
                sx={{ color: 'text.secondary', fontSize: '0.62rem', lineHeight: 1.15 }}
              >
                {stat.label}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
