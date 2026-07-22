import { CheckCircleOutline, ShieldOutlined } from '@mui/icons-material';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  SKILLS,
  calculateCharacterStats,
  formatModifier,
  getAbilityModifier,
  type CharacterDraft,
} from '../../../types/playerCharacter';
import { playerRoomColors } from '../playerRoomTheme';
import { CreationStepFrame } from './CreationStepFrame';

type ReviewStepProps = {
  draft: CharacterDraft;
  equipmentItems: string[];
};

const panelSx = {
  p: 1.5,
  minHeight: 0,
  backgroundColor: alpha('#000000', 0.1),
};

export function ReviewStep({ draft, equipmentItems }: ReviewStepProps) {
  const stats = calculateCharacterStats(draft);
  const selectedSkills = SKILLS.filter((skill) => draft.proficientSkills.includes(skill.key));

  return (
    <CreationStepFrame
      eyebrow="Шаг 7 · Подтверждение"
      title="Летопись готова к началу"
      description="Проверьте основные сведения. После создания персонаж сразу откроется в комнате."
      icon={<CheckCircleOutline />}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.05fr 1fr 1fr' },
          gap: 1,
          alignItems: 'stretch',
        }}
      >
        <Paper elevation={0} sx={panelSx}>
          <Typography variant="overline" color="primary.main">Личность</Typography>
          <Typography variant="h5" sx={{ mt: 0.4 }}>{draft.name || 'Безымянный герой'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {draft.race} · {draft.characterClass} ({draft.subclass})
          </Typography>
          <Typography variant="body2" color="text.secondary">Уровень {draft.level} · {draft.background}</Typography>
          <Box sx={{ my: 1.2, height: '1px', background: `linear-gradient(90deg, ${playerRoomColors.border}, transparent)` }} />
          <Stack spacing={0.5}>
            {[
              ['Класс доспеха', stats.armorClass],
              ['Инициатива', formatModifier(stats.initiative)],
              ['Максимум HP', stats.maxHp],
              ['Бонус владения', formatModifier(stats.proficiencyBonus)],
              ['Пасс. восприятие', stats.passivePerception],
            ].map(([label, value]) => (
              <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body2" sx={{ color: 'primary.main', fontFamily: 'Georgia, serif' }}>{value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={panelSx}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <ShieldOutlined color="primary" fontSize="small" />
            <Typography variant="overline" color="primary.main">Характеристики</Typography>
          </Stack>
          <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.55 }}>
            {ABILITY_NAMES.map((ability) => (
              <Stack
                key={ability}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 0.8, py: 0.55, border: `1px solid ${alpha(playerRoomColors.gold, 0.1)}` }}
              >
                <Box minWidth={0}>
                  <Typography variant="caption" color="text.secondary" noWrap>{ABILITY_LABELS[ability]}</Typography>
                  <Typography variant="body2">{draft.abilities[ability]}</Typography>
                </Box>
                <Typography sx={{ color: 'primary.main', fontFamily: 'Georgia, serif' }}>
                  {formatModifier(getAbilityModifier(draft.abilities[ability]))}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={panelSx}>
          <Typography variant="overline" color="primary.main">Выбор героя</Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.6 }}>
            Владение навыками
          </Typography>
          <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.55} sx={{ mt: 0.7 }}>
            {selectedSkills.length > 0 ? selectedSkills.map((skill) => (
              <Chip key={skill.key} size="small" label={skill.label} variant="outlined" />
            )) : <Typography variant="body2" color="text.secondary">Не выбрано</Typography>}
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.25 }}>
            Стартовое снаряжение
          </Typography>
          <Stack spacing={0.35} sx={{ mt: 0.6 }}>
            {equipmentItems.length > 0 ? equipmentItems.slice(0, 6).map((item, index) => (
              <Typography key={`${item}-${index}`} variant="body2" noWrap>· {item}</Typography>
            )) : <Typography variant="body2" color="text.secondary">Без снаряжения</Typography>}
          </Stack>
        </Paper>
      </Box>
    </CreationStepFrame>
  );
}
