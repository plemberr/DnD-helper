import { useState, type FormEvent } from 'react';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { Alert, Box, Button, InputAdornment, Paper, Stack, TextField } from '@mui/material';
import { fantasyFrameSx, fantasyGradients } from '../../theme/fantasyTheme';
import { FantasySectionHeading } from '../fantasy/FantasySectionHeading';

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
      elevation={0}
      sx={{ ...fantasyFrameSx, p: { xs: 2.5, sm: 3.5 } }}
    >
      <Stack spacing={2.25}>
        <FantasySectionHeading
          icon={<ManageAccountsOutlinedIcon />}
          eyebrow="Запись путешественника"
          title="Данные профиля"
          description="Эти данные отображаются в реестре комнат и карточках вашего профиля."
        />

        <Box sx={{ height: 1, background: fantasyGradients.ornament, opacity: 0.65 }} />

        {profileError && (
          <Alert severity="error" variant="outlined">
            {profileError}
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <TextField
            label="Никнейм"
            value={nickname}
            onChange={(event) => {
              onNicknameChange(event.target.value);
              setProfileError('');
            }}
            autoComplete="nickname"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
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
            autoComplete="email"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            fullWidth
            required
          />
        </Box>

        <Box>
          <Button type="submit" variant="contained" startIcon={<SaveOutlinedIcon />}>
            Сохранить изменения
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
