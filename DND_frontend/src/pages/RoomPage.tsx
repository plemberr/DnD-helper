import { AppHeader } from '../components/AppHeader';

type RoomPageProps = {
  onOpenAdmin: () => void;
  onOpenRoom: () => void;
};

export function RoomPage({ onOpenAdmin, onOpenRoom }: RoomPageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f3efe8] text-stone-800">
      <div className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">Adminka</div>

      <div className="flex flex-1 flex-col">
        <AppHeader isRoomScreen onOpenAdmin={onOpenAdmin} onOpenRoom={onOpenRoom} />

        <main className="flex min-h-0 flex-1 w-full">
          <aside className="w-[220px] shrink-0 border-r border-[#e2ddd4] bg-stone-50">
            <div className="border-b border-[#e2ddd4] px-3 py-2.5">
              <div className="font-mono text-[11px] uppercase tracking-wider text-stone-400">Описание</div>
              <div className="mt-3 rounded-lg border border-[#e2ddd4] bg-white p-3 text-[13px] leading-6 text-stone-700 shadow-sm">
                Здесь мастер сможет кратко описать сцену, правила или подсказки для участников.
              </div>
            </div>

            <div className="p-2.5">
              <div className="rounded-lg border border-[#e2ddd4] bg-white px-3 py-2 font-serif text-[14px] text-stone-800 shadow-sm">
                Дм
              </div>

              <div className="mt-4 space-y-2 text-[13px] text-stone-700">
                {['Участник1', 'Участник1', 'Участник1', 'Участник1'].map((name, index) => (
                  <div key={`${name}-${index}`} className="rounded px-2 py-1 hover:bg-white">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="flex min-w-0 flex-1 flex-col border-r border-[#e2ddd4] bg-white">
            <div className="flex h-10 items-center gap-2 border-b border-[#e2ddd4] bg-stone-100 px-3 text-[13px] text-stone-600">
              <span className="rounded-full border border-stone-300 bg-white px-2.5 py-0.5">Комната мастера</span>
              <span className="text-stone-300">/</span>
              <span className="rounded-full border border-stone-300 bg-white px-2.5 py-0.5">Публичный экран</span>
            </div>

            <div className="flex flex-1 items-center justify-center px-6 py-8 text-center">
              <div className="w-full max-w-[760px]">
                <div className="font-serif text-[34px] font-semibold leading-tight text-stone-900">Комната</div>
                <div className="mt-1 font-serif text-[18px] italic leading-tight text-stone-500">
                  Экран для показа текста, картинок, музыки и звука участникам
                </div>

                <div className="mt-10 rounded-xl border border-[#e2ddd4] bg-white p-4 text-left shadow-lg shadow-stone-200/60">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="font-medium text-stone-800">Центральная область</div>
                    <span className="text-amber-600">live</span>
                  </div>
                  <div className="mt-3 min-h-[320px] rounded-lg border border-dashed border-stone-200 bg-[#faf8f4]" />
                  <div className="mt-3 text-[12px] text-stone-500">
                    Здесь позже появится расшаренный контент со стороны админки.
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex w-[340px] shrink-0 flex-col border-l border-[#e2ddd4] bg-stone-50">
            <div className="flex h-12 items-center justify-between border-b border-[#e2ddd4] bg-white px-3">
              <div className="font-serif text-[17px] font-medium text-stone-900">Игроки</div>
              <button className="rounded-full p-1.5 text-stone-500 transition hover:bg-amber-50 hover:text-amber-700">
                +
              </button>
            </div>

            <div className="space-y-3 p-3">
              <div className="rounded-xl border border-[#e2ddd4] bg-white p-3 shadow-sm">
                <div className="font-medium text-stone-800">Имя игрока</div>
                <div className="text-[13px] text-stone-500">Класс</div>
                <div className="mt-3 border-b border-stone-200" />
                <div className="mt-2 font-mono text-[12px] text-stone-600">34/34 hp</div>
              </div>

              <div className="rounded-xl border border-[#e2ddd4] bg-white p-3 shadow-sm">
                <div className="font-medium text-stone-800">Имя игрока</div>
                <div className="text-[13px] text-stone-500">Класс</div>
                <div className="mt-3 border-b border-stone-200" />
                <div className="mt-2 font-mono text-[12px] text-stone-600">34/34 hp</div>
              </div>

              <div className="rounded-xl border border-[#e2ddd4] bg-white p-3 shadow-sm">
                <div className="text-[13px] text-stone-700">Имя игрока хочет присоединиться</div>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[13px] text-amber-800 transition hover:bg-amber-100">
                    Принять
                  </button>
                  <button className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-[13px] text-stone-700 transition hover:bg-stone-100">
                    Отклонить
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[#e2ddd4] bg-white p-3 shadow-sm">
                <button className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 font-medium text-amber-900 transition hover:bg-amber-100">
                  Открыть полный лист персонажа
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
