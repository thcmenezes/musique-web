import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Album } from '../../models/album.model';
import { Artist } from '../../models/artist.model';

export interface CreateArtistPayload {
  name: string;
}

export interface UpdateArtistPayload {
  name: string;
}

export interface CreateAlbumPayload {
  name: string;
  releaseYear: number;
  rating: number;
  artistId: number;
}

export interface UpdateAlbumPayload {
  name: string;
  releaseYear: number;
  rating: number;
  artistId: number;
}

export interface AddMoodAlbumPayload {
  albumId: number;
}

@Injectable({ providedIn: 'root' })
export class MusiqueApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getArtists(query?: string): Observable<Artist[]> {
    let params = new HttpParams();
    if (query?.trim()) {
      params = params.set('q', query.trim());
    }
    return this.http.get<Artist[]>(`${this.baseUrl}/artists`, { params });
  }

  getAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.baseUrl}/albums`);
  }

  getAlbumById(id: number): Observable<Album> {
    return this.http.get<Album>(`${this.baseUrl}/albums/${id}`);
  }

  createArtist(payload: CreateArtistPayload): Observable<Artist> {
    return this.http.post<Artist>(`${this.baseUrl}/artists`, payload);
  }

  updateArtist(id: number, payload: UpdateArtistPayload): Observable<Artist> {
    return this.http.put<Artist>(`${this.baseUrl}/artists/${id}`, payload);
  }

  deleteArtist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/artists/${id}`);
  }

  createAlbum(payload: CreateAlbumPayload): Observable<Album> {
    return this.http.post<Album>(`${this.baseUrl}/albums`, payload);
  }

  updateAlbum(id: number, payload: UpdateAlbumPayload): Observable<Album> {
    return this.http.put<Album>(`${this.baseUrl}/albums/${id}`, payload);
  }

  deleteAlbum(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/albums/${id}`);
  }

  getMoodAlbums(): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.baseUrl}/mood`);
  }

  addAlbumToMood(payload: AddMoodAlbumPayload): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/mood`, payload);
  }

  removeAlbumFromMood(albumId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/mood/${albumId}`);
  }
}
