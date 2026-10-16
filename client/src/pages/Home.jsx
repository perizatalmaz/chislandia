import { Link } from "react-router-dom";
import QuickProblem from "../components/QuickProblem.jsx";
import { useApi } from "../api.js";
import { useUser } from "../context/UserContext.jsx";

export default function Home() {
  const { data: stats } = useApi("/stats");
  const { user } = useUser();

  return (
    <>
      <section className="hero">
        <div>
          <h1>Математика, которую дети решают с удовольствием</h1>
          <p className="lead">
            Онлайн-занятия в маленьких группах. Считаем, играем, решаем задачи
            и видим прогресс после каждого урока. Первый урок любого курса бесплатный.
          </p>
          <div className="row">
            {user ? (
              <Link className="btn" to="/trainer">Открыть тренажёр</Link>
            ) : (
              <Link className="btn" to="/register">Зарегистрироваться</Link>
            )}
            <Link className="btn ghost" to="/courses">Смотреть курсы</Link>
          </div>
          {stats && (
            <p className="muted stats-line">
              Зарегистрировано учеников: {stats.users}. В тренажёре решено примеров: {stats.solved}.
            </p>
          )}
        </div>
        <QuickProblem />
      </section>

      <section>
        <h2>Как проходит урок</h2>
        <ol className="steps">
          <li><strong>Разминка.</strong> Пять минут устного счёта, чтобы включиться в работу.</li>
          <li><strong>Новая тема.</strong> Объясняем на картинках и предметах, а не на сухих правилах.</li>
          <li><strong>Практика.</strong> Решаем задачи вместе, преподаватель видит ответ каждого.</li>
          <li><strong>Тренажёр дома.</strong> Короткое задание на сайте закрепляет тему, результат сохраняется.</li>
        </ol>
      </section>

      <section>
        <h2>Почему родители выбирают нас</h2>
        <div className="grid">
          <div className="sheet"><h3>До 6 детей в группе</h3><p>Преподаватель успевает услышать и поправить каждого ребёнка.</p></div>
          <div className="sheet"><h3>Уроки по 40 минут</h3><p>Ровно столько, сколько ребёнок удерживает внимание без усталости.</p></div>
          <div className="sheet"><h3>Вся история в кабинете</h3><p>Каждый пройденный раунд тренажёра сохраняется, видно прогресс ребёнка.</p></div>
        </div>
      </section>
    </>
  );
}
