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
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fantasyColors, fantasyFrameSx, fantasyGradients } from '../../theme/fantasyTheme';
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
    <Paper
      component="section"
      aria-label="Поиск и фильтры комнат"
      elevation={0}
      sx={{
        ...fantasyFrameSx,
        minWidth: 0,
        px: { xs: 1.5, sm: 2, md: 2.5 },
        py: { xs: 1.5, md: 1.75 },
        background: fantasyGradients.panelRaised,
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={1.5}
        sx={{ minWidth: 0, alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between' }}
      >
        {currentUser ? (
          <Box sx={{ flexShrink: 0 }}>
            <Button
              color="inherit"
              onClick={(event) => setUserAnchor(event.currentTarget)}
              aria-haspopup="menu"
              aria-expanded={Boolean(userAnchor)}
              sx={{
                justifyContent: 'flex-start',
                minWidth: 190,
                px: 1.25,
                py: 0.65,
                color: 'text.primary',
                textAlign: 'left',
                border: `1px solid ${alpha(fantasyColors.gold, 0.12)}`,
                backgroundColor: alpha(fantasyColors.void, 0.2),
                '&:hover': {
                  borderColor: alpha(fantasyColors.gold, 0.32),
                  backgroundColor: alpha(fantasyColors.gold, 0.05),
                },
              }}
            >
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <UserAvatar nickname={currentUser.nickname} avatarUrl={currentUser.avatarUrl} size={40} />
                <Box minWidth={0}>
                  <Typography variant="subtitle1" noWrap sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, lineHeight: 1.1 }}>
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
                <PersonOutlineRoundedIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                Личный кабинет
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutRoundedIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                Выйти
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
            <Button variant="text" color="inherit" onClick={() => navigate('/login')}>
              Войти
            </Button>
            <Button variant="outlined" onClick={() => navigate('/register')}>
              Регистрация
            </Button>
          </Stack>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          sx={{ width: '100%', minWidth: 0, flex: 1, justifyContent: { lg: 'center' } }}
        >
          <TextField
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            size="small"
            placeholder="Название комнаты"
            sx={{ width: { xs: '100%', sm: 290 }, maxWidth: '100%' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Поиск комнат по названию' },
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
            aria-haspopup="menu"
            aria-expanded={Boolean(filterAnchor)}
            sx={{ whiteSpace: 'nowrap', color: activeFiltersCount > 0 ? 'primary.light' : undefined }}
          >
            Фильтры
          </Button>

          <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
            <MenuItem disableRipple sx={{ minWidth: 260 }}>
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
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={onCreateClick}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap', width: { xs: '100%', sm: 'auto' } }}
          >
            Создать комнату
          </Button>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
