import { Component, OnInit } from '@angular/core';
import { SongService } from '../../services/song.service';
import { PlayerService } from '../../services/player.service';
import { Song } from '../../models/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredSongs: Song[] = [];
  trendingSongs: Song[] = [];
  recentSongs:   Song[] = [];
  allSongsQueue: Song[] = [];
  totalSongs = 0;
  loading = true;

  constructor(
    public songService: SongService,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    // Featured: marked featured, sorted by plays
    this.songService.getFeatured().subscribe({
      next: res => this.featuredSongs = res.songs,
      error: () => {}
    });

    // Trending: top 5 by plays
    this.songService.getTrending().subscribe({
      next: songs => this.trendingSongs = songs.slice(0, 5),
      error: () => {}
    });

    // All Songs: fetch every song in DB (limit=1000 covers any real-world case),
    // sorted newest first so admin-added songs appear at top immediately.
    // The API returns total count separately — use that for the hero stat.
    this.songService.getSongs({ limit: 1000, sort: 'newest' }).subscribe({
      next: res => {
        this.recentSongs   = res.songs;
        this.allSongsQueue = res.songs;
        this.totalSongs    = res.total;   // real count from MongoDB
        this.loading       = false;
      },
      error: () => { this.loading = false; }
    });
  }

  playSong(song: Song): void {
    this.playerService.playSong(song, this.trendingSongs, 'trending');
  }

  formatPlays(plays: number): string {
    if (!plays) return '0';
    if (plays >= 1000000) return (plays / 1000000).toFixed(1) + 'M';
    if (plays >= 1000)    return (plays / 1000).toFixed(1) + 'K';
    return plays.toString();
  }
}