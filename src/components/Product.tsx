import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Product, ProductCartItem } from '../types';

const API_URL = 'http://localhost:7070/api';

export default function Product() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        async function loadProduct() {
            setIsLoading(true);
            setError('');
            setProduct(null);
            setSelectedImage(0);

            try {
                const response = await fetch(
                    `${API_URL}/products/${id}`,
                    { signal: controller.signal },
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? 'Товар не найден'
                            : 'Не удалось загрузить товар',
                    );
                }

                const data: Product = await response.json();
                setProduct(data);
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === 'AbortError'
                ) {
                    return;
                }

                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ошибка загрузки товара',
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        if (id) {
            loadProduct();
        } else {
            setError('Не указан товар');
            setIsLoading(false);
        }

        return () => controller.abort();
    }, [id]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('ru-RU').format(price) + ' ₽';

    const handleAddToCart = () => {
        if (!product || !product.inStock) {
            return;
        }

        let cart: ProductCartItem[] = [];

        try {
            const savedCart = localStorage.getItem('cart');

            if (savedCart) {
                const parsedCart: unknown = JSON.parse(savedCart);

                if (Array.isArray(parsedCart)) {
                    cart = parsedCart as ProductCartItem[];
                }
            }
        } catch {
            cart = [];
        }

        const existingItem = cart.find(
            (item) => item.id === product.id,
        );

        if (existingItem) {
            existingItem.count = Math.min(
                existingItem.count + quantity,
                10,
            );
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                count: quantity,
                image: product.images[0] ?? '',
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event('cartUpdated'));

        navigate('/cart.html');
    };

    if (isLoading) {
        return <main className="product-page">Загружаем товар...</main>;
    }

    if (error || !product) {
        return (
            <main className="product-page">
                <p role="alert">{error || 'Товар не найден'}</p>
                <Link to="/catalog.html">Вернуться в каталог</Link>
            </main>
        );
    }

    return (
        <main className="product-page">
            <nav className="product-page__breadcrumbs">
                <Link to="/">Главная</Link>
                <span>/</span>
                <Link to="/catalog.html">Каталог</Link>
                <span>/</span>
                <span>{product.title}</span>
            </nav>

            <section className="product-detail">
                <div className="product-detail__gallery">
                    <div className="product-detail__main-image">
                        {product.images.length > 0 ? (
                            <img
                                src={product.images[selectedImage]}
                                alt={product.title}
                            />
                        ) : (
                            <p>Изображение отсутствует</p>
                        )}
                    </div>

                    {product.images.length > 1 && (
                        <div className="product-detail__thumbnails">
                            {product.images.map((image, index) => (
                                <button
                                    type="button"
                                    key={`${image}-${index}`}
                                    className={
                                        selectedImage === index
                                            ? 'product-detail__thumbnail product-detail__thumbnail--active'
                                            : 'product-detail__thumbnail'
                                    }
                                    onClick={() => setSelectedImage(index)}
                                    aria-label={`Изображение ${index + 1}`}
                                >
                                    <img src={image} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-detail__info">
                    <p className="product-detail__brand">
                        {product.brand}
                    </p>

                    <h1>{product.title}</h1>

                    <p className="product-detail__description">
                        {product.description}
                    </p>

                    <div className="product-detail__price">
                        {product.oldPrice && (
                            <del>{formatPrice(product.oldPrice)}</del>
                        )}

                        <strong>{formatPrice(product.price)}</strong>
                    </div>

                    <p>
                        {product.inStock
                            ? 'В наличии'
                            : 'Временно нет в наличии'}
                    </p>

                    <div className="product-detail__quantity">
                        <label htmlFor="product-quantity">
                            Количество
                        </label>

                        <select
                            id="product-quantity"
                            value={quantity}
                            onChange={(event) =>
                                setQuantity(Number(event.target.value))
                            }
                            disabled={!product.inStock}
                        >
                            {Array.from({ length: 10 }, (_, index) => (
                                <option
                                    key={index + 1}
                                    value={index + 1}
                                >
                                    {index + 1}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        className="product-detail__add-to-cart"
                        disabled={!product.inStock}
                        onClick={handleAddToCart}
                    >
                        {product.inStock
                            ? 'Добавить в корзину'
                            : 'Нет в наличии'}
                    </button>

                    <p className="product-detail__delivery">
                        Технические характеристики и описание товара указаны
                        ниже.
                    </p>
                </div>
            </section>

            <section className="product-detail__specifications">
                <h2>Характеристики</h2>

                <dl>
                    {Object.entries(product.specifications).map(
                        ([name, value]) => (
                            <div key={name}>
                                <dt>{name}</dt>
                                <dd>{value}</dd>
                            </div>
                        ),
                    )}
                </dl>
            </section>
        </main>
    );
}
