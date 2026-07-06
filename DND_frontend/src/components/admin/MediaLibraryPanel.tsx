import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { mediaLibraries, type MediaItem, type MediaType } from '../../data/library';

type MediaLibraryPanelProps = {
  selectedMediaType: MediaType;
  viewMode: 'list' | 'grid';
  activeItems: MediaItem[];
  onToggleViewMode: () => void;
  onAddMediaItem: () => void;
  onSelectMediaType: (kind: MediaType) => void;
  onDeleteMediaItem: (itemId: string) => void;
  onMediaDragStart: (itemId: string) => void;
  onMediaDragEnd: () => void;
  onMediaDropAt: (index: number) => void;
};

export function MediaLibraryPanel({
  selectedMediaType,
  viewMode,
  activeItems,
  onToggleViewMode,
  onAddMediaItem,
  onSelectMediaType,
  onDeleteMediaItem,
  onMediaDragStart,
  onMediaDragEnd,
  onMediaDropAt,
}: MediaLibraryPanelProps) {
  const activeLibrary = mediaLibraries[selectedMediaType];

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-[#e2ddd4] bg-stone-50">
      <div className="flex h-12 items-center border-b border-[#e2ddd4] bg-white px-3">
        <div className="flex-1 text-center font-serif text-[17px] font-medium text-stone-900">{activeLibrary.title}</div>
        <button className="rounded-full p-1.5 text-stone-500 transition hover:bg-amber-50 hover:text-amber-700" onClick={onToggleViewMode}>
          {viewMode === 'list' ? <ViewListOutlinedIcon fontSize="small" /> : <GridViewOutlinedIcon fontSize="small" />}
        </button>
        <button className="rounded-full p-1.5 text-stone-500 transition hover:bg-amber-50 hover:text-amber-700" onClick={onAddMediaItem}>
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
                onClick={() => onSelectMediaType(kind)}
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
              <button className="rounded-full p-1 text-stone-500 hover:bg-amber-50 hover:text-amber-700" onClick={onAddMediaItem}>
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
                  onDragStart={() => onMediaDragStart(item.id)}
                  onDragEnd={onMediaDragEnd}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => onMediaDropAt(index)}
                  className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-[13px] text-stone-700 shadow-sm transition hover:border-amber-300"
                >
                  <DragIndicatorIcon sx={{ fontSize: 16 }} className="cursor-grab text-stone-300" />
                  <span className="flex-1 truncate">{item.name}</span>
                  <button
                    className="rounded-full p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                    onClick={() => onDeleteMediaItem(item.id)}
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
                  onDragStart={() => onMediaDragStart(item.id)}
                  onDragEnd={onMediaDragEnd}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => onMediaDropAt(index)}
                  className="flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-[13px] text-stone-700 shadow-sm transition hover:border-amber-300"
                >
                  <DragIndicatorIcon sx={{ fontSize: 16 }} className="cursor-grab text-stone-300" />
                  <span className="flex-1 truncate">{item.name}</span>
                  <button
                    className="rounded-full p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                    onClick={() => onDeleteMediaItem(item.id)}
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
  );
}
