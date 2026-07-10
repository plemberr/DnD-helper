import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '../lib/reactZustandQuery';
import { Box } from '@mui/material';
import { AppHeader } from '../components/AppHeader';
import { DocumentTreeSidebar } from '../components/admin/DocumentTreeSidebar';
import { DocumentWorkspace } from '../components/admin/DocumentWorkspace';
import { MediaLibraryPanel } from '../components/admin/MediaLibraryPanel';
import { MusicLibraryFooter } from '../components/admin/MusicLibraryFooter';
import { Api } from '../api/Api';
import {
  documentTree as initialDocumentTree,
  musicTracks,
  type FolderNode,
  type MediaItem,
  type MediaType,
  type TextFileNode,
} from '../data/library';
import { useMediaLibraryStore } from '../store/mediaLibraryStore';
import { nodeHelper } from '../utils/nodeHelper';

type AdminPageProps = {
  onOpenAdmin: () => void;
  onOpenRoom: () => void;
};

type TabState = {
  id: string;
  title: string;
  documentId: string;
};

type DragKind = 'folder' | 'document' | 'media';

type DragState =
  | {
      kind: DragKind;
      id: string;
      sourceFolderId?: string;
      mediaType?: MediaType;
    }
  | null;

const fallbackDocument: TextFileNode = {
  id: 'fallback-document',
  name: 'Пустой документ',
  kind: 'document',
  summary: '',
  content: '',
  links: [],
};

