import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import type { TextFileNode } from '../../data/library';

type TabState = {
  id: string;
  title: string;
  documentId: string;
};

type DocumentWorkspaceProps = {
  tabs: TabState[];
  activeTabId: string;
  activeDocument: TextFileNode;
  breadcrumbs: string[];
  getTabDocument: (documentId: string) => TextFileNode;
  onSetActiveTabId: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onOpenNewTab: () => void;
  onUpdateTextContent: (documentId: string, content: string) => void;
};

export function DocumentWorkspace({
  tabs,
  activeTabId,
  activeDocument,
  breadcrumbs,
  getTabDocument,
  onSetActiveTabId,
  onCloseTab,
  onOpenNewTab,
  onUpdateTextContent,
}: DocumentWorkspaceProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col border-r border-[#e2ddd4] bg-white">
      <div className="flex h-10 items-stretch gap-1 border-b border-[#e2ddd4] bg-stone-100 px-2 pt-2 text-[13px]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const tabDocument = getTabDocument(tab.documentId);

          return (
            <div
              key={tab.id}
              role="button"
              tabIndex={0}
              onClick={() => onSetActiveTabId(tab.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSetActiveTabId(tab.id);
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
                  onCloseTab(tab.id);
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
          onClick={onOpenNewTab}
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
              onChange={(event) => onUpdateTextContent(activeDocument.id, event.target.value)}
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
  );
}
