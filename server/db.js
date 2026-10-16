// =========================================================
// База данных SQLite (встроена в Node.js, ничего ставить не нужно)
// Файл базы: server/school.db — создаётся автоматически
// =========================================================
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { hashPassword } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_FILE = path.join(__dirname, "school.db");

const db = new DatabaseSync(DB_FILE);
db.exec("PRAGMA foreign_keys = ON;");

// ---------- Создание таблиц ----------
db.exec(`
  -- Преподаватели
  CREATE TABLE IF NOT EXISTS teachers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    role        TEXT    NOT NULL,
    experience  INTEGER NOT NULL,
    color       TEXT    NOT NULL,
    about       TEXT
  );

  -- Курсы
  CREATE TABLE IF NOT EXISTS courses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    age_group   TEXT    NOT NULL,
    lessons     INTEGER NOT NULL,
    price       REAL    NOT NULL,
    description TEXT,
    teacher_id  INTEGER REFERENCES teachers(id)
  );

  -- Пользователи (участники). Пароль хранится только в зашифрованном виде.
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  -- Сессии: какой пользователь сейчас вошёл на сайт
  CREATE TABLE IF NOT EXISTS sessions (
    token       TEXT    PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  -- Записи на курсы. На один курс можно записаться только один раз.
  CREATE TABLE IF NOT EXISTS enrollments (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id   INTEGER NOT NULL REFERENCES courses(id),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    UNIQUE (user_id, course_id)
  );

  -- История прохождения тренажёра
  CREATE TABLE IF NOT EXISTS results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    operation   TEXT    NOT NULL,
    level       TEXT    NOT NULL,
    correct     INTEGER NOT NULL,
    total       INTEGER NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

// ---------- Начальные данные (только если база новая) ----------
const isEmpty = db.prepare("SELECT COUNT(*) AS n FROM teachers").get().n === 0;

if (isEmpty) {
  const addTeacher = db.prepare(
    "INSERT INTO teachers (name, role, experience, color, about) VALUES (?, ?, ?, ?, ?)"
  );
  addTeacher.run("Анна Петрова",  "Счёт и первые примеры",  8,  "#1f3fbf", "Превращает уроки в игру, поэтому малыши ждут занятий.");
  addTeacher.run("Игорь Смирнов", "Олимпиадная математика", 12, "#e2463b", "Готовит учеников к олимпиадам, сам бывший призёр олимпиад.");
  addTeacher.run("Мария Козлова", "Дроби и геометрия",      6,  "#2f9e63", "Объясняет сложные темы через рисунки и предметы.");
  addTeacher.run("Дмитрий Орлов", "Таблица умножения",      10, "#c98a00", "Автор методики «умножение за 20 уроков».");

  const addCourse = db.prepare(
    "INSERT INTO courses (title, age_group, lessons, price, description, teacher_id) VALUES (?, ?, ?, ?, ?, ?)"
  );
  addCourse.run("Счёт до 20",             "5–6",  16, 45, "Учимся считать, сравнивать числа и решать первые примеры на сложение.", 1);
  addCourse.run("Сложение и вычитание",   "6–7",  24, 55, "Примеры в пределах 100, задачи в одно действие, счёт в уме.", 1);
  addCourse.run("Таблица умножения",      "7–9",  20, 55, "Запоминаем таблицу через игры и закономерности, а не зубрёжку.", 4);
  addCourse.run("Геометрия в картинках",  "7–9",  12, 40, "Фигуры, периметр и площадь на примерах из жизни.", 3);
  addCourse.run("Дроби — это просто",     "9–11", 18, 60, "Делим пиццу и шоколадку: понимаем дроби и действия с ними.", 3);
  addCourse.run("Олимпиадная математика", "9–11", 30, 75, "Логические задачи и подготовка к школьным олимпиадам.", 2);

  // Демо-аккаунт для показа на защите: demo@mail.com / 123456
  const demo = db.prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run("Лиза", "demo@mail.com", hashPassword("123456"));
  const demoId = demo.lastInsertRowid;

  db.prepare("INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)").run(demoId, 3);
  const addResult = db.prepare(
    "INSERT INTO results (user_id, operation, level, correct, total) VALUES (?, ?, ?, ?, ?)"
  );
  addResult.run(demoId, "+", "easy", 9, 10);
  addResult.run(demoId, "*", "medium", 7, 10);

  console.log("База данных создана. Демо-вход: demo@mail.com / 123456");
}

export default db;
