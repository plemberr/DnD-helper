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
import { contentService } from '../../api/contentService';
import { mediaLibraries, type MediaItem, type MediaType } from '../../data/library';
import { useMediaLibraryStore } from '../../store/mediaLibraryStore';
import { readAccessToken } from '../../utils/authSession';
import {
  fantasyColors,
  fantasyGradients,
  fantasyShadows,
} from '../../theme/fantasyTheme';

const MEDIA_LIBRARY_DND_MIME = 'application/x-tenzor-media-library-item';

type MediaDragState = {
  mediaType: MediaType;
  itemId: string;
} | null;

type MediaLibraryPanelProps = {
  roomId: number | null;
};

export function MediaLibraryPanel({ roomId }: MediaLibraryPanelProps) {
  const orderedMediaTypes: MediaType[] = ['picture', 'sound', 'music'];
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [defaultFolderId, setDefaultFolderId] = useState<number | null>(null);
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
  const accessToken = readAccessToken();

  const mediaLibraryQuery = useQuery<{ mediaState: Record<MediaType, MediaItem[]>; defaultFolderId: number }>({
    queryKey: ['media-library', roomId, accessToken],
    queryFn: async () => {
      if (!roomId || !accessToken) {
        return {
          mediaState: contentService.createEmptyMediaState(),
          defaultFolderId: 0,
        };
      }

      return contentService.getAdminMediaLibrary(roomId, accessToken);
    },
    staleTime: 30_000,
    retry: 1,
  });

  const uploadMediaMutation = useMutation<
    { mediaType: MediaType; item: MediaItem },
    { mediaType: MediaType; file: File }
  >({
    mutationFn: async ({ mediaType, file }) => {
      if (!roomId || !accessToken || !defaultFolderId) {
        throw new Error('Не удалось определить активную комнату для загрузки медиа.');
      }

      const uploaded = await contentService.uploadMediaFile(roomId, defaultFolderId, mediaType, file, accessToken);
      return { mediaType, item: uploaded };
    },
    onSuccess: ({ mediaType, item }) => {
      addMediaItem(mediaType, item);
      selectMediaItem(mediaType, item);
    },
  });

  const deleteMediaMutation = useMutation<void, { mediaType: MediaType; itemId: string }>({
    mutationFn: async ({ mediaType, itemId }) => {
      if (!accessToken) {
        throw new Error('Сессия не найдена. Войдите снова.');
      }

      const mediaId = Number(itemId.replace('media-', ''));
      if (!Number.isFinite(mediaId)) {
        return;
      }

      await contentService.deleteMediaFile(mediaType, mediaId, accessToken);
    },
  });

  useEffect(() => {
    if (mediaLibraryQuery.data) {
      setMediaState(mediaLibraryQuery.data.mediaState);
      if (mediaLibraryQuery.data.defaultFolderId > 0) {
        setDefaultFolderId(mediaLibraryQuery.data.defaultFolderId);
      }
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
    <Box
      component="aside"
      sx={{
        width: 340,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: fantasyColors.border,
        color: fantasyColors.text,
        backgroundColor: fantasyColors.backdrop,
        backgroundImage:
          'radial-gradient(circle at 100% 0%, rgba(87, 37, 45, 0.18), transparent 34%), linear-gradient(180deg, #171215 0%, #100d11 100%)',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 1.5,
          height: 48,
          borderBottom: 1,
          borderColor: fantasyColors.border,
          backgroundColor: fantasyColors.panelRaised,
          backgroundImage: fantasyGradients.panelRaised,
          boxShadow: 'inset 0 -1px 0 rgba(210, 173, 103, 0.08)',
        }}
      >
        <Typography variant="subtitle1" sx={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
          Библиотека медиа файлов
        </Typography>
        <IconButton size="small" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} sx={{ display: 'none' }}>
          {viewMode === 'list' ? <ViewListOutlinedIcon fontSize="small" /> : <GridViewOutlinedIcon fontSize="small" />}
        </IconButton>
      </Stack>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(11, 9, 12, 0.34)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(210, 173, 103, 0.24)',
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(210, 173, 103, 0.38)',
          },
        }}
      >
        <Stack spacing={1.5} sx={{ p: 1.5 }}>
          {orderedMediaTypes.map((mediaType) => {
            const library = mediaLibraries[mediaType];
            const items = mediaState[mediaType];

            return (
              <Paper
                key={mediaType}
                variant="outlined"
                sx={{
                  p: 1.5,
                  color: fantasyColors.text,
                  borderColor: fantasyColors.border,
                  backgroundColor:
                    mediaType === 'picture'
                      ? '#241a1d'
                      : mediaType === 'sound'
                        ? '#21191b'
                        : '#1d1519',
                  backgroundImage:
                    mediaType === 'picture'
                      ? 'linear-gradient(145deg, rgba(210, 173, 103, 0.055), transparent 38%)'
                      : mediaType === 'sound'
                        ? 'linear-gradient(145deg, rgba(125, 141, 162, 0.05), transparent 42%)'
                        : 'linear-gradient(145deg, rgba(87, 37, 45, 0.14), transparent 46%)',
                  boxShadow: fantasyShadows.panel,
                  transition: 'border-color 160ms ease, box-shadow 160ms ease',
                  '&:hover': {
                    borderColor: fantasyColors.borderStrong,
                    boxShadow: `${fantasyShadows.panel}, 0 0 18px rgba(210, 173, 103, 0.06)`,
                  },
                }}
              >
                <Stack direction="row" alignItems="center">
                  <Typography variant="subtitle2">{library.title}</Typography>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.25}
                    sx={{ ml: 'auto', color: fantasyColors.gold }}
                  >
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
                          borderColor:
                            selectedMediaPreview?.item.id === item.id
                              ? fantasyColors.gold
                              : fantasyColors.border,
                          color: fantasyColors.text,
                          backgroundColor:
                            selectedMediaPreview?.item.id === item.id
                              ? 'rgba(87, 37, 45, 0.62)'
                              : 'rgba(11, 9, 12, 0.38)',
                          boxShadow:
                            selectedMediaPreview?.item.id === item.id
                              ? 'inset 3px 0 0 #d2ad67, 0 0 14px rgba(210, 173, 103, 0.08)'
                              : 'inset 0 1px 0 rgba(255, 255, 255, 0.018)',
                          cursor: 'pointer',
                          transition:
                            'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
                          '&:hover': {
                            borderColor: fantasyColors.borderStrong,
                            backgroundColor:
                              selectedMediaPreview?.item.id === item.id
                                ? 'rgba(87, 37, 45, 0.72)'
                                : 'rgba(210, 173, 103, 0.055)',
                          },
                        }}
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16, cursor: 'grab', color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={async (event) => {
                            event.stopPropagation();
                            await deleteMediaMutation.mutate({ mediaType, itemId: item.id });
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
                          borderColor:
                            selectedMediaPreview?.item.id === item.id
                              ? fantasyColors.gold
                              : fantasyColors.border,
                          color: fantasyColors.text,
                          backgroundColor:
                            selectedMediaPreview?.item.id === item.id
                              ? 'rgba(87, 37, 45, 0.62)'
                              : 'rgba(11, 9, 12, 0.38)',
                          boxShadow:
                            selectedMediaPreview?.item.id === item.id
                              ? 'inset 3px 0 0 #d2ad67, 0 0 14px rgba(210, 173, 103, 0.08)'
                              : 'inset 0 1px 0 rgba(255, 255, 255, 0.018)',
                          cursor: 'pointer',
                          transition:
                            'border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease',
                          '&:hover': {
                            borderColor: fantasyColors.borderStrong,
                            backgroundColor:
                              selectedMediaPreview?.item.id === item.id
                                ? 'rgba(87, 37, 45, 0.72)'
                                : 'rgba(210, 173, 103, 0.055)',
                          },
                        }}
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16, cursor: 'grab', color: 'text.secondary' }} />
                        <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                          {item.name}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={async (event) => {
                            event.stopPropagation();
                            await deleteMediaMutation.mutate({ mediaType, itemId: item.id });
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
