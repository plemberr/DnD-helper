import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { useRef } from 'react';
import { Box, CircularProgress, IconButton, Paper, Stack, Typography } from '@mui/material';
import { mediaLibraries, type MediaItem, type MediaType } from '../../data/library';

type MediaLibraryPanelProps = {
  mediaState: Record<MediaType, MediaItem[]>;
  uploadingByType: Record<MediaType, boolean>;
  viewMode: 'list' | 'grid';
  onToggleViewMode: () => void;
  onUploadMediaItem: (mediaType: MediaType, file: File) => Promise<void>;
  onDeleteMediaItem: (mediaType: MediaType, itemId: string) => void;
  onMediaDragStart: (mediaType: MediaType, itemId: string) => void;
  onMediaDragEnd: () => void;
  onMediaDropAt: (mediaType: MediaType, index: number) => void;
};

export function MediaLibraryPanel({
  mediaState,
  uploadingByType,
  viewMode,
  onToggleViewMode,
  onUploadMediaItem,
  onDeleteMediaItem,
  onMediaDragStart,
  onMediaDragEnd,
  onMediaDropAt,
}: MediaLibraryPanelProps) {
  const orderedMediaTypes: MediaType[] = ['picture', 'sound', 'music'];
  const inputRefs = useRef<Record<MediaType, HTMLInputElement | null>>({
    picture: null,
    sound: null,
    music: null,
  });

  const acceptByMediaType: Record<MediaType, string> = {
    picture: 'image/*',
    sound: 'audio/*',
    music: 'audio/*',
  };

  return (
    <Box component="aside" sx={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
      <Stack direction="row" alignItems="center" sx={{ px: 1.5, height: 48, borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
          Библиотека медиа файлов
        </Typography>
        <IconButton size="small" onClick={onToggleViewMode}>
          {viewMode === 'list' ? <ViewListOutlinedIcon fontSize="small" /> : <GridViewOutlinedIcon fontSize="small" />}
        </IconButton>
      </Stack>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Stack spacing={1.5} sx={{ p: 1.5 }}>
          {orderedMediaTypes.map((mediaType) => {
            const library = mediaLibraries[mediaType];
            const items = mediaState[mediaType];

            return (
              <Paper key={mediaType} variant="outlined" sx={{ p: 1.5 }}>
                <Stack direction="row" alignItems="center">
                  <Typography variant="subtitle2">{library.title}</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.25} sx={{ ml: 'auto', color: 'warning.dark' }}>
                    {mediaType === 'music' && <MusicNoteIcon fontSize="small" />}
                    {mediaType === 'picture' && <ImageOutlinedIcon fontSize="small" />}
                    {mediaType === 'sound' && <GraphicEqOutlinedIcon fontSize="small" />}
                    <input
                      ref={(element) => {
                        inputRefs.current[mediaType] = element;
                      }}
                      type="file"
                      accept={acceptByMediaType[mediaType]}
                      hidden
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) {
                          return;
                        }

                        await onUploadMediaItem(mediaType, file);
                        event.target.value = '';
                      }}
                    />
                    <IconButton size="small" onClick={() => inputRefs.current[mediaType]?.click()} disabled={uploadingByType[mediaType]}>
                      {uploadingByType[mediaType] ? <CircularProgress size={14} /> : <AddIcon fontSize="small" />}
                    </IconButton>
                  </Stack>
                </Stack>

                {viewMode === 'list' ? (
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {items.map((item, index) => (
                      <Box
                        key={item.id}
                        draggable
                        onDragStart={() => onMediaDragStart(mediaType, item.id)}
                        onDragEnd={onMediaDragEnd}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => onMediaDropAt(mediaType, index)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'divider',
                          bgcolor: 'grey.50',
                          '&:hover': { borderColor: 'warning.light' },
                        }}
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16, cursor: 'grab', color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <IconButton size="small" onClick={() => onDeleteMediaItem(mediaType, item.id)} aria-label="Удалить">
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    {items.map((item, index) => (
                      <Box
                        key={item.id}
                        draggable
                        onDragStart={() => onMediaDragStart(mediaType, item.id)}
                        onDragEnd={onMediaDragEnd}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => onMediaDropAt(mediaType, index)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1,
                          py: 1,
                          borderRadius: 1,
                          border: 1,
                          borderColor: 'divider',
                          bgcolor: 'grey.50',
                          '&:hover': { borderColor: 'warning.light' },
                        }}
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16, cursor: 'grab', color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <IconButton size="small" onClick={() => onDeleteMediaItem(mediaType, item.id)} aria-label="Удалить">
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', fontStyle: 'italic' }}>
                  {library.subtitle}
                </Typography>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}
