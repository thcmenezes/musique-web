import { Album } from '../../models/album.model';
import { Artist } from '../../models/artist.model';

export function sortArtistsAlphabetically(artists: Artist[]): Artist[] {
  return [...artists].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
}

export function sortAlbumsByReleaseYearDesc(albums: Album[]): Album[] {
  return [...albums].sort((a, b) => {
    const byYear = b.releaseYear - a.releaseYear;
    if (byYear !== 0) {
      return byYear;
    }
    return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
  });
}
