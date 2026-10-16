// Показывает загрузку или ошибку при работе с сервером
export default function Status({ loading, error }) {
  if (error) return <p className="bad">{error}</p>;
  if (loading) return <p className="muted">Загружаем данные…</p>;
  return null;
}
