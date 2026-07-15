import MusicNoteIcon from '@mui/icons-material/MusicNote';
import { Box, Typography } from '@mui/material';
import { FantasyAudioPlayer } from '../audio/FantasyAudioPlayer';
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
      <Box sx={{ width: 420, maxWidth: '55%' }}>
        <FantasyAudioPlayer src={hasPlayableAudio ? selectedAudioItem?.fileUrl : undefined} dense />
      </Box>
    </Box>
  );
}
