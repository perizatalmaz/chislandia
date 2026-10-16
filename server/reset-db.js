// Удаляет файл базы данных. При следующем запуске сервера база создастся заново.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
for (const name of ["school.db", "chislandia.db"]) {
  const file = path.join(dir, name);
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log("Удалён файл " + name);
  }
}
console.log("Готово. Запустите сервер: npm start");
