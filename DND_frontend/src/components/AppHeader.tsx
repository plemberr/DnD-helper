import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { useNavigate } from 'react-router-dom';

type AppHeaderProps = {
  isRoomScreen: boolean;
  onOpenRoom: () => void;
  onOpenAdmin: () => void;
};

export function AppHeader({ isRoomScreen, onOpenRoom, onOpenAdmin }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex h-14 w-full items-center border-b-2 border-amber-500 bg-[#292420] px-5 text-white shadow-sm">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[22px] font-semibold tracking-tight">Dnd</span>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-stone-400 sm:inline">
          workspace
        </span>
      </div>

      <div className="ml-auto mr-3 flex items-center gap-2">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#f2ede4] transition hover:bg-[#f2ede4]/10"
          aria-label="Скопировать ссылку"
        >
          <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
        </button>

        <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-[12px]">
          <button
            type="button"
            onClick={onOpenRoom}
            className={`rounded-full px-3 py-1.5 transition ${
              isRoomScreen ? 'bg-white text-[#292420] shadow-sm' : 'text-stone-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Комната
          </button>
          <button
            type="button"
            onClick={onOpenAdmin}
            className={`rounded-full px-3 py-1.5 transition ${
              !isRoomScreen ? 'bg-white text-[#292420] shadow-sm' : 'text-stone-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            Админка
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-full p-2 text-stone-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Открыть профиль"
        >
          <AccountCircleOutlinedIcon fontSize="small" />
        </button>
      </div>
    </header>
  );
}
