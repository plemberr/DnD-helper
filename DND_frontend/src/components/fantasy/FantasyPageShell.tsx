import { Box, ThemeProvider } from '@mui/material';
import type { ReactNode } from 'react';
import { fantasyBackdropSx, fantasyTheme } from '../../theme/fantasyTheme';

interface FantasyPageShellProps {
  children: ReactNode;
}

export function FantasyPageShell({ children }: FantasyPageShellProps) {
  return (
    <ThemeProvider theme={fantasyTheme}>
      <Box sx={fantasyBackdropSx}>
        <Box sx={{ position: 'relative', zIndex: 1, minHeight: 'inherit' }}>{children}</Box>
      </Box>
    </ThemeProvider>
  );
}
