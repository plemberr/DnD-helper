import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';

export function ChangePasswordForm() {
  const [securityError, setSecurityError] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordRepeat, setNewPasswordRepeat] = useState('');

  const changePassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSecurityMessage('');

    if (!currentPassword || !newPassword || !newPasswordRepeat) {
      setSecurityError('Заполните все поля.');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError('Новый пароль должен быть не короче 6 символов.');
      return;
    }

    if (newPassword !== newPasswordRepeat) {
      setSecurityError('Новый пароль и повтор не совпадают.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setNewPasswordRepeat('');
    setSecurityError('');
    setSecurityMessage('Форма проверена. Реальная смена пароля будет подключена к API.');
  };

  return (
    <Paper
      component="form"
      onSubmit={changePassword}
      sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}
    >
      <Stack spacing={2.25}>
        <Box>
          <Typography variant="h6">Безопасность</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            В демо-версии пароль не сохраняется в браузере.
          </Typography>
        </Box>

        {securityError && <Alert severity="error">{securityError}</Alert>}
        {securityMessage && <Alert severity="info">{securityMessage}</Alert>}

        <TextField
          label="Текущий пароль"
          type="password"
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            setSecurityError('');
            setSecurityMessage('');
          }}
          fullWidth
        />
        <TextField
          label="Новый пароль"
          type="password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setSecurityError('');
            setSecurityMessage('');
          }}
          fullWidth
        />
        <TextField
          label="Повторите новый пароль"
          type="password"
          value={newPasswordRepeat}
          onChange={(event) => {
            setNewPasswordRepeat(event.target.value);
            setSecurityError('');
            setSecurityMessage('');
          }}
          fullWidth
        />
        <Box>
          <Button type="submit" variant="outlined">
            Сменить пароль
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
