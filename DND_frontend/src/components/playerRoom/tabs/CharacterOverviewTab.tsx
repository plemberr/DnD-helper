import {
  AutoAwesomeOutlined,
  BackpackOutlined,
  CheckCircleOutline,
  MilitaryTechOutlined,
} from '@mui/icons-material';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  SKILLS,
  formatModifier,
  getAbilityModifier,
  type PlayerCharacter,
} from '../../../types/playerCharacter';
import { playerRoomColors } from '../playerRoomTheme';
import { getSavingThrowBonus, normalizeFeatures, normalizeInventory } from './tabUtils';

type CharacterOverviewTabProps = {
  character: PlayerCharacter;
};

const sectionTitleSx = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  color: 'primary.main',
  fontSize: '0.74rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  '& svg': { fontSize: 18 },
};

export function CharacterOverviewTab({ character }: CharacterOverviewTabProps) {
  const strongestAbilities = [...ABILITY_NAMES]
    .sort((left, right) => character.abilities[right] - character.abilities[left])
    .slice(0, 2);
  const topSkills = SKILLS.map((skill) => ({
    ...skill,
    proficient: character.proficientSkills.includes(skill.key),
    bonus:
      getAbilityModifier(character.abilities[skill.ability]) +
      (character.proficientSkills.includes(skill.key) ? character.proficiencyBonus : 0),
  }))
    .sort((left, right) => right.bonus - left.bonus || Number(right.proficient) - Number(left.proficient))
    .slice(0, 6);
  const equipment = normalizeInventory(character.inventory, character.inventoryDetails).slice(0, 4);
  const features = normalizeFeatures(character.features, character.featureDetails).slice(0, 4);

  return (
    <Box
      className="pr-scroll-region"
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: 1.25,
        pr: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(3, 1fr)', md: 'repeat(6, minmax(0, 1fr))' },
          gap: { xs: 0.75, lg: 1.25 },
        }}
      >
        {ABILITY_NAMES.map((ability) => {
          const score = character.abilities[ability];
          const featured = strongestAbilities.includes(ability);
          return (
            <Paper
              key={ability}
              elevation={0}
              className="pr-medallion"
              sx={{
                minHeight: { xs: 92, lg: 112 },
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
                px: 1,
                py: 1.15,
                borderColor: featured ? alpha(playerRoomColors.gold, 0.76) : 'divider',
                background: featured
                  ? `radial-gradient(circle at 50% 32%, ${alpha(playerRoomColors.gold, 0.13)}, transparent 65%), ${playerRoomColors.panel}`
                  : undefined,
                boxShadow: featured ? `0 0 20px ${alpha(playerRoomColors.gold, 0.08)}` : undefined,
              }}
            >
              <Box>
                <Typography variant="overline" color={featured ? 'primary.main' : 'text.secondary'} sx={{ fontSize: '0.63rem' }}>
                  {ABILITY_LABELS[ability]}
                </Typography>
                <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '1.55rem', lg: '2rem' }, lineHeight: 1 }}>
                  {formatModifier(getAbilityModifier(score))}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  значение {score}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Box
        sx={{
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.05fr 1.4fr' },
          gap: 1.25,
        }}
      >
        <Paper elevation={0} className="pr-frame" sx={{ p: 2, minHeight: 0 }}>
          <Typography sx={sectionTitleSx}>
            <CheckCircleOutline /> Спасброски
          </Typography>
          <Stack spacing={0.45} sx={{ mt: 1.25 }}>
            {ABILITY_NAMES.map((ability) => {
              const save = getSavingThrowBonus(character, ability);
              return (
                <Stack
                  key={ability}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    minHeight: 30,
                    px: 1,
                    borderLeft: `2px solid ${save.proficient ? playerRoomColors.gold : alpha(playerRoomColors.gold, 0.12)}`,
                    backgroundColor: save.proficient ? alpha(playerRoomColors.gold, 0.055) : 'transparent',
                  }}
                >
                  <Typography variant="body2" color={save.proficient ? 'text.primary' : 'text.secondary'}>
                    {ABILITY_LABELS[ability]}
                  </Typography>
                  <Typography sx={{ fontFamily: 'Georgia, serif', color: save.proficient ? 'primary.main' : 'text.primary' }}>
                    {formatModifier(save.bonus)}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Paper>

        <Paper elevation={0} className="pr-frame" sx={{ p: 2, minHeight: 0 }}>
          <Typography sx={sectionTitleSx}>
            <MilitaryTechOutlined /> Лучшие навыки
          </Typography>
          <Stack spacing={0.45} sx={{ mt: 1.25 }}>
            {topSkills.map((skill) => (
              <Stack
                key={skill.key}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ minHeight: 30, px: 1, backgroundColor: alpha('#000000', 0.12) }}
              >
                <Box minWidth={0}>
                  <Typography variant="body2" noWrap>{skill.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ABILITY_LABELS[skill.ability]}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Georgia, serif', color: skill.proficient ? 'primary.main' : 'text.primary' }}>
                  {formatModifier(skill.bonus)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          className="pr-frame"
          sx={{
            p: 2,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Box minWidth={0}>
            <Typography sx={sectionTitleSx}>
              <BackpackOutlined /> Снаряжение
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 1.25 }}>
              {equipment.length > 0 ? equipment.map((item) => (
                <Box key={item.id} sx={{ pl: 1, borderLeft: `1px solid ${alpha(playerRoomColors.gold, 0.32)}` }}>
                  <Typography variant="body2" noWrap title={item.name}>{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.type}</Typography>
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary">Снаряжение отсутствует.</Typography>
              )}
            </Stack>
          </Box>
          <Box minWidth={0}>
            <Typography sx={sectionTitleSx}>
              <AutoAwesomeOutlined /> Черты
            </Typography>
            <Stack spacing={0.75} sx={{ mt: 1.25 }}>
              {features.length > 0 ? features.map((feature) => (
                <Box key={feature.id} sx={{ pl: 1, borderLeft: `1px solid ${alpha(playerRoomColors.burgundy, 0.9)}` }}>
                  <Typography variant="body2" noWrap title={feature.name}>{feature.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {feature.summary}
                  </Typography>
                </Box>
              )) : (
                <Typography variant="body2" color="text.secondary">Черты пока не указаны.</Typography>
              )}
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
