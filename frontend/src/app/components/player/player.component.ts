import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../models/models';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  currentSong: Song | null = null;
  isPlaying  = false;
  progress   = 0;
  volume     = 0.8;
  isMuted    = false;
  prevVolume = 0.8;
  errorMsg   = '';

  constructor(public playerService: PlayerService) {}

  ngOnInit(): void {
    this.playerService.currentSong$.subscribe(s  => this.currentSong = s);
    this.playerService.isPlaying$.subscribe(p    => this.isPlaying = p);
    this.playerService.progress$.subscribe(p     => this.progress = p);
    this.playerService.volume$.subscribe(v       => this.volume = v);
    this.playerService.error$.subscribe(err      => this.errorMsg = err);
  }

  onSeek(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.playerService.seek(val);
  }

  onVolume(event: Event): void {
    const val = +(event.target as HTMLInputElement).value;
    this.playerService.setVolume(val);
    this.isMuted = val === 0;
  }

  toggleMute(): void {
    if (this.isMuted) {
      this.playerService.setVolume(this.prevVolume);
      this.isMuted = false;
    } else {
      this.prevVolume = this.volume;
      this.playerService.setVolume(0);
      this.isMuted = true;
    }
  }

  get currentTimeStr(): string { return this.playerService.formatTime(this.playerService.currentTime); }
  get durationStr():    string { return this.playerService.formatTime(this.playerService.duration); }
}