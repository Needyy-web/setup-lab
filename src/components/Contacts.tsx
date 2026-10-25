import { Link } from 'react-router-dom';

export default function Contacts() {
    return (
        <main className="contacts-page">
            <nav className="contacts-page__breadcrumbs">
                <Link to="/">Главная</Link>
                <span>/</span>
                <span>Контакты</span>
            </nav>

            <section className="contacts-page__intro">
                <p>НА СВЯЗИ</p>
                <h1>
                    Есть вопросы?
                    <br />
                    Давай обсудим.
                </h1>
                <p>
                    Нужна помощь с выбором техники или комплекта?
                    Напиши нам — поможем разобраться.
                </p>
            </section>

            <section className="contacts-page__details">
                <article>
                    <h2>Электронная почта</h2>
                    <p>
                        По вопросам товаров и заказов
                    </p>
                    <a href="mailto:hello@setup-lab.example">
                        Почта для связи вскоре появится
                    </a>
                </article>

                <article>
                    <h2>Подбор техники</h2>
                    <p>
                        Расскажи, для чего тебе нужен сетап,
                        а мы поможем сориентироваться в каталоге.
                    </p>
                    <Link to="/catalog.html">
                        Перейти в каталог
                    </Link>
                </article>
            </section>

            <section className="contacts-page__note">
                <h2>SETUP LAB</h2>
                <p>
                    Техника для работы, учёбы, игр и создания контента.
                    Всё необходимое для твоего пространства — в одном месте.
                </p>
            </section>
        </main>
    );
}
