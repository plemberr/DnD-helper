import { useEffect, useState } from 'react';
import { Alert, Box, Button, Container, Snackbar, Stack, Typography } from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { ChangePasswordForm } from '../components/profile/ChangePasswordForm';
import { ProfileAvatarCard } from '../components/profile/ProfileAvatarCard';
import { ProfileDataForm } from '../components/profile/ProfileDataForm';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(currentUser?.nickname ?? '');
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentUser?.avatarUrl ?? null);
  const [isSavedMessageOpen, setIsSavedMessageOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setNickname(currentUser.nickname);
      setEmail(currentUser.email);
      setAvatarUrl(currentUser.avatarUrl);
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const saveProfile = (data: { nickname: string; email: string }) => {
    updateProfile({
      nickname: data.nickname,
      email: data.email,
      avatarUrl,
    });
    setIsSavedMessageOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 7 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">Личный кабинет</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Управляйте данными своего профиля
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 0.85fr) minmax(0, 1.15fr)' },
              gap: 2.5,
              alignItems: 'start',
            }}
          >
            <ProfileAvatarCard nickname={nickname} avatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} />

            <Stack spacing={2.5}>
              <ProfileDataForm
                nickname={nickname}
                email={email}
                onNicknameChange={setNickname}
                onEmailChange={setEmail}
                onSave={saveProfile}
              />
              <ChangePasswordForm />
            </Stack>
          </Box>

          <Box>
            <Button variant="contained" onClick={() => navigate('/rooms')}>
              Вернуться к комнатам
            </Button>
          </Box>
        </Stack>
      </Container>

      <Snackbar
        open={isSavedMessageOpen}
        autoHideDuration={3000}
        onClose={() => setIsSavedMessageOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setIsSavedMessageOpen(false)}>
          Профиль сохранён
        </Alert>
      </Snackbar>
    </Box>
  );
}
