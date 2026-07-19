import type { FolderNode, MediaItem, MediaType } from '../data/library';

const CONTENT_API_BASE_URL = import.meta.env.VITE_CONTENT_API_BASE_URL ?? '/api/content';

interface ApiErrorBody {
  detail?: string;
}

interface FolderOutDto {
  id: number;
  room_id: number;
  name: string;
  parent_folder_id: number | null;
}

interface DocumentOutDto {
  id: number;
  room_id: number;
  folder_id: number | null;
  title: string;
  content: string;
  is_secret: boolean;
  created_by: number;
  created_at: string;
}

interface MediaFileOutDto {
  id: number;
  room_id: number;
  type: 'image' | 'audio';
  url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  folder_id: number | null;
  tags: string[] | null;
  is_favorite: boolean;
  created_at: string;
}

const emptyMediaState = (): Record<MediaType, MediaItem[]> => ({
  picture: [],
  sound: [],
  music: [],
});

async function parseError(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === 'string' && body.detail.trim()) {
      message = body.detail;
    }
  } catch {
    // Intentionally ignored: fallback error message is used.
  }

  throw new Error(message);
}

async function request<TResponse>(
  path: string,
  init?: RequestInit,
  accessToken?: string | null,
): Promise<TResponse> {
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${CONTENT_API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    return parseError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

function toFileNameFromUrl(url: string | null, fallbackPrefix: string, id: number): string {
  if (!url) {
    return `${fallbackPrefix}-${id}`;
  }

  const pathname = url.split('?')[0];
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    return `${fallbackPrefix}-${id}`;
  }

  try {
    return decodeURIComponent(lastSegment);
  } catch {
    return lastSegment;
  }
}

function toMediaItem(media: MediaFileOutDto): MediaItem {
  return {
    id: `media-${media.id}`,
    name: toFileNameFromUrl(media.url, media.type, media.id),
    kind: 'file',
    fileUrl: media.url ?? undefined,
  };
}

function toDocumentNode(document: DocumentOutDto) {
  return {
    id: `document-${document.id}`,
    name: document.title,
    kind: 'document' as const,
    summary: document.content.slice(0, 120),
    content: document.content,
    links: [],
  };
}

function buildDocumentTree(
  folders: FolderOutDto[],
  documents: DocumentOutDto[],
): FolderNode[] {
  const foldersById = new Map<number, FolderNode>();
  const folderParentById = new Map<number, number | null>();

  folders.forEach((folder) => {
    foldersById.set(folder.id, {
      id: `folder-${folder.id}`,
      name: folder.name,
      kind: 'folder',
      children: [],
    });
    folderParentById.set(folder.id, folder.parent_folder_id);
  });

  documents.forEach((document) => {
    if (!document.folder_id) {
      return;
    }

    const parentFolder = foldersById.get(document.folder_id);
    if (!parentFolder) {
      return;
    }

    parentFolder.children.push(toDocumentNode(document));
  });

  const roots: FolderNode[] = [];

  folders.forEach((folder) => {
    const currentNode = foldersById.get(folder.id);
    if (!currentNode) {
      return;
    }

    const parentId = folderParentById.get(folder.id);
    if (parentId === null || parentId === undefined) {
      roots.push(currentNode);
      return;
    }

    const parentFolder = foldersById.get(parentId);
    if (parentFolder) {
      parentFolder.children.push(currentNode);
    } else {
      roots.push(currentNode);
    }
  });

  return roots;
}

async function listAllDocumentFolders(roomId: number, accessToken: string) {
  const pendingParents: Array<number | null> = [null];
  const visited = new Set<string>();
  const allFolders: FolderOutDto[] = [];

  while (pendingParents.length > 0) {
    const parentFolderId = pendingParents.shift() ?? null;
    const parentKey = parentFolderId === null ? 'root' : String(parentFolderId);
    if (visited.has(parentKey)) {
      continue;
    }
    visited.add(parentKey);

    const search = new URLSearchParams();
    if (parentFolderId !== null) {
      search.set('parent_folder_id', String(parentFolderId));
    }

    const folders = await request<FolderOutDto[]>(
      `/rooms/${roomId}/document-folders${search.size > 0 ? `?${search.toString()}` : ''}`,
      undefined,
      accessToken,
    );

    allFolders.push(...folders);
    folders.forEach((folder) => {
      pendingParents.push(folder.id);
    });
  }

  return allFolders;
}

export const contentService = {
  async getAdminDocumentTree(roomId: number, accessToken: string): Promise<FolderNode[]> {
    const folders = await listAllDocumentFolders(roomId, accessToken);
    const documentsByFolder = await Promise.all(
      folders.map(async (folder) => {
        const folderDocuments = await request<DocumentOutDto[]>(
          `/document-folders/${folder.id}/documents`,
          undefined,
          accessToken,
        );

        const detailedDocuments = await Promise.all(
          folderDocuments.map((document) =>
            request<DocumentOutDto>(`/documents/${document.id}`, undefined, accessToken),
          ),
        );

        return detailedDocuments;
      }),
    );

    return buildDocumentTree(folders, documentsByFolder.flat());
  },

  createDocumentFolder(roomId: number, name: string, accessToken: string, parentFolderId?: number | null) {
    return request<FolderOutDto>(
      `/rooms/${roomId}/document-folders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          parent_folder_id: parentFolderId ?? null,
        }),
      },
      accessToken,
    );
  },

  updateDocumentFolder(roomId: number, folderId: number, payload: { name?: string; parent_folder_id?: number | null }, accessToken: string) {
    return request<FolderOutDto>(
      `/rooms/${roomId}/document-folders/${folderId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      accessToken,
    );
  },

  deleteDocumentFolder(roomId: number, folderId: number, accessToken: string) {
    return request<void>(
      `/rooms/${roomId}/document-folders/${folderId}`,
      {
        method: 'DELETE',
      },
      accessToken,
    );
  },

  createDocument(folderId: number, title: string, content: string, accessToken: string) {
    return request<DocumentOutDto>(
      `/document-folders/${folderId}/documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      },
      accessToken,
    );
  },

  updateDocument(documentId: number, payload: { title?: string; content?: string }, accessToken: string) {
    return request<DocumentOutDto>(
      `/documents/${documentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      accessToken,
    );
  },

  deleteDocument(documentId: number, accessToken: string) {
    return request<void>(
      `/documents/${documentId}`,
      {
        method: 'DELETE',
      },
      accessToken,
    );
  },

  async getAdminMediaLibrary(roomId: number, accessToken: string): Promise<{ mediaState: Record<MediaType, MediaItem[]>; defaultFolderId: number }> {
    const mediaFolders = await request<FolderOutDto[]>(
      `/rooms/${roomId}/media-folders`,
      undefined,
      accessToken,
    );

    let defaultFolderId = mediaFolders[0]?.id;
    if (!defaultFolderId) {
      const createdFolder = await request<FolderOutDto>(
        `/rooms/${roomId}/media-folders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Основная медиапапка',
          }),
        },
        accessToken,
      );
      defaultFolderId = createdFolder.id;
    }

    const [images, audio] = await Promise.all([
      request<MediaFileOutDto[]>(
        `/rooms/${roomId}/media/images`,
        undefined,
        accessToken,
      ),
      request<MediaFileOutDto[]>(
        `/rooms/${roomId}/media/audio`,
        undefined,
        accessToken,
      ),
    ]);

    return {
      mediaState: {
        picture: images.map(toMediaItem),
        sound: [],
        music: audio.map(toMediaItem),
      },
      defaultFolderId,
    };
  },

  uploadMediaFile(roomId: number, folderId: number, mediaType: MediaType, file: File, accessToken: string) {
    const body = new FormData();
    body.set('folder_id', String(folderId));
    body.set('file', file);

    const isImage = mediaType === 'picture';
    return request<MediaFileOutDto>(
      isImage ? `/rooms/${roomId}/media/images` : `/rooms/${roomId}/media/audio`,
      {
        method: 'POST',
        body,
      },
      accessToken,
    ).then(toMediaItem);
  },

  deleteMediaFile(mediaType: MediaType, mediaId: number, accessToken: string) {
    const isImage = mediaType === 'picture';
    return request<void>(
      isImage ? `/media/images/${mediaId}` : `/media/audio/${mediaId}`,
      {
        method: 'DELETE',
      },
      accessToken,
    );
  },

  createEmptyMediaState: emptyMediaState,
};
