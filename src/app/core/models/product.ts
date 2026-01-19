export interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  images: string[];
  description: string;
  buyLink: string;
}

export interface ProductFeedResponse {
  items: Product[];
  hasMore: boolean;
}
