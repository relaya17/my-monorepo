// src/pages/ForSale.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { removeApartment, fetchApartments } from "../redux/slice/forSaleSlice";
import { Card, Button } from "react-bootstrap";
import "./ForSale.css"; // לוודא שהקובץ קיים

const ForSale: React.FC = () => {
  const { apartments, loading, error } = useSelector((state: RootState) => state.forSale);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchApartments());
  }, [dispatch]);

  const handleRemove = (id: number) => {
    dispatch(removeApartment(id));
  };

  if (loading) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">טוען...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="forsale-container">
      <h1 className="page-title">Apartments for Sale</h1>
      <div className="page-subtitle">כל הדירות למכירה במתחם שלנו</div>
      <div className="cards-grid">
        {apartments.map((apartment) => (
          <Card className="apartment-card" key={apartment.id}>
            <Card.Img
              variant="top"
              src={apartment.image && apartment.image.trim() !== "" ? apartment.image : process.env.PUBLIC_URL + "/images/image.png"}
              alt="תמונה של הדירה"
              className="apartment-img"
            />
            <Card.Body>
              <Card.Title>{apartment.address}</Card.Title>
              <Card.Text>
                {apartment.description}
                <br />
                <strong>{apartment.price.toLocaleString()} ש"ח</strong>
              </Card.Text>
              <Button variant="primary" className="details-btn">
                צפה בפרטים
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ForSale;
