import { Artist } from './artist.model';

export interface Album {
  id: number;
  name: string;
  releaseYear: number;
  rating: number;
  coverUrl?: string;
  idExternal?: string;
  spotifyUrl?: string;
  artist: Artist;
}
