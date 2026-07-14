import { Box } from '@mui/material';
import type { PlayerCharacter } from '../../types/playerCharacter';
import { usePlayerRoomStore } from '../../store/playerRoomStore';
import { CharacterHeroHeader } from './CharacterHeroHeader';
import { PlayerRoomNavigation } from './PlayerRoomNavigation';
import { CharacterAbilitiesTab } from './tabs/CharacterAbilitiesTab';
import { CharacterDiceTab } from './tabs/CharacterDiceTab';
import { CharacterInventoryTab } from './tabs/CharacterInventoryTab';
import { CharacterOverviewTab } from './tabs/CharacterOverviewTab';
import { CharacterSkillsTab } from './tabs/CharacterSkillsTab';

type PlayerCharacterDashboardProps = {
  character: PlayerCharacter;
};

export function PlayerCharacterDashboard({ character }: PlayerCharacterDashboardProps) {
  const activeTab = usePlayerRoomStore((state) => state.activeTab);

  const tabContent = (() => {
    switch (activeTab) {
      case 'skills':
        return <CharacterSkillsTab character={character} />;
      case 'inventory':
        return (
          <CharacterInventoryTab
            inventory={character.inventory}
            inventoryDetails={character.inventoryDetails}
          />
        );
      case 'abilities':
        return (
          <CharacterAbilitiesTab
            features={character.features}
            featureDetails={character.featureDetails}
          />
        );
      case 'dice':
        return <CharacterDiceTab />;
      case 'overview':
      default:
        return <CharacterOverviewTab character={character} />;
    }
  })();

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'auto auto minmax(0, 1fr)',
        gap: { xs: 0.75, lg: 1.25 },
        p: { xs: 1, md: 1.5, xl: 2 },
      }}
    >
      <CharacterHeroHeader character={character} />
      <PlayerRoomNavigation />
      <Box
        key={activeTab}
        id={`player-room-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`player-room-tab-${activeTab}`}
        className="pr-tab-content"
        sx={{ minHeight: 0, overflow: 'hidden' }}
      >
        {tabContent}
      </Box>
    </Box>
  );
}
