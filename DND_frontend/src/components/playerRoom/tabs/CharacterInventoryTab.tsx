import {
  BackpackOutlined,
  GpsFixedOutlined,
  Inventory2Outlined,
  LocalDrinkOutlined,
  ShieldOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import { Box, ButtonBase, Chip, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState, type ReactNode } from 'react';
import type { InventoryCategory, InventoryItemDetails } from '../../../types/playerCharacter';
import { playerRoomColors } from '../playerRoomTheme';
import { inventoryCategories, normalizeInventory, type DisplayInventoryItem } from './tabUtils';

type CharacterInventoryTabProps = {
  inventory: string[];
  inventoryDetails?: InventoryItemDetails[];
};

type CategoryKey = 'all' | InventoryCategory;

function ItemIcon({ category }: { category: InventoryCategory }) {
  const icon: Record<InventoryCategory, ReactNode> = {
    weapon: <GpsFixedOutlined />,
    armor: <ShieldOutlined />,
    consumable: <LocalDrinkOutlined />,
    quest: <VpnKeyOutlined />,
    other: <BackpackOutlined />,
  };
  return <>{icon[category]}</>;
}

function InventoryItemTile({
  item,
  selected,
  onSelect,
}: {
  item: DisplayInventoryItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <ButtonBase
      onClick={onSelect}
      aria-pressed={selected}
      sx={{
        width: '100%',
        minHeight: 82,
        alignItems: 'stretch',
        justifyContent: 'stretch',
        textAlign: 'left',
        border: `1px solid ${selected ? alpha(playerRoomColors.gold, 0.78) : alpha(playerRoomColors.gold, 0.18)}`,
        background: selected
          ? `linear-gradient(145deg, ${alpha(playerRoomColors.gold, 0.12)}, ${alpha(playerRoomColors.burgundy, 0.2)})`
          : alpha('#000000', 0.14),
        boxShadow: selected ? `inset 0 0 18px ${alpha(playerRoomColors.gold, 0.06)}` : 'none',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:hover': { borderColor: alpha(playerRoomColors.gold, 0.55) },
        '&.Mui-focusVisible': { outline: `2px solid ${playerRoomColors.gold}`, outlineOffset: -2 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ width: '100%', p: 1.2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            color: selected ? 'primary.main' : 'text.secondary',
            border: `1px solid ${alpha(playerRoomColors.gold, 0.25)}`,
            background: `radial-gradient(circle, ${alpha(playerRoomColors.gold, 0.1)}, ${alpha('#000000', 0.18)})`,
            '& svg': { fontSize: 26 },
          }}
        >
          <ItemIcon category={item.category} />
        </Box>
        <Box minWidth={0} flex={1}>
          <Typography variant="body2" noWrap title={item.name} sx={{ color: selected ? 'primary.light' : 'text.primary' }}>
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {item.type}
          </Typography>
        </Box>
        {item.quantity > 1 && (
          <Typography
            variant="caption"
            sx={{ alignSelf: 'flex-end', color: 'primary.main', fontFamily: 'Georgia, serif' }}
          >
            ×{item.quantity}
          </Typography>
        )}
      </Stack>
    </ButtonBase>
  );
}

export function CharacterInventoryTab({ inventory, inventoryDetails = [] }: CharacterInventoryTabProps) {
  const items = useMemo(() => normalizeInventory(inventory, inventoryDetails), [inventory, inventoryDetails]);
  const [category, setCategory] = useState<CategoryKey>('all');
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '');
  const filteredItems = category === 'all' ? items : items.filter((item) => item.category === category);
  const selectedItem = filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? null;

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '170px minmax(0, 1fr) 290px', xl: '190px minmax(0, 1fr) 320px' },
        gap: 1.25,
      }}
    >
      <Paper elevation={0} className="pr-frame" sx={{ p: 1.25, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.75, py: 0.75 }}>
          <Inventory2Outlined color="primary" />
          <Typography variant="h6" sx={{ fontSize: '1rem' }}>Категории</Typography>
        </Stack>
        <Stack component="div" role="list" spacing={0.5} sx={{ mt: 1 }}>
          {inventoryCategories.map((item) => {
            const active = category === item.key;
            const count = item.key === 'all' ? items.length : items.filter((entry) => entry.category === item.key).length;
            return (
              <ButtonBase
                key={item.key}
                role="listitem"
                onClick={() => setCategory(item.key)}
                aria-pressed={active}
                sx={{
                  minHeight: 42,
                  px: 1.25,
                  justifyContent: 'space-between',
                  borderLeft: `2px solid ${active ? playerRoomColors.gold : 'transparent'}`,
                  color: active ? 'primary.light' : 'text.secondary',
                  backgroundColor: active ? alpha(playerRoomColors.gold, 0.075) : 'transparent',
                  '&:hover': { color: 'text.primary', backgroundColor: alpha(playerRoomColors.gold, 0.04) },
                  '&.Mui-focusVisible': { outline: `2px solid ${playerRoomColors.gold}`, outlineOffset: -2 },
                }}
              >
                <Typography variant="body2">{item.label}</Typography>
                <Typography variant="caption" sx={{ color: active ? 'primary.main' : 'text.secondary' }}>
                  {count}
                </Typography>
              </ButtonBase>
            );
          })}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: { xs: 1.25, lg: 1.75 } }}
      >
        <Stack direction="row" alignItems="baseline" justifyContent="space-between" spacing={2} sx={{ mb: 1.25 }}>
          <Box>
            <Typography variant="h6">Снаряжение</Typography>
            <Typography variant="caption" color="text.secondary">
              {inventoryCategories.find((item) => item.key === category)?.label} · {filteredItems.length}
            </Typography>
          </Box>
          <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.62rem' }}>
            Ячейки персонажа
          </Typography>
        </Stack>
        {filteredItems.length > 0 ? (
          <Box
            className="pr-scroll-region"
            sx={{
              pr: 0.5,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
              alignContent: 'start',
              gap: 0.8,
            }}
          >
            {filteredItems.map((item) => (
              <InventoryItemTile
                key={item.id}
                item={item}
                selected={selectedItem?.id === item.id}
                onSelect={() => setSelectedId(item.id)}
              />
            ))}
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', textAlign: 'center', px: 2 }}>
            <Box>
              <BackpackOutlined sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.5 }} />
              <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                В этой категории пока нет предметов.
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper
        elevation={0}
        className="pr-frame"
        sx={{ p: 2, minHeight: 0, overflow: 'auto', display: { xs: 'none', md: 'block' } }}
      >
        {selectedItem ? (
          <Stack spacing={1.5}>
            <Box
              sx={{
                width: 86,
                height: 86,
                mx: 'auto',
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                border: `1px solid ${alpha(playerRoomColors.gold, 0.42)}`,
                background: `radial-gradient(circle, ${alpha(playerRoomColors.gold, 0.12)}, transparent 68%)`,
                '& svg': { fontSize: 42 },
              }}
            >
              <ItemIcon category={selectedItem.category} />
            </Box>
            <Box textAlign="center">
              <Typography variant="h6">{selectedItem.name}</Typography>
              <Chip size="small" label={selectedItem.type} variant="outlined" sx={{ mt: 0.75 }} />
            </Box>
            <Box sx={{ height: 1, background: `linear-gradient(90deg, transparent, ${playerRoomColors.border}, transparent)` }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
              {selectedItem.description}
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">Количество</Typography>
              <Typography variant="body2" color="primary.main">{selectedItem.quantity}</Typography>
            </Stack>
          </Stack>
        ) : (
          <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Выберите предмет, чтобы увидеть детали.</Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
