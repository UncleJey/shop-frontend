import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {of} from 'rxjs';
import {Product} from '../models/product';
import {TransferState, makeStateKey} from '@angular/core';
import { inject } from '@angular/core';
import { tap } from 'rxjs/operators'; // ← не забудь импорт!

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
    const cached = this.transferState.get(this.FEED_KEY, null);
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

}
