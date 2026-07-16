import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, Paper, Stack, Typography } from '@mui/material';
import { useMutation, useQuery } from '../../lib/reactZustandQuery';
import { Api } from '../../api/Api';
import { mediaLibraries, type MediaItem, type MediaType } from '../../data/library';
import { useMediaLibraryStore } from '../../store/mediaLibraryStore';

const MEDIA_LIBRARY_DND_MIME = 'application/x-tenzor-media-library-item';

type MediaDragState = {
  mediaType: MediaType;
  itemId: string;
} | null;

export function MediaLibraryPanel() {
  const orderedMediaTypes: MediaType[] = ['picture', 'sound', 'music'];
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const inputRefs = useRef<Record<MediaType, HTMLInputElement | null>>({
    picture: null,
    sound: null,
    music: null,
  });
  const mediaDragRef = useRef<MediaDragState>(null);
  const mediaState = useMediaLibraryStore((state) => state.mediaState);
  const uploadingByType = useMediaLibraryStore((state) => state.uploadingByType);
  const selectedMediaPreview = useMediaLibraryStore((state) => state.selectedMediaPreview);
  const setMediaState = useMediaLibraryStore((state) => state.setMediaState);
  const addMediaItem = useMediaLibraryStore((state) => state.addMediaItem);
  const deleteMediaItem = useMediaLibraryStore((state) => state.deleteMediaItem);
  const moveMediaItem = useMediaLibraryStore((state) => state.moveMediaItem);
  const selectMediaItem = useMediaLibraryStore((state) => state.selectMediaItem);
  const setUploadingState = useMediaLibraryStore((state) => state.setUploadingState);

  const mediaLibraryQuery = useQuery<Record<MediaType, MediaItem[]>>({
    queryKey: ['media-library'],
    queryFn: Api.getMediaLibrary,
    staleTime: 30_000,
    retry: 1,
  });

  const uploadMediaMutation = useMutation<
    { mediaType: MediaType; item: MediaItem },
    { mediaType: MediaType; file: File }
  >({
    mutationFn: async ({ mediaType, file }) => {
      const uploaded = await Api.uploadMediaFile(mediaType, file);
      return { mediaType, item: uploaded };
    },
    onSuccess: ({ mediaType, item }) => {
      addMediaItem(mediaType, item);
      selectMediaItem(mediaType, item);
    },
  });

  useEffect(() => {
    if (mediaLibraryQuery.data) {
      setMediaState(mediaLibraryQuery.data);
    }
  }, [mediaLibraryQuery.data, setMediaState]);

  const handleUploadMediaItem = async (mediaType: MediaType, file: File) => {
    setUploadingState(mediaType, true);
    try {
      await uploadMediaMutation.mutate({ mediaType, file });
    } finally {
      setUploadingState(mediaType, false);
    }
  };

  const handleMediaDropAt = (mediaType: MediaType, index: number) => {
    const dragged = mediaDragRef.current;
    if (!dragged || dragged.mediaType !== mediaType) {
      return;
    }

    const fromIndex = mediaState[mediaType].findIndex((entry) => entry.id === dragged.itemId);
    if (fromIndex !== -1 && fromIndex !== index) {
      moveMediaItem(mediaType, fromIndex, index);
    }

    mediaDragRef.current = null;
  };

  const setExternalMediaPayload = (event: React.DragEvent<HTMLElement>, mediaType: MediaType, item: MediaItem) => {
    if (item.kind === 'folder') {
      return;
    }

    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData(
      MEDIA_LIBRARY_DND_MIME,
      JSON.stringify({
        mediaType,
        itemId: item.id,
        itemName: item.name,
        itemKind: item.kind,
      }),
    );
    event.dataTransfer.setData('text/plain', item.name);
  };

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
        <IconButton size="small" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} sx={{ display: 'none' }}>
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

                        await handleUploadMediaItem(mediaType, file);
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
                        onClick={() => selectMediaItem(mediaType, item)}
                        onDragStart={(event) => {
                          mediaDragRef.current = { mediaType, itemId: item.id };
                          setExternalMediaPayload(event, mediaType, item);
                        }}
                        onDragEnd={() => {
                          mediaDragRef.current = null;
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleMediaDropAt(mediaType, index)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: 1,
                          border: 1,
                          borderColor: selectedMediaPreview?.item.id === item.id ? 'warning.main' : 'divider',
                          bgcolor: selectedMediaPreview?.item.id === item.id ? 'rgba(255, 167, 38, 0.12)' : 'grey.50',
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'warning.light' },
                        }}
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16, cursor: 'grab', color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteMediaItem(mediaType, item.id);
                          }}
                          aria-label="Удалить"
                        >
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
                        onClick={() => selectMediaItem(mediaType, item)}
                        onDragStart={(event) => {
                          mediaDragRef.current = { mediaType, itemId: item.id };
                          setExternalMediaPayload(event, mediaType, item);
                        }}
                        onDragEnd={() => {
                          mediaDragRef.current = null;
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleMediaDropAt(mediaType, index)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1,
                          py: 1,
                          borderRadius: 1,
                          border: 1,
                          borderColor: selectedMediaPreview?.item.id === item.id ? 'warning.main' : 'divider',
                          bgcolor: selectedMediaPreview?.item.id === item.id ? 'rgba(255, 167, 38, 0.12)' : 'grey.50',
                          cursor: 'pointer',
                          '&:hover': { borderColor: 'warning.light' },
                        }}
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16, cursor: 'grab', color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteMediaItem(mediaType, item.id);
                          }}
                          aria-label="Удалить"
                        >
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
