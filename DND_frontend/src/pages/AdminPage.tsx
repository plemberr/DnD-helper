import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { useMemo, useRef, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import {
  documentTree as initialDocumentTree,
  mediaLibraries,
  musicTracks,
  soundEffects,
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
  const activeLibrary = mediaLibraries[selectedMediaType];
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
          <aside className="w-[220px] shrink-0 border-r border-[#e2ddd4] bg-stone-50">
            <div className="flex items-center justify-between border-b border-[#e2ddd4] px-3 py-2.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-stone-400">Папки</span>
              <button
                type="button"
                className="rounded-full p-1 text-stone-500 transition hover:bg-amber-100 hover:text-amber-700"
                onClick={createFolder}
                aria-label="Создать папку"
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            <div className="space-y-1 p-1.5 text-[13px] leading-tight">
              {documentRoots.map((rootNode) => {
                const isExpanded = expandedFolders[rootNode.id];
                const isActiveRoot = activeDocument.id.startsWith(rootNode.id);

                return (
                  <div
                    key={rootNode.id}
                    className="space-y-0.5"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const currentDrag = dragStateRef.current;
                      if (currentDrag?.kind === 'document') {
                        moveNodeToFolder(currentDrag.id, rootNode.id, rootNode.children.length);
                        updateDragState(null);
                      }
                    }}
                  >
                    <div
                      className={`flex items-center gap-1 rounded px-1.5 py-1 text-left ${
                        isActiveRoot ? 'bg-amber-50 font-medium text-amber-900' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleFolder(rootNode.id)}
                        className="flex flex-1 items-center gap-1 text-left transition hover:bg-stone-100"
                      >
                        {isExpanded ? (
                          <ExpandMoreIcon fontSize="small" className="text-stone-500" />
                        ) : (
                          <KeyboardArrowRightIcon fontSize="small" className="text-stone-500" />
                        )}
                        <span className="truncate">{rootNode.name}</span>
                      </button>
                      <button
                        type="button"
                        className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                        onClick={() => createDocumentInFolder(rootNode.id)}
                        aria-label={`Добавить документ в ${rootNode.name}`}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </button>
                      <button
                        type="button"
                        className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteNode(rootNode.id);
                        }}
                        aria-label={`Удалить папку ${rootNode.name}`}
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                      </button>
                    </div>

                    {isExpanded && <div className="ml-4 space-y-0.5 border-l border-stone-200 pl-2">{renderSidebarNodes(rootNode.children, rootNode.id)}</div>}
                  </div>
                );
              })}
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col border-r border-[#e2ddd4] bg-white">
            <div className="flex h-10 items-stretch gap-1 border-b border-[#e2ddd4] bg-stone-100 px-2 pt-2 text-[13px]">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                const tabDocument = findTextFileById(documentRoots, tab.documentId) ?? activeDocument;

                return (
                  <div
                    key={tab.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveTabId(tab.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setActiveTabId(tab.id);
                      }
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded-t-md border border-b-0 px-4 transition ${
                      isActive
                        ? 'border-[#e2ddd4] bg-white font-medium text-stone-900 shadow-[0_-1px_0_theme(colors.amber.500)_inset]'
                        : 'border-transparent text-stone-500 hover:bg-white/60'
                    }`}
                  >
                    <span className="truncate">
                      {tab.title}: {tabDocument.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Закрыть ${tab.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="ml-1 rounded-full p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </button>
                  </div>
                );
              })}
              <button
                className="mb-0 rounded-t-md px-3 text-stone-400 transition hover:bg-white/60 hover:text-amber-700"
                onClick={openNewTab}
                aria-label="Добавить вкладку"
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center px-6 py-8 text-center">
              <div className="mb-5 flex items-center gap-1.5 self-start font-mono text-[11px] uppercase tracking-wide text-stone-500">
                <FolderOutlinedIcon fontSize="small" />
                {breadcrumbs.map((crumb, index) => (
                  <span key={crumb} className="flex items-center gap-1.5">
                    <span className="rounded-full border border-stone-300 bg-white px-2.5 py-0.5 normal-case tracking-normal text-stone-600">
                      {crumb}
                    </span>
                    {index < breadcrumbs.length - 1 && <span className="text-stone-300">/</span>}
                  </span>
                ))}
              </div>

              <div className="mt-8 max-w-[520px]">
                <div className="font-serif text-[36px] font-semibold leading-tight text-stone-900">Txt Doc</div>
                <div className="mt-1 font-serif text-[20px] italic leading-tight text-stone-500">Аналог Obsidian</div>
                <p className="mx-auto mt-4 max-w-[420px] text-[15px] leading-6 text-stone-600">
                  В себе хранит текст, ссылки на файлы и связи между документами комнаты.
                </p>

                <div className="mx-auto mt-12 w-[360px] rounded-lg border border-stone-200 bg-white p-4 text-left shadow-lg shadow-stone-200/60">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="text-[14px] font-medium text-stone-800">{activeDocument.name}</div>
                    <DescriptionOutlinedIcon sx={{ fontSize: 16 }} className="text-amber-600" />
                  </div>
                  <div className="mt-2 text-[12px] text-stone-500">{activeDocument.summary}</div>
                  <textarea
                    className="mt-3 min-h-[180px] w-full rounded-md border border-stone-200 bg-stone-50 p-3 text-[14px] leading-6 text-stone-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                    value={activeDocument.content}
                    onChange={(event) => updateTextContent(activeDocument.id, event.target.value)}
                  />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {activeDocument.links?.map((link) => (
                      <span
                        key={link}
                        className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-mono text-[11px] text-amber-800"
                      >
                        <DescriptionOutlinedIcon sx={{ fontSize: 13 }} />
                        {link}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex w-[340px] shrink-0 flex-col border-l border-[#e2ddd4] bg-stone-50">
            <div className="flex h-12 items-center border-b border-[#e2ddd4] bg-white px-3">
              <div className="flex-1 text-center font-serif text-[17px] font-medium text-stone-900">{activeLibrary.title}</div>
              <button
                className="rounded-full p-1.5 text-stone-500 transition hover:bg-amber-50 hover:text-amber-700"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <ViewListOutlinedIcon fontSize="small" /> : <GridViewOutlinedIcon fontSize="small" />}
              </button>
              <button className="rounded-full p-1.5 text-stone-500 transition hover:bg-amber-50 hover:text-amber-700" onClick={addMediaItem}>
                <AddIcon fontSize="small" />
              </button>
            </div>

            <div className="border-b border-[#e2ddd4] px-3 py-3">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-wider text-stone-400">Фильтр по типу файлов</div>
              <div className="flex flex-wrap gap-2">
                {(['music', 'picture', 'sound'] as MediaType[]).map((kind) => {
                  const isActive = selectedMediaType === kind;
                  return (
                    <button
                      key={kind}
                      onClick={() => setSelectedMediaType(kind)}
                      className={`rounded-full px-3 py-1 text-[13px] transition ${
                        isActive ? 'bg-amber-600 text-white shadow-sm' : 'bg-white text-stone-600 ring-1 ring-inset ring-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {mediaLibraries[kind].title}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="p-3">
                <div className="flex items-center">
                  <div className="font-serif text-[16px] font-medium text-stone-900">{activeLibrary.title}</div>
                  <div className="ml-auto flex items-center gap-1 text-amber-700">
                    {selectedMediaType === 'music' && <MusicNoteIcon fontSize="small" />}
                    {selectedMediaType === 'picture' && <ImageOutlinedIcon fontSize="small" />}
                    {selectedMediaType === 'sound' && <GraphicEqOutlinedIcon fontSize="small" />}
                    <button className="rounded-full p-1 text-stone-500 hover:bg-amber-50 hover:text-amber-700" onClick={addMediaItem}>
                      <AddIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-stone-400">Хлебные крошки вложения</div>
                {viewMode === 'list' ? (
                  <div className="mt-2 space-y-1.5">
                    {activeItems.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() =>
                          updateDragState({
                            kind: 'media',
                            id: item.id,
                          })
                        }
                        onDragEnd={() => updateDragState(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          const fromIndex = activeItems.findIndex((entry) => entry.id === dragStateRef.current?.id);
                          if (fromIndex !== -1 && fromIndex !== index) {
                            moveMediaItem(fromIndex, index);
                          }
                          updateDragState(null);
                        }}
                        className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-[13px] text-stone-700 shadow-sm transition hover:border-amber-300"
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16 }} className="cursor-grab text-stone-300" />
                        <span className="flex-1 truncate">{item.name}</span>
                        <button
                          className="rounded-full p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                          onClick={() => deleteMediaItem(item.id)}
                          aria-label="Удалить"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {activeItems.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() =>
                          updateDragState({
                            kind: 'media',
                            id: item.id,
                          })
                        }
                        onDragEnd={() => updateDragState(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          const fromIndex = activeItems.findIndex((entry) => entry.id === dragStateRef.current?.id);
                          if (fromIndex !== -1 && fromIndex !== index) {
                            moveMediaItem(fromIndex, index);
                          }
                          updateDragState(null);
                        }}
                        className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-[13px] text-stone-700 shadow-sm transition hover:border-amber-300"
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16 }} className="cursor-grab text-stone-300" />
                        <span className="flex-1 truncate">{item.name}</span>
                        <button
                          className="rounded-full p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                          onClick={() => deleteMediaItem(item.id)}
                          aria-label="Удалить"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-[12px] italic text-stone-400">{activeLibrary.subtitle}</div>
              </div>
            </div>
          </aside>
        </main>

        <footer className="flex h-[68px] items-center gap-4 border-t border-[#e2ddd4] bg-white px-5">
          <span className="w-[60px] font-mono text-[10px] uppercase tracking-wider text-stone-400">Music</span>
          <button
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm transition hover:bg-amber-700"
            onClick={() => setMusicPlaying((value) => !value)}
          >
            {musicPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate font-serif text-[13px] text-stone-800">{selectedMusic.title}</div>
            <input className="mt-2 h-1.5 w-full accent-amber-600" type="range" defaultValue={42} />
          </div>
          <div className="font-mono text-[12px] text-stone-400">{selectedMusic.duration}</div>
        </footer>

        <div className="w-full border-t border-[#e2ddd4] bg-stone-50 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Библиотека:</span>
            {musicTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedMusic(track)}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wide transition ${
                  selectedMusic.id === track.id
                    ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                    : 'border-amber-200 bg-white text-amber-700 hover:border-amber-400'
                }`}
              >
                <MusicNoteIcon sx={{ fontSize: 14 }} />
                {track.title}
              </button>
            ))}
            {soundEffects.map((effect) => (
              <button
                key={effect.id}
                className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[11px] uppercase tracking-wide text-amber-700 transition hover:border-amber-400"
              >
                <GraphicEqOutlinedIcon sx={{ fontSize: 14 }} />
                {effect.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
