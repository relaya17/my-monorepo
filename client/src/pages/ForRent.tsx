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
    <div>
      <h1>דירות להשכרה</h1>
      <div className="d-flex flex-wrap">
        {apartments.map((apartment) => (
          <Card style={{ width: "18rem", margin: "1rem" }} key={apartment.id}>
            <Card.Img variant="top" src={apartment.image} />
            <Card.Body>
              <Card.Title>{apartment.address}</Card.Title>
              <Card.Text>
                {apartment.description}
                <br />
                <strong>{apartment.price.toLocaleString()} ש"ח</strong>
              </Card.Text>
              <Button variant="danger" onClick={() => handleRemove(apartment.id)}>
                הסר דירה
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ForRent;
