// src/app/app.routes.ts
import {Routes} from '@angular/router';
import {ProductFeedComponent} from './home/product-feed/product-feed.component';
import {ProductDetailComponent} from './home/product-detail/product-detail.component';
import {MyProductsComponent} from './my-products/my-products.component';
import {AddProductWizardComponent} from './products/add-product-wizard/add-product-wizard.component';

export const routes: Routes = [
  {path: '', component: ProductFeedComponent}, // лента
  {path: 'product/:slug', component: ProductDetailComponent}, // детализация
  {path: '**', redirectTo: ''},
  {path: 'product/add', component: AddProductWizardComponent}, // добавление
  {path: 'products', component: MyProductsComponent}, // мои товары
];

