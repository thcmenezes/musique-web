import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { GlobalErrorService } from '../error/global-error.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const globalErrorService = inject(GlobalErrorService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      globalErrorService.pushError(
        error.error?.message || 'Não foi possível concluir a solicitação. Tente novamente.'
      );
      return throwError(() => error);
    })
  );
};
