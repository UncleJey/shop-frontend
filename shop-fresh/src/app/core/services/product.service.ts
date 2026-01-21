import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Product} from '../models/product';
import {TransferState, makeStateKey} from '@angular/core';
import {inject} from '@angular/core';
import {tap, catchError} from 'rxjs/operators';

export interface ProductFeedResponse {
  items: Product[];
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = '/api/product';
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  constructor(private pHttp: HttpClient) {
  }

  private FEED_KEY = makeStateKey<ProductFeedResponse>('feed');

  getFeed(page: number, pageSize: number = 20): Observable<ProductFeedResponse> {
    const cached = this.transferState.get(this.FEED_KEY, null as any);
    if (cached) {
      return of(cached);
    }

    const apiUrl = typeof window === 'undefined'
      ? 'http://localhost:5141/api/product'
      : '/api/product';

    return this.http.get<ProductFeedResponse>(
      `${apiUrl}/feed?page=${page}&pageSize=${pageSize}`
    ).pipe(
      tap(data => {
        if (typeof window === 'undefined') {
          this.transferState.set(this.FEED_KEY, data);
        }
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /*
  * Мои продукты
  * */
  getMyProducts(page: number, pageSize: number = 20): Observable<ProductFeedResponse> {
    const cached = this.transferState.get(this.FEED_KEY, null as any);
    if (cached) {
      return of(cached);
    }

    const apiUrl = typeof window === 'undefined'
      ? 'http://localhost:5141/api/product'
      : '/api/product';

    return this.http.get<ProductFeedResponse>(
      `${apiUrl}/feed?page=${page}&pageSize=${pageSize}`
    ).pipe(
      tap(data => {
        if (typeof window === 'undefined') {
          this.transferState.set(this.FEED_KEY, data);
        }
      })
    );
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/slug/${encodeURIComponent(slug)}`)
      .pipe(
        catchError((err) => {
          throw err;
        })
      );
  }

  // Новый: попытка взять продукт из transferState (SSR) кеша фида
  getCachedProduct(id: number): Product | null {
    try {
      const cached = this.transferState.get(this.FEED_KEY, null as any) as ProductFeedResponse | null;
      if (cached && Array.isArray(cached.items)) {
        const found = cached.items.find(it => it && it.id === id);
        return found ?? null;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }
}
