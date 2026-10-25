import { Link } from 'react-router-dom';

export default function ErrorPage() {
    return (
        <main className="error-page">
            <section className="error-page__content">
                <p className="error-page__code">404</p>

                <h1>Кажется, здесь пусто.</h1>

                <p>
                    Страница, которую ты ищешь, не существует
                    или была перемещена.
                </p>

                <div className="error-page__actions">
                    <Link to="/" className="error-page__home">
                        На главную
                    </Link>

                    <Link to="/catalog.html">
                        Перейти в каталог
                    </Link>
                </div>
            </section>
        </main>
    );
}
