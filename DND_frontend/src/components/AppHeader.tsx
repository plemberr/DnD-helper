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

  const activePill =
    'rounded-full px-3.5 py-1.5 bg-gradient-to-b from-[#e6c877] to-[#a97f34] text-[#1a120a] font-semibold shadow';
  const inactivePill = 'rounded-full px-3.5 py-1.5 text-[#9c8b76] transition hover:bg-[#c9a24a]/10 hover:text-[#e6c877]';

  return (
    <header className="flex h-14 w-full items-center border-b border-[#c9a24a]/30 bg-gradient-to-b from-[#1b120d] to-[#120b08] px-5 text-[#ece2d0] shadow-[0_4px_18px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-5">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[24px] font-semibold tracking-wide text-[#e6c877]"
            style={{ fontFamily: '"Cormorant Garamond", serif' }}
          >
            Dnd
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-[#9c8b76] sm:inline">
            workspace
          </span>
        </div>

        <div className="flex items-center rounded-full border border-[#c9a24a]/20 bg-black/25 p-1 text-[12px]">
          <button type="button" onClick={onOpenRoom} className={isRoomScreen ? activePill : inactivePill}>
            Комната
          </button>
          <button type="button" onClick={onOpenAdmin} className={!isRoomScreen ? activePill : inactivePill}>
            Админка
          </button>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a24a]/35 text-[#c9a24a] transition hover:border-[#e6c877] hover:bg-[#c9a24a]/10 hover:text-[#e6c877]"
          aria-label="Скопировать ссылку"
        >
          <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
        </button>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="rounded-full p-2 text-[#9c8b76] transition hover:bg-[#c9a24a]/10 hover:text-[#e6c877]"
          aria-label="Открыть профиль"
        >
          <AccountCircleOutlinedIcon fontSize="small" />
        </button>
      </div>
    </header>
  );
}
