import {
  AutoAwesomeOutlined,
  BackpackOutlined,
  CasinoOutlined,
  DashboardOutlined,
  MilitaryTechOutlined,
} from '@mui/icons-material';
import { Paper, Tab, Tabs } from '@mui/material';
import type { ReactElement } from 'react';
import { type PlayerRoomTab, usePlayerRoomStore } from '../../store/playerRoomStore';

const navigationItems: Array<{ value: PlayerRoomTab; label: string; icon: ReactElement }> = [
  { value: 'overview', label: 'Обзор', icon: <DashboardOutlined /> },
  { value: 'skills', label: 'Навыки', icon: <MilitaryTechOutlined /> },
  { value: 'inventory', label: 'Инвентарь', icon: <BackpackOutlined /> },
  { value: 'abilities', label: 'Способности', icon: <AutoAwesomeOutlined /> },
  { value: 'dice', label: 'Кубики', icon: <CasinoOutlined /> },
];

export function PlayerRoomNavigation() {
  const activeTab = usePlayerRoomStore((state) => state.activeTab);
  const setActiveTab = usePlayerRoomStore((state) => state.setActiveTab);

  return (
    <Paper component="nav" aria-label="Разделы персонажа" elevation={0} sx={{ overflow: 'hidden' }}>
      <Tabs
        value={activeTab}
        onChange={(_event, value: PlayerRoomTab) => setActiveTab(value)}
        variant="fullWidth"
        aria-label="Основная навигация комнаты игрока"
      >
        {navigationItems.map((item) => (
          <Tab
            key={item.value}
            value={item.value}
            label={item.label}
            icon={item.icon}
            iconPosition="start"
            id={`player-room-tab-${item.value}`}
            aria-controls={`player-room-panel-${item.value}`}
          />
        ))}
      </Tabs>
    </Paper>
  );
}
