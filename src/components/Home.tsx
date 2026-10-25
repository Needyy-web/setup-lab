import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category, Product, SetupKit } from '../types';

const API_URL = 'http://localhost:7070/api';
const PAGE_SIZE = 6;

const ALL_CATEGORY: Category = {
    id: 0,
    title: 'Все',
};

export default function Home() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [topSales, setTopSales] = useState<Product[]>([]);
    const [kits, setKits] = useState<SetupKit[]>([]);

    const [selectedCategoryId, setSelectedCategoryId] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);

    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [error, setError] = useState('');

    useEffect(() => {
        async function loadHomeData() {
            try {
                const [categoriesResponse, salesResponse, kitsResponse] =
                    await Promise.all([
                        fetch(`${API_URL}/categories`),
fetch(`${API_URL}/top-sales`),
    fetch(`${API_URL}/kits`),
]);

if (
    !categoriesResponse.ok ||
    !salesResponse.ok ||
    !kitsResponse.ok
) {
    throw new Error('Не удалось загрузить данные главной страницы');
}

const categoriesData: Category[] =
    await categoriesResponse.json();
const salesData: Product[] = await salesResponse.json();
const kitsData: SetupKit[] = await kitsResponse.json();

setCategories([ALL_CATEGORY, ...categoriesData]);
setTopSales(salesData);
setKits(kitsData);
} catch (error) {
    setError(
        error instanceof Error
            ? error.message
            : 'Ошибка загрузки данных',
    );
} finally {
    setIsLoadingCategories(false);
}
}

loadHomeData();
}, []);

useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
        setIsLoadingProducts(true);
        setError('');

        try {
            const params = new URLSearchParams({
                limit: String(PAGE_SIZE),
                offset: '0',
            });

            if (selectedCategoryId !== 0) {
                params.set('categoryId', String(selectedCategoryId));
            }

            const response = await fetch(
                `${API_URL}/products?${params.toString()}`,
                { signal: controller.signal },
            );

            if (!response.ok) {
                throw new Error('Не удалось загрузить товары');
            }

            const data: {
                total: number;
                products: Product[];
            } = await response.json();

            setProducts(data.products);
            setTotalProducts(data.total);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return;
            }

            setProducts([]);
            setTotalProducts(0);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Ошибка загрузки товаров',
            );
        } finally {
            if (!controller.signal.aborted) {
                setIsLoadingProducts(false);
            }
        }
    }

    loadProducts();

    return () => controller.abort();
}, [selectedCategoryId]);

const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setError('');

    try {
        const params = new URLSearchParams({
            limit: String(PAGE_SIZE),
            offset: String(products.length),
        });

        if (selectedCategoryId !== 0) {
            params.set('categoryId', String(selectedCategoryId));
        }

        const response = await fetch(
            `${API_URL}/products?${params.toString()}`,
        );

        if (!response.ok) {
            throw new Error('Не удалось загрузить следующие товары');
        }

        const data: {
            total: number;
            products: Product[];
        } = await response.json();

        setProducts((previous) => [...previous, ...data.products]);
        setTotalProducts(data.total);
    } catch (error) {
        setError(
            error instanceof Error
                ? error.message
                : 'Ошибка загрузки товаров',
        );
    } finally {
        setIsLoadingMore(false);
    }
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat('ru-RU').format(price) + ' ₽';

