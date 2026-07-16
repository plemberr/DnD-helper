import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { FormEventHandler, ReactNode } from 'react';
import {
  fantasyColors,
  fantasyFrameSx,
  fantasyGradients,
  fantasyShadows,
} from '../../theme/fantasyTheme';
import { FantasyPageShell } from '../fantasy/FantasyPageShell';

interface AuthPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthPageLayout({
  eyebrow,
  title,
  description,
  onSubmit,
  children,
  footer,
}: AuthPageLayoutProps) {
  return (
    <FantasyPageShell>
      <Box
        component="main"
        sx={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          px: { xs: 1.5, sm: 2.5 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Stack spacing={{ xs: 2.25, sm: 3 }} sx={{ alignItems: 'stretch' }}>
            <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 62,
                  height: 62,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  border: `1px solid ${alpha(fantasyColors.gold, 0.52)}`,
                  outline: `5px double ${alpha(fantasyColors.brass, 0.28)}`,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(fantasyColors.burgundy, 0.72)}, ${fantasyColors.burgundyDeep} 58%, ${fantasyColors.void})`,
                  boxShadow: `0 0 34px ${alpha(fantasyColors.burgundy, 0.46)}`,
                  '& svg': { fontSize: 30 },
                }}
              >
                <AutoStoriesRoundedIcon />
              </Box>
              <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.66rem' }}>
                D&amp;D Rooms · Хроники приключений
              </Typography>
            </Stack>

            <Paper
              component="form"
              onSubmit={onSubmit}
              elevation={0}
              sx={{
                ...fantasyFrameSx,
                p: { xs: 2.5, sm: 4.5 },
                background: fantasyGradients.panelRaised,
                boxShadow: fantasyShadows.raised,
              }}
            >
              <Stack spacing={2.5}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.62rem' }}>
                    {eyebrow}
                  </Typography>
                  <Typography component="h1" variant="h3" sx={{ mt: 0.25, fontSize: { xs: '2rem', sm: '2.35rem' } }}>
                    {title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.9, mx: 'auto', maxWidth: 430, lineHeight: 1.6 }}>
                    {description}
                  </Typography>
                </Box>

                <Box sx={{ height: 1, background: fantasyGradients.ornament }} />
                {children}
                <Box sx={{ height: 1, background: fantasyGradients.ornament, opacity: 0.6 }} />
                <Box sx={{ textAlign: 'center' }}>{footer}</Box>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>
    </FantasyPageShell>
  );
}
