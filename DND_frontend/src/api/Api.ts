import { mediaLibraries, type MediaItem, type MediaType } from '../data/library';

type UserMock = {
  id: string;
  name: string;
};

const mockUsers: UserMock[] = [
  { id: 'u-1', name: 'Admin' },
  { id: 'u-2', name: 'Master' },
];

const createInitialMediaState = (): Record<MediaType, MediaItem[]> =>
  Object.fromEntries(
    Object.entries(mediaLibraries).map(([kind, library]) => [kind, [...library.items]]),
  ) as Record<MediaType, MediaItem[]>;

const mediaStorage = createInitialMediaState();

export const delay = (ms = 500) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const Api = {
  async getUsers() {
    await delay();
    return [...mockUsers];
  },

  async getMediaLibrary() {
    await delay();
    return Object.fromEntries(
      Object.entries(mediaStorage).map(([kind, items]) => [kind, [...items]]),
    ) as Record<MediaType, MediaItem[]>;
  },

  async uploadMediaFile(mediaType: MediaType, file: File) {
    await delay(700);

    const nextItem: MediaItem = {
      id: `${mediaType}-${Date.now()}`,
      name: file.name,
      kind: 'file',
      fileUrl: URL.createObjectURL(file),
      mimeType: file.type,
    };

    mediaStorage[mediaType] = [...mediaStorage[mediaType], nextItem];
    return nextItem;
  },
};
