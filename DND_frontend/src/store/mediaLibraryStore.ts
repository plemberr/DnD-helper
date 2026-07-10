import { create } from 'zustand';
import { mediaLibraries, type MediaItem, type MediaType } from '../data/library';

const createMediaState = (): Record<MediaType, MediaItem[]> =>
  Object.fromEntries(
    Object.entries(mediaLibraries).map(([kind, library]) => [kind, [...library.items]]),
  ) as Record<MediaType, MediaItem[]>;

type MediaLibraryStore = {
  mediaState: Record<MediaType, MediaItem[]>;
  uploadingByType: Record<MediaType, boolean>;
  setMediaState: (nextState: Record<MediaType, MediaItem[]>) => void;
  addMediaItem: (mediaType: MediaType, item: MediaItem) => void;
  deleteMediaItem: (mediaType: MediaType, itemId: string) => void;
  moveMediaItem: (mediaType: MediaType, fromIndex: number, toIndex: number) => void;
  setUploadingState: (mediaType: MediaType, value: boolean) => void;
};

export const useMediaLibraryStore = create<MediaLibraryStore>((set) => ({
  mediaState: createMediaState(),
  uploadingByType: {
    picture: false,
    sound: false,
    music: false,
  },
  setMediaState: (nextState) => set({ mediaState: nextState }),
  addMediaItem: (mediaType, item) =>
    set((state) => ({
      mediaState: {
        ...state.mediaState,
        [mediaType]: [...state.mediaState[mediaType], item],
      },
    })),
  deleteMediaItem: (mediaType, itemId) =>
    set((state) => ({
      mediaState: {
        ...state.mediaState,
        [mediaType]: state.mediaState[mediaType].filter((item) => item.id !== itemId),
      },
    })),
  moveMediaItem: (mediaType, fromIndex, toIndex) =>
    set((state) => {
      const nextItems = [...state.mediaState[mediaType]];
      const [movedItem] = nextItems.splice(fromIndex, 1);
      nextItems.splice(toIndex, 0, movedItem);

      return {
        mediaState: {
          ...state.mediaState,
          [mediaType]: nextItems,
        },
      };
    }),
  setUploadingState: (mediaType, value) =>
    set((state) => ({
      uploadingByType: {
        ...state.uploadingByType,
        [mediaType]: value,
      },
    })),
}));
