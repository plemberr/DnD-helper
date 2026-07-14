import {
  AutoAwesomeOutlined,
  ExpandMore,
  HistoryEduOutlined,
  LocalFireDepartmentOutlined,
  PersonOutline,
  StarsOutlined,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useMemo, useState, type ReactNode } from 'react';
import type { CharacterFeatureDetails, CharacterFeatureType } from '../../../types/playerCharacter';
import { playerRoomColors } from '../playerRoomTheme';
import { featureTypeLabels, normalizeFeatures } from './tabUtils';

type CharacterAbilitiesTabProps = {
  features: string[];
  featureDetails?: CharacterFeatureDetails[];
};

const featureTypes: CharacterFeatureType[] = ['racial', 'class', 'background', 'general'];

const featureIcons: Record<CharacterFeatureType, ReactNode> = {
  racial: <PersonOutline />,
  class: <LocalFireDepartmentOutlined />,
  background: <HistoryEduOutlined />,
  general: <StarsOutlined />,
};

export function CharacterAbilitiesTab({ features, featureDetails = [] }: CharacterAbilitiesTabProps) {
  const normalizedFeatures = useMemo(
    () => normalizeFeatures(features, featureDetails),
    [featureDetails, features],
  );
  const firstPopulatedType = featureTypes.find((type) => normalizedFeatures.some((feature) => feature.type === type));
  const [activeType, setActiveType] = useState<CharacterFeatureType>(firstPopulatedType ?? 'class');
  const visibleFeatures = normalizedFeatures.filter((feature) => feature.type === activeType);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '235px minmax(0, 1fr)' },
        gap: 1.25,
      }}
    >
      <Paper elevation={0} className="pr-frame" sx={{ p: 1.25, minHeight: 0, overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.75, py: 0.75 }}>
          <AutoAwesomeOutlined color="primary" />
          <Box>
            <Typography variant="h6" sx={{ fontSize: '1rem' }}>Источники сил</Typography>
            <Typography variant="caption" color="text.secondary">Способности и черты</Typography>
          </Box>
        </Stack>
        <Stack spacing={0.65} sx={{ mt: 1.25 }}>
          {featureTypes.map((type) => {
            const active = type === activeType;
            const count = normalizedFeatures.filter((feature) => feature.type === type).length;
            return (
              <ButtonBase
                key={type}
                onClick={() => setActiveType(type)}
                aria-pressed={active}
                sx={{
                  minHeight: 54,
                  px: 1.2,
                  justifyContent: 'stretch',
                  color: active ? 'primary.light' : 'text.secondary',
                  border: `1px solid ${active ? alpha(playerRoomColors.gold, 0.45) : alpha(playerRoomColors.gold, 0.1)}`,
                  background: active
                    ? `linear-gradient(90deg, ${alpha(playerRoomColors.gold, 0.09)}, transparent)`
                    : alpha('#000000', 0.08),
                  '&:hover': { borderColor: alpha(playerRoomColors.gold, 0.4), color: 'text.primary' },
                  '&.Mui-focusVisible': { outline: `2px solid ${playerRoomColors.gold}`, outlineOffset: -2 },
                }}
              >
                <Box sx={{ display: 'flex', color: active ? 'primary.main' : 'text.secondary', '& svg': { fontSize: 20 } }}>
                  {featureIcons[type]}
                </Box>
                <Typography variant="body2" sx={{ ml: 1.2, flex: 1, textAlign: 'left' }}>
                  {featureTypeLabels[type]}
                </Typography>
                <Typography variant="caption" color={active ? 'primary.main' : 'text.secondary'}>{count}</Typography>
              </ButtonBase>
            );
          })}
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{ minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', p: { xs: 1.5, lg: 2.25 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 1.4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', lg: '1.55rem' } }}>
              {featureTypeLabels[activeType]}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Раскройте запись, чтобы прочитать подробное описание.
            </Typography>
          </Box>
          <Chip size="small" label={`${visibleFeatures.length} записей`} variant="outlined" color="primary" />
        </Stack>

        <Box className="pr-scroll-region" sx={{ minHeight: 0, pr: 0.6 }}>
          {visibleFeatures.length > 0 ? (
            <Stack spacing={0.85}>
              {visibleFeatures.map((feature, index) => (
                <Accordion
                  key={feature.id}
                  defaultExpanded={index === 0}
                  elevation={0}
                  disableGutters
                  sx={{
                    border: `1px solid ${alpha(playerRoomColors.gold, 0.19)}`,
                    backgroundColor: alpha('#000000', 0.12),
                    '&.Mui-expanded': { borderColor: alpha(playerRoomColors.gold, 0.48) },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore color="primary" />}
                    aria-controls={`${feature.id}-content`}
                    id={`${feature.id}-header`}
                    sx={{
                      minHeight: 58,
                      px: 1.5,
                      '& .MuiAccordionSummary-content': { my: 1 },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          flexShrink: 0,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'primary.main',
                          border: `1px solid ${alpha(playerRoomColors.gold, 0.28)}`,
                          transform: 'rotate(45deg)',
                          '& svg': { fontSize: 18, transform: 'rotate(-45deg)' },
                        }}
                      >
                        {featureIcons[feature.type]}
                      </Box>
                      <Box minWidth={0}>
                        <Typography variant="subtitle1" sx={{ fontFamily: 'Georgia, serif' }} noWrap>
                          {feature.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {feature.summary}
                        </Typography>
                      </Box>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails
                    id={`${feature.id}-content`}
                    sx={{
                      mx: 1.5,
                      px: 0,
                      pt: 1.35,
                      pb: 1.8,
                      borderTop: `1px solid ${alpha(playerRoomColors.gold, 0.15)}`,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 880 }}>
                      {feature.description}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          ) : (
            <Box sx={{ height: '100%', minHeight: 220, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
              <Box>
                <AutoAwesomeOutlined sx={{ fontSize: 42, color: 'text.secondary', opacity: 0.45 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Способности этого типа пока не добавлены.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
