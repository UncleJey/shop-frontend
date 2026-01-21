// product-feed.component.ts
import {Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, AfterViewInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Product, ProductFeedResponse} from '../../core/models/product';
import {ProductService} from '../../core/services/product.service';
import {RouterLink} from '@angular/router';
import {isPlatformBrowser} from '@angular/common';
import {PLATFORM_ID, Inject} from '@angular/core';
import {HeaderComponent} from '../../header/header.component';

@Component({
  selector: 'app-product-feed',
  template: `
    <div #virtualContainer></div>

    <!-- Fallback для SSR -->
    <div *ngIf="!isBrowser" class="product-grid">
      <div *ngFor="let product of products.slice(0, 10)" class="product-card">
        <img [src]="product.images[0]" [alt]="product.name" class="product-image"/>
        <h3 class="product-name">{{ product.name }}</h3>
        <p class="product-price">{{ product.price | number }} {{ product.currency }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./product-feed.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent]
})
export class ProductFeedComponent implements OnInit, AfterViewInit {
  isBrowser = false;
  products: Product[] = [];
  page = 1;
  pageSize = 20;
  hasMore = true;
  loading = false;
  error: string | null = null;

  @ViewChild('virtualContainer', {read: ViewContainerRef}) container!: ViewContainerRef;

  constructor(
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      // Загружаем первые товары для SSR
      this.productService.getFeed(1, 10).subscribe(response => {
        this.products = response.items;
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Динамически загружаем компонент со скроллом
      import('./virtual-feed.component').then(module => {
        const componentRef = this.container.createComponent(module.VirtualFeedComponent);
        componentRef.instance.products = this.products;
        componentRef.instance.loading = this.loading;
        componentRef.instance.onScroll.subscribe(() => this.loadMore());
        this.loadMore(); // запускаем загрузку
      });
    }
  }

  loadMore(): void {
    if (this.loading || !this.hasMore) return;
    this.loading = true;
    this.productService.getFeed(this.page, this.pageSize).subscribe({
      next: (response) => {
        this.products.push(...response.items);
        this.hasMore = response.hasMore;
        this.page++;
        this.loading = false;
        // Обновляем инстанс компонента, если нужно
      },
      error: (err) => {
        this.error = 'Не удалось загрузить товары';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
