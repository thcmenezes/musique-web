import { HttpInterceptorFn } from '@angular/common/http';

export const apiBaseInterceptor: HttpInterceptorFn = (req, next) => {
  const enriched = req.clone({
    setHeaders: {
      Accept: 'application/json'
    }
  });
  return next(enriched);
};
