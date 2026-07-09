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

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
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

    login({ email: normalizedEmail, password });
    navigate('/rooms', { replace: true });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 7 } }}>
      <Container maxWidth="sm">
        <Paper component="form" onSubmit={submit} sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4">Вход</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Войдите в аккаунт, чтобы продолжить работу с комнатами.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

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

            <Button type="submit" variant="contained" size="large">
              Войти
            </Button>

            <Typography color="text.secondary">
              Нет аккаунта?{' '}
              <Link component={RouterLink} to="/register">
                Зарегистрироваться
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
