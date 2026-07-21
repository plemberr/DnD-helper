import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { fantasyPageBackground } from '../theme/fantasyTheme';
import { AppHeader } from '../components/AppHeader';
import { DocumentTreeSidebar } from '../components/admin/DocumentTreeSidebar';
import { DocumentWorkspace } from '../components/admin/DocumentWorkspace';
import { MediaLibraryPanel } from '../components/admin/MediaLibraryPanel';
import { MusicLibraryFooter } from '../components/admin/MusicLibraryFooter';
import {
  type FolderNode,
  type MediaFileNode,
  type MediaType,
  type TextFileNode,
} from '../data/library';
import { contentService } from '../api/contentService';
import { roomsService } from '../api/roomsService';
import { nodeHelper } from '../utils/nodeHelper';
import { readAccessToken } from '../utils/authSession';
import { readActiveAdminRoomId } from '../utils/roomSession';

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
  const [documentRoots, setDocumentRoots] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [tabs, setTabs] = useState<TabState[]>([{ id: 'tab-1', title: 'Вкладка 1', documentId: fallbackDocument.id }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [selectedMediaType, setSelectedMediaType] = useState<MediaType>('music');
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createDocumentFolderId, setCreateDocumentFolderId] = useState<string | null>(null);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState('');
  const dragStateRef = useRef<DragState>(null);
  const saveContentTimersRef = useRef<Record<string, number>>({});
  const accessToken = readAccessToken();

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const activeDocument = nodeHelper.findTextFileById(documentRoots, activeTab?.documentId ?? fallbackDocument.id) ?? nodeHelper.findFirstTextDocument(documentRoots) ?? fallbackDocument;
  const breadcrumbs = useMemo(() => ['Корень', 'Кампания', activeDocument.name], [activeDocument]);

  const parseFolderNumericId = (nodeId: string): number | null => {
    if (!nodeId.startsWith('folder-')) {
      return null;
    }
    const parsed = Number(nodeId.replace('folder-', ''));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseDocumentNumericId = (nodeId: string): number | null => {
    if (!nodeId.startsWith('document-')) {
      return null;
    }
    const parsed = Number(nodeId.replace('document-', ''));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const syncTabsWithTree = (nextRoots: FolderNode[]) => {
    const firstDocument = nodeHelper.findFirstTextDocument(nextRoots);
    const fallbackDocumentId = firstDocument?.id ?? fallbackDocument.id;

    setTabs((currentTabs) =>
      currentTabs.map((tab) => {
        const hasDocument = nodeHelper.findTextFileById(nextRoots, tab.documentId);
        return hasDocument ? tab : { ...tab, documentId: fallbackDocumentId };
      }),
    );
  };

  const loadAdminData = async (roomId: number, token: string) => {
    const tree = await contentService.getAdminDocumentTree(roomId, token);
    setDocumentRoots(tree);
    setExpandedFolders((current) => ({
      ...Object.fromEntries(tree.map((node) => [node.id, true])),
      ...current,
    }));
    syncTabsWithTree(tree);
  };

  const retryLoad = async () => {
    if (!activeRoomId || !accessToken) {
      return;
    }

    setIsAdminLoading(true);
    try {
      await loadAdminData(activeRoomId, accessToken);
      setAdminError('');
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : 'Не удалось загрузить данные админки.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const resolveActiveRoom = async () => {
      if (!accessToken) {
        if (isMounted) {
          setAdminError('Сессия не найдена. Войдите снова, чтобы открыть админку.');
          setIsAdminLoading(false);
        }
        return;
      }

      try {
        const storedRoomId = readActiveAdminRoomId();
        if (storedRoomId) {
          if (isMounted) {
            setActiveRoomId(storedRoomId);
          }
          return;
        }

        const myRoomsResponse = await roomsService.list({
          my: true,
          limit: 1,
          offset: 0,
          accessToken,
        });

        if (!isMounted) {
          return;
        }

        const fallbackRoomId = myRoomsResponse.items[0]?.id ?? null;
        setActiveRoomId(fallbackRoomId);
        if (!fallbackRoomId) {
          setAdminError('Не найдена комната мастера. Создайте комнату на странице реестра.');
          setIsAdminLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setAdminError(error instanceof Error ? error.message : 'Не удалось определить комнату мастера.');
          setIsAdminLoading(false);
        }
      }
    };

    void resolveActiveRoom();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!activeRoomId || !accessToken) {
        return;
      }

      setIsAdminLoading(true);
      setAdminError('');
      try {
        await loadAdminData(activeRoomId, accessToken);
      } catch (error) {
        if (isMounted) {
          setAdminError(error instanceof Error ? error.message : 'Не  удалось загрузить данные админки.');
        }
      } finally {
        if (isMounted) {
          setIsAdminLoading(false);
        }
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [activeRoomId, accessToken]);

  useEffect(
    () => () => {
      Object.values(saveContentTimersRef.current).forEach((timerId) => clearTimeout(timerId));
      saveContentTimersRef.current = {};
    },
    [],
  );

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
    const trimmedName = documentName.trim();
    const folderNumericId = parseFolderNumericId(folderId);
    if (!activeRoomId || !accessToken || !folderNumericId) {
      return;
    }

    void contentService
      .createDocument(folderNumericId, trimmedName || 'Новый текстовый документ', 'Новый текстовый документ', accessToken)
      .then(async (createdDocument) => {
        await loadAdminData(activeRoomId, accessToken);
        updateActiveTabDocument(`document-${createdDocument.id}`);
        setExpandedFolders((current) => ({ ...current, [folderId]: true }));
      })
      .catch((error) => {
        setAdminError(error instanceof Error ? error.message : 'Не удалось создать документ.');
      });
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
    const trimmedName = folderName.trim();
    if (!activeRoomId || !accessToken) {
      return;
    }

    void contentService
      .createDocumentFolder(activeRoomId, trimmedName || 'Новая папка', accessToken, null)
      .then(async (createdFolder) => {
        await loadAdminData(activeRoomId, accessToken);
        setExpandedFolders((current) => ({ ...current, [`folder-${createdFolder.id}`]: true }));
      })
      .catch((error) => {
        setAdminError(error instanceof Error ? error.message : 'Не удалось создать папку.');
      });
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
    if (!activeRoomId || !accessToken) {
      return;
    }

    const folderId = parseFolderNumericId(nodeId);
    const documentId = parseDocumentNumericId(nodeId);

    const deleteRequest = folderId
      ? contentService.deleteDocumentFolder(activeRoomId, folderId, accessToken)
      : documentId
        ? contentService.deleteDocument(documentId, accessToken)
        : null;

    if (!deleteRequest) {
      const { tree: nextTree, removed } = nodeHelper.removeNodeById(documentRoots, nodeId);
      if (!removed) {
        return;
      }
      setDocumentRoots(nextTree);
      syncTabsWithTree(nextTree);
      return;
    }

    void deleteRequest
      .then(async () => {
        await loadAdminData(activeRoomId, accessToken);
      })
      .catch((error) => {
        setAdminError(error instanceof Error ? error.message : 'Не удалось удалить элемент.');
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

    const numericDocumentId = parseDocumentNumericId(documentId);
    if (!numericDocumentId || !accessToken) {
      return;
    }

    const existingTimer = saveContentTimersRef.current[documentId];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    saveContentTimersRef.current[documentId] = window.setTimeout(() => {
      void contentService.updateDocument(numericDocumentId, { content }, accessToken).catch((error) => {
        setAdminError(error instanceof Error ? error.message : 'Не удалось сохранить документ.');
      });
    }, 700);
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
    const sourceNode = nodeHelper.findNodeById(documentRoots, nodeId);
    const sourceFolderId = parseFolderNumericId(nodeId);
    const targetFolderId = parseFolderNumericId(folderId);

    if (sourceNode?.kind === 'folder' && activeRoomId && accessToken && sourceFolderId && targetFolderId) {
      if (sourceFolderId === targetFolderId || nodeHelper.containsNode(sourceNode, folderId)) {
        return;
      }

      void contentService
        .updateDocumentFolder(activeRoomId, sourceFolderId, { parent_folder_id: targetFolderId }, accessToken)
        .then(async () => {
          await loadAdminData(activeRoomId, accessToken);
        })
        .catch((error) => {
          setAdminError(error instanceof Error ? error.message : 'Не удалось переместить папку.');
        });
      return;
    }

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
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', flexDirection: 'column', overflow: 'hidden', background: fantasyPageBackground, color: 'text.primary' }}>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, flexDirection: 'column' }}>
        <AppHeader isRoomScreen={false} onOpenAdmin={onOpenAdmin} onOpenRoom={onOpenRoom} />

        <Box component="main" sx={{ display: 'flex', minHeight: 0, flex: 1, width: '100%', overflow: 'hidden' }}>
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
          {isAdminLoading ? (
            <Box sx={{ display: 'grid', flex: 1, placeItems: 'center' }}>
              <CircularProgress />
            </Box>
          ) : adminError ? (
            <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', p: 3 }}>
              <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 760 }}>
                <Alert severity="error">{adminError}</Alert>
                <Typography variant="body2" color="text.secondary">
                  Откройте список комнат и снова перейдите в админку из комнаты, где вы мастер.
                </Typography>
                <Button variant="outlined" onClick={() => void retryLoad()}>
                  Повторить
                </Button>
              </Stack>
            </Box>
          ) : (
            <>
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

              <MediaLibraryPanel roomId={activeRoomId} />
            </>
          )}
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
