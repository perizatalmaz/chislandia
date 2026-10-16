// Защищённая страница: если пользователь не вошёл — отправляем на страницу входа
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

export default function RequireAuth({ children }) {
  const { user, checking } = useUser();
  const location = useLocation();

  if (checking) return <section><p className="muted">Проверяем вход…</p></section>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
