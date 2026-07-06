import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import type { ReactNode } from 'react';
import type { FolderNode } from '../../data/library';

type DocumentTreeSidebarProps = {
  documentRoots: FolderNode[];
  expandedFolders: Record<string, boolean>;
  activeDocumentId: string;
  onCreateFolder: () => void;
  onToggleFolder: (folderId: string) => void;
  onCreateDocumentInFolder: (folderId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onRootDrop: (rootId: string, insertIndex: number) => void;
  renderSidebarNodes: (nodes: FolderNode['children'], parentFolderId: string) => ReactNode;
};

export function DocumentTreeSidebar({
  documentRoots,
  expandedFolders,
  activeDocumentId,
  onCreateFolder,
  onToggleFolder,
  onCreateDocumentInFolder,
  onDeleteNode,
  onRootDrop,
  renderSidebarNodes,
}: DocumentTreeSidebarProps) {
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
