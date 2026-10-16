// Шифрование паролей и создание токенов входа (встроенный модуль crypto)
import crypto from "node:crypto";

// Пароль превращается в "соль:хеш". Исходный пароль в базе не хранится.
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function checkPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, "hex"));
}

export function newToken() {
  return crypto.randomBytes(32).toString("hex");
}
