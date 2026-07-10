import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, Button, IconButton, Slider, Stack, Typography } from '@mui/material';
import { musicTracks, soundEffects } from '../../data/library';

type Track = {
  id: string;
  title: string;
  duration: string;
};

type MusicLibraryFooterProps = {
  selectedMusic: Track;
  musicPlaying: boolean;
  onToggleMusicPlaying: () => void;
  onSelectTrack: (track: Track) => void;
};

export function MusicLibraryFooter({
  selectedMusic,
  musicPlaying,
  onToggleMusicPlaying,
  onSelectTrack,
}: MusicLibraryFooterProps) {
  return (
    <>
      <Box component="footer" sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, height: 68, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="overline" color="text.secondary" sx={{ width: 60, fontWeight: 700 }}>
          Music
        </Typography>
        <IconButton
          onClick={onToggleMusicPlaying}
          sx={{ width: 36, height: 36, bgcolor: 'warning.main', color: 'common.white', '&:hover': { bgcolor: 'warning.dark' } }}
        >
          {musicPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </IconButton>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap>
            {selectedMusic.title}
          </Typography>
          <Slider size="small" defaultValue={42} sx={{ mt: 0.75, color: 'warning.main' }} />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {selectedMusic.duration}
        </Typography>
      </Box>

      <Box sx={{ width: '100%', borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50', px: 2.5, py: 1.5 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
            Библиотека:
          </Typography>
          {musicTracks.map((track) => (
            <Button
              key={track.id}
              onClick={() => onSelectTrack(track)}
              size="small"
              variant={selectedMusic.id === track.id ? 'contained' : 'outlined'}
              color="warning"
              startIcon={<MusicNoteIcon sx={{ fontSize: 14 }} />}
              sx={{ borderRadius: 999, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, px: 1.5 }}
            >
              {track.title}
            </Button>
          ))}
          {soundEffects.map((effect) => (
            <Button
              key={effect.id}
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<GraphicEqOutlinedIcon sx={{ fontSize: 14 }} />}
              sx={{ borderRadius: 999, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, px: 1.5 }}
            >
              {effect.title}
            </Button>
          ))}
        </Stack>
      </Box>
    </>
  );
}
