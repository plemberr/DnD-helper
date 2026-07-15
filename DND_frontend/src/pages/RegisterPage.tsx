import { useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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

    if (!normalizedNickname || !normalizedEmail || !password || !passwordRepeat) {
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
      await register({ nickname: normalizedNickname, email: normalizedEmail, password });
      navigate('/rooms', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось выполнить регистрацию.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 7 } }}>
      <Container maxWidth="sm">
        <Paper component="form" onSubmit={submit} sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4">Регистрация</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Создайте демо-аккаунт для D&D-комнат.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Никнейм"
              value={nickname}
              onChange={(event) => {
                setNickname(event.target.value);
                setError('');
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
              fullWidth
              required
            />

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              Создать аккаунт
            </Button>

            <Typography color="text.secondary">
              Уже есть аккаунт?{' '}
              <Link component={RouterLink} to="/login">
                Войти
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
