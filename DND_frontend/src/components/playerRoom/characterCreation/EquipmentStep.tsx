import {
  BackpackOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import { playerRoomColors } from "../playerRoomTheme";
import { CreationStepFrame } from "./CreationStepFrame";

type EquipmentStepProps = {
  equipmentText: string;
  onEquipmentChange: (value: string) => void;
};

const CONTENT_HEIGHT = 286;

export function EquipmentStep({
  equipmentText,
  onEquipmentChange,
}: EquipmentStepProps) {
  const items = equipmentText
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <CreationStepFrame
      eyebrow="Шаг 6 · Снаряжение"
      title="Соберите дорожный набор"
      description="Добавьте стартовые предметы по одному на строку или разделяйте их запятыми."
      icon={<BackpackOutlined />}
    >
      <Box
        sx={{
          minHeight: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1.25fr) minmax(280px, 0.75fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography
            variant="overline"
            sx={{
              pl: 0.75,
              color: "text.secondary",
              fontSize: "0.7rem",
              lineHeight: 1,
              letterSpacing: "0.12em",
            }}
          >
            Стартовые предметы
          </Typography>

          <TextField
            multiline
            fullWidth
            minRows={9}
            maxRows={9}
            value={equipmentText}
            onChange={(event) => onEquipmentChange(event.target.value)}
            helperText="Старые данные остаются совместимыми: предметы сохраняются как простой список."
            sx={{
              "& .MuiOutlinedInput-root": {
                height: CONTENT_HEIGHT,
                alignItems: "flex-start",
                backgroundColor: alpha("#000000", 0.12),
              },

              "& .MuiInputBase-inputMultiline": {
                height: "100% !important",
                maxHeight: "100% !important",
                overflowY: "auto !important",
                resize: "none",
                boxSizing: "border-box",
              },

              "& .MuiFormHelperText-root": {
                mx: 0,
                mt: 0.75,
              },
            }}
          />
        </Stack>

        <Paper
          elevation={0}
          className="pr-frame"
          sx={{
            p: 1.75,
            mt: 2.25,
            minHeight: CONTENT_HEIGHT,
            maxHeight: CONTENT_HEIGHT,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Inventory2Outlined color="primary" />

            <Box>
              <Typography variant="h6" sx={{ fontSize: "1rem" }}>
                Предпросмотр
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Предметов: {items.length}
              </Typography>
            </Box>
          </Stack>

          <Stack
            className="pr-scroll-region"
            spacing={0.65}
            sx={{
              mt: 1.25,
              minHeight: 0,
              flex: 1,
              overflowY: "auto",
              pr: 0.5,
            }}
          >
            {items.length > 0 ? (
              items.map((item, index) => (
                <Stack
                  key={`${item}-${index}`}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{
                    minHeight: 42,
                    px: 1,
                    flexShrink: 0,
                    borderLeft: `2px solid ${alpha(
                      playerRoomColors.gold,
                      0.4,
                    )}`,
                    backgroundColor: alpha("#000000", 0.11),
                  }}
                >
                  <Box
                    sx={{
                      width: 25,
                      height: 25,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      color: "primary.main",
                      border: `1px solid ${alpha(
                        playerRoomColors.gold,
                        0.25,
                      )}`,
                    }}
                  >
                    {index + 1}
                  </Box>

                  <Typography variant="body2" noWrap>
                    {item}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  py: 4,
                  textAlign: "center",
                }}
              >
                Список пока пуст.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    </CreationStepFrame>
  );
}