export interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  images: string[];
  description: string;
  buyLink: string;
  sku?: string;           // добавлено — с��ответствует API
  categoryName?: string;  // опционально, если нужно
}

export interface ProductFeedResponse {
  items: Product[];
  hasMore: boolean;
}
