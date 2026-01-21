import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../core/services/product.service';
import { Product } from '../core/models/product'; // Укажи правильный путь к модели Product
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.scss'
})
export class MyProductsComponent implements OnInit {

  products$: Observable<Product[]> | undefined;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    // Вызываем метод, который мы проверили в шаге 1
    this.products$ = this.productService.getMyProducts(0);
  }
}
