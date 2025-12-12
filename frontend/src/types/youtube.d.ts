// YouTube IFrame API TypeScript declarations
interface YTPlayerState {
  UNSTARTED: -1;
  ENDED: 0;
  PLAYING: 1;
  PAUSED: 2;
  BUFFERING: 3;
  CUED: 5;
}

interface YTPlayerEvent {
  target: YT.Player;
  data: number;
}

interface YTPlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1 | 2;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
  end?: number;
  fs?: 0 | 1;
  hl?: string;
  iv_load_policy?: 1 | 3;
  list?: string;
  listType?: 'playlist' | 'search' | 'user_uploads';
  loop?: 0 | 1;
  modestbranding?: 0 | 1;
  origin?: string;
  playlist?: string;
  playsinline?: 0 | 1;
  rel?: 0 | 1;
  start?: number;
  widget_referrer?: string;
}

interface YTPlayerEvents {
  onReady?: (event: YTPlayerEvent) => void;
  onStateChange?: (event: YTPlayerEvent) => void;
  onPlaybackQualityChange?: (event: YTPlayerEvent) => void;
  onPlaybackRateChange?: (event: YTPlayerEvent) => void;
  onError?: (event: YTPlayerEvent) => void;
  onApiChange?: (event: YTPlayerEvent) => void;
}

interface YTPlayerConfig {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: YTPlayerVars;
  events?: YTPlayerEvents;
}

declare namespace YT {
  class Player {
    constructor(id: string | HTMLElement, config?: YTPlayerConfig);
    destroy(): void;
    getCurrentTime(): number;
    getDuration(): number;
    getVideoUrl(): string;
    getVideoEmbedCode(): string;
    getAvailableQualityLevels(): string[];
    getPlaybackQuality(): string;
    setPlaybackQuality(suggestedQuality: string): void;
    getAvailablePlaybackRates(): number[];
    getPlaybackRate(): number;
    setPlaybackRate(suggestedRate: number): void;
    getPlayerState(): number;
    getVolume(): number;
    setVolume(volume: number): void;
    isMuted(): boolean;
    mute(): void;
    unMute(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getIframe(): HTMLIFrameElement;
    pauseVideo(): void;
    playVideo(): void;
    stopVideo(): void;
    clearVideo(): void;
    cueVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
    cueVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
    loadVideoById(videoId: string, startSeconds?: number, suggestedQuality?: string): void;
    loadVideoByUrl(mediaContentUrl: string, startSeconds?: number, suggestedQuality?: string): void;
  }

  const PlayerState: YTPlayerState;
}

interface Window {
  YT: typeof YT;
  onYouTubeIframeAPIReady?: () => void;
}

