import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SongService } from '../../services/song.service';
import { Song } from '../../models/models';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  songs: Song[] = [];
  loading = false;
  searchQuery = '';
  selectedGenre = '';
  genres = ['Pop', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Electronic', 'R&B', 'Country', 'Indie', 'Metal'];
  totalResults = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private songService: SongService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.selectedGenre = params['genre'] || '';
      this.search();
    });

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => this.search());
  }

  onQueryChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  selectGenre(genre: string): void {
    this.selectedGenre = this.selectedGenre === genre ? '' : genre;
    this.search();
  }

  search(): void {
    this.loading = true;
    const filters: any = { limit: 50 };
    if (this.searchQuery.trim()) filters.search = this.searchQuery.trim();
    if (this.selectedGenre) filters.genre = this.selectedGenre;

    this.songService.getSongs(filters).subscribe({
      next: res => {
        this.songs = res.songs;
        this.totalResults = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedGenre = '';
    this.search();
  }
}
