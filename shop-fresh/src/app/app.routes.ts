// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProductFeedComponent } from './home/product-feed/product-feed.component';
import { ProductDetailComponent } from './home/product-detail/product-detail.component';

export const routes: Routes = [
  { path: '', component: ProductFeedComponent },
  { path: 'product/:slug', component: ProductDetailComponent },
  { path: '**', redirectTo: '' }
];

