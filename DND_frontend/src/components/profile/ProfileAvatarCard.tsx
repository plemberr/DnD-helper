import { useRef, useState, type ChangeEvent } from 'react';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import PortraitOutlinedIcon from '@mui/icons-material/PortraitOutlined';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { fantasyColors, fantasyFrameSx, fantasyGradients } from '../../theme/fantasyTheme';
import { FantasySectionHeading } from '../fantasy/FantasySectionHeading';
import { UserAvatar } from '../user/UserAvatar';

const allowedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxAvatarSize = 1024 * 1024;

interface ProfileAvatarCardProps {
  nickname: string;
  avatarUrl: string | null;
  onAvatarChange: (avatarUrl: string | null) => void;
}

export function ProfileAvatarCard({ nickname, avatarUrl, onAvatarChange }: ProfileAvatarCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setAvatarError('');

    if (!allowedAvatarTypes.includes(file.type)) {
      setAvatarError('Поддерживаются только JPG, PNG или WEBP.');
      return;
    }

    if (file.size > maxAvatarSize) {
      setAvatarError('Размер аватара не должен превышать 1 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onAvatarChange(reader.result);
      }
    };
    reader.onerror = () => setAvatarError('Не удалось прочитать файл. Попробуйте другой аватар.');
    reader.readAsDataURL(file);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        ...fantasyFrameSx,
        p: { xs: 2.5, sm: 3.25 },
        background: fantasyGradients.panelRaised,
      }}
    >
      <Stack spacing={2.5}>
        <FantasySectionHeading
          icon={<PortraitOutlinedIcon />}
          eyebrow="Образ героя"
          title="Аватар"
          description="JPG, PNG или WEBP до 1 МБ."
        />

        <Box sx={{ height: 1, background: fantasyGradients.ornament, opacity: 0.65 }} />

        <Stack spacing={1.25} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Box
            sx={{
              p: 1.25,
              border: `1px solid ${alpha(fantasyColors.gold, 0.2)}`,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(fantasyColors.gold, 0.08)}, transparent 68%)`,
              boxShadow: `0 0 34px ${alpha(fantasyColors.burgundy, 0.24)}`,
            }}
          >
            <UserAvatar nickname={nickname} avatarUrl={avatarUrl} size={132} fontSize={42} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {nickname || 'Игрок'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Портрет участника кампании
            </Typography>
          </Box>
        </Stack>

        {avatarError && (
          <Alert severity="error" variant="outlined" sx={{ width: '100%' }}>
            {avatarError}
          </Alert>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={handleAvatarChange}
        />

        <Stack direction={{ xs: 'column', sm: 'row', md: 'column' }} spacing={1.25} sx={{ width: '100%' }}>
          <Button
            variant="contained"
            startIcon={<FileUploadOutlinedIcon />}
            onClick={() => fileInputRef.current?.click()}
            fullWidth
          >
            Загрузить аватар
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DeleteOutlineRoundedIcon />}
            onClick={() => {
              onAvatarChange(null);
              setAvatarError('');
            }}
            fullWidth
          >
            Удалить аватар
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
