import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../context/UserContext.jsx";

export default function Login() {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Уже вошёл — сразу в кабинет
  if (user) return <Navigate to="/profile" replace />;

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Введите email и пароль"); return; }
    setBusy(true);
    try {
      const { token } = await api("/login", { method: "POST", body: form });
      await login(token);
      navigate(location.state?.from || "/profile", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Вход</h2>
      <form className="form" onSubmit={submit} noValidate>
        <label>Email
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={change} />
        </label>
        <label>Пароль
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={change} />
        </label>
        {error && <div className="error">{error}</div>}
        <div><button className="btn" type="submit" disabled={busy}>{busy ? "Входим…" : "Войти"}</button></div>
        <p>Ещё нет аккаунта? <Link to="/register" state={location.state}>Зарегистрироваться</Link></p>
      </form>
    </section>
  );
}
