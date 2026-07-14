import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import {
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  SKILLS,
  formatModifier,
  getAbilityModifier,
  type AbilityName,
  type PlayerCharacter,
} from '../../types/playerCharacter';

type SkillsPanelProps = {
  character: PlayerCharacter;
};

const savingThrowsByClass: Record<string, AbilityName[]> = {
  Бард: ['dexterity', 'charisma'],
  Варвар: ['strength', 'constitution'],
  Воин: ['strength', 'constitution'],
  Волшебник: ['intelligence', 'wisdom'],
  Друид: ['intelligence', 'wisdom'],
  Жрец: ['wisdom', 'charisma'],
  Колдун: ['wisdom', 'charisma'],
  Монах: ['strength', 'dexterity'],
  Паладин: ['wisdom', 'charisma'],
  Плут: ['dexterity', 'intelligence'],
  Следопыт: ['strength', 'dexterity'],
  Чародей: ['constitution', 'charisma'],
};

export function SkillsPanel({ character }: SkillsPanelProps) {
  const proficientSavingThrows = savingThrowsByClass[character.characterClass] ?? [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 800 }}>
          Навыки и спасброски
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Спасброски
        </Typography>
        <Grid container spacing={1}>
          {ABILITY_NAMES.map((ability) => {
            const proficient = proficientSavingThrows.includes(ability);
            const bonus =
              getAbilityModifier(character.abilities[ability]) +
              (proficient ? character.proficiencyBonus : 0);

            return (
              <Grid item key={ability} xs={12} sm={6}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {proficient ? (
                      <CheckCircle color="primary" sx={{ fontSize: 18 }} />
                    ) : (
                      <RadioButtonUnchecked color="disabled" sx={{ fontSize: 18 }} />
                    )}
                    <Typography variant="body2">{ABILITY_LABELS[ability]}</Typography>
                  </Stack>
                  <Chip size="small" label={formatModifier(bonus)} variant="outlined" />
                </Stack>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Навыки
        </Typography>
        <Grid container columnSpacing={3} rowSpacing={1}>
          {SKILLS.map((skill) => {
            const proficient = character.proficientSkills.includes(skill.key);
            const bonus =
              getAbilityModifier(character.abilities[skill.ability]) +
              (proficient ? character.proficiencyBonus : 0);

            return (
              <Grid item key={skill.key} xs={12} sm={6}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Stack direction="row" alignItems="center" spacing={1} minWidth={0}>
                    {proficient ? (
                      <CheckCircle color="primary" sx={{ fontSize: 18, flexShrink: 0 }} />
                    ) : (
                      <RadioButtonUnchecked color="disabled" sx={{ fontSize: 18, flexShrink: 0 }} />
                    )}
                    <Typography variant="body2" noWrap title={skill.label}>
                      {skill.label}
                    </Typography>
                  </Stack>
                  <Chip size="small" label={formatModifier(bonus)} variant="outlined" />
                </Stack>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}
