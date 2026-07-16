import { useState, type FormEvent } from 'react';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import {
  Alert,
  Button,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { AuthPageLayout } from '../components/auth/AuthPageLayout';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedNickname = nickname.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedNickname ||
      !normalizedEmail ||
      !password ||
      !passwordRepeat
    ) {
      setError('Заполните все поля.');
      return;
    }

    if (!normalizedEmail.includes('@')) {
      setError('Введите корректный email.');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен быть не короче 8 символов.');
      return;
    }

    if (password !== passwordRepeat) {
      setError('Пароли не совпадают.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await register({
        nickname: normalizedNickname,
        email: normalizedEmail,
        password,
      });

      navigate('/rooms', { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось выполнить регистрацию.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout
      eyebrow="Новая запись в летописи"
      title="Регистрация"
      description="Создайте профиль искателя приключений, чтобы вступать в кампании и открывать собственные комнаты."
      onSubmit={submit}
      footer={
        <Typography variant="body2" color="text.secondary">
          Уже есть аккаунт?{' '}
          <Link component={RouterLink} to="/login">
            Войти
          </Link>
        </Typography>
      }
    >
      <Stack spacing={2}>
        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        <TextField
          label="Никнейм"
          value={nickname}
          onChange={(event) => {
            setNickname(event.target.value);
            setError('');
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
            setEmail(event.target.value);
            setError('');
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

        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
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
          required
        />

        <TextField
          label="Повторите пароль"
          type="password"
          value={passwordRepeat}
          onChange={(event) => {
            setPasswordRepeat(event.target.value);
            setError('');
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
          required
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          endIcon={<PersonAddAltRoundedIcon />}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Создаём аккаунт…' : 'Создать аккаунт'}
        </Button>
      </Stack>
    </AuthPageLayout>
  );
}