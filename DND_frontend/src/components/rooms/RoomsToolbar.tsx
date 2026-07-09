import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Badge,
  Box,
  Button,
  FormControlLabel,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../user/UserAvatar';

export interface RoomFilters {
  mine: boolean;
  master: boolean;
  available: boolean;
}

interface RoomsToolbarProps {
  searchValue: string;
  filters: RoomFilters;
  onSearchChange: (value: string) => void;
  onFiltersChange: (filters: RoomFilters) => void;
  onCreateClick: () => void;
}

export function RoomsToolbar({
  searchValue,
  filters,
  onSearchChange,
  onFiltersChange,
  onCreateClick,
}: RoomsToolbarProps) {
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  const changeFilter = (name: keyof RoomFilters) => {
    onFiltersChange({ ...filters, [name]: !filters[name] });
  };

  const openProfile = () => {
    setUserAnchor(null);
    navigate('/profile');
  };

  const handleLogout = () => {
    setUserAnchor(null);
    logout();
    navigate('/rooms', { replace: true });
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        px: { xs: 2, md: 2.5 },
        py: 1.5,
        boxShadow: 1,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
      >
        {currentUser ? (
          <Box>
            <Button
              color="inherit"
              onClick={(event) => setUserAnchor(event.currentTarget)}
              sx={{ justifyContent: 'flex-start', px: 1, color: 'text.primary', textAlign: 'left' }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <UserAvatar nickname={currentUser.nickname} avatarUrl={currentUser.avatarUrl} size={40} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                    {currentUser.nickname}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Реестр кампаний
                  </Typography>
                </Box>
              </Stack>
            </Button>

            <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
              <MenuItem onClick={openProfile}>
                <PersonOutlineRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                Личный кабинет
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                Выйти
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button variant="outlined" onClick={() => navigate('/login')}>
              Войти
            </Button>
            <Button variant="contained" onClick={() => navigate('/register')}>
              Регистрация
            </Button>
          </Stack>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <TextField
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            size="small"
            placeholder="Название комнаты"
            sx={{ width: { xs: '100%', sm: 260 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            variant="outlined"
            startIcon={
              <Badge badgeContent={activeFiltersCount} color="primary" invisible={activeFiltersCount === 0}>
                <FilterAltOutlinedIcon />
              </Badge>
            }
            onClick={(event) => setFilterAnchor(event.currentTarget)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Фильтры
          </Button>

          <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
            <MenuItem disableRipple>
              <FormControlLabel
                control={<Switch checked={filters.mine} onChange={() => changeFilter('mine')} />}
                label="Мои комнаты"
              />
            </MenuItem>
            <MenuItem disableRipple>
              <FormControlLabel
                control={<Switch checked={filters.master} onChange={() => changeFilter('master')} />}
                label="Где я мастер"
              />
            </MenuItem>
            <MenuItem disableRipple>
              <FormControlLabel
                control={<Switch checked={filters.available} onChange={() => changeFilter('available')} />}
                label="Открытые для вступления"
              />
            </MenuItem>
          </Menu>
        </Stack>

        <Tooltip title="Создать новую D&D-комнату">
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onCreateClick} sx={{ whiteSpace: 'nowrap' }}>
            Создать комнату
          </Button>
        </Tooltip>
      </Stack>
    </Box>
  );
}
