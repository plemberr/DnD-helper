import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Replay10RoundedIcon from '@mui/icons-material/Replay10Rounded';
import Forward10RoundedIcon from '@mui/icons-material/Forward10Rounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Slider, Stack, Typography } from '@mui/material';
import { fantasyTokens } from '../../theme/fantasyTheme';

type FantasyAudioPlayerProps = {
  src?: string;
  /** Compact layout hides the +/-10s buttons (used in the tight footer bar). */
  dense?: boolean;
};

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function FantasyAudioPlayer({ src, dense = false }: FantasyAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  const disabled = !src;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || disabled) {
      return;
    }
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  };

  const skipBy = (delta: number) => {
    const audio = audioRef.current;
    if (!audio || disabled) {
      return;
    }
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), duration || audio.duration || 0);
  };

  const goldSliderSx = {
    color: fantasyTokens.gold,
    height: 4,
    '& .MuiSlider-rail': { backgroundColor: 'rgba(201, 162, 74, 0.22)', opacity: 1 },
    '& .MuiSlider-track': {
      border: 'none',
      backgroundImage: `linear-gradient(90deg, ${fantasyTokens.goldDark}, ${fantasyTokens.goldLight})`,
    },
    '& .MuiSlider-thumb': {
      width: 12,
      height: 12,
      backgroundColor: fantasyTokens.goldLight,
      border: `1px solid ${fantasyTokens.goldDark}`,
      '&:hover, &.Mui-focusVisible': { boxShadow: `0 0 0 6px rgba(201, 162, 74, 0.18)` },
      '&.Mui-active': { boxShadow: `0 0 0 8px rgba(201, 162, 74, 0.22)` },
    },
  } as const;

  return (
    <Box
      sx={{
        width: '100%',
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        border: `1px solid ${fantasyTokens.border}`,
        background: `linear-gradient(180deg, ${fantasyTokens.bgPanelRaised} 0%, ${fantasyTokens.bgField} 100%)`,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => {
          if (!isSeeking) {
            setCurrentTime(event.currentTarget.currentTime);
          }
        }}
      />

      <Stack direction="row" alignItems="center" spacing={dense ? 1 : 1.5}>
        {!dense && (
          <IconButton size="small" onClick={() => skipBy(-10)} disabled={disabled} aria-label="Назад 10 секунд">
            <Replay10RoundedIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton
          onClick={togglePlay}
          disabled={disabled}
          aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
          sx={{
            color: '#1a120a',
            background: `linear-gradient(180deg, ${fantasyTokens.goldLight} 0%, ${fantasyTokens.gold} 50%, ${fantasyTokens.goldDark} 100%)`,
            border: `1px solid ${fantasyTokens.goldLight}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            '&:hover': { color: '#1a120a', background: `linear-gradient(180deg, ${fantasyTokens.goldLight} 0%, ${fantasyTokens.goldLight} 50%, ${fantasyTokens.gold} 100%)` },
            '&.Mui-disabled': { color: '#1a120a', opacity: 0.5 },
          }}
        >
          {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </IconButton>

        {!dense && (
          <IconButton size="small" onClick={() => skipBy(10)} disabled={disabled} aria-label="Вперёд 10 секунд">
            <Forward10RoundedIcon fontSize="small" />
          </IconButton>
        )}

        <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'right', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(currentTime)}
        </Typography>

        <Slider
          size="small"
          value={Math.min(currentTime, duration || 0)}
          min={0}
          max={duration || 0}
          step={0.1}
          disabled={disabled || !duration}
          onChange={(_, value) => {
            setIsSeeking(true);
            setCurrentTime(value as number);
          }}
          onChangeCommitted={(_, value) => {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = value as number;
            }
            setIsSeeking(false);
          }}
          aria-label="Позиция воспроизведения"
          sx={{ flex: 1, mx: 0.5, ...goldSliderSx }}
        />

        <Typography variant="caption" sx={{ minWidth: 36, color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(duration)}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ width: dense ? 'auto' : 116 }}>
          <IconButton
            size="small"
            onClick={() => setIsMuted((current) => !current)}
            disabled={disabled}
            aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted || volume === 0 ? <VolumeOffRoundedIcon fontSize="small" /> : <VolumeUpRoundedIcon fontSize="small" />}
          </IconButton>
          {!dense && (
            <Slider
              size="small"
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.01}
              disabled={disabled}
              onChange={(_, value) => {
                setVolume(value as number);
                setIsMuted((value as number) === 0);
              }}
              aria-label="Громкость"
              sx={{ width: 70, ...goldSliderSx }}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
