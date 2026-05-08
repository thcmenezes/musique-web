import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { MusiqueApiService } from '../../../core/api/musique-api.service';
import { Album } from '../../../models/album.model';

export const albumDetailResolver: ResolveFn<Album> = (route) => {
  const api = inject(MusiqueApiService);
  return api.getAlbumById(Number(route.paramMap.get('id')));
};
