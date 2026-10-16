import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../context/UserContext.jsx";

export default function CourseCard({ course, onChange }) {
  const { user, enrolledIds, refresh } = useUser();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const enrolled = enrolledIds.has(course.id);

  async function enroll() {
    // Без аккаунта записаться нельзя — отправляем на регистрацию
    if (!user) {
      navigate("/register", { state: { from: "/courses" } });
      return;
    }
    setBusy(true);
    setError("");
    try {
      await api("/enrollments", { method: "POST", body: { course_id: course.id } });
      await refresh();     // обновляем «Мои курсы»
      onChange?.();        // обновляем счётчик учеников на карточке
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={"sheet" + (enrolled ? " enrolled" : "")}>
      <span className="tag">{course.age_group} лет</span>
      <span className="tag">{course.lessons} уроков</span>
      <h3 className="card-title">{course.title}</h3>
      <p>{course.description}</p>
      <p className="muted small">
        Преподаватель: {course.teacher_name}<br />
        Записано учеников: {course.students_count}
      </p>
      <div className="row between">
        <span className="price">{course.price} руб / месяц</span>
        {enrolled ? (
          <span className="ok">Вы записаны</span>
        ) : (
          <button className="btn small" onClick={enroll} disabled={busy}>
            {busy ? "Записываем…" : "Записаться"}
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </article>
  );
}
