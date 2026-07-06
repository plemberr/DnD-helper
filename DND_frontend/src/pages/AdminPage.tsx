import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
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
  type TreeNode,
} from '../data/library';

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

const cloneTree = (tree: FolderNode[]): FolderNode[] =>
  tree.map((node) => ({
    ...node,
    children: node.children.map(cloneNode),
  }));

const cloneNode = (node: TreeNode): TreeNode =>
  node.kind === 'folder'
    ? {
        ...node,
        children: node.children.map(cloneNode),
      }
    : { ...node };

const findNodeById = (tree: FolderNode[], nodeId: string): TreeNode | null => {
  for (const node of tree) {
    if (node.id === nodeId) {
      return node;
    }

    const found = findNodeInChildren(node.children, nodeId);
    if (found) {
      return found;
    }
  }

  return null;
};

const findNodeInChildren = (children: TreeNode[], nodeId: string): TreeNode | null => {
  for (const child of children) {
    if (child.id === nodeId) {
      return child;
    }

    if (child.kind === 'folder') {
      const found = findNodeInChildren(child.children, nodeId);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

const findTextFileById = (tree: FolderNode[], documentId: string): TextFileNode | null => {
  const node = findNodeById(tree, documentId);
  return node && node.kind === 'document' ? node : null;
};

const findFirstTextDocument = (tree: FolderNode[]): TextFileNode | null => {
  for (const folder of tree) {
    const found = findFirstTextDocumentInChildren(folder.children);
    if (found) {
      return found;
    }
  }

  return null;
};

const findFirstTextDocumentInChildren = (children: TreeNode[]): TextFileNode | null => {
  for (const child of children) {
    if (child.kind === 'document') {
      return child;
    }

    if (child.kind === 'folder') {
      const found = findFirstTextDocumentInChildren(child.children);
      if (found) {
        return found;
      }
    }
  }

  return null;
};

const containsNode = (folder: FolderNode, searchId: string): boolean =>
  folder.id === searchId || folder.children.some((child) => child.kind === 'folder' && containsNode(child, searchId));

const findDirectParentFolder = (tree: FolderNode[], nodeId: string): FolderNode | null => {
  for (const folder of tree) {
    if (folder.children.some((child) => child.id === nodeId)) {
      return folder;
    }

    for (const child of folder.children) {
      if (child.kind === 'folder') {
        const nested = findDirectParentFolder([child], nodeId);
        if (nested) {
          return nested;
        }
      }
    }
  }

  return null;
};

const removeNodeById = (tree: FolderNode[], nodeId: string): { tree: FolderNode[]; removed: TreeNode | null } => {
  const isRootFolder = tree.some((folder) => folder.id === nodeId);
  let removed: TreeNode | null = null;

  const nextTree = tree.map((folder) => {
    if (folder.id === nodeId) {
      removed = folder;
      return folder;
    }

    const updatedChildren = removeNodeFromChildren(folder.children, nodeId);
    if (updatedChildren.removed) {
      removed = updatedChildren.removed;
    }

    return {
      ...folder,
      children: updatedChildren.children,
    };
  });

  if (isRootFolder) {
    return { tree: nextTree.filter((folder) => folder.id !== nodeId), removed };
  }

  return { tree: nextTree, removed };
};

const removeNodeFromChildren = (
  children: TreeNode[],
  nodeId: string,
): { children: TreeNode[]; removed: TreeNode | null } => {
  let removed: TreeNode | null = null;
  const nextChildren: TreeNode[] = [];

  for (const child of children) {
    if (child.id === nodeId) {
      removed = child;
      continue;
    }

    if (child.kind === 'folder') {
      const nested = removeNodeFromChildren(child.children, nodeId);
      if (nested.removed) {
        removed = nested.removed;
      }
      nextChildren.push({
        ...child,
        children: nested.children,
      });
      continue;
    }

    nextChildren.push(child);
  }

  return { children: nextChildren, removed };
};

const insertNodeIntoFolder = (
  tree: FolderNode[],
  folderId: string,
  nodeToInsert: TreeNode,
  insertIndex: number | null = null,
): FolderNode[] =>
  tree.map((folder) => {
    if (folder.id === folderId) {
      const nextChildren = [...folder.children];
      const index = insertIndex === null ? nextChildren.length : Math.max(0, Math.min(insertIndex, nextChildren.length));
      nextChildren.splice(index, 0, nodeToInsert);
      return { ...folder, children: nextChildren };
    }

    return {
      ...folder,
      children: insertNodeIntoChildren(folder.children, folderId, nodeToInsert, insertIndex),
    };
  });

const insertNodeIntoChildren = (
  children: TreeNode[],
  folderId: string,
  nodeToInsert: TreeNode,
  insertIndex: number | null,
): TreeNode[] =>
  children.map((child) => {
    if (child.kind === 'folder') {
      if (child.id === folderId) {
        const nextChildren = [...child.children];
        const index = insertIndex === null ? nextChildren.length : Math.max(0, Math.min(insertIndex, nextChildren.length));
        nextChildren.splice(index, 0, nodeToInsert);
        return { ...child, children: nextChildren };
      }

      return {
        ...child,
        children: insertNodeIntoChildren(child.children, folderId, nodeToInsert, insertIndex),
      };
    }

    return child;
  });

const replaceTextDocument = (tree: FolderNode[], documentId: string, nextDocument: TextFileNode): FolderNode[] =>
  tree.map((folder) => ({
    ...folder,
    children: replaceTextDocumentInChildren(folder.children, documentId, nextDocument),
  }));

const replaceTextDocumentInChildren = (children: TreeNode[], documentId: string, nextDocument: TextFileNode): TreeNode[] =>
  children.map((child) => {
    if (child.id === documentId && child.kind === 'document') {
      return nextDocument;
    }

    if (child.kind === 'folder') {
      return {
        ...child,
        children: replaceTextDocumentInChildren(child.children, documentId, nextDocument),
      };
    }

    return child;
  });

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
  const [documentRoots, setDocumentRoots] = useState<FolderNode[]>(() => cloneTree(initialDocumentTree));
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
    findTextFileById(documentRoots, activeTab?.documentId ?? 'doc-1-text') ?? findFirstTextDocument(documentRoots) ?? fallbackDocument;
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

    setDocumentRoots((current) => insertNodeIntoFolder(current, folderId, nextDocument));
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
    const { tree: nextTree, removed } = removeNodeById(documentRoots, nodeId);
    if (!removed) {
      return;
    }

    setDocumentRoots(nextTree);
    setTabs((currentTabs) => {
      if (!currentTabs.some((tab) => tab.documentId === nodeId)) {
        return currentTabs;
      }

      const fallback = findFirstTextDocument(nextTree) ?? fallbackDocument;
      return currentTabs.map((tab) => (tab.documentId === nodeId ? { ...tab, documentId: fallback.id } : tab));
    });
  };

  const updateTextContent = (documentId: string, content: string) => {
    setDocumentRoots((current) => {
      const documentNode = findTextFileById(current, documentId);
      if (!documentNode) {
        return current;
      }

      const nextDocument: TextFileNode = {
        ...documentNode,
        content,
      };

      return replaceTextDocument(current, documentId, nextDocument);
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

  const getTabDocument = (documentId: string): TextFileNode => findTextFileById(documentRoots, documentId) ?? activeDocument;

  const renderSidebarNodes = (nodes: TreeNode[], parentFolderId: string) =>
    nodes.map((child, childIndex) => {
      const isSelectedDocument = child.kind === 'document' && child.id === activeDocument.id;
      const isSelectedMedia = child.kind !== 'folder' && child.kind === selectedMediaType;
      const isSelected = isSelectedDocument || isSelectedMedia;
      const isNestedFolderExpanded = child.kind === 'folder' && expandedFolders[child.id];

      return (
        <div key={child.id} className="space-y-0.5">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const currentDrag = dragStateRef.current;
              if (!currentDrag || currentDrag.id === child.id) {
                return;
              }

              if (child.kind === 'folder') {
                moveNodeToFolder(currentDrag.id, child.id, null);
              } else {
                moveNodeToFolder(currentDrag.id, parentFolderId, childIndex);
              }
              updateDragState(null);
            }}
            className={`flex w-full items-center gap-1 rounded px-1.5 py-1 text-left transition hover:bg-stone-100 ${
              isSelected ? 'bg-amber-50 font-medium text-amber-900' : ''
            }`}
          >
            {child.kind === 'folder' ? (
              <>
                <button
                  type="button"
                  onClick={() => toggleFolder(child.id)}
                  className="flex shrink-0 items-center text-stone-500"
                >
                  {isNestedFolderExpanded ? (
                    <ExpandMoreIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowRightIcon fontSize="small" />
                  )}
                </button>
                <FolderOutlinedIcon fontSize="small" className="shrink-0 text-stone-500" />
              </>
            ) : child.kind === 'document' ? (
              <DescriptionOutlinedIcon fontSize="small" className="shrink-0 text-stone-500" />
            ) : child.kind === 'music' ? (
              <MusicNoteIcon fontSize="small" className="shrink-0 text-stone-500" />
            ) : child.kind === 'picture' ? (
              <ImageOutlinedIcon fontSize="small" className="shrink-0 text-stone-500" />
            ) : (
              <GraphicEqOutlinedIcon fontSize="small" className="shrink-0 text-stone-500" />
            )}

            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-1 text-left"
              onClick={() => {
                if (child.kind === 'document') {
                  updateActiveTabDocument(child.id);
                } else if (child.kind === 'music' || child.kind === 'picture' || child.kind === 'sound') {
                  setSelectedMediaType(child.kind);
                } else {
                  toggleFolder(child.id);
                }
              }}
            >
              <span className="truncate">{child.name}</span>
            </button>

            {child.kind === 'folder' && (
              <>
                <button
                  type="button"
                  className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    createDocumentInFolder(child.id);
                  }}
                  aria-label={`Добавить файл в ${child.name}`}
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                </button>
                <button
                  type="button"
                  className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteNode(child.id);
                  }}
                  aria-label={`Удалить папку ${child.name}`}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </button>
              </>
            )}

            {child.kind === 'document' && (
              <>
                <button
                  type="button"
                  className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    deleteNode(child.id);
                  }}
                  aria-label={`Удалить ${child.name}`}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </button>
                <span
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    updateDragState({
                      kind: 'document',
                      id: child.id,
                      sourceFolderId: parentFolderId,
                    });
                  }}
                  onDragEnd={() => updateDragState(null)}
                  className="cursor-grab text-stone-400"
                >
                  <DragIndicatorIcon sx={{ fontSize: 14 }} />
                </span>
              </>
            )}
          </div>

          {isNestedFolderExpanded && child.kind === 'folder' && (
            <div className="ml-4 space-y-0.5 border-l border-stone-200 pl-2">{renderSidebarNodes(child.children, child.id)}</div>
          )}
        </div>
      );
    });

  const moveNodeToFolder = (nodeId: string, folderId: string, insertIndex: number | null = null) => {
    setDocumentRoots((current) => {
      const sourceNode = findNodeById(current, nodeId);
      const targetFolder = findNodeById(current, folderId);

      if (!sourceNode || !targetFolder || targetFolder.kind !== 'folder') {
        return current;
      }

      if (sourceNode.kind === 'folder' && containsNode(sourceNode, folderId)) {
        return current;
      }

      const extracted = removeNodeById(current, nodeId);
      if (!extracted.removed) {
        return current;
      }

      let adjustedIndex = insertIndex;
      const sourceParent = findDirectParentFolder(current, nodeId);
      if (sourceParent?.id === folderId && adjustedIndex !== null) {
        const sourceIndex = sourceParent.children.findIndex((child) => child.id === nodeId);
        if (sourceIndex !== -1 && sourceIndex < adjustedIndex) {
          adjustedIndex -= 1;
        }
      }

      return insertNodeIntoFolder(extracted.tree, folderId, extracted.removed, adjustedIndex);
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
            onCreateFolder={createFolder}
            onToggleFolder={toggleFolder}
            onCreateDocumentInFolder={createDocumentInFolder}
            onDeleteNode={deleteNode}
            onRootDrop={handleRootDrop}
            renderSidebarNodes={renderSidebarNodes}
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
