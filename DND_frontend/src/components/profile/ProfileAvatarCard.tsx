import { useRef, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { UserAvatar } from '../user/UserAvatar';

const allowedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxAvatarSize = 1024 * 1024;

interface ProfileAvatarCardProps {
  nickname: string;
  avatarUrl: string | null;
  onAvatarChange: (avatarUrl: string | null) => void;
}

export function ProfileAvatarCard({ nickname, avatarUrl, onAvatarChange }: ProfileAvatarCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setAvatarError('');

    if (!allowedAvatarTypes.includes(file.type)) {
      setAvatarError('Поддерживаются только JPG, PNG или WEBP.');
      return;
    }

    if (file.size > maxAvatarSize) {
      setAvatarError('Размер аватара не должен превышать 1 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAvatarChange(reader.result);
      }
    };
    reader.onerror = () => setAvatarError('Не удалось прочитать файл. Попробуйте другой аватар.');
    reader.readAsDataURL(file);
  };

  return (
    <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Box>
          <Typography variant="h6">Аватар</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            JPG, PNG или WEBP до 1 МБ.
          </Typography>
        </Box>

        <UserAvatar nickname={nickname} avatarUrl={avatarUrl} size={132} fontSize={42} />

        {avatarError && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {avatarError}
          </Alert>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={handleAvatarChange}
        />

        <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1.25} sx={{ width: '100%' }}>
          <Button variant="contained" onClick={() => fileInputRef.current?.click()}>
            Загрузить аватар
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              onAvatarChange(null);
              setAvatarError('');
            }}
          >
            Удалить аватар
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
