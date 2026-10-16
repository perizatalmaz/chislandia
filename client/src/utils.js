export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const OPERATION_NAMES = {
  "+": "Сложение", "-": "Вычитание", "*": "Умножение", "/": "Деление", random: "Вперемешку",
};
export const LEVEL_NAMES = { easy: "Лёгкий", medium: "Средний", hard: "Сложный" };

// Генерирует пример по действию и уровню сложности
export function makeProblem(op, level) {
  const max = level === "easy" ? 10 : level === "medium" ? 50 : 100;
  const m = level === "easy" ? 5 : level === "medium" ? 9 : 12;
  if (op === "random") op = ["+", "-", "*", "/"][randomInt(0, 3)];

  if (op === "+") {
    const a = randomInt(1, max), b = randomInt(1, max);
    return { a, b, sign: "+", answer: a + b };
  }
  if (op === "-") {
    const a = randomInt(1, max), b = randomInt(1, a);
    return { a, b, sign: "−", answer: a - b };
  }
  if (op === "*") {
    const a = randomInt(2, m), b = randomInt(2, m);
    return { a, b, sign: "×", answer: a * b };
  }
  const b = randomInt(2, m), answer = randomInt(1, m);
  return { a: b * answer, b, sign: ":", answer };
}

export function starsFor(correct, total) {
  const p = correct / total;
  return p >= 0.9 ? 3 : p >= 0.6 ? 2 : p >= 0.3 ? 1 : 0;
}
