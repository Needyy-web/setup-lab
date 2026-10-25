export type Category = {
    id: number;
    title: string;
};

export type Categories = Category[];

export type ProductUseCase = 'work' | 'study' | 'gaming' | 'content-creation';

export type Product = {
    id: number;
    slug: string;
    title: string;
    brand: string;
    categoryId: number;
    price: number;
    oldPrice?: number;
    images: string[];
    shortDescription: string;
    description: string;
    specifications: Record<string, string | number>;
    useCases: ProductUseCase[];
    featured: boolean;
    inStock: boolean;
};

export type Products = Product[];

export type ProductCartItem = {
    id: number;
    title: string;
    price: number;
    count: number;
    image: string;
};

export type ProductCartItems = ProductCartItem[];

export type SetupKit = {
    id: number;
    slug: string;
    title: string;
    purpose: ProductUseCase;
    description: string;
    productIds: number[];
    reasons: string[];
    image: string;
    featured: boolean;
};

export type SetupKits = SetupKit[];
