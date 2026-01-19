import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  currentImageIndex = 0; // ← индекс текущего изображения
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    }
  }

  loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.currentImageIndex = 0; // сброс при загрузке
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Переключение изображения
  selectImage(index: number): void {
    if (this.product && index >= 0 && index < this.product.images.length) {
      this.currentImageIndex = index;
    }
  }

  // Навигация: предыдущее/следующее
  prevImage(): void {
    if (this.product) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
    }
  }

  nextImage(): void {
    if (this.product) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.product.images.length;
    }
  }
}
