import { NavLink, Link } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

const LINKS = [
  { to: "/",         title: "Главная" },
  { to: "/courses",  title: "Курсы" },
  { to: "/trainer",  title: "Тренажёр" },
  { to: "/teachers", title: "Преподаватели" },
];

export default function Header() {
  const { user } = useUser();
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="logo">Числ<span>я</span>ндия</Link>
        <nav className="nav">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"}>{l.title}</NavLink>
          ))}
          {user ? (
            <NavLink to="/profile" className="profile-link">Кабинет: {user.name}</NavLink>
          ) : (
            <>
              <NavLink to="/login">Вход</NavLink>
              <NavLink to="/register" className="profile-link">Регистрация</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
