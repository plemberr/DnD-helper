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
  mediaState: Record<MediaType, MediaItem[]>;
  viewMode: 'list' | 'grid';
  onToggleViewMode: () => void;
  onAddMediaItem: (mediaType: MediaType) => void;
  onDeleteMediaItem: (mediaType: MediaType, itemId: string) => void;
  onMediaDragStart: (mediaType: MediaType, itemId: string) => void;
  onMediaDragEnd: () => void;
  onMediaDropAt: (mediaType: MediaType, index: number) => void;
};

export function MediaLibraryPanel({
  mediaState,
  viewMode,
  onToggleViewMode,
  onAddMediaItem,
  onDeleteMediaItem,
  onMediaDragStart,
  onMediaDragEnd,
  onMediaDropAt,
}: MediaLibraryPanelProps) {
  const orderedMediaTypes: MediaType[] = ['picture', 'sound', 'music'];

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-[#e2ddd4] bg-stone-50">
      <div className="flex h-12 items-center border-b border-[#e2ddd4] bg-white px-3">
        <div className="flex-1 text-center font-serif text-[17px] font-medium text-stone-900">Библиотека медиа файлов</div>
        <button className="rounded-full p-1.5 text-stone-500 transition hover:bg-amber-50 hover:text-amber-700" onClick={onToggleViewMode}>
          {viewMode === 'list' ? <ViewListOutlinedIcon fontSize="small" /> : <GridViewOutlinedIcon fontSize="small" />}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-3 p-3">
          {orderedMediaTypes.map((mediaType) => {
            const library = mediaLibraries[mediaType];
            const items = mediaState[mediaType];

            return (
              <section key={mediaType} className="rounded-lg border border-stone-200 bg-white p-3">
                <div className="flex items-center">
                  <div className="font-serif text-[16px] font-medium text-stone-900">{library.title}</div>
                  <div className="ml-auto flex items-center gap-1 text-amber-700">
                    {mediaType === 'music' && <MusicNoteIcon fontSize="small" />}
                    {mediaType === 'picture' && <ImageOutlinedIcon fontSize="small" />}
                    {mediaType === 'sound' && <GraphicEqOutlinedIcon fontSize="small" />}
                    <button
                      className="rounded-full p-1 text-stone-500 hover:bg-amber-50 hover:text-amber-700"
                      onClick={() => onAddMediaItem(mediaType)}
                    >
                      <AddIcon fontSize="small" />
                    </button>
                  </div>
                </div>

                {viewMode === 'list' ? (
                  <div className="mt-2 space-y-1.5">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => onMediaDragStart(mediaType, item.id)}
                        onDragEnd={onMediaDragEnd}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => onMediaDropAt(mediaType, index)}
                        className="flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-1.5 text-[13px] text-stone-700 transition hover:border-amber-300"
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16 }} className="cursor-grab text-stone-300" />
                        <span className="flex-1 truncate">{item.name}</span>
                        <button
                          className="rounded-full p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                          onClick={() => onDeleteMediaItem(mediaType, item.id)}
                          aria-label="Удалить"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => onMediaDragStart(mediaType, item.id)}
                        onDragEnd={onMediaDragEnd}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => onMediaDropAt(mediaType, index)}
                        className="flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-[13px] text-stone-700 transition hover:border-amber-300"
                      >
                        <DragIndicatorIcon sx={{ fontSize: 16 }} className="cursor-grab text-stone-300" />
                        <span className="flex-1 truncate">{item.name}</span>
                        <button
                          className="rounded-full p-1 text-stone-400 hover:bg-red-50 hover:text-red-500"
                          onClick={() => onDeleteMediaItem(mediaType, item.id)}
                          aria-label="Удалить"
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 text-[12px] italic text-stone-400">{library.subtitle}</div>
              </section>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
