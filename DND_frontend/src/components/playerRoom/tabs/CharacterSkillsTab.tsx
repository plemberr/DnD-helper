import { Check, CircleOutlined, MilitaryTechOutlined, StarsOutlined } from '@mui/icons-material';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
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
import { getSavingThrowBonus } from './tabUtils';

type CharacterSkillsTabProps = {
  character: PlayerCharacter;
};

function ProficiencyMark({ active }: { active: boolean }) {
  return (
    <Box
      aria-label={active ? 'Есть владение' : 'Нет владения'}
      title={active ? 'Есть владение' : 'Нет владения'}
      sx={{
        width: 22,
        height: 22,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        color: active ? 'primary.main' : 'text.secondary',
        border: `1px solid ${active ? alpha(playerRoomColors.gold, 0.78) : alpha(playerRoomColors.textMuted, 0.25)}`,
        borderRadius: '50%',
        backgroundColor: active ? alpha(playerRoomColors.gold, 0.09) : 'transparent',
        '& svg': { fontSize: 14 },
      }}
    >
      {active ? <Check /> : <CircleOutlined />}
    </Box>
  );
}

export function CharacterSkillsTab({ character }: CharacterSkillsTabProps) {
  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(285px, 0.72fr) minmax(0, 1.65fr)' },
        gap: 1.25,
      }}
    >
      <Paper
        elevation={0}
        className="pr-frame"
        sx={{ p: { xs: 1.5, lg: 2.25 }, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <StarsOutlined color="primary" />
          <Box>
            <Typography variant="h6">Спасброски</Typography>
            <Typography variant="caption" color="text.secondary">
              Защита от эффектов и опасностей
            </Typography>
          </Box>
        </Stack>
        <Stack className="pr-scroll-region" spacing={0.75} sx={{ mt: 1.5, pr: 0.5 }}>
          {ABILITY_NAMES.map((ability) => {
            const result = getSavingThrowBonus(character, ability);
            return (
              <Stack
                key={ability}
                direction="row"
                alignItems="center"
                spacing={1.25}
                sx={{
                  minHeight: 52,
                  px: 1.25,
                  border: `1px solid ${result.proficient ? alpha(playerRoomColors.gold, 0.38) : alpha(playerRoomColors.gold, 0.12)}`,
                  background: result.proficient
                    ? `linear-gradient(90deg, ${alpha(playerRoomColors.gold, 0.08)}, transparent)`
                    : alpha('#000000', 0.1),
                }}
              >
                <ProficiencyMark active={result.proficient} />
                <Box minWidth={0} flex={1}>
                  <Typography variant="body2" color={result.proficient ? 'text.primary' : 'text.secondary'}>
                    {ABILITY_LABELS[ability]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {result.proficient ? 'Владение' : 'Базовый бонус'}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem', color: result.proficient ? 'primary.main' : 'text.primary' }}>
                  {formatModifier(result.bonus)}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        className="pr-frame"
        sx={{ p: { xs: 1.5, lg: 2.25 }, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <MilitaryTechOutlined color="primary" />
            <Box>
              <Typography variant="h6">Навыки</Typography>
              <Typography variant="caption" color="text.secondary">
                Итоговый бонус уже учитывает характеристику и владение
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label={`Владений: ${character.proficientSkills.length}`}
            icon={<Check />}
            variant="outlined"
            color="primary"
          />
        </Stack>

        <Box
          className="pr-scroll-region"
          sx={{
            mt: 1.5,
            pr: 0.5,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            alignContent: 'start',
            gap: 0.7,
          }}
        >
          {SKILLS.map((skill) => {
            const proficient = character.proficientSkills.includes(skill.key);
            const bonus =
              getAbilityModifier(character.abilities[skill.ability]) +
              (proficient ? character.proficiencyBonus : 0);
            return (
              <Stack
                key={skill.key}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  minHeight: 45,
                  px: 1.1,
                  borderLeft: `2px solid ${proficient ? playerRoomColors.gold : alpha(playerRoomColors.gold, 0.12)}`,
                  borderTop: `1px solid ${alpha(playerRoomColors.gold, proficient ? 0.2 : 0.08)}`,
                  borderBottom: `1px solid ${alpha(playerRoomColors.gold, proficient ? 0.2 : 0.08)}`,
                  backgroundColor: proficient ? alpha(playerRoomColors.gold, 0.055) : alpha('#000000', 0.09),
                }}
              >
                <ProficiencyMark active={proficient} />
                <Box minWidth={0} flex={1}>
                  <Typography variant="body2" noWrap title={skill.label}>
                    {skill.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ABILITY_LABELS[skill.ability]}
                    {proficient ? ' · владение' : ''}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1.1rem', color: proficient ? 'primary.main' : 'text.primary' }}>
                  {formatModifier(bonus)}
                </Typography>
              </Stack>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
