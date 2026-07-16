import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { fantasyColors } from '../../theme/fantasyTheme';

interface FantasySectionHeadingProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export function FantasySectionHeading({
  icon,
  eyebrow,
  title,
  description,
}: FantasySectionHeadingProps) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box
        aria-hidden="true"
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          border: `1px solid ${alpha(fantasyColors.gold, 0.36)}`,
          background: `radial-gradient(circle, ${alpha(fantasyColors.gold, 0.12)}, ${alpha(fantasyColors.void, 0.34)})`,
          boxShadow: `0 0 20px ${alpha(fantasyColors.burgundy, 0.2)}`,
          transform: 'rotate(45deg)',
          '& svg': { fontSize: 22, transform: 'rotate(-45deg)' },
        }}
      >
        {icon}
      </Box>

      <Box minWidth={0}>
        <Typography variant="overline" color="primary.main" sx={{ display: 'block', fontSize: '0.62rem', lineHeight: 1.2 }}>
          {eyebrow}
        </Typography>
        <Typography component="h2" variant="h6" sx={{ mt: 0.35, lineHeight: 1.15 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6, lineHeight: 1.55 }}>
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}