return (
    <main className="home">
        <section className="home__hero">
            <p className="home__eyebrow">ТЕХНИКА ДЛЯ ТВОИХ ЗАДАЧ</p>

            <h1>
                Твой идеальный
                <br />
                <span>рабочий сетап.</span>
            </h1>

            <p className="home__hero-description">
                Подбираем технику для работы, учёбы, игр и создания контента.
                Только нужное — ничего лишнего.
            </p>

            <div className="home__hero-actions">
                <Link to="/catalog.html" className="home__primary-link">
                    Выбрать технику
                </Link>

                <a href="#setup-kits" className="home__secondary-link">
                    Смотреть комплекты
                </a>
            </div>
        </section>

        <section className="home__kits" id="setup-kits">
            <div className="home__section-heading">
                <div>
                    <p className="home__eyebrow">ГОТОВЫЕ РЕШЕНИЯ</p>
                    <h2>Сетапы под твои задачи</h2>
                </div>

                <Link to="/catalog.html">Вся техника →</Link>
            </div>

            {isLoadingCategories && (
                <p>Загружаем данные...</p>
            )}

            {!isLoadingCategories && kits.length === 0 && !error && (
                <p>Пока нет доступных комплектов.</p>
            )}

            <div className="home__kits-grid">
                {kits.map((kit) => (
                    <article className="home__kit-card" key={kit.id}>
                        <img src={kit.image} alt={kit.title} />

                        <div className="home__kit-content">
                            <h3>{kit.title}</h3>
                            <p>{kit.description}</p>

                            <ul>
                                {kit.reasons.map((reason) => (
                                    <li key={reason}>{reason}</li>
                                ))}
                            </ul>

                            <Link to="/catalog.html">
                                Подобрать технику →
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>

        <section className="home__products">
            <div className="home__section-heading">
                <div>
                    <p className="home__eyebrow">ВЫБОР SETUP LAB</p>
                    <h2>Популярная техника</h2>
                </div>

                <Link to="/catalog.html">Весь каталог →</Link>
            </div>

            {topSales.length > 0 && (
                <div className="home__featured">
                    {topSales.slice(0, 3).map((product) => (
                        <article
                            className="home__featured-card"
                            key={product.id}
                        >
                            <Link to={`/catalog/${product.id}.html`}>
                                <img
                                    src={product.images[0]}
                                    alt={product.title}
                                />
                            </Link>

                            <div>
                                <p>{product.brand}</p>
                                <h3>
                                    <Link
                                        to={`/catalog/${product.id}.html`}
                                    >
                                        {product.title}
                                    </Link>
                                </h3>
                                <strong>{formatPrice(product.price)}</strong>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <div className="home__section-heading">
                <div>
                    <p className="home__eyebrow">НАЙДИ СВОЁ</p>
                    <h2>Каталог техники</h2>
                </div>
            </div>

            {!isLoadingCategories && !error && (
                <div className="home__categories">
                    {categories.map((category) => (
                        <button
                            type="button"
                            key={category.id}
                            className={
                                selectedCategoryId === category.id
                                    ? 'home__category home__category--active'
                                    : 'home__category'
                            }
                            onClick={() =>
                                setSelectedCategoryId(category.id)
                            }
                        >
                            {category.title}
                        </button>
                    ))}
                </div>
            )}

            {error && <p role="alert">{error}</p>}

            {isLoadingProducts && <p>Загружаем товары...</p>}

            {!isLoadingProducts &&
                !error &&
                products.length === 0 && (
                    <p>В этой категории пока нет товаров.</p>
                )}

            <div className="home__products-grid">
                {products.map((product) => (
                    <article
                        className="home__product-card"
                        key={product.id}
                    >
                        <Link to={`/catalog/${product.id}.html`}>
                            <img
                                src={product.images[0]}
                                alt={product.title}
                            />
                        </Link>

                        <div className="home__product-content">
                            <p>{product.brand}</p>

                            <h3>
                                <Link
                                    to={`/catalog/${product.id}.html`}
                                >
                                    {product.title}
                                </Link>
                            </h3>

                            <p>{product.shortDescription}</p>

                            <strong>{formatPrice(product.price)}</strong>
                        </div>
                    </article>
                ))}
            </div>

            {!isLoadingProducts &&
                products.length < totalProducts &&
                !error && (
                    <button
                        type="button"
                        className="home__load-more"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore
                            ? 'Загружаем...'
                            : 'Показать ещё'}
                    </button>
                )}
        </section>
    </main>
);
}
