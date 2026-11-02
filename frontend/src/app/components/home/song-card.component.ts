import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Song } from '../../models/models';
import { PlayerService } from '../../services/player.service';
import { SongService } from '../../services/song.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-song-card',
  template: `
    <div class="song-card card" [class.now-playing]="isCurrentSong">
      <div class="card-cover" (click)="play()">
        <img [src]="song.coverImage || 'https://picsum.photos/seed/'+song._id+'/300/300'" [alt]="song.title" />
        <div class="card-overlay">
          <button class="play-btn-card">
            <i class="fas" [ngClass]="isCurrentSong && isPlaying ? 'fa-pause' : 'fa-play'"></i>
          </button>
        </div>
        <span *ngIf="song.featured" class="featured-badge">
          <i class="fas fa-star"></i> Featured
        </span>
      </div>

      <div class="card-body">
        <div class="card-meta">
          <span class="badge badge-accent">{{ song.genre }}</span>
          <span class="song-year">{{ song.releaseYear }}</span>
        </div>
        <h3 class="card-title" [title]="song.title">{{ song.title }}</h3>
        <p class="card-artist">{{ song.artist }}</p>
        <div class="card-footer">
          <span class="stat"><i class="fas fa-play"></i> {{ formatPlays(song.plays) }}</span>
          <span class="stat"><i class="fas fa-clock"></i> {{ songService.formatDuration(displayDuration) }}</span>
          <button class="like-btn" [class.liked]="isLiked" (click)="toggleLike($event)">
            <i class="fas fa-heart"></i>
            <span>{{ song.likes }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./song-card.component.css']
})
export class SongCardComponent implements OnInit, OnDestroy {
  @Input() song!: Song;
  @Input() queue: Song[] = [];
  @Output() likeToggled = new EventEmitter<void>();

  isLiked = false;
  isPlaying = false;
  isCurrentSong = false;
  displayDuration = 0;   // real duration from durationMap or song.duration

  private subs = new Subscription();

  constructor(
    public playerService: PlayerService,
    public songService: SongService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Set initial display duration from stored value
    this.displayDuration = this.song.duration || 0;

    this.subs.add(
      this.playerService.currentSong$.subscribe(s => {
        this.isCurrentSong = s?._id === this.song?._id;
      })
    );

    this.subs.add(
      this.playerService.isPlaying$.subscribe(p => this.isPlaying = p)
    );

    // Subscribe to durationMap — updates whenever a song is played and real duration is known
    this.subs.add(
      this.playerService.durationMap$.subscribe(map => {
        const real = map[this.song._id];
        if (real && real > 0) {
          this.displayDuration = real;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  play(): void {
    this.playerService.playSong(this.song, this.queue.length ? this.queue : [this.song], 'home');
  }

  toggleLike(e: Event): void {
    e.stopPropagation();
    if (!this.auth.isLoggedIn()) { alert('Please login to like songs'); return; }
    this.songService.likeSong(this.song._id).subscribe(res => {
      this.isLiked = res.liked;
      this.song.likes += res.liked ? 1 : -1;
      this.likeToggled.emit();
    });
  }

  formatPlays(plays: number): string {
    if (!plays) return '0';
    if (plays >= 1000000) return (plays / 1000000).toFixed(1) + 'M';
    if (plays >= 1000) return (plays / 1000).toFixed(1) + 'K';
    return plays.toString();
  }
}