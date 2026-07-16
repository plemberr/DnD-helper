import { useEffect, useState } from 'react';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Alert, Box, Button, Container, Snackbar, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Navigate, useNavigate } from 'react-router-dom';
import { FantasyPageShell } from '../components/fantasy/FantasyPageShell';
import { ChangePasswordForm } from '../components/profile/ChangePasswordForm';
import { ProfileAvatarCard } from '../components/profile/ProfileAvatarCard';
import { ProfileDataForm } from '../components/profile/ProfileDataForm';
import { useAuth } from '../context/AuthContext';
import { fantasyColors, fantasyGradients } from '../theme/fantasyTheme';

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
    <FantasyPageShell>
      <Box component="main" sx={{ minHeight: '100dvh', py: { xs: 2.5, md: 5 } }}>
        <Container maxWidth="lg">
          <Stack spacing={{ xs: 2.5, md: 3.5 }}>
            <Stack
              component="header"
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
            >
              <Stack direction="row" spacing={1.75} sx={{ alignItems: 'center' }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 54,
                    height: 54,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    border: `1px solid ${alpha(fantasyColors.gold, 0.5)}`,
                    outline: `4px double ${alpha(fantasyColors.brass, 0.24)}`,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(fantasyColors.burgundy, 0.62)}, ${fantasyColors.burgundyDeep})`,
                    boxShadow: `0 0 28px ${alpha(fantasyColors.burgundy, 0.36)}`,
                  }}
                >
                  <AccountCircleOutlinedIcon sx={{ fontSize: 30 }} />
                </Box>
                <Box>
                  <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.65rem' }}>
                    Личный гримуар
                  </Typography>
                  <Typography
                    component="h1"
                    variant="h3"
                    sx={{ fontSize: { xs: '2rem', md: '2.55rem' }, lineHeight: 1.08 }}
                  >
                    Личный кабинет
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.65 }}>
                    Управляйте образом героя, данными профиля и безопасностью аккаунта.
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => navigate('/rooms')}
                sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, whiteSpace: 'nowrap' }}
              >
                К реестру комнат
              </Button>
            </Stack>

            <Box sx={{ height: 1, background: fantasyGradients.ornament }} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 0.72fr) minmax(0, 1.28fr)' },
                gap: { xs: 2, md: 2.75 },
                alignItems: 'start',
              }}
            >
              <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
                <ProfileAvatarCard nickname={nickname} avatarUrl={avatarUrl} onAvatarChange={setAvatarUrl} />
              </Box>

              <Stack spacing={{ xs: 2, md: 2.75 }}>
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
    </FantasyPageShell>
  );
}
