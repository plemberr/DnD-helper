import { useMemo, useRef, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { fantasyPageBackground } from '../theme/fantasyTheme';
import { AppHeader } from '../components/AppHeader';
import { DocumentTreeSidebar } from '../components/admin/DocumentTreeSidebar';
import { DocumentWorkspace } from '../components/admin/DocumentWorkspace';
import { MediaLibraryPanel } from '../components/admin/MediaLibraryPanel';
import { MusicLibraryFooter } from '../components/admin/MusicLibraryFooter';
import {
  documentTree as initialDocumentTree,
  type FolderNode,
  type MediaFileNode,
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

type DragKind = 'folder' | 'document' | MediaType;

type DragState =
  | {
      kind: DragKind;
      id: string;
      sourceFolderId?: string;
    }
  | null;

type SidebarMediaDropPayload = {
  mediaType: MediaType;
  itemId: string;
  itemName: string;
  itemKind: 'file';
};

const fallbackDocument: TextFileNode = {
  id: 'fallback-document',
  name: 'Пустой документ',
  kind: 'document',
  summary: '',
  content: '',
  links: [],
};

export function AdminPage({ onOpenAdmin, onOpenRoom }: AdminPageProps) {
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
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createDocumentFolderId, setCreateDocumentFolderId] = useState<string | null>(null);
  const [newDocumentName, setNewDocumentName] = useState('');
  const dragStateRef = useRef<DragState>(null);

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

  const createDocumentInFolder = (folderId: string, documentName: string) => {
    const documentId = `doc-${Date.now()}`;
    const trimmedName = documentName.trim();
    const nextDocument: TextFileNode = {
      id: documentId,
      name: trimmedName || `Текст док ${documentId.slice(-4)}`,
      kind: 'document',
      summary: 'Новый текстовый документ',
      content: 'Новый текстовый документ',
      links: [],
    };

    setDocumentRoots((current) => nodeHelper.insertNodeIntoFolder(current, folderId, nextDocument));
    setExpandedFolders((current) => ({ ...current, [folderId]: true }));
    updateActiveTabDocument(documentId);
  };

  const requestCreateDocumentInFolder = (folderId: string) => {
    setCreateDocumentFolderId(folderId);
    setNewDocumentName('');
  };

  const closeCreateDocumentDialog = () => {
    setCreateDocumentFolderId(null);
    setNewDocumentName('');
  };

  const submitCreateDocument = () => {
    if (!createDocumentFolderId || !newDocumentName.trim()) {
      return;
    }

    createDocumentInFolder(createDocumentFolderId, newDocumentName);
    closeCreateDocumentDialog();
  };

  const createFolder = (folderName: string) => {
    const folderId = `folder-${Date.now()}`;
    const trimmedName = folderName.trim();
    const nextFolder: FolderNode = {
      id: folderId,
      name: trimmedName || `Новая папка ${folderId.slice(-4)}`,
      kind: 'folder',
      children: [],
    };

    setDocumentRoots((current) => [...current, nextFolder]);
    setExpandedFolders((current) => ({ ...current, [folderId]: true }));
  };

  const requestCreateFolder = () => {
    setIsCreateFolderDialogOpen(true);
    setNewFolderName('');
  };

  const closeCreateFolderDialog = () => {
    setIsCreateFolderDialogOpen(false);
    setNewFolderName('');
  };

  const submitCreateFolder = () => {
    if (!newFolderName.trim()) {
      return;
    }

    createFolder(newFolderName);
    closeCreateFolderDialog();
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
      const currentIndex = current.findIndex((tab) => tab.id === tabId);
      const nextTabs = current.filter((tab) => tab.id !== tabId);
      const fallbackTab = nextTabs[currentIndex] ?? nextTabs[currentIndex - 1] ?? nextTabs[0] ?? null;

      setActiveTabId((activeCurrent) => (activeCurrent === tabId ? fallbackTab?.id ?? '' : activeCurrent));

      return nextTabs;
    });
  };

  const handleRootDrop = (rootId: string, insertIndex: number) => {
    const currentDrag = dragStateRef.current;
    if (currentDrag) {
      moveNodeToFolder(currentDrag.id, rootId, insertIndex);
      updateDragState(null);
    }
  };

  const getTabDocument = (documentId: string): TextFileNode => nodeHelper.findTextFileById(documentRoots, documentId) ?? activeDocument;
  const createDocumentFolderName =
    createDocumentFolderId && nodeHelper.findNodeById(documentRoots, createDocumentFolderId)?.kind === 'folder'
      ? nodeHelper.findNodeById(documentRoots, createDocumentFolderId)?.name
      : 'папке';

  const dropMediaIntoFolder = (payload: SidebarMediaDropPayload, folderId: string) => {
    const mediaNode: MediaFileNode = {
      id: `linked-${payload.mediaType}-${payload.itemId}-${Date.now()}`,
      name: payload.itemName,
      kind: payload.mediaType,
      summary: `Добавлено из медиатеки (${payload.mediaType})`,
    };

    setDocumentRoots((current) => nodeHelper.insertNodeIntoFolder(current, folderId, mediaNode));
    setExpandedFolders((current) => ({ ...current, [folderId]: true }));
  };

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
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', flexDirection: 'column', overflowX: 'hidden', background: fantasyPageBackground, color: 'text.primary' }}>
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <AppHeader isRoomScreen={false} onOpenAdmin={onOpenAdmin} onOpenRoom={onOpenRoom} />

        <Box component="main" sx={{ display: 'flex', minHeight: 0, flex: 1, width: '100%' }}>
          <DocumentTreeSidebar
            documentRoots={documentRoots}
            expandedFolders={expandedFolders}
            activeDocumentId={activeDocument.id}
            selectedMediaType={selectedMediaType}
            onCreateFolder={requestCreateFolder}
            onToggleFolder={toggleFolder}
            onCreateDocumentInFolder={requestCreateDocumentInFolder}
            onDeleteNode={deleteNode}
            onSelectDocument={updateActiveTabDocument}
            onSelectMediaType={setSelectedMediaType}
            onMoveNodeToFolder={moveNodeToFolder}
            onDropMediaIntoFolder={dropMediaIntoFolder}
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

          <MediaLibraryPanel />
        </Box>

        <MusicLibraryFooter />
      </Box>
      <Dialog open={Boolean(createDocumentFolderId)} onClose={closeCreateDocumentDialog} fullWidth maxWidth="xs">
        <DialogTitle>Новый текстовый документ в {createDocumentFolderName}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название документа"
            value={newDocumentName}
            onChange={(event) => setNewDocumentName(event.target.value)}
            margin="dense"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitCreateDocument();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDocumentDialog} color="inherit">
            Отмена
          </Button>
          <Button onClick={submitCreateDocument} variant="contained" disabled={!newDocumentName.trim()}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isCreateFolderDialogOpen} onClose={closeCreateFolderDialog} fullWidth maxWidth="xs">
        <DialogTitle>Новая папка</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Название папки"
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            margin="dense"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submitCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateFolderDialog} color="inherit">
            Отмена
          </Button>
          <Button onClick={submitCreateFolder} variant="contained" disabled={!newFolderName.trim()}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
