import { useState, type FormEvent } from 'react';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { Alert, Box, Button, InputAdornment, Paper, Stack, TextField } from '@mui/material';
import { fantasyFrameSx, fantasyGradients } from '../../theme/fantasyTheme';
import { FantasySectionHeading } from '../fantasy/FantasySectionHeading';

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
      elevation={0}
      sx={{ ...fantasyFrameSx, p: { xs: 2.5, sm: 3.5 } }}
    >
      <Stack spacing={2.25}>
        <FantasySectionHeading
          icon={<ShieldOutlinedIcon />}
          eyebrow="Защитные руны"
          title="Безопасность"
          description="В демо-версии пароль не сохраняется в браузере."
        />

        <Box sx={{ height: 1, background: fantasyGradients.ornament, opacity: 0.65 }} />

        {securityError && (
          <Alert severity="error" variant="outlined">
            {securityError}
          </Alert>
        )}
        {securityMessage && (
          <Alert severity="info" variant="outlined">
            {securityMessage}
          </Alert>
        )}

        <TextField
          label="Текущий пароль"
          type="password"
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            setSecurityError('');
            setSecurityMessage('');
          }}
          autoComplete="current-password"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          fullWidth
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <TextField
            label="Новый пароль"
            type="password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setSecurityError('');
              setSecurityMessage('');
            }}
            autoComplete="new-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
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
            autoComplete="new-password"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            fullWidth
          />
        </Box>

        <Box>
          <Button type="submit" variant="outlined" startIcon={<KeyRoundedIcon />}>
            Сменить пароль
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
