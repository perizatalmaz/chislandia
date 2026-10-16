import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "../api.js";
import { useUser } from "../context/UserContext.jsx";
import CourseCard from "../components/CourseCard.jsx";
import Status from "../components/Status.jsx";

const AGES = ["all", "5–6", "6–7", "7–9", "9–11"];

export default function Courses() {
  const { user } = useUser();
  const { data: courses, loading, error, reload } = useApi("/courses");
  const [age, setAge] = useState("all");

  const list = (courses || []).filter(c => age === "all" || c.age_group === age);

  return (
    <section>
      <h2>Курсы</h2>
      <p>Первый урок любого курса бесплатный. Выберите возраст, чтобы увидеть подходящие курсы.</p>
      {!user && (
        <p className="note">
          Чтобы записаться на курс, <Link to="/register">зарегистрируйтесь</Link> или <Link to="/login">войдите</Link>.
        </p>
      )}
      <div className="filters">
        {AGES.map(a => (
          <button key={a} className={"chip" + (age === a ? " active" : "")} onClick={() => setAge(a)}>
            {a === "all" ? "Все возрасты" : a + " лет"}
          </button>
        ))}
      </div>
      <Status loading={loading} error={error} />
      <div className="grid">
        {list.map(c => <CourseCard key={c.id} course={c} onChange={reload} />)}
      </div>
    </section>
  );
}
