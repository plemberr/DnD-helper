import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { musicTracks, soundEffects } from '../../data/library';

type Track = {
  id: string;
  title: string;
  duration: string;
};

type MusicLibraryFooterProps = {
  selectedMusic: Track;
  musicPlaying: boolean;
  onToggleMusicPlaying: () => void;
  onSelectTrack: (track: Track) => void;
};

export function MusicLibraryFooter({
  selectedMusic,
  musicPlaying,
  onToggleMusicPlaying,
  onSelectTrack,
}: MusicLibraryFooterProps) {
  return (
    <>
      <footer className="flex h-[68px] items-center gap-4 border-t border-[#e2ddd4] bg-white px-5">
        <span className="w-[60px] font-mono text-[10px] uppercase tracking-wider text-stone-400">Music</span>
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white shadow-sm transition hover:bg-amber-700"
          onClick={onToggleMusicPlaying}
        >
          {musicPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-[13px] text-stone-800">{selectedMusic.title}</div>
          <input className="mt-2 h-1.5 w-full accent-amber-600" type="range" defaultValue={42} />
        </div>
        <div className="font-mono text-[12px] text-stone-400">{selectedMusic.duration}</div>
      </footer>

      <div className="w-full border-t border-[#e2ddd4] bg-stone-50 px-5 py-3">
        <div className="flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Библиотека:</span>
          {musicTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wide transition ${
                selectedMusic.id === track.id
                  ? 'border-amber-600 bg-amber-600 text-white shadow-sm'
                  : 'border-amber-200 bg-white text-amber-700 hover:border-amber-400'
              }`}
            >
              <MusicNoteIcon sx={{ fontSize: 14 }} />
              {track.title}
            </button>
          ))}
          {soundEffects.map((effect) => (
            <button
              key={effect.id}
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-[11px] uppercase tracking-wide text-amber-700 transition hover:border-amber-400"
            >
              <GraphicEqOutlinedIcon sx={{ fontSize: 14 }} />
              {effect.title}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
