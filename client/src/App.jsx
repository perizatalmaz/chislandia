import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Home from "./pages/Home.jsx";
import Courses from "./pages/Courses.jsx";
import Trainer from "./pages/Trainer.jsx";
import Teachers from "./pages/Teachers.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main className="page">
        <Routes>
          {/* Открытые страницы */}
          <Route path="/"         element={<Home />} />
          <Route path="/courses"  element={<Courses />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Страницы только для зарегистрированных */}
          <Route path="/trainer" element={<RequireAuth><Trainer /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

          <Route path="*" element={<section><h2>Страница не найдена</h2><p>Выберите раздел в меню сверху.</p></section>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
