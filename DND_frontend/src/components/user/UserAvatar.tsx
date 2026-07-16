import { Avatar } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { fantasyColors } from '../../theme/fantasyTheme';

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
  const isLarge = size >= 100;

  return (
    <Avatar
      src={avatarUrl || undefined}
      alt={`Аватар ${nickname || 'игрока'}`}
      sx={{
        width: size,
        height: size,
        color: fantasyColors.goldLight,
        fontFamily: 'Georgia, Palatino, serif',
        fontSize: fontSize ?? Math.max(14, Math.round(size * 0.36)),
        fontWeight: isLarge ? 800 : 700,
        border: `1px solid ${alpha(fantasyColors.gold, isLarge ? 0.72 : 0.55)}`,
        outline: `${isLarge ? 5 : 2}px double ${alpha(fantasyColors.brass, isLarge ? 0.3 : 0.22)}`,
        background: `radial-gradient(circle at 38% 28%, ${fantasyColors.burgundy}, ${fantasyColors.burgundyDeep} 54%, ${fantasyColors.void})`,
        boxShadow: `0 0 ${isLarge ? 30 : 16}px ${alpha(fantasyColors.burgundy, isLarge ? 0.44 : 0.3)}`,
      }}
    >
      {getInitials(nickname)}
    </Avatar>
  );
}
