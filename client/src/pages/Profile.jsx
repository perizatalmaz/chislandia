import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../context/UserContext.jsx";
import { OPERATION_NAMES, LEVEL_NAMES, starsFor } from "../utils.js";

export default function Profile() {
  const { user, logout, refresh } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const results = user.results;
  const solved = results.reduce((s, r) => s + r.correct, 0);
  const total = results.reduce((s, r) => s + r.total, 0);
  const percent = total ? Math.round((solved / total) * 100) : 0;

  async function cancel(enrollment) {
    if (!window.confirm(`Отменить запись на курс «${enrollment.title}»?`)) return;
    setError("");
    try {
      await api(`/enrollments/${enrollment.id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function exit() {
    await logout();
    navigate("/");
  }

  return (
    <section>
      <div className="row between">
        <h2>Кабинет: {user.name}</h2>
        <button className="btn ghost small" onClick={exit}>Выйти</button>
      </div>
      <p className="muted">{user.email}. На сайте с {user.created_at.slice(0, 10)}.</p>

      <div className="grid">
        <div className="sheet"><h3>{user.enrollments.length}</h3><p>курсов</p></div>
        <div className="sheet"><h3>{results.length}</h3><p>раундов в тренажёре</p></div>
        <div className="sheet"><h3>{percent}%</h3><p>правильных ответов</p></div>
      </div>

      <h3 className="block-title">Мои курсы</h3>
      {error && <p className="error">{error}</p>}
      {user.enrollments.length === 0 ? (
        <p>Вы пока не записаны ни на один курс. <Link to="/courses">Выбрать курс</Link></p>
      ) : (
        <div className="grid">
          {user.enrollments.map(e => (
            <article className="sheet enrolled" key={e.id}>
              <h3>{e.title}</h3>
              <p className="muted small">
                Преподаватель: {e.teacher_name}<br />
                {e.lessons} уроков<br />
                Записан(а): {e.created_at.slice(0, 10)}
              </p>
              <button className="link-btn" onClick={() => cancel(e)}>Отменить запись</button>
            </article>
          ))}
        </div>
      )}

      <h3 className="block-title">История тренажёра</h3>
      {results.length === 0 ? (
        <p>Здесь появятся ваши результаты. <Link to="/trainer">Открыть тренажёр</Link></p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Дата</th><th>Действие</th><th>Уровень</th><th>Результат</th><th>Звёзды</th></tr></thead>
            <tbody>
              {results.map(r => (
                <tr key={r.id}>
                  <td>{r.created_at.slice(0, 16)}</td>
                  <td>{OPERATION_NAMES[r.operation]}</td>
                  <td>{LEVEL_NAMES[r.level]}</td>
                  <td>{r.correct} из {r.total}</td>
                  <td className="star-cell">{"★".repeat(starsFor(r.correct, r.total)) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
