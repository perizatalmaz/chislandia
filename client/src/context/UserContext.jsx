// =========================================================
// Контекст пользователя: кто вошёл, его курсы и результаты.
// Доступен на любой странице через useUser().
// =========================================================
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, TOKEN_KEY } from "../api.js";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);       // данные из /api/me
  const [checking, setChecking] = useState(true); // идёт проверка входа при открытии сайта

  // Загружаем профиль заново (после записи на курс, нового результата и т.д.)
  const refresh = useCallback(async () => {
    if (!getToken()) { setUser(null); return; }
    try {
      setUser(await api("/me"));
    } catch (err) {
      if (err.status === 401) {               // токен устарел — выходим
        try { localStorage.removeItem(TOKEN_KEY); } catch {}
        setUser(null);
      }
    }
  }, []);

  useEffect(() => { refresh().finally(() => setChecking(false)); }, [refresh]);

  async function login(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
    await refresh();
  }

  async function logout() {
    try { await api("/logout", { method: "POST" }); } catch {}
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
    setUser(null);
  }

  // Номера курсов, на которые пользователь уже записан
  const enrolledIds = new Set((user?.enrollments || []).map(e => e.course_id));

  return (
    <UserContext.Provider value={{ user, checking, login, logout, refresh, enrolledIds }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
