export type MediaType = 'music' | 'picture' | 'sound';

export type FolderNode = {
  id: string;
  name: string;
  kind: 'folder';
  children: TreeNode[];
};

export type TextFileNode = {
  id: string;
  name: string;
  kind: 'document';
  summary: string;
  content: string;
  links: string[];
};

export type MediaFileNode = {
  id: string;
  name: string;
  kind: MediaType;
  summary: string;
};

export type TreeNode = FolderNode | TextFileNode | MediaFileNode;

export type MediaItem = {
  id: string;
  name: string;
  kind: 'folder' | 'file';
};

export const documentTree: FolderNode[] = [
  {
    id: 'folder-1',
    name: 'Текст док 1 оглав',
    kind: 'folder',
    children: [
      {
        id: 'doc-1-text',
        name: 'Текст док 1',
        kind: 'document',
        summary: 'Основной текст документа',
        content:
          'Здесь хранится мастерский текст с внутренними ссылками, списками и заметками по сцене. Это центральная область, похожая на Obsidian.',
        links: ['Музыкальный зал', 'Пещера дракона', 'Карты и схемы'],
      },
      {
        id: 'doc-1-music',
        name: 'Музыка файл 1',
        kind: 'music',
        summary: 'Долгие треки для нижнего плеера',
      },
      {
        id: 'doc-1-picture',
        name: 'Картинка файл 1',
        kind: 'picture',
        summary: 'Картинки, превью и вложения',
      },
      {
        id: 'doc-1-sound',
        name: 'Звук файл 1',
        kind: 'sound',
        summary: 'Короткие эффекты, не прерывают музыку',
      },
    ],
  },
  {
    id: 'folder-2',
    name: 'Текст док 2 оглав',
    kind: 'folder',
    children: [
      {
        id: 'doc-2-text',
        name: 'Текст док 2',
        kind: 'document',
        summary: 'Дополнительная заметка',
        content:
          'Этот документ может содержать короткие записи, подсказки и ссылки на музыку, картинки и другие документы комнаты.',
        links: ['Подземелье', 'Старый архив'],
      },
      { id: 'doc-2-sound', name: 'Звук файл 1', kind: 'sound', summary: 'Тестовый звук' },
      { id: 'doc-2-picture', name: 'Картинка файл 1', kind: 'picture', summary: 'Тестовая картинка' },
    ],
  },
  {
    id: 'folder-3',
    name: 'Текст док 3 оглав',
    kind: 'folder',
    children: [
      {
        id: 'doc-3-text',
        name: 'Текст док 3',
        kind: 'document',
        summary: 'Ещё одна запись',
        content:
          'Каждый документ можно связывать с медиа, чтобы мастер держал в одном месте всю структуру кампании.',
        links: ['Шаблоны монстров'],
      },
    ],
  },
];

export const mediaLibraries: Record<
  MediaType,
  {
    title: string;
    subtitle: string;
    icon: 'music' | 'picture' | 'sound';
    items: MediaItem[];
  }
> = {
  music: {
    title: 'Музыка',
    subtitle: 'Долгие треки для нижнего плеера',
    icon: 'music',
    items: [
      { id: 'music-folder', name: 'Папка', kind: 'folder' },
      { id: 'music-file-3', name: 'Музыка файл 3', kind: 'file' },
      { id: 'music-file-1', name: 'Музыка файл 1', kind: 'file' },
      { id: 'music-file-4', name: 'Музыка файл 4', kind: 'file' },
      { id: 'music-file-2', name: 'Музыка файл 2', kind: 'file' },
    ],
  },
  picture: {
    title: 'Картинки',
    subtitle: 'Картинки, превью и вложения',
    icon: 'picture',
    items: [
      { id: 'picture-folder', name: 'Папка', kind: 'folder' },
      { id: 'picture-file-2', name: 'Картинка файл 2', kind: 'file' },
      { id: 'picture-file-1', name: 'Картинка файл 1', kind: 'file' },
      { id: 'picture-file-4', name: 'Картинка файл 4', kind: 'file' },
      { id: 'picture-file-3', name: 'Картинка файл 3', kind: 'file' },
    ],
  },
  sound: {
    title: 'Звуки',
    subtitle: 'Короткие эффекты, не прерывают музыку',
    icon: 'sound',
    items: [
      { id: 'sound-folder', name: 'Папка', kind: 'folder' },
      { id: 'sound-file-4', name: 'Звук файл 4', kind: 'file' },
      { id: 'sound-file-1', name: 'Звук файл 1', kind: 'file' },
      { id: 'sound-file-3', name: 'Звук файл 3', kind: 'file' },
      { id: 'sound-file-2', name: 'Звук файл 2', kind: 'file' },
    ],
  },
};

export const musicTracks = [
  { id: 't1', title: 'Ancient Tavern Loop', duration: '03:42' },
  { id: 't2', title: 'Dungeon Ambient', duration: '05:18' },
  { id: 't3', title: 'Boss Encounter', duration: '04:06' },
];

export const soundEffects = [
  { id: 's1', title: 'Sword Slash', duration: '00:02' },
  { id: 's2', title: 'Coin Drop', duration: '00:01' },
  { id: 's3', title: 'Monster Roar', duration: '00:03' },
];
