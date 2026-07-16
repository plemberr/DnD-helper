import { useState, type FormEvent } from 'react';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError('Введите email и пароль.');
      return;
    }

    if (!normalizedEmail.includes('@')) {
      setError('Введите корректный email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await login({
        email: normalizedEmail,
        password,
      });

      navigate('/rooms', { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось выполнить вход.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageLayout
      eyebrow="Возвращение в хронику"
      title="Вход"
      description="Откройте книгу кампаний и продолжите приключение вместе со своей группой."
      onSubmit={submit}
      footer={
        <Typography variant="body2" color="text.secondary">
          Нет аккаунта?{' '}
          <Link component={RouterLink} to="/register">
            Зарегистрироваться
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
          required
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          endIcon={<LoginRoundedIcon />}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Входим…' : 'Войти'}
        </Button>
      </Stack>
    </AuthPageLayout>
  );
}