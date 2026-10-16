import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useUser } from "../context/UserContext.jsx";

export default function Register() {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", password2: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/profile" replace />;

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined, general: undefined });
  }

  // Проверка на стороне браузера (сервер проверяет ещё раз)
  function validate() {
    const err = {};
    if (form.name.trim().length < 2) err.name = "Имя должно быть не короче 2 букв";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Проверьте адрес почты, например name@mail.com";
    if (form.password.length < 6) err.password = "Пароль должен быть не короче 6 символов";
    if (form.password !== form.password2) err.password2 = "Пароли не совпадают";
    return err;
  }

  async function submit(e) {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length) return;

    setBusy(true);
    try {
      const { token } = await api("/register", {
        method: "POST",
        body: { name: form.name, email: form.email, password: form.password },
      });
      await login(token);
      navigate(location.state?.from || "/profile", { replace: true });
    } catch (err) {
      setErrors(err.errors || { general: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Регистрация</h2>
      <p>После регистрации можно записываться на курсы и сохранять результаты тренажёра.</p>
      <form className="form" onSubmit={submit} noValidate>
        <label>Имя
          <input name="name" autoComplete="name" value={form.name} onChange={change} />
          {errors.name && <div className="error">{errors.name}</div>}
        </label>
        <label>Email
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={change} />
          {errors.email && <div className="error">{errors.email}</div>}
        </label>
        <label>Пароль
          <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={change} />
          {errors.password && <div className="error">{errors.password}</div>}
        </label>
        <label>Повторите пароль
          <input name="password2" type="password" autoComplete="new-password" value={form.password2} onChange={change} />
          {errors.password2 && <div className="error">{errors.password2}</div>}
        </label>
        {errors.general && <div className="error">{errors.general}</div>}
        <div><button className="btn" type="submit" disabled={busy}>{busy ? "Создаём аккаунт…" : "Зарегистрироваться"}</button></div>
        <p>Уже есть аккаунт? <Link to="/login" state={location.state}>Войти</Link></p>
      </form>
    </section>
  );
}
