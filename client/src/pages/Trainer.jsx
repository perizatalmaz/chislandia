import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../context/UserContext.jsx";
import { makeProblem, starsFor, OPERATION_NAMES, LEVEL_NAMES } from "../utils.js";

const ROUND_SIZE = 10;

export default function Trainer() {
  const { refresh } = useUser();
  const [op, setOp] = useState("+");
  const [level, setLevel] = useState("easy");
  const [started, setStarted] = useState(false);
  const [problem, setProblem] = useState(null);
  const [value, setValue] = useState("");
  const [count, setCount] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  const finished = started && count === ROUND_SIZE;

  function start() {
    setStarted(true);
    setCount(0);
    setCorrect(0);
    setFeedback(null);
    setValue("");
    setSaveStatus("");
    setProblem(makeProblem(op, level));
  }

  // Отправляем результат раунда в базу данных
  async function saveResult(finalCorrect) {
    setSaveStatus("Сохраняем результат…");
    try {
      await api("/results", {
        method: "POST",
        body: { operation: op, level, correct: finalCorrect, total: ROUND_SIZE },
      });
      await refresh();
      setSaveStatus("Результат сохранён в кабинете.");
    } catch (err) {
      setSaveStatus("Не удалось сохранить: " + err.message);
    }
  }

  function answer(e) {
    e.preventDefault();
    if (value === "") return;
    const isRight = Number(value) === problem.answer;
    const newCorrect = isRight ? correct + 1 : correct;
    const newCount = count + 1;

    setCorrect(newCorrect);
    setCount(newCount);
    setFeedback(isRight ? { type: "ok", text: "Верно!" } : { type: "bad", text: `Правильный ответ: ${problem.answer}` });
    setValue("");
    setProblem(makeProblem(op, level));

    if (newCount === ROUND_SIZE) saveResult(newCorrect);
  }

  const stars = starsFor(correct, ROUND_SIZE);

  return (
    <section className="narrow">
      <h2>Тренажёр</h2>
      <p>
        Реши {ROUND_SIZE} примеров подряд и получи звёзды. Каждый раунд сохраняется
        в <Link to="/profile">истории в кабинете</Link>.
      </p>

      {!started && (
        <div className="sheet">
          <div className="row gap-lg">
            <label>Действие:{" "}
              <select value={op} onChange={e => setOp(e.target.value)}>
                {Object.entries(OPERATION_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label>Уровень:{" "}
              <select value={level} onChange={e => setLevel(e.target.value)}>
                {Object.entries(LEVEL_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
          <button className="btn" onClick={start}>Начать</button>
        </div>
      )}

      {started && !finished && (
        <div className="notebook-task">
          <div>Пример {count + 1} из {ROUND_SIZE}, верно: {correct}</div>
          <div className="progress"><div style={{ width: (count / ROUND_SIZE) * 100 + "%" }} /></div>
          <form onSubmit={answer}>
            <div className="expr">
              <span>{problem.a} {problem.sign} {problem.b} =</span>
              <input
                className="answer-input"
                type="number"
                inputMode="numeric"
                aria-label="Ответ"
                autoFocus
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </div>
            <div className="feedback">
              {feedback && <span className={feedback.type}>{feedback.text}</span>}
            </div>
            <button className="btn" type="submit">Ответить</button>
          </form>
        </div>
      )}

      {finished && (
        <div className="notebook-task">
          <h3>Раунд окончен!</h3>
          <div className="stars" aria-label={`Звёзд: ${stars} из 3`}>
            {"★".repeat(stars)}{"☆".repeat(3 - stars)}
          </div>
          <p className="center-text">Правильных ответов: <strong>{correct} из {ROUND_SIZE}</strong></p>
          {saveStatus && <p className="muted center-text">{saveStatus}</p>}
          <div className="row center">
            <button className="btn" onClick={start}>Ещё раунд</button>
            <button className="btn ghost" onClick={() => setStarted(false)}>Сменить задание</button>
          </div>
        </div>
      )}
    </section>
  );
}
