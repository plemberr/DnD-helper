import { Box } from '@mui/material';
import type { ReactNode } from 'react';

type PlayerRoomShellProps = {
  children: ReactNode;
};

export function PlayerRoomShell({ children }: PlayerRoomShellProps) {
  return (
    <Box className="player-room-root">
      <Box className="pr-shell">{children}</Box>
    </Box>
  );
}
