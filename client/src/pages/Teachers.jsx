import { useApi } from "../api.js";
import Status from "../components/Status.jsx";

export default function Teachers() {
  const { data: teachers, loading, error } = useApi("/teachers");

  return (
    <section>
      <h2>Преподаватели</h2>
      <p>Все преподаватели — педагоги с опытом работы с детьми младшего школьного возраста.</p>
      <Status loading={loading} error={error} />
      <div className="grid">
        {(teachers || []).map(t => (
          <article className="sheet" key={t.id}>
            <div className="avatar" style={{ background: t.color }}>
              {t.name.split(" ").map(w => w[0]).join("")}
            </div>
            <h3>{t.name}</h3>
            <p><strong>{t.role}</strong><br />Опыт: {t.experience} лет</p>
            <p>{t.about}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
