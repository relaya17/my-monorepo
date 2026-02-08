// src/pages/ForRent.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { removeApartment, fetchRentApartments } from "../redux/slice/forRentSlice";
import { Button } from "react-bootstrap";
import "./ForRent.css";

const ForRent: React.FC = () => {
  const { apartments, loading, error } = useSelector((state: RootState) => state.forRent);
  const dispatch = useDispatch<AppDispatch>();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchRentApartments());
  }, []);

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
      <div className="page-subtitle">כל הדירות להשכרה במתחם שלנו</div>
      <div className="cards-grid">
        {apartments.map((apartment) => {
          const hasImage = apartment.image && apartment.image.trim() !== "";
          return (
            <div
              className={`apartment-card${hoveredId === apartment.id ? ' flipped' : ''}`}
              key={apartment.id}
              onMouseEnter={() => setHoveredId(apartment.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="apartment-card-inner">
                  <div className="apartment-card-front">
                    <div className="card-overlay"></div>
                    <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="card-body">
                        <div className="card-text-bg">
                          <div className="card-title">{apartment.address}</div>
                          <div className="card-text">
                            {apartment.description}
                            <br />
                            <strong>{apartment.price.toLocaleString()} ש"ח</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="apartment-card-back">
                    {hasImage && (
                      <img
                        src={apartment.image.startsWith('/') ? apartment.image : `/images/${apartment.image}`}
                        alt="תמונה של הדירה"
                        className="apartment-img-hover"
                      />
                    )}
                  </div>
                </div>
              </div>
              <Button variant="primary" className="details-btn" style={{ margin: '1rem', width: '90%', alignSelf: 'center' }}>
                צפה בפרטים
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ForRent;
