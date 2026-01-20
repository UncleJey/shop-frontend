import {CommonModule} from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {Product} from '../../core/models/product';
import {RouterLink} from '@angular/router';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-virtual-feed',
  template: `
    <cdk-virtual-scroll-viewport
      itemSize="320"
      minBufferPx="600"
      maxBufferPx="1200"
      class="feed-viewport"
      (scrolledIndexChange)="onScroll.emit()">

      <div class="product-grid">
        <a *cdkVirtualFor="let product of products"
           [routerLink]="['/product', product.id]"
           class="product-card-link">
          <div class="product-card">
            <img [src]="product.image" [alt]="product.name" class="product-image"/>
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">{{ product.price | number }} {{ product.currency }}</p>
          </div>
        </a>
      </div>

      <div *ngIf="loading && products.length > 0" class="loading-indicator">
        Загрузка...
      </div>
    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: ['./product-feed.component.scss'],
  standalone: true,
  imports: [CommonModule, ScrollingModule, RouterLink]
})
export class VirtualFeedComponent {
  @Input() products: Product[] = [];
  @Input() loading = false;
  @Output() onScroll = new EventEmitter<void>();
}
