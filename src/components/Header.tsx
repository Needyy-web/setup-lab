import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);

    const navigate = useNavigate();

    const updateCartCount = () => {
        const savedCart = localStorage.getItem('cart');

        if (!savedCart) {
            setCartCount(0);
            return;
        }

        try {
            const cart = JSON.parse(savedCart);
            setCartCount(
                Array.isArray(cart)
                    ? cart.reduce(
                          (total, item) => total + (Number(item.count) || 0),
                          0,
                      )
                    : 0,
            );
        } catch {
            setCartCount(0);
        }
    };

    useEffect(() => {
        updateCartCount();

        window.addEventListener('cartUpdated', updateCartCount);
        window.addEventListener('storage', updateCartCount);

        return () => {
            window.removeEventListener('cartUpdated', updateCartCount);
            window.removeEventListener('storage', updateCartCount);
        };
    }, []);

    const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (searchQuery.trim()) {
            navigate(`/catalog.html?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchVisible(false);
        }
    };

    return (
        <header className="site-header">
            <div className="site-header__inner">
                <Link to="/" className="site-header__logo">
                    SETUP <span>LAB</span>
                </Link>

                <nav className="site-header__nav">
                    <Link to="/">Главная</Link>
                    <Link to="/catalog.html">Каталог</Link>
                    <Link to="/about.html">О проекте</Link>
                    <Link to="/contacts.html">Контакты</Link>
                </nav>

                <div className="site-header__actions">
                    <button
                        type="button"
                        className="site-header__icon"
                        aria-label="Открыть поиск"
                        onClick={() => setIsSearchVisible(!isSearchVisible)}
                    >
                        Поиск
                    </button>

                    <Link
                        to="/cart.html"
                        className="site-header__cart"
                        aria-label={`Корзина, товаров: ${cartCount}`}
                    >
                        Корзина
                        {cartCount > 0 && (
                            <span className="site-header__cart-count">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {isSearchVisible && (
                <form
                    className="site-header__search"
                    onSubmit={handleSearchSubmit}
                >
                    <input
                        type="search"
                        placeholder="Найти технику..."
                        aria-label="Поиск товаров"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    <button type="submit">Найти</button>
                </form>
            )}
        </header>
    );
}
