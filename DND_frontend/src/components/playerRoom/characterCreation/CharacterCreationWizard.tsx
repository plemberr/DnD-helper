import { ArrowBack, ArrowForward, AutoStoriesOutlined, Check } from '@mui/icons-material';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState, type FormEvent } from 'react';
import { ABILITY_NAMES, type CharacterDraft } from '../../../types/playerCharacter';
import { playerRoomColors } from '../playerRoomTheme';
import { AbilitiesStep } from './AbilitiesStep';
import { ClassStep } from './ClassStep';
import { CreationProgress, creationSteps } from './CreationProgress';
import { EquipmentStep } from './EquipmentStep';
import { IdentityStep } from './IdentityStep';
import { OriginStep } from './OriginStep';
import { ReviewStep } from './ReviewStep';
import { SkillsStep } from './SkillsStep';
import { createInitialDraft, initialEquipment } from './creationData';
import type { DraftUpdater } from './wizardTypes';

type CharacterCreationWizardProps = {
  roomId: string;
  isSubmitting: boolean;
  submitError?: string;
  onCreate: (draft: CharacterDraft) => Promise<void>;
};

function getStepError(step: number, draft: CharacterDraft) {
  if (step === 0 && (!draft.name.trim() || !draft.background.trim())) {
    return 'Укажите имя персонажа и его предысторию.';
  }
  if (step === 1 && !draft.race) {
    return 'Выберите происхождение персонажа.';
  }
  if (step === 2) {
    if (!draft.characterClass || !draft.subclass.trim()) return 'Выберите класс и укажите подкласс.';
    if (!Number.isFinite(draft.level) || draft.level < 1 || draft.level > 20) {
      return 'Уровень персонажа должен быть от 1 до 20.';
    }
  }
  if (
    step === 3 &&
    ABILITY_NAMES.some((ability) =>
      !Number.isFinite(draft.abilities[ability]) || draft.abilities[ability] < 1 || draft.abilities[ability] > 30,
    )
  ) {
    return 'Все характеристики должны иметь значение от 1 до 30.';
  }
  return '';
}

export function CharacterCreationWizard({
  roomId,
  isSubmitting,
  submitError,
  onCreate,
}: CharacterCreationWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [draft, setDraft] = useState<CharacterDraft>(() => createInitialDraft());
  const [equipmentText, setEquipmentText] = useState(initialEquipment);
  const [validationError, setValidationError] = useState('');

  const equipmentItems = equipmentText
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const updateDraft: DraftUpdater = (updater) => {
    setDraft((current) => updater(current));
    setValidationError('');
  };

  const goForward = () => {
    const error = getStepError(activeStep, draft);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    setActiveStep((current) => Math.min(creationSteps.length - 1, current + 1));
  };

  const goBack = () => {
    setValidationError('');
    setActiveStep((current) => Math.max(0, current - 1));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeStep < creationSteps.length - 1) {
      goForward();
      return;
    }

    for (let step = 0; step < creationSteps.length - 1; step += 1) {
      const error = getStepError(step, draft);
      if (error) {
        setActiveStep(step);
        setValidationError(error);
        return;
      }
    }

    setValidationError('');
    try {
      await onCreate({
        ...draft,
        name: draft.name.trim(),
        subclass: draft.subclass.trim(),
        background: draft.background.trim(),
        inventory: equipmentItems,
      });
    } catch {
      // Ошибка мутации отображается через submitError.
    }
  };

  const stepContent = (() => {
    switch (activeStep) {
      case 1:
        return <OriginStep draft={draft} updateDraft={updateDraft} />;
      case 2:
        return <ClassStep draft={draft} updateDraft={updateDraft} />;
      case 3:
        return <AbilitiesStep draft={draft} updateDraft={updateDraft} />;
      case 4:
        return <SkillsStep draft={draft} updateDraft={updateDraft} />;
      case 5:
        return (
          <EquipmentStep
            equipmentText={equipmentText}
            onEquipmentChange={(value) => {
              setEquipmentText(value);
              setValidationError('');
            }}
          />
        );
      case 6:
        return <ReviewStep draft={draft} equipmentItems={equipmentItems} />;
      case 0:
      default:
        return <IdentityStep draft={draft} updateDraft={updateDraft} />;
    }
  })();

  return (
    <Box sx={{ height: '100%', minHeight: 0, p: { xs: 1, md: 1.5, xl: 2 } }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        noValidate
        elevation={0}
        className="pr-frame"
        sx={{
          width: '100%',
          maxWidth: 1600,
          height: '100%',
          mx: 'auto',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr) auto',
          background: `linear-gradient(128deg, ${alpha(playerRoomColors.burgundyDeep, 0.36)}, transparent 32%), ${playerRoomColors.panel}`,
        }}
      >
        <Stack
          component="header"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            minHeight: { xs: 62, lg: 72 },
            px: { xs: 2, lg: 3 },
            py: 1,
            borderBottom: `1px solid ${alpha(playerRoomColors.gold, 0.2)}`,
            backgroundColor: alpha('#000000', 0.16),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25} minWidth={0}>
            <Box
              sx={{
                width: 39,
                height: 39,
                flexShrink: 0,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                border: `1px solid ${alpha(playerRoomColors.gold, 0.42)}`,
                transform: 'rotate(45deg)',
                '& svg': { transform: 'rotate(-45deg)' },
              }}
            >
              <AutoStoriesOutlined />
            </Box>
            <Box minWidth={0}>
              <Typography variant="overline" color="primary.main" sx={{ fontSize: '0.59rem' }}>
                Комната {roomId}
              </Typography>
              <Typography variant="h5" noWrap sx={{ fontSize: { xs: '1.08rem', lg: '1.35rem' } }}>
                Создание персонажа
              </Typography>
            </Box>
          </Stack>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block">Этап</Typography>
            <Typography sx={{ color: 'primary.main', fontFamily: 'Georgia, serif' }}>
              {activeStep + 1} / {creationSteps.length}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '235px minmax(0, 1fr)', lg: '260px minmax(0, 1fr)' },
            gridTemplateRows: { xs: 'auto minmax(0, 1fr)', md: 'minmax(0, 1fr)' },
          }}
        >
          <CreationProgress activeStep={activeStep} />
          <Box sx={{ minHeight: 0, overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' }}>
            {(validationError || submitError) && (
              <Alert severity="error" sx={{ mx: { xs: 1.5, lg: 2.5 }, mt: 1.2, py: 0.25 }}>
                {validationError || submitError}
              </Alert>
            )}
            <Box key={activeStep} className="pr-tab-content" sx={{ minHeight: 0, overflow: 'hidden' }}>
              {stepContent}
            </Box>
          </Box>
        </Box>

        <Stack
          component="footer"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            minHeight: { xs: 58, lg: 66 },
            px: { xs: 2, lg: 3 },
            py: 1,
            borderTop: `1px solid ${alpha(playerRoomColors.gold, 0.2)}`,
            backgroundColor: alpha('#000000', 0.16),
          }}
        >
          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={goBack}
            disabled={activeStep === 0 || isSubmitting}
          >
            Назад
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {creationSteps[activeStep]}
          </Typography>
          {activeStep < creationSteps.length - 1 ? (
            <Button type="submit" variant="contained" endIcon={<ArrowForward />}>
              Далее
            </Button>
          ) : (
            <Button type="submit" variant="contained" startIcon={<Check />} disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем героя…' : 'Создать персонажа'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
