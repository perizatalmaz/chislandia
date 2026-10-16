import { useState } from "react";
import { makeProblem } from "../utils.js";

// Пример на главной странице: ребёнок может сразу попробовать
export default function QuickProblem() {
  const [problem, setProblem] = useState(() => makeProblem("+", "easy"));
  const [value, setValue] = useState("");
  const [result, setResult] = useState(null);

  function check(e) {
    e.preventDefault();
    if (value === "") return;
    setResult(Number(value) === problem.answer ? "ok" : "bad");
  }

  function next() {
    setProblem(makeProblem("random", "easy"));
    setValue("");
    setResult(null);
  }

  return (
    <div className="notebook-task">
      <p className="hand task-title">Реши пример</p>
      <form onSubmit={check}>
        <div className="expr">
          <span>{problem.a} {problem.sign} {problem.b} =</span>
          <input
            className="answer-input"
            type="number"
            inputMode="numeric"
            aria-label="Ответ"
            value={value}
            onChange={e => { setValue(e.target.value); setResult(null); }}
          />
        </div>
        <div className="feedback">
          {result === "ok" && <span className="ok">Верно! Молодец!</span>}
          {result === "bad" && <span className="bad">Попробуй ещё раз</span>}
        </div>
        <div className="row center">
          <button className="btn" type="submit">Проверить</button>
          <button className="btn ghost" type="button" onClick={next}>Другой пример</button>
        </div>
      </form>
    </div>
  );
}
