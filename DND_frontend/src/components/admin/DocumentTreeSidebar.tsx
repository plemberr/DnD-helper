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
import { Box, IconButton, Stack, Typography } from '@mui/material';
import type { FolderNode, MediaType, TreeNode } from '../../data/library';

type SidebarDragKind = 'folder' | 'document';

type SidebarDragState =
  | {
      kind: SidebarDragKind;
      id: string;
      sourceFolderId?: string;
    }
  | null;

type DocumentTreeSidebarProps = {
  documentRoots: FolderNode[];
  expandedFolders: Record<string, boolean>;
  activeDocumentId: string;
  selectedMediaType: MediaType;
  onCreateFolder: () => void;
  onToggleFolder: (folderId: string) => void;
  onCreateDocumentInFolder: (folderId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectDocument: (documentId: string) => void;
  onSelectMediaType: (mediaType: MediaType) => void;
  onMoveNodeToFolder: (nodeId: string, folderId: string, insertIndex: number | null) => void;
  getDragState: () => SidebarDragState;
  onSetDragState: (nextDragState: SidebarDragState) => void;
  onRootDrop: (rootId: string, insertIndex: number) => void;
};

export function DocumentTreeSidebar({
  documentRoots,
  expandedFolders,
  activeDocumentId,
  selectedMediaType,
  onCreateFolder,
  onToggleFolder,
  onCreateDocumentInFolder,
  onDeleteNode,
  onSelectDocument,
  onSelectMediaType,
  onMoveNodeToFolder,
  getDragState,
  onSetDragState,
  onRootDrop,
}: DocumentTreeSidebarProps) {
  const renderSidebarNodes = (nodes: TreeNode[], parentFolderId: string) =>
    nodes.map((child, childIndex) => {
      const isSelectedDocument = child.kind === 'document' && child.id === activeDocumentId;
      const isSelectedMedia = child.kind !== 'folder' && child.kind === selectedMediaType;
      const isSelected = isSelectedDocument || isSelectedMedia;
      const isNestedFolderExpanded = child.kind === 'folder' && expandedFolders[child.id];

      return (
        <Box key={child.id} sx={{ mb: 0.5 }}>
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const currentDrag = getDragState();
              if (!currentDrag || currentDrag.id === child.id) {
                return;
              }

              if (child.kind === 'folder') {
                onMoveNodeToFolder(currentDrag.id, child.id, null);
              } else {
                onMoveNodeToFolder(currentDrag.id, parentFolderId, childIndex);
              }
              onSetDragState(null);
            }}
            style={{ width: '100%' }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.25}
              sx={{
                width: '100%',
                px: 0.75,
                py: 0.5,
                borderRadius: 1,
                bgcolor: isSelected ? 'warning.50' : 'transparent',
                color: isSelected ? 'warning.dark' : 'text.primary',
                '&:hover': { bgcolor: isSelected ? 'warning.100' : 'action.hover' },
              }}
            >
            {child.kind === 'folder' ? (
              <>
                <IconButton
                  size="small"
                  onClick={() => onToggleFolder(child.id)}
                  sx={{ color: 'text.secondary' }}
                >
                  {isNestedFolderExpanded ? <ExpandMoreIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
                </IconButton>
                <FolderOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </>
            ) : child.kind === 'document' ? (
              <DescriptionOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            ) : child.kind === 'music' ? (
              <MusicNoteIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            ) : child.kind === 'picture' ? (
              <ImageOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            ) : (
              <GraphicEqOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            )}

            <button
              type="button"
              style={{ display: 'flex', minWidth: 0, flex: 1, alignItems: 'center', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}
              onClick={() => {
                if (child.kind === 'document') {
                  onSelectDocument(child.id);
                } else if (child.kind === 'music' || child.kind === 'picture' || child.kind === 'sound') {
                  onSelectMediaType(child.kind);
                } else {
                  onToggleFolder(child.id);
                }
              }}
            >
              <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
                {child.name}
              </Typography>
            </button>

            {child.kind === 'folder' && (
              <>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCreateDocumentInFolder(child.id);
                  }}
                  aria-label={`Добавить файл в ${child.name}`}
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteNode(child.id);
                  }}
                  aria-label={`Удалить папку ${child.name}`}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </>
            )}

            {child.kind === 'document' && (
              <>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteNode(child.id);
                  }}
                  aria-label={`Удалить ${child.name}`}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <Box
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    onSetDragState({
                      kind: 'document',
                      id: child.id,
                      sourceFolderId: parentFolderId,
                    });
                  }}
                  onDragEnd={() => onSetDragState(null)}
                  sx={{ cursor: 'grab', color: 'text.secondary', display: 'inline-flex' }}
                >
                  <DragIndicatorIcon sx={{ fontSize: 14 }} />
                </Box>
              </>
            )}
            </Stack>
          </div>

          {isNestedFolderExpanded && child.kind === 'folder' && (
            <Box sx={{ ml: 2, pl: 1, borderLeft: 1, borderColor: 'divider' }}>{renderSidebarNodes(child.children, child.id)}</Box>
          )}
        </Box>
      );
    });

  return (
    <Box component="aside" sx={{ width: 240, flexShrink: 0, borderRight: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Папки
        </Typography>
        <IconButton size="small" onClick={onCreateFolder} aria-label="Создать папку">
          <AddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      <Box sx={{ p: 1 }}>
        {documentRoots.map((rootNode) => {
          const isExpanded = expandedFolders[rootNode.id];
          const isActiveRoot = activeDocumentId.startsWith(rootNode.id);

          return (
            <Box
              key={rootNode.id}
              sx={{ mb: 0.5 }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onRootDrop(rootNode.id, rootNode.children.length);
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.25}
                sx={{
                  px: 0.75,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: isActiveRoot ? 'warning.50' : 'transparent',
                  color: isActiveRoot ? 'warning.dark' : 'text.primary',
                }}
              >
                <button
                  onClick={() => onToggleFolder(rootNode.id)}
                  style={{
                    display: 'flex',
                    flex: 1,
                    alignItems: 'center',
                    gap: 4,
                    textAlign: 'left',
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    minWidth: 0,
                    padding: 0,
                  }}
                >
                  {isExpanded ? (
                    <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  ) : (
                    <KeyboardArrowRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  )}
                  <FolderOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" noWrap>
                    {rootNode.name}
                  </Typography>
                </button>
                <IconButton
                  size="small"
                  onClick={() => onCreateDocumentInFolder(rootNode.id)}
                  aria-label={`Добавить документ в ${rootNode.name}`}
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteNode(rootNode.id);
                  }}
                  aria-label={`Удалить папку ${rootNode.name}`}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Stack>

              {isExpanded && <Box sx={{ ml: 2, pl: 1, borderLeft: 1, borderColor: 'divider' }}>{renderSidebarNodes(rootNode.children, rootNode.id)}</Box>}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
