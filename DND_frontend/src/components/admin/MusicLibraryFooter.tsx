import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { Box, Typography } from '@mui/material';
import { useMediaLibraryStore } from '../../store/mediaLibraryStore';

export function MusicLibraryFooter() {
  const selectedMediaPreview = useMediaLibraryStore((state) => state.selectedMediaPreview);
  const selectedAudioItem =
    selectedMediaPreview && (selectedMediaPreview.mediaType === 'music' || selectedMediaPreview.mediaType === 'sound')
      ? selectedMediaPreview.item
      : null;

  const hasPlayableAudio = Boolean(selectedAudioItem?.fileUrl);

  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2.5,
        py: 1.5,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <MusicNoteIcon sx={{ color: 'warning.main', fontSize: 20 }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {selectedAudioItem ? selectedAudioItem.name : 'Аудиофайл не выбран'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Выберите музыку или звук в библиотеке справа, чтобы проиграть здесь.
        </Typography>
      </Box>
      <Box
        component="audio"
        controls
        src={hasPlayableAudio ? selectedAudioItem?.fileUrl : undefined}
        sx={{ width: 360, maxWidth: '50%' }}
      />
    </Box>
  );
}
