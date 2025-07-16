// src/pages/ForRent.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { removeApartment, fetchRentApartments } from "../redux/slice/forRentSlice";
import { Card, Button } from "react-bootstrap";

const ForRent: React.FC = () => {
  const { apartments, loading, error } = useSelector((state: RootState) => state.forRent);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchRentApartments());
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
    <div className="forrent-container">
  <h1 className="page-title">Apartments for Rent</h1>
  <div className="page-subtitle">כל הדירות להשכרה במצפה נוף</div>
  
  <div className="cards-grid">
    {apartments.map((apartment) => (
      <Card className="apartment-card" key={apartment.id}>
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

  <footer className="page-footer">
    כל הדירות להשכרה במצפה נוף
  </footer>
</div>

  );
};

export default ForRent;
