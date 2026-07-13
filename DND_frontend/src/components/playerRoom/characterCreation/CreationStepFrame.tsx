import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

type CreationStepFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
};

export function CreationStepFrame({ eyebrow, title, description, icon, children }: CreationStepFrameProps) {
  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ px: { xs: 1.5, lg: 2.5 }, pt: 1.8, pb: 1.25 }}>
        <Box sx={{ color: 'primary.main', display: 'flex', mt: 0.25, '& svg': { fontSize: 28 } }}>{icon}</Box>
        <Box minWidth={0}>
          <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.62rem' }}>{eyebrow}</Typography>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.45rem', lg: '1.85rem' }, lineHeight: 1.1 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>{description}</Typography>
        </Box>
      </Stack>
      <Box className="pr-scroll-region" sx={{ minHeight: 0, flex: 1, px: { xs: 1.5, lg: 2.5 }, pb: 2, pr: { xs: 2, lg: 3 } }}>
        {children}
      </Box>
    </Box>
  );
}
