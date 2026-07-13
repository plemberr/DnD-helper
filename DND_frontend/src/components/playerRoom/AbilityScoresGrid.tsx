import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import {
  ABILITY_LABELS,
  ABILITY_NAMES,
  formatModifier,
  getAbilityModifier,
  type AbilityScores,
} from '../../types/playerCharacter';

type AbilityScoresGridProps = {
  abilities: AbilityScores;
};

export function AbilityScoresGrid({ abilities }: AbilityScoresGridProps) {
  return (
    <Grid container spacing={2}>
      {ABILITY_NAMES.map((ability) => {
        const score = abilities[ability];

        return (
          <Grid item key={ability} xs={6} sm={4} md={2}>
            <Card variant="outlined" sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                    {ABILITY_LABELS[ability]}
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 800 }}>
                    {formatModifier(getAbilityModifier(score))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Значение: {score}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
