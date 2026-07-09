import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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

      <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
        <div className="mb-4 flex items-center gap-1.5 self-start font-mono text-[11px] uppercase tracking-wide text-stone-500">
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
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
          <section className="flex min-h-0 flex-col rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div>
                <div className="text-[14px] font-semibold text-stone-900">{activeDocument.name}</div>
                <div className="text-[12px] text-stone-500">{activeDocument.summary}</div>
              </div>
              <DescriptionOutlinedIcon sx={{ fontSize: 16 }} className="text-amber-600" />
            </div>

            <textarea
              className="mt-3 min-h-0 flex-1 resize-none rounded-md border border-stone-200 bg-white p-3 font-mono text-[14px] leading-6 text-stone-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
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
          </section>

          <section className="flex min-h-0 flex-col rounded-lg border border-stone-200 bg-white p-4">
            <div className="border-b border-stone-200 pb-2 text-[13px] font-semibold uppercase tracking-wide text-stone-500">
              Preview Markdown
            </div>
            <div className="mt-3 min-h-0 flex-1 overflow-auto rounded-md border border-stone-100 bg-stone-50 p-4 text-left text-[14px] leading-7 text-stone-800">
              {activeDocument.content.trim() ? (
                <article className="space-y-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ ...props }) => <h1 className="mt-2 text-2xl font-bold text-stone-900" {...props} />,
                      h2: ({ ...props }) => <h2 className="mt-2 text-xl font-semibold text-stone-900" {...props} />,
                      h3: ({ ...props }) => <h3 className="mt-1 text-lg font-semibold text-stone-900" {...props} />,
                      p: ({ ...props }) => <p className="text-stone-800" {...props} />,
                      a: ({ ...props }) => <a className="text-amber-700 underline decoration-amber-500/50" {...props} />,
                      code: ({ ...props }) => (
                        <code className="rounded bg-stone-200 px-1.5 py-0.5 font-mono text-[13px] text-stone-900" {...props} />
                      ),
                      pre: ({ ...props }) => (
                        <pre
                          className="overflow-auto rounded-md bg-stone-900 p-3 font-mono text-[13px] text-stone-100 [&>code]:bg-transparent [&>code]:p-0"
                          {...props}
                        />
                      ),
                      ul: ({ ...props }) => <ul className="list-disc space-y-1 pl-6" {...props} />,
                      ol: ({ ...props }) => <ol className="list-decimal space-y-1 pl-6" {...props} />,
                      blockquote: ({ ...props }) => (
                        <blockquote className="border-l-4 border-amber-300 pl-3 italic text-stone-600" {...props} />
                      ),
                      table: ({ ...props }) => <table className="w-full border-collapse text-[13px]" {...props} />,
                      th: ({ ...props }) => <th className="border border-stone-300 bg-stone-100 px-2 py-1 text-left" {...props} />,
                      td: ({ ...props }) => <td className="border border-stone-200 px-2 py-1 align-top" {...props} />,
                    }}
                  >
                    {activeDocument.content}
                  </ReactMarkdown>
                </article>
              ) : (
                <p className="text-stone-400">Введите markdown-текст слева, чтобы увидеть превью.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
