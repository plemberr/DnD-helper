import { Avatar } from '@mui/material';

interface UserAvatarProps {
  nickname: string;
  avatarUrl: string | null;
  size: number;
  fontSize?: number;
}

function getInitials(nickname: string) {
  return nickname.trim().slice(0, 2).toUpperCase() || 'И';
}

export function UserAvatar({ nickname, avatarUrl, size, fontSize }: UserAvatarProps) {
  return (
    <Avatar
      src={avatarUrl || undefined}
      sx={{
        width: size,
        height: size,
        bgcolor: 'primary.main',
        fontSize,
        fontWeight: size >= 100 ? 800 : 700,
      }}
    >
      {getInitials(nickname)}
    </Avatar>
  );
}
