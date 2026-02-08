import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
const Error404Page: React.FC = () => {
  const language = useSelector((state: RootState) => state.settings.language); // שים לב לשם ה-state

  const messages: { [key: string]: { title: string; message: string; button: string } } = {
    en: { title: "404", message: "The page you’re looking for doesn’t exist.", button: "Back Home" },
    he: { title: "404", message: "העמוד שחיפשת לא נמצא.", button: "חזור לדף הבית" },
    es: { title: "404", message: "La página que buscas no existe.", button: "Volver al inicio" },
    ar: { title: "404", message: "الصفحة التي تبحث عنها غير موجودة.", button: "العودة إلى الصفحة الرئيسية" },
    ru: { title: "404", message: "Страница, которую вы ищете, не существует.", button: "На главную" },
  };

  const { title, message, button } = messages[language] || messages.en;

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-md-6 text-center text-md-start">
            <h1 className="display-1 fw-bold">{title}</h1>
            <h6 className="mb-4">{message}</h6>
            <a href="/" className="btn btn-primary">
              {button}
            </a>
          </div>
          <div className="col-md-6 text-center">
            <img
              src="https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569__340.jpg"
              alt="Error Illustration"
              className="img-fluid"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


export default Error404Page;
