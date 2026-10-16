// =========================================================
// Работа с сервером (REST API)
// =========================================================
import { useEffect, useState, useCallback } from "react";

export const TOKEN_KEY = "chislandia-token";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

// Универсальная функция запроса. Если пользователь вошёл — добавляем его токен.
export async function api(path, options = {}) {
  const token = getToken();
  const res = await fetch("/api" + path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "Сервер недоступен. Проверьте, что он запущен (npm start в папке server).");
    error.status = res.status;
    error.errors = data.errors;
    throw error;
  }
  return data;
}

// Хук для загрузки данных: возвращает данные, состояние загрузки и ошибку
export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    api(path)
      .then(setData)
      .catch(() => setError("Не удалось загрузить данные. Проверьте, что сервер запущен (npm start в папке server)."))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload };
}
