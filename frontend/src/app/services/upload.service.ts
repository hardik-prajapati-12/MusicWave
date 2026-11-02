import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResult {
  audioUrl?: string;
  coverImage?: string;
}

@Injectable({ providedIn: 'root' })
export class UploadService {
  private apiUrl = 'http://localhost:5000/api/upload';

  constructor(private http: HttpClient) {}

  uploadSongFiles(audioFile?: File | null, imageFile?: File | null): Observable<UploadResult> {
    const formData = new FormData();
    if (audioFile) formData.append('audio', audioFile);
    if (imageFile) formData.append('image', imageFile);
    return this.http.post<UploadResult>(`${this.apiUrl}/song-files`, formData);
  }
}
