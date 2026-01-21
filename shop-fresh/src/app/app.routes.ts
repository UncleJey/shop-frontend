// src/app/app.routes.ts
import {Routes} from '@angular/router';
import {ProductFeedComponent} from './home/product-feed/product-feed.component';
import {ProductDetailComponent} from './home/product-detail/product-detail.component';
import {MyProductsComponent} from './my-products/my-products.component';
import {CreateWizardComponent} from './create-wizard/create-wizard.component';

export const routes: Routes = [
  {path: '', component: ProductFeedComponent}, // лента
  {path: 'product/:slug', component: ProductDetailComponent}, // детализация
  {path: 'create-wizard', component: CreateWizardComponent}, // добавить
  {path: 'products', component: MyProductsComponent}, // мои товары


  // Маршрут-перехватчик ВСЕГДА должен быть последним
  {path: '**', redirectTo: ''},
];

