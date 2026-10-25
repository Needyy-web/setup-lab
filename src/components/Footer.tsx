import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-footer__main">
                <section className="site-footer__brand">
                    <Link to="/" className="site-footer__logo">
                        SETUP LAB<span>.</span>
                    </Link>
                    <p>
                        Техника и готовые решения для твоего
                        рабочего пространства.
                    </p>
                </section>

                <section className="site-footer__navigation">
                    <h2>Навигация</h2>
                    <ul>
                        <li>
                            <Link to="/">Главная</Link>
                        </li>
                        <li>
                            <Link to="/catalog.html">Каталог</Link>
                        </li>
                        <li>
                            <Link to="/about.html">О проекте</Link>
                        </li>
                        <li>
                            <Link to="/contacts.html">Контакты</Link>
                        </li>
                    </ul>
                </section>

                <section className="site-footer__help">
                    <h2>Помощь</h2>
                    <ul>
                        <li>
                            <Link to="/cart.html">Корзина</Link>
                        </li>
                        <li>
                            <Link to="/contacts.html">
                                Задать вопрос
                            </Link>
                        </li>
                    </ul>
                </section>
            </div>

            <div className="site-footer__bottom">
                <p>
                    © {new Date().getFullYear()} SETUP LAB.
                </p>
                <Link to="/catalog.html">
                    Найти свою технику ↗
                </Link>
            </div>
        </footer>
    );
}
