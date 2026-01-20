import { CommonModule } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { Product } from '../../core/models/product';
import { RouterLink } from '@angular/router';
import { Component, Input, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-virtual-feed',
  template: `
    <cdk-virtual-scroll-viewport
      itemSize="320"
      minBufferPx="600"
      maxBufferPx="1200"
      class="feed-viewport"
      (scrolledIndexChange)="handleScroll($event)">

      <div class="product-grid">
        <a *cdkVirtualFor="let product of products; let i = index"
           [routerLink]="['/product', productSlug(product)]"
           (click)="saveScrollIndex(i)"
           class="product-card-link">
          <div class="product-card">
            <img [src]="product.images?.[0]" [alt]="product.name" class="product-image"/>
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">{{ product.price | number }} {{ product.currency }}</p>
          </div>
        </a>
      </div>

    </cdk-virtual-scroll-viewport>
  `,
  styleUrls: ['./product-feed.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollingModule]
})
export class VirtualFeedComponent implements AfterViewInit {
  @ViewChild(CdkVirtualScrollViewport) viewport?: CdkVirtualScrollViewport;

  @Input() products: Product[] = [];
  @Input() loading = false;
  @Output() onScroll = new EventEmitter<void>();

  // сохраняем индекс прокрутки в sessionStorage
  saveScrollIndex(index: number | undefined): void {
    if (typeof index === 'number' && !Number.isNaN(index)) {
      try {
        sessionStorage.setItem('productFeedScrollIndex', String(index));
      } catch (e) { /* ignore */ }
    }
  }

  handleScroll(index: number | undefined): void {
    this.saveScrollIndex(index);
    this.onScroll.emit();
  }

  ngAfterViewInit(): void {
    try {
      const raw = sessionStorage.getItem('productFeedScrollIndex');
      const idx = raw ? parseInt(raw, 10) : NaN;
      if (!Number.isNaN(idx) && this.viewport) {
        setTimeout(() => this.viewport?.scrollToIndex(idx, 'auto'), 0);
      }
    } catch (e) { /* ignore */ }
  }

  // формируем seo-friendly slug: "<id>-<slugified-name>"
  productSlug(p: Product): string {
    const slugPart = p.sku && p.sku.trim().length > 0 ? p.sku : this.slugify(p.name || '');
    return `${p.id}-${slugPart}`;
  }

  private slugify(text: string): string {
    return text
      .toString()
      .normalize('NFKD')            // удаление диакритики
      .replace(/[\u0300-\u036F]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')  // заменяем всё не-алфавитно-цифровое на '-'
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }
}
