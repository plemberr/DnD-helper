import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Box, Button, CircularProgress, ThemeProvider, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { createPlayerCharacter, getPlayerCharacter } from '../api/playerCharacterApi';
import { CharacterCreateForm } from '../components/playerRoom/CharacterCreateForm';
import { PlayerCharacterDashboard } from '../components/playerRoom/PlayerCharacterDashboard';
import { PlayerRoomShell } from '../components/playerRoom/PlayerRoomShell';
import { playerRoomTheme } from '../components/playerRoom/playerRoomTheme';
import '../components/playerRoom/playerRoom.css';
import { usePlayerRoomStore } from '../store/playerRoomStore';
import type { CharacterDraft } from '../types/playerCharacter';

const CURRENT_USER_ID = 'current-user';

export default function PlayerRoomPage() {
  const { roomId = '' } = useParams();
  const queryClient = useQueryClient();
  const enterRoom = usePlayerRoomStore((state) => state.enterRoom);
  const characterQueryKey = ['player-character', roomId, CURRENT_USER_ID] as const;

  useEffect(() => {
    if (roomId) enterRoom(roomId);
  }, [enterRoom, roomId]);

  const characterQuery = useQuery({
    queryKey: characterQueryKey,
    queryFn: () => getPlayerCharacter(roomId, CURRENT_USER_ID),
    enabled: Boolean(roomId),
  });

  const createCharacterMutation = useMutation({
    mutationFn: (draft: CharacterDraft) => createPlayerCharacter(roomId, CURRENT_USER_ID, draft),
    onSuccess: (character) => {
      queryClient.setQueryData(characterQueryKey, character);
    },
  });

  const content = (() => {
    if (!roomId) {
      return (
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 3 }}>
          <Alert severity="error">Не удалось определить идентификатор комнаты.</Alert>
        </Box>
      );
    }

    if (characterQuery.isPending) {
      return (
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={44} thickness={2.4} />
            <Typography color="text.secondary" sx={{ mt: 2, letterSpacing: '0.08em' }}>
              Открываем летопись персонажа…
            </Typography>
          </Box>
        </Box>
      );
    }

    if (characterQuery.isError) {
      return (
        <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', p: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void characterQuery.refetch()}>
                Повторить
              </Button>
            }
          >
            Не удалось загрузить персонажа.
          </Alert>
        </Box>
      );
    }

    if (characterQuery.data === null) {
      return (
        <CharacterCreateForm
          roomId={roomId}
          isSubmitting={createCharacterMutation.isPending}
          submitError={
            createCharacterMutation.isError
              ? 'Не удалось сохранить персонажа в localStorage. Попробуйте ещё раз.'
              : undefined
          }
          onCreate={async (draft) => {
            await createCharacterMutation.mutateAsync(draft);
          }}
        />
      );
    }

    return <PlayerCharacterDashboard character={characterQuery.data} />;
  })();

  return (
    <ThemeProvider theme={playerRoomTheme}>
      <PlayerRoomShell>{content}</PlayerRoomShell>
    </ThemeProvider>
  );
}
