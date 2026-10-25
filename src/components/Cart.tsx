import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { ProductCartItem } from '../types';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:7070/api';

export default function Cart() {
    const [cart, setCart] = useState<ProductCartItem[]>([]);
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [agreement, setAgreement] = useState(false);

    const [isOrdering, setIsOrdering] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');

        if (!savedCart) return;

        try {
            const parsedCart: unknown = JSON.parse(savedCart);

            if (Array.isArray(parsedCart)) {
                setCart(parsedCart as ProductCartItem[]);
            }
        } catch {
            localStorage.removeItem('cart');
        }
    }, []);

    const saveCart = (newCart: ProductCartItem[]) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const handleRemove = (id: number) => {
        saveCart(cart.filter((item) => item.id !== id));
    };

    const handleChangeCount = (id: number, count: number) => {
        saveCart(
            cart.map((item) =>
                item.id === id ? { ...item, count } : item,
            ),
        );
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('ru-RU').format(price) + ' ₽';

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.count,
        0,
    );

    const handleSubmitOrder = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!agreement) {
            setError('Необходимо согласиться с правилами доставки');
            return;
        }

        setError('');
        setSuccess('');
        setIsOrdering(true);

        try {
            const response = await fetch(`${API_URL}/orders`, {
method: 'POST',
    headers: {
    'Content-Type': 'application/json',
},
body: JSON.stringify({
    owner: { phone, address },
    items: cart.map((item) => ({
        id: item.id,
        price: item.price,
        count: item.count,
    })),
}),
});

if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(
        data?.error || 'Не удалось оформить заказ',
    );
}

setCart([]);
localStorage.removeItem('cart');
window.dispatchEvent(new Event('cartUpdated'));

setPhone('');
setAddress('');
setAgreement(false);
setSuccess('Заказ успешно оформлен!');
} catch (error) {
    setError(
        error instanceof Error
            ? error.message
            : 'Ошибка оформления заказа',
    );
} finally {
    setIsOrdering(false);
}
};

return (
    <main className="cart-page">
        <nav className="cart-page__breadcrumbs">
            <Link to="/">Главная</Link>
            <span>/</span>
            <span>Корзина</span>
        </nav>

        <section className="cart-page__content">
            <h1>Корзина</h1>

            {success && <p role="status">{success}</p>}

            {cart.length === 0 ? (
                <div className="cart-page__empty">
                    <p>В корзине пока ничего нет.</p>
                    <Link to="/catalog.html">
                        Перейти в каталог
                    </Link>
                </div>
            ) : (
                <>
                    <div className="cart-page__items">
                        {cart.map((item) => (
                            <article
                                className="cart-page__item"
                                key={item.id}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                />

                                <div className="cart-page__item-info">
                                    <h2>{item.title}</h2>
                                    <p>{formatPrice(item.price)}</p>
                                </div>

                                <label>
                                    Количество
                                    <select
                                        value={item.count}
                                        onChange={(event) =>
                                            handleChangeCount(
                                                item.id,
                                                Number(event.target.value),
                                            )
                                        }
                                    >
                                        {Array.from(
                                            { length: 10 },
                                            (_, index) => (
                                                <option
                                                    key={index + 1}
                                                    value={index + 1}
                                                >
                                                    {index + 1}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>

                                <strong>
                                    {formatPrice(
                                        item.price * item.count,
                                    )}
                                </strong>

                                <button
                                    type="button"
                                    onClick={() => handleRemove(item.id)}
                                >
                                    Удалить
                                </button>
                            </article>
                        ))}
                    </div>

                    <div className="cart-page__total">
                        <span>Итого</span>
                        <strong>{formatPrice(totalPrice)}</strong>
                    </div>

                    <section className="cart-page__order">
                        <h2>Оформление заказа</h2>

                        <form onSubmit={handleSubmitOrder}>
                            <label htmlFor="phone">Телефон</label>
                            <input
                                id="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="+7 ..."
                                value={phone}
                                onChange={(event) =>
                                    setPhone(event.target.value)
                                }
                                required
                            />

                            <label htmlFor="address">
                                Адрес доставки
                            </label>
                            <input
                                id="address"
                                autoComplete="street-address"
                                placeholder="Город, улица, дом"
                                value={address}
                                onChange={(event) =>
                                    setAddress(event.target.value)
                                }
                                required
                            />

                            <label>
                                <input
                                    type="checkbox"
                                    checked={agreement}
                                    onChange={(event) =>
                                        setAgreement(event.target.checked)
                                    }
                                />
                                Согласен с правилами доставки
                            </label>

                            {error && <p role="alert">{error}</p>}

                            <button
                                type="submit"
                                disabled={isOrdering}
                            >
                                {isOrdering
                                    ? 'Оформление...'
                                    : 'Подтвердить заказ'}
                            </button>
                        </form>
                    </section>
                </>
            )}
        </section>
    </main>
);
}
