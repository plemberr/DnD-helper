import { BackpackOutlined } from '@mui/icons-material';
import {
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

type InventoryPanelProps = {
  inventory: string[];
};

export function InventoryPanel({ inventory }: InventoryPanelProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Инвентарь
        </Typography>
        {inventory.length > 0 ? (
          <List disablePadding sx={{ mt: 1 }}>
            {inventory.map((item, index) => (
              <div key={`${item}-${index}`}>
                {index > 0 && <Divider component="li" />}
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <BackpackOutlined color="action" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={item} />
                </ListItem>
              </div>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
            Инвентарь пока пуст.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
