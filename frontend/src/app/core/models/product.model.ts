export interface Product {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    stock: number;
    rating: number;
    image: string;
    description: string;
}

export interface ProductPage {
    items: Product[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}