export function AdminPage({ onOpenAdmin, onOpenRoom }: AdminPageProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [documentRoots, setDocumentRoots] = useState<FolderNode[]>(() => nodeHelper.cloneTree(initialDocumentTree));
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(
    Object.fromEntries(initialDocumentTree.map((node) => [node.id, true])),
  );
  const [tabs, setTabs] = useState<TabState[]>([
    { id: 'tab-1', title: 'Вкладка 1', documentId: 'doc-1-text' },
    { id: 'tab-2', title: 'Вкладка 2', documentId: 'doc-2-text' },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>('music');
  const dragStateRef = useRef<DragState>(null);
  const [selectedMusic, setSelectedMusic] = useState(musicTracks[0]);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const mediaState = useMediaLibraryStore((state) => state.mediaState);
  const uploadingByType = useMediaLibraryStore((state) => state.uploadingByType);
  const setMediaState = useMediaLibraryStore((state) => state.setMediaState);
  const addMediaItem = useMediaLibraryStore((state) => state.addMediaItem);
  const deleteMediaItem = useMediaLibraryStore((state) => state.deleteMediaItem);
  const moveMediaItem = useMediaLibraryStore((state) => state.moveMediaItem);
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
    },
  });

  useEffect(() => {
    if (mediaLibraryQuery.data) {
      setMediaState(mediaLibraryQuery.data);
    }
  }, [mediaLibraryQuery.data, setMediaState]);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const activeDocument =
    nodeHelper.findTextFileById(documentRoots, activeTab?.documentId ?? 'doc-1-text') ??
    nodeHelper.findFirstTextDocument(documentRoots) ??
    fallbackDocument;
  const breadcrumbs = useMemo(() => ['Корень', 'Кампания', activeDocument.name], [activeDocument]);

  const updateDragState = (nextDragState: DragState) => {
    dragStateRef.current = nextDragState;
  };

  const updateActiveTabDocument = (documentId: string) => {
    setTabs((current) => current.map((tab) => (tab.id === activeTabId ? { ...tab, documentId } : tab)));
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((current) => ({
      ...current,
      [folderId]: !current[folderId],
    }));
  };

  const createDocumentInFolder = (folderId: string) => {
    const documentId = `doc-${Date.now()}`;
    const nextDocument: TextFileNode = {
      id: documentId,
      name: `Текст док ${documentId.slice(-4)}`,
      kind: 'document',
      summary: 'Новый текстовый документ',
      content: 'Новый текстовый документ',
      links: [],
    };

    setDocumentRoots((current) => nodeHelper.insertNodeIntoFolder(current, folderId, nextDocument));
    updateActiveTabDocument(documentId);
  };

  const createFolder = () => {
    const folderId = `folder-${Date.now()}`;
    const nextFolder: FolderNode = {
      id: folderId,
      name: `Новая папка ${folderId.slice(-4)}`,
      kind: 'folder',
      children: [],
    };

    setDocumentRoots((current) => [...current, nextFolder]);
    setExpandedFolders((current) => ({ ...current, [folderId]: true }));
  };

  const deleteNode = (nodeId: string) => {
    const { tree: nextTree, removed } = nodeHelper.removeNodeById(documentRoots, nodeId);
    if (!removed) {
      return;
    }

    setDocumentRoots(nextTree);
    setTabs((currentTabs) => {
      if (!currentTabs.some((tab) => tab.documentId === nodeId)) {
        return currentTabs;
      }

      const fallback = nodeHelper.findFirstTextDocument(nextTree) ?? fallbackDocument;
      return currentTabs.map((tab) => (tab.documentId === nodeId ? { ...tab, documentId: fallback.id } : tab));
    });
  };

  const updateTextContent = (documentId: string, content: string) => {
    setDocumentRoots((current) => {
      const documentNode = nodeHelper.findTextFileById(current, documentId);
      if (!documentNode) {
        return current;
      }

      const nextDocument: TextFileNode = {
        ...documentNode,
        content,
      };

      return nodeHelper.replaceTextDocument(current, documentId, nextDocument);
    });
  };

  const openNewTab = () => {
    const nextIndex = tabs.length + 1;
    const newTabId = `tab-${Date.now()}`;
    setTabs((current) => [
      ...current,
      {
        id: newTabId,
        title: `Вкладка ${nextIndex}`,
        documentId: activeTab?.documentId ?? activeDocument.id,
      },
    ]);
    setActiveTabId(newTabId);
  };

  const closeTab = (tabId: string) => {
    setTabs((current) => {
      if (current.length === 1) {
        return current;
      }

      const currentIndex = current.findIndex((tab) => tab.id === tabId);
      const nextTabs = current.filter((tab) => tab.id !== tabId);
      const fallbackTab = nextTabs[currentIndex] ?? nextTabs[currentIndex - 1] ?? nextTabs[0];

      setActiveTabId((activeCurrent) => (activeCurrent === tabId ? fallbackTab.id : activeCurrent));

      return nextTabs;
    });
  };

  const handleUploadMediaItem = async (mediaType: MediaType, file: File) => {
    setUploadingState(mediaType, true);
    try {
      await uploadMediaMutation.mutate({ mediaType, file });
    } finally {
      setUploadingState(mediaType, false);
    }
  };

  const handleRootDrop = (rootId: string, insertIndex: number) => {
    const currentDrag = dragStateRef.current;
    if (currentDrag?.kind === 'document') {
      moveNodeToFolder(currentDrag.id, rootId, insertIndex);
      updateDragState(null);
    }
  };

  const handleMediaDropAt = (mediaType: MediaType, index: number) => {
    const dragged = dragStateRef.current;
    if (dragged?.kind !== 'media' || dragged.mediaType !== mediaType) {
      return;
    }

    const fromIndex = mediaState[mediaType].findIndex((entry) => entry.id === dragged.id);
    if (fromIndex !== -1 && fromIndex !== index) {
      moveMediaItem(mediaType, fromIndex, index);
    }
    updateDragState(null);
  };

  const getTabDocument = (documentId: string): TextFileNode => nodeHelper.findTextFileById(documentRoots, documentId) ?? activeDocument;

  const moveNodeToFolder = (nodeId: string, folderId: string, insertIndex: number | null = null) => {
    setDocumentRoots((current) => {
      const sourceNode = nodeHelper.findNodeById(current, nodeId);
      const targetFolder = nodeHelper.findNodeById(current, folderId);

      if (!sourceNode || !targetFolder || targetFolder.kind !== 'folder') {
        return current;
      }

      if (sourceNode.kind === 'folder' && nodeHelper.containsNode(sourceNode, folderId)) {
        return current;
      }

      const extracted = nodeHelper.removeNodeById(current, nodeId);
      if (!extracted.removed) {
        return current;
      }

      let adjustedIndex = insertIndex;
      const sourceParent = nodeHelper.findDirectParentFolder(current, nodeId);
      if (sourceParent?.id === folderId && adjustedIndex !== null) {
        const sourceIndex = sourceParent.children.findIndex((child) => child.id === nodeId);
        if (sourceIndex !== -1 && sourceIndex < adjustedIndex) {
          adjustedIndex -= 1;
        }
      }

      return nodeHelper.insertNodeIntoFolder(extracted.tree, folderId, extracted.removed, adjustedIndex);
    });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', flexDirection: 'column', overflowX: 'hidden', bgcolor: 'grey.100', color: 'text.primary' }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <AppHeader isRoomScreen={false} onOpenAdmin={onOpenAdmin} onOpenRoom={onOpenRoom} />

        <Box component="main" sx={{ display: 'flex', minHeight: 0, flex: 1, width: '100%' }}>
          <DocumentTreeSidebar
            documentRoots={documentRoots}
            expandedFolders={expandedFolders}
            activeDocumentId={activeDocument.id}
            selectedMediaType={selectedMediaType}
            onCreateFolder={createFolder}
            onToggleFolder={toggleFolder}
            onCreateDocumentInFolder={createDocumentInFolder}
            onDeleteNode={deleteNode}
            onSelectDocument={updateActiveTabDocument}
            onSelectMediaType={setSelectedMediaType}
            onMoveNodeToFolder={moveNodeToFolder}
            getDragState={() => dragStateRef.current}
            onSetDragState={updateDragState}
            onRootDrop={handleRootDrop}
          />

          <DocumentWorkspace
            tabs={tabs}
            activeTabId={activeTabId}
            activeDocument={activeDocument}
            breadcrumbs={breadcrumbs}
            getTabDocument={getTabDocument}
            onSetActiveTabId={setActiveTabId}
            onCloseTab={closeTab}
            onOpenNewTab={openNewTab}
            onUpdateTextContent={updateTextContent}
          />

          <MediaLibraryPanel
            mediaState={mediaState}
            uploadingByType={uploadingByType}
            viewMode={viewMode}
            onToggleViewMode={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            onUploadMediaItem={handleUploadMediaItem}
            onDeleteMediaItem={deleteMediaItem}
            onMediaDragStart={(mediaType, itemId) => updateDragState({ kind: 'media', id: itemId, mediaType })}
            onMediaDragEnd={() => updateDragState(null)}
            onMediaDropAt={handleMediaDropAt}
          />
        </Box>

        <MusicLibraryFooter
          selectedMusic={selectedMusic}
          musicPlaying={musicPlaying}
          onToggleMusicPlaying={() => setMusicPlaying((value) => !value)}
          onSelectTrack={setSelectedMusic}
        />
      </Box>
    </Box>
  );
}
