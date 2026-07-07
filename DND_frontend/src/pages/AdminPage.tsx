import { useMemo, useRef, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { DocumentTreeSidebar } from '../components/admin/DocumentTreeSidebar';
import { DocumentWorkspace } from '../components/admin/DocumentWorkspace';
import { MediaLibraryPanel } from '../components/admin/MediaLibraryPanel';
import { MusicLibraryFooter } from '../components/admin/MusicLibraryFooter';
import {
  documentTree as initialDocumentTree,
  mediaLibraries,
  musicTracks,
  type FolderNode,
  type MediaItem,
  type MediaType,
  type TextFileNode,
} from '../data/library';
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

const createMediaState = () =>
  Object.fromEntries(
    Object.entries(mediaLibraries).map(([kind, library]) => [kind, [...library.items]]),
  ) as Record<MediaType, MediaItem[]>;

function labelForMediaType(kind: MediaType): string {
  if (kind === 'music') {
    return 'Музыка';
  }

  if (kind === 'picture') {
    return 'Картинка';
  }

  return 'Звук';
}

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
  const [mediaState, setMediaState] = useState<Record<MediaType, MediaItem[]>>(createMediaState);
  const dragStateRef = useRef<DragState>(null);
  const [selectedMusic, setSelectedMusic] = useState(musicTracks[0]);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const activeDocument =
    nodeHelper.findTextFileById(documentRoots, activeTab?.documentId ?? 'doc-1-text') ??
    nodeHelper.findFirstTextDocument(documentRoots) ??
    fallbackDocument;
  const activeItems = mediaState[selectedMediaType];

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

  const addMediaItem = () => {
    setMediaState((current) => {
      const next = [...current[selectedMediaType]];
      const newIndex = next.filter((item) => item.kind === 'file').length + 1;
      next.push({
        id: `${selectedMediaType}-${Date.now()}`,
        name: `${labelForMediaType(selectedMediaType)} файл ${newIndex}`,
        kind: 'file',
      });
      return { ...current, [selectedMediaType]: next };
    });
  };

  const deleteMediaItem = (itemId: string) => {
    setMediaState((current) => ({
      ...current,
      [selectedMediaType]: current[selectedMediaType].filter((item) => item.id !== itemId),
    }));
  };

  const moveMediaItem = (fromIndex: number, toIndex: number) => {
    setMediaState((current) => {
      const next = [...current[selectedMediaType]];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      return { ...current, [selectedMediaType]: next };
    });
  };

  const handleRootDrop = (rootId: string, insertIndex: number) => {
    const currentDrag = dragStateRef.current;
    if (currentDrag?.kind === 'document') {
      moveNodeToFolder(currentDrag.id, rootId, insertIndex);
      updateDragState(null);
    }
  };

  const handleMediaDropAt = (index: number) => {
    const dragged = dragStateRef.current;
    if (dragged?.kind !== 'media') {
      return;
    }

    const fromIndex = activeItems.findIndex((entry) => entry.id === dragged.id);
    if (fromIndex !== -1 && fromIndex !== index) {
      moveMediaItem(fromIndex, index);
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
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f3efe8] text-stone-800">
      <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">Adminka</div>

      <div className="flex flex-1 flex-col">
        <AppHeader isRoomScreen={false} onOpenAdmin={onOpenAdmin} onOpenRoom={onOpenRoom} />

        <main className="flex min-h-0 flex-1 w-full">
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
            selectedMediaType={selectedMediaType}
            viewMode={viewMode}
            activeItems={activeItems}
            onToggleViewMode={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            onAddMediaItem={addMediaItem}
            onSelectMediaType={setSelectedMediaType}
            onDeleteMediaItem={deleteMediaItem}
            onMediaDragStart={(itemId) => updateDragState({ kind: 'media', id: itemId })}
            onMediaDragEnd={() => updateDragState(null)}
            onMediaDropAt={handleMediaDropAt}
          />
        </main>

        <MusicLibraryFooter
          selectedMusic={selectedMusic}
          musicPlaying={musicPlaying}
          onToggleMusicPlaying={() => setMusicPlaying((value) => !value)}
          onSelectTrack={setSelectedMusic}
        />
      </div>
    </div>
  );
}
