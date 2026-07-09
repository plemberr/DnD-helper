import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';

interface ProfileDataFormProps {
  nickname: string;
  email: string;
  onNicknameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSave: (data: { nickname: string; email: string }) => void;
}

export function ProfileDataForm({
  nickname,
  email,
  onNicknameChange,
  onEmailChange,
  onSave,
}: ProfileDataFormProps) {
  const [profileError, setProfileError] = useState('');

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedNickname = nickname.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedNickname.length < 2 || normalizedNickname.length > 30) {
      setProfileError('Никнейм должен быть от 2 до 30 символов.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setProfileError('Введите корректный email.');
      return;
    }

    setProfileError('');
    onSave({ nickname: normalizedNickname, email: normalizedEmail });
  };

  return (
    <Paper
      component="form"
      onSubmit={saveProfile}
      sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography variant="h6">Данные профиля</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Эти данные отображаются в верхней панели и карточках вашего профиля.
          </Typography>
        </Box>

        {profileError && <Alert severity="error">{profileError}</Alert>}

        <TextField
          label="Никнейм"
          value={nickname}
          onChange={(event) => {
            onNicknameChange(event.target.value);
            setProfileError('');
          }}
          fullWidth
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => {
            onEmailChange(event.target.value);
            setProfileError('');
          }}
          fullWidth
          required
        />
        <Box>
          <Button type="submit" variant="contained">
            Сохранить изменения
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
