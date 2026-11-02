import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../models/models';
import { SongService } from './song.service';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private audio = new Audio();

  private currentSongSubject  = new BehaviorSubject<Song | null>(null);
  private isPlayingSubject    = new BehaviorSubject<boolean>(false);
  private progressSubject     = new BehaviorSubject<number>(0);
  private volumeSubject       = new BehaviorSubject<number>(0.8);
  private durationSubject     = new BehaviorSubject<number>(0);
  private queueSubject        = new BehaviorSubject<Song[]>([]);
  private errorSubject        = new BehaviorSubject<string>('');
  private durationMapSubject  = new BehaviorSubject<Record<string, number>>({});

  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$   = this.isPlayingSubject.asObservable();
  progress$    = this.progressSubject.asObservable();
  volume$      = this.volumeSubject.asObservable();
  duration$    = this.durationSubject.asObservable();
  queue$       = this.queueSubject.asObservable();
  error$       = this.errorSubject.asObservable();
  durationMap$ = this.durationMapSubject.asObservable();

  constructor(private songService: SongService) {
    this.audio.volume = 0.8;
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.duration) {
        this.progressSubject.next((this.audio.currentTime / this.audio.duration) * 100);
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      const realDuration = this.audio.duration;
      if (!realDuration || !isFinite(realDuration)) return;

      const roundedDuration = Math.round(realDuration);
      this.durationSubject.next(realDuration);
      this.errorSubject.next('');

      const song = this.currentSongSubject.value;
      if (!song) return;

      // Store in durationMap so all song cards can subscribe and update
      const currentMap = this.durationMapSubject.value;
      this.durationMapSubject.next({ ...currentMap, [song._id]: roundedDuration });

      const storedDuration = song.duration || 0;
      const isDurationWrong = storedDuration === 180 || storedDuration === 0 ||
        Math.abs(storedDuration - roundedDuration) > 5;

      if (isDurationWrong) {
        const updatedSong = { ...song, duration: roundedDuration };
        this.currentSongSubject.next(updatedSong);

        const queue = this.queueSubject.value;
        this.queueSubject.next(
          queue.map(s => s._id === song._id ? { ...s, duration: roundedDuration } : s)
        );

        this.songService.updateDuration(song._id, roundedDuration).subscribe({
          error: (e: any) => console.warn('Duration update failed:', e.message)
        });
      }
    });

    this.audio.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
      this.playNext();
    });

    this.audio.addEventListener('error', () => {
      this.isPlayingSubject.next(false);
      const song = this.currentSongSubject.value;
      if (song) {
        this.errorSubject.next(`Cannot play "${song.title}" — audio source unavailable.`);
        setTimeout(() => this.errorSubject.next(''), 4000);
      }
    });

    this.audio.addEventListener('playing', () => {
      this.isPlayingSubject.next(true);
      this.errorSubject.next('');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlayingSubject.next(false);
    });
  }

  getRealDuration(songId: string, storedDuration: number): number {
    return this.durationMapSubject.value[songId] ?? storedDuration;
  }

  playSong(song: Song, queue?: Song[], context: 'home' | 'search' | 'playlist' | 'trending' = 'home'): void {
    if (queue) this.queueSubject.next(queue);

    const isSameSong = this.currentSongSubject.value?._id === song._id;

    if (isSameSong) {
      if (context === 'playlist') {
        this.audio.currentTime = 0;
        this.progressSubject.next(0);
        if (this.audio.paused) {
          this.audio.play()
            .then(() => this.isPlayingSubject.next(true))
            .catch(() => this.isPlayingSubject.next(false));
        }
      } else {
        this.togglePlay();
      }
      return;
    }

    if (!song.audioUrl) {
      this.errorSubject.next(`"${song.title}" has no audio source.`);
      setTimeout(() => this.errorSubject.next(''), 4000);
      return;
    }

    this.currentSongSubject.next(song);
    this.progressSubject.next(0);
    this.errorSubject.next('');

    this.audio.src = song.audioUrl;
    this.audio.load();

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlayingSubject.next(true);
          this.songService.incrementPlay(song._id).subscribe();
        })
        .catch((err: any) => {
          console.warn('Playback failed:', err.message);
          this.isPlayingSubject.next(false);
          if (err.name !== 'AbortError') {
            this.errorSubject.next(`Cannot play "${song.title}". Check the audio source.`);
            setTimeout(() => this.errorSubject.next(''), 4000);
          }
        });
    }
  }

  togglePlay(): void {
    if (!this.currentSongSubject.value) return;
    if (this.audio.paused) {
      this.audio.play()
        .then(() => this.isPlayingSubject.next(true))
        .catch(() => this.isPlayingSubject.next(false));
    } else {
      this.audio.pause();
      this.isPlayingSubject.next(false);
    }
  }

  playNext(): void {
    const queue   = this.queueSubject.value;
    const current = this.currentSongSubject.value;
    if (!queue.length || !current) return;
    const idx = queue.findIndex(s => s._id === current._id);
    if (idx < queue.length - 1) this.playSong(queue[idx + 1], queue, 'home');
  }

  playPrev(): void {
    const queue   = this.queueSubject.value;
    const current = this.currentSongSubject.value;
    if (!queue.length || !current) return;
    if (this.audio.currentTime > 3) { this.audio.currentTime = 0; return; }
    const idx = queue.findIndex(s => s._id === current._id);
    if (idx > 0) this.playSong(queue[idx - 1], queue, 'home');
  }

  seek(percent: number): void {
    if (this.audio.duration) {
      this.audio.currentTime = (percent / 100) * this.audio.duration;
    }
  }

  setVolume(volume: number): void {
    this.audio.volume = volume;
    this.volumeSubject.next(volume);
  }

  stop(): void {
    this.audio.pause();
    this.audio.src = '';
    this.currentSongSubject.next(null);
    this.isPlayingSubject.next(false);
    this.progressSubject.next(0);
    this.durationSubject.next(0);
    this.queueSubject.next([]);
    this.errorSubject.next('');
  }

  get currentTime(): number { return this.audio.currentTime; }
  get duration():    number { return this.audio.duration || 0; }

  formatTime(secs: number): string {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}