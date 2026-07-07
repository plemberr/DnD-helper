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
import type { FolderNode, MediaType, TreeNode } from '../../data/library';

type SidebarDragKind = 'folder' | 'document' | 'media';

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
        <div key={child.id} className="space-y-0.5">
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
            className={`flex w-full items-center gap-1 rounded px-1.5 py-1 text-left transition hover:bg-stone-100 ${
              isSelected ? 'bg-amber-50 font-medium text-amber-900' : ''
            }`}
          >
            {child.kind === 'folder' ? (
              <>
                <button
                  type="button"
                  onClick={() => onToggleFolder(child.id)}
                  className="flex shrink-0 items-center text-stone-500"
                >
                  {isNestedFolderExpanded ? <ExpandMoreIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
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
                  onSelectDocument(child.id);
                } else if (child.kind === 'music' || child.kind === 'picture' || child.kind === 'sound') {
                  onSelectMediaType(child.kind);
                } else {
                  onToggleFolder(child.id);
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
                    onCreateDocumentInFolder(child.id);
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
                    onDeleteNode(child.id);
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
                    onDeleteNode(child.id);
                  }}
                  aria-label={`Удалить ${child.name}`}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                </button>
                <span
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

  return (
    <aside className="w-[220px] shrink-0 border-r border-[#e2ddd4] bg-stone-50">
      <div className="flex items-center justify-between border-b border-[#e2ddd4] px-3 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-stone-400">Папки</span>
        <button
          type="button"
          className="rounded-full p-1 text-stone-500 transition hover:bg-amber-100 hover:text-amber-700"
          onClick={onCreateFolder}
          aria-label="Создать папку"
        >
          <AddIcon sx={{ fontSize: 16 }} />
        </button>
      </div>

      <div className="space-y-1 p-1.5 text-[13px] leading-tight">
        {documentRoots.map((rootNode) => {
          const isExpanded = expandedFolders[rootNode.id];
          const isActiveRoot = activeDocumentId.startsWith(rootNode.id);

          return (
            <div
              key={rootNode.id}
              className="space-y-0.5"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onRootDrop(rootNode.id, rootNode.children.length);
              }}
            >
              <div
                className={`flex items-center gap-1 rounded px-1.5 py-1 text-left ${
                  isActiveRoot ? 'bg-amber-50 font-medium text-amber-900' : ''
                }`}
              >
                <button
                  onClick={() => onToggleFolder(rootNode.id)}
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
                  onClick={() => onCreateDocumentInFolder(rootNode.id)}
                  aria-label={`Добавить документ в ${rootNode.name}`}
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                </button>
                <button
                  type="button"
                  className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteNode(rootNode.id);
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
  );
}
