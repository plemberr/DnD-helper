import { Check, CircleOutlined, MilitaryTechOutlined } from '@mui/icons-material';
import { Box, ButtonBase, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ABILITY_LABELS,
  SKILLS,
  formatModifier,
  getAbilityModifier,
} from '../../../types/playerCharacter';
import { playerRoomColors } from '../playerRoomTheme';
import { CreationStepFrame } from './CreationStepFrame';
import type { CreationStepProps } from './wizardTypes';

export function SkillsStep({ draft, updateDraft }: CreationStepProps) {
  return (
    <CreationStepFrame
      eyebrow="Шаг 5 · Навыки"
      title="Отметьте владения"
      description="Выбранные навыки получают бонус владения, рассчитанный по уровню персонажа."
      icon={<MilitaryTechOutlined />}
    >
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={`Выбрано: ${draft.proficientSkills.length}`}
          icon={<Check />}
        />
      </Stack>
      <Box
        role="group"
        aria-label="Владение навыками"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
          gap: 0.65,
          alignContent: 'start',
        }}
      >
        {SKILLS.map((skill) => {
          const selected = draft.proficientSkills.includes(skill.key);
          const baseBonus = getAbilityModifier(draft.abilities[skill.ability]);
          const proficiencyBonus = Math.floor((draft.level - 1) / 4) + 2;
          const bonus = baseBonus + (selected ? proficiencyBonus : 0);
          return (
            <ButtonBase
              key={skill.key}
              onClick={() => updateDraft((current) => ({
                ...current,
                proficientSkills: current.proficientSkills.includes(skill.key)
                  ? current.proficientSkills.filter((item) => item !== skill.key)
                  : [...current.proficientSkills, skill.key],
              }))}
              aria-pressed={selected}
              sx={{
                minHeight: 49,
                px: 1.1,
                justifyContent: 'stretch',
                textAlign: 'left',
                border: `1px solid ${selected ? alpha(playerRoomColors.gold, 0.42) : alpha(playerRoomColors.gold, 0.1)}`,
                borderLeft: `2px solid ${selected ? playerRoomColors.gold : alpha(playerRoomColors.gold, 0.12)}`,
                backgroundColor: selected ? alpha(playerRoomColors.gold, 0.065) : alpha('#000000', 0.09),
                '&:hover': { borderColor: alpha(playerRoomColors.gold, 0.4) },
                '&.Mui-focusVisible': { outline: `2px solid ${playerRoomColors.gold}`, outlineOffset: -2 },
              }}
            >
              <Box
                sx={{
                  width: 23,
                  height: 23,
                  mr: 1,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: selected ? 'primary.main' : 'text.secondary',
                  border: `1px solid ${selected ? alpha(playerRoomColors.gold, 0.65) : alpha(playerRoomColors.textMuted, 0.2)}`,
                  borderRadius: '50%',
                  '& svg': { fontSize: 14 },
                }}
              >
                {selected ? <Check /> : <CircleOutlined />}
              </Box>
              <Box minWidth={0} flex={1}>
                <Typography variant="body2" noWrap>{skill.label}</Typography>
                <Typography variant="caption" color="text.secondary">{ABILITY_LABELS[skill.ability]}</Typography>
              </Box>
              <Typography sx={{ fontFamily: 'Georgia, serif', color: selected ? 'primary.main' : 'text.primary' }}>
                {formatModifier(bonus)}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </CreationStepFrame>
  );
}
