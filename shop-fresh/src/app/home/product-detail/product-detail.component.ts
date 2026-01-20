import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product';
import { Router } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  currentImageIndex = 0;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const slugParam = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.paramMap.get('slug');

    if (!slugParam) {
      this.product = null;
      return;
    }

    // Если slug начинается с числа (формат "123-..."), используем id напрямую
    const idMatch = slugParam.match(/^(\d+)(?:-|$)/);
    if (idMatch) {
      const id = Number(idMatch[1]);
      if (!Number.isNaN(id)) {
        this.loadProductById(id);
        return;
      }
    }

    // Иначе пытаемся получить товар по slug (требует поддержки на сервере)
    this.loading = true;
    this.productService.getProductBySlug(slugParam)
      .pipe(
        catchError(() => {
          // Если не получилось по slug — считаем notFound
          this.loading = false;
          this.product = null;
          return of(null as Product | null);
        })
      )
      .subscribe((p) => {
        this.loading = false;
        if (p) {
          this.product = p;
          this.afterLoadMeta(p);
        } else {
          this.product = null;
        }
      });
  }

  private loadProductById(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.loading = false;
        this.afterLoadMeta(p);
      },
      error: () => {
        this.product = null;
        this.loading = false;
      }
    });
  }

  private afterLoadMeta(p: Product): void {
    // Title / Meta для SEO + OpenGraph
    this.title.setTitle(`${p.name} — Shop`);
    this.meta.updateTag({ name: 'description', content: p.description?.slice(0, 160) ?? '' });
    this.meta.updateTag({ property: 'og:title', content: p.name });
    this.meta.updateTag({ property: 'og:description', content: p.description ?? '' });
    if (p.images && p.images.length) {
      this.meta.updateTag({ property: 'og:image', content: p.images[0] });
    }

    // canonical link
    const canonical = this.document.querySelector("link[rel='canonical']");
    const canonicalUrl = `${this.document.location.origin}/product/${p.id}-${this.slugify(p.name)}`;
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    } else {
      const link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', canonicalUrl);
      this.document.head.appendChild(link);
    }

    // JSON-LD (Product schema)
    const scriptId = 'ld-json-product';
    let script = this.document.getElementById(scriptId) as HTMLScriptElement | null;
    const ld = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: p.name,
      image: p.images || [],
      description: p.description,
      sku: p.sku ?? String(p.id),
      offers: {
        '@type': 'Offer',
        priceCurrency: p.currency ?? 'RUB',
        price: p.price,
        availability: 'https://schema.org/InStock'
      }
    };
    const ldText = JSON.stringify(ld);
    if (script) {
      script.text = ldText;
    } else {
      script = this.document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.text = ldText;
      this.document.head.appendChild(script);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  selectImage(index: number): void {
    if (this.product && index >= 0 && index < this.product.images.length) {
      this.currentImageIndex = index;
    }
  }

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

  private slugify(text: string): string {
    return (text || '')
      .toString()
      .normalize('NFKD')
      .replace(/[\u0300-\u036F]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');
  }
}
