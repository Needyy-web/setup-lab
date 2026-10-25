
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { Category, Product } from '../types';

const API_URL = 'http://localhost:7070/api';
const PAGE_SIZE = 6;
const ALL_CATEGORY = { id: 0, title: 'Все' };

type ProductsResponse = {
    products: Product[];
    total: number;
};

export default function Catalog() {
    const [searchParams, setSearchParams] = useSearchParams();

    const urlParam = searchParams.get('q') ?? '';
    const categoryParam = searchParams.get('categoryId');

    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState(urlParam);

    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    const [itemsError, setItemsError] = useState('');
    const [categoriesError, setCategoriesError] = useState('');
    const [loadMoreError, setLoadMoreError] = useState('');

    const hasMoreItems = items.length < total;

    useEffect(() => {
        setSearchInput(urlParam);
    }, [urlParam]);

    useEffect(() => {
        async function getCategories() {
            setIsLoadingCategories(true);
            setCategoriesError('');

            try {
                const response = await fetch(`${API_URL}/categories`);

                if (!response.ok) {
                    throw new Error('Ошибка загрузки категорий');
                }

                const data: Category[] = await response.json();
                setCategories(data);
            } catch (error) {
                setCategoriesError(
                    error instanceof Error
                        ? error.message
                        : 'Ошибка загрузки категорий',
                );
            } finally {
                setIsLoadingCategories(false);
            }
        }

        getCategories();
    }, []);

    const getParams = (offset = 0) => {
        const params = new URLSearchParams();

        if (urlParam.trim()) {
            params.set('q', urlParam.trim());
        }

        if (categoryParam) {
            params.set('categoryId', categoryParam);
        }

        params.set('offset', String(offset));
        params.set('limit', String(PAGE_SIZE));

        return `?${params.toString()}`;
    };

    useEffect(() => {
        const controller = new AbortController();

        async function getProducts() {
            setIsLoadingItems(true);
            setItemsError('');
            setLoadMoreError('');
            setItems([]);

            try {
                const response = await fetch(
                    `${API_URL}/products${getParams()}`,
                    { signal: controller.signal },
                );

                if (!response.ok) {
                    throw new Error('Ошибка загрузки товаров');
                }

                const data: ProductsResponse = await response.json();

                setItems(data.products);
                setTotal(data.total);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }

                setItemsError(
                    error instanceof Error
                        ? error.message
                        : 'Ошибка загрузки товаров',
                );
                setItems([]);
                setTotal(0);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingItems(false);
                }
            }
        }

        getProducts();

        return () => controller.abort();
    }, [urlParam, categoryParam]);

    const handleChangeCategoryId = (selectedCategoryId: number) => {
        const params = new URLSearchParams(searchParams);

        if (selectedCategoryId === ALL_CATEGORY.id) {
            params.delete('categoryId');
        } else {
            params.set('categoryId', String(selectedCategoryId));
        }

        params.delete('offset');
        setSearchParams(params);
    };

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const params = new URLSearchParams(searchParams);
        const value = searchInput.trim();

        if (value) {
            params.set('q', value);
        } else {
            params.delete('q');
        }

        params.delete('offset');
        setSearchParams(params);
    };

    const handleLoadMore = async () => {
        setIsLoadingMore(true);
        setLoadMoreError('');

        try {
            const response = await fetch(
                `${API_URL}/products${getParams(items.length)}`,
            );

            if (!response.ok) {
                throw new Error('Ошибка загрузки товаров');
            }

            const data: ProductsResponse = await response.json();

            setItems((previousItems) => {
                const existingIds = new Set(previousItems.map((item) => item.id));
                const newItems = data.products.filter(
                    (item) => !existingIds.has(item.id),
                );

                return [...previousItems, ...newItems];
            });

            setTotal(data.total);
        } catch (error) {
            setLoadMoreError(
                error instanceof Error
                    ? error.message
                    : 'Ошибка загрузки товаров',
            );
        } finally {
            setIsLoadingMore(false);
        }
    };

    return (
        <main className="container">
            <div className="row">
                <div className="col">
                    <div className="banner">
                        <img
                            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=85"
                            className="img-fluid"
                            alt="Подберите технику для своего рабочего пространства"
                        />
                        <h2 className="banner-header">SETUP LAB</h2>
                    </div>

                    <section className="catalog">
                        <h2 className="text-center">Каталог техники</h2>

                        <form
                            className="catalog-search-form form-inline"
                            onSubmit={handleSearchSubmit}
                        >
                            <input
                                className="form-control"
                                placeholder="Поиск техники..."
                                aria-label="Поиск товаров"
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                value={searchInput}
                            />
                            <button
                                type="submit"
                                className="btn btn-outline-primary"
                            >
                                Найти
                            </button>
                        </form>

                        {isLoadingCategories && <div>Загрузка категорий...</div>}

                        {categoriesError && <div>{categoriesError}</div>}

                        {!isLoadingCategories && !categoriesError && (
                            <ul className="catalog-categories nav justify-content-center">
                                {[ALL_CATEGORY, ...categories].map((category) => (
                                    <li className="nav-item" key={category.id}>
                                        <button
                                            type="button"
                                            className={`nav-link ${
                                                category.id ===
                                                Number(categoryParam) ||
                                                (category.id === ALL_CATEGORY.id &&
                                                    categoryParam === null)
                                                    ? 'active'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                handleChangeCategoryId(category.id)
                                            }
                                        >
                                            {category.title}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {isLoadingItems && (
                            <div className="text-center">
                                Загрузка товаров...
                            </div>
                        )}

                        {itemsError && (
                            <div className="text-center">{itemsError}</div>
                        )}

                        {!isLoadingItems && !itemsError && (
                            <>
                                <div className="row">
                                    {items.map((item) => (
                                        <div
                                            className="col-4"
                                            key={item.id}
                                        >
                                            <div className="card catalog-item-card">
                                                <img
                                                    className="card-img-top img-fluid"
                                                    src={item.images[0]}
                                                    alt={item.title}
                                                />

                                                <div className="card-body">
                                                    <p className="card-text">
                                                        {item.brand}
                                                    </p>

                                                    <h3 className="card-title">
                                                        {item.title}
                                                    </h3>

                                                    <p className="card-text">
                                                        {item.shortDescription}
                                                    </p>

                                                    <p className="card-text">
                                                        {item.price.toLocaleString(
                                                            'ru-RU',
                                                        )}{' '}
                                                        ₽
                                                    </p>

                                                    <Link
                                                        className="btn btn-outline-primary"
                                                        to={`/catalog/${item.id}.html`}
                                                    >
                                                        Подробнее
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {items.length === 0 && (
                                    <p className="text-center">
                                        Товары не найдены.
                                    </p>
                                )}

                                {hasMoreItems && (
                                    <div className="text-center">
                                        {loadMoreError && (
                                            <div>{loadMoreError}</div>
                                        )}

                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMore}
                                        >
                                            {isLoadingMore
                                                ? 'Загрузка...'
                                                : 'Загрузить ещё'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}