// =========================================================
// REST API сервер онлайн-школы «Числяндия»
// Написан на чистом Node.js (модуль http), без сторонних библиотек.
// Запуск: npm start  →  http://localhost:3001/api
// =========================================================
import http from "node:http";
import db from "./db.js";
import { hashPassword, checkPassword, newToken } from "./auth.js";

const PORT = 3001;
const OPERATIONS = ["+", "-", "*", "/", "random"];
const LEVELS = ["easy", "medium", "hard"];

// ---------- Вспомогательные функции ----------
function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch { reject({ status: 400, message: "Неверный формат данных" }); }
    });
  });
}

// Определяем, кто отправил запрос, по токену из заголовка Authorization
function getUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return null;
  return db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
  `).get(token) || null;
}

function requireUser(req) {
  const user = getUser(req);
  if (!user) throw { status: 401, message: "Нужно войти в аккаунт" };
  return user;
}

function startSession(user) {
  const token = newToken();
  db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, user.id);
  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

const EMAIL_RE = /^\S+@\S+\.\S+$/;

// ---------- Маршруты API: [метод, путь, обработчик] ----------
const routes = [

  // --- Регистрация ---
  ["POST", /^\/api\/register$/, async (req) => {
    const b = await readBody(req);
    const name = String(b.name || "").trim();
    const email = String(b.email || "").trim().toLowerCase();
    const password = String(b.password || "");

    const errors = {};
    if (name.length < 2) errors.name = "Имя должно быть не короче 2 букв";
    if (!EMAIL_RE.test(email)) errors.email = "Проверьте адрес почты, например name@mail.com";
    else if (db.prepare("SELECT id FROM users WHERE email = ?").get(email))
      errors.email = "Этот email уже зарегистрирован. Войдите в аккаунт";
    if (password.length < 6) errors.password = "Пароль должен быть не короче 6 символов";
    if (Object.keys(errors).length) throw { status: 400, message: "Проверьте форму", errors };

    const info = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
      .run(name, email, hashPassword(password));
    return startSession({ id: info.lastInsertRowid, name, email });
  }],

  // --- Вход ---
  ["POST", /^\/api\/login$/, async (req) => {
    const b = await readBody(req);
    const email = String(b.email || "").trim().toLowerCase();
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user || !checkPassword(String(b.password || ""), user.password_hash))
      throw { status: 400, message: "Неверный email или пароль" };
    return startSession(user);
  }],

  // --- Выход ---
  ["POST", /^\/api\/logout$/, (req) => {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return { ok: true };
  }],

  // --- Личный кабинет: данные пользователя, его курсы и история ---
  ["GET", /^\/api\/me$/, (req) => {
    const user = requireUser(req);
    const enrollments = db.prepare(`
      SELECT e.id, e.course_id, e.created_at, c.title, c.lessons, t.name AS teacher_name
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      LEFT JOIN teachers t ON t.id = c.teacher_id
      WHERE e.user_id = ? ORDER BY e.id DESC
    `).all(user.id);
    const results = db.prepare("SELECT * FROM results WHERE user_id = ? ORDER BY id DESC").all(user.id);
    return { ...user, enrollments, results };
  }],

  // --- Справочные данные (доступны всем) ---
  ["GET", /^\/api\/teachers$/, () =>
    db.prepare("SELECT * FROM teachers ORDER BY id").all()
  ],

  ["GET", /^\/api\/courses$/, () =>
    db.prepare(`
      SELECT c.*, t.name AS teacher_name,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS students_count
      FROM courses c LEFT JOIN teachers t ON t.id = c.teacher_id
      ORDER BY c.id
    `).all()
  ],

  ["GET", /^\/api\/stats$/, () => ({
    users:  db.prepare("SELECT COUNT(*) AS n FROM users").get().n,
    solved: db.prepare("SELECT COALESCE(SUM(correct), 0) AS n FROM results").get().n,
  })],

  // --- Запись на курс ---
  ["POST", /^\/api\/enrollments$/, async (req) => {
    const user = requireUser(req);
    const { course_id } = await readBody(req);
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(Number(course_id));
    if (!course) throw { status: 404, message: "Курс не найден" };
    const exists = db.prepare("SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?").get(user.id, course.id);
    if (exists) throw { status: 400, message: "Вы уже записаны на этот курс" };
    const info = db.prepare("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)").run(user.id, course.id);
    return { id: info.lastInsertRowid, course_id: course.id, title: course.title };
  }],

  // --- Отмена записи (только своей) ---
  ["DELETE", /^\/api\/enrollments\/(\d+)$/, (req, [id]) => {
    const user = requireUser(req);
    const info = db.prepare("DELETE FROM enrollments WHERE id = ? AND user_id = ?").run(id, user.id);
    if (info.changes === 0) throw { status: 404, message: "Запись не найдена" };
    return { deleted: true };
  }],

  // --- Сохранение результата тренажёра ---
  ["POST", /^\/api\/results$/, async (req) => {
    const user = requireUser(req);
    const { operation, level, correct, total } = await readBody(req);
    if (!OPERATIONS.includes(operation) || !LEVELS.includes(level))
      throw { status: 400, message: "Неизвестное действие или уровень" };
    if (!(Number(total) > 0 && Number(correct) >= 0 && Number(correct) <= Number(total)))
      throw { status: 400, message: "Неверный результат" };
    const info = db.prepare(
      "INSERT INTO results (user_id, operation, level, correct, total) VALUES (?, ?, ?, ?, ?)"
    ).run(user.id, operation, level, Number(correct), Number(total));
    return db.prepare("SELECT * FROM results WHERE id = ?").get(info.lastInsertRowid);
  }],
];

// ---------- Сам сервер ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  for (const [method, pattern, handler] of routes) {
    const match = url.pathname.match(pattern);
    if (req.method === method && match) {
      try {
        const data = await handler(req, match.slice(1));
        return sendJSON(res, method === "POST" ? 201 : 200, data);
      } catch (err) {
        if (err.status) return sendJSON(res, err.status, { error: err.message, errors: err.errors });
        console.error(err);
        return sendJSON(res, 500, { error: "Ошибка сервера" });
      }
    }
  }

  if (url.pathname === "/api" || url.pathname === "/") {
    return sendJSON(res, 200, { message: "API Числяндии работает" });
  }
  sendJSON(res, 404, { error: "Такого адреса нет" });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}/api`);
});
