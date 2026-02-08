import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addTask } from '../redux/slice/gardeningSlice';

interface GardeningTask {
  date: string;
  wateringAmount: string;
  soilCheck: string;
  task: string;
  treatmentType?: string[];
  treatmentDetails: string;
}

const Gardening = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState('');
  const [wateringAmount, setWateringAmount] = useState('');
  const [soilCheck, setSoilCheck] = useState('');
  const [task, setTask] = useState('');
  const [treatmentType, setTreatmentType] = useState<string[]>([]);
  const [treatmentDetails, setTreatmentDetails] = useState('');

  const handleTreatmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTreatmentType((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: GardeningTask = {
      date,
      wateringAmount,
      soilCheck,
      task,
      treatmentType,
      treatmentDetails,
    };
    dispatch(addTask(newTask));
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="text-center mb-4">גינון</h1>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} dir="rtl">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="mb-3 text-center">
                  <label htmlFor="date" className="form-label">יום</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="mb-3 text-center">
                  <label htmlFor="wateringAmount" className="form-label">פירוט ביצוע העבודה</label>
                  <input
                    type="text"
                    className="form-control"
                    id="wateringAmount"
                    value={wateringAmount}
                    onChange={(e) => setWateringAmount(e.target.value)}
                  />
                </div>
                <div className="mb-3 text-center">
                  <label className="form-label">סוג טיפול</label>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="טיפול טפטפות" id="drip" onChange={handleTreatmentChange} checked={treatmentType.includes("טיפול טפטפות")} />
                    <label className="form-check-label" htmlFor="drip">טיפול טפטפות</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="חיטוב עצים" id="pruning" onChange={handleTreatmentChange} checked={treatmentType.includes("חיטוב עצים")} />
                    <label className="form-check-label" htmlFor="pruning">חיטוב עצים</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="גיזום" id="trimming" onChange={handleTreatmentChange} checked={treatmentType.includes("גיזום")} />
                    <label className="form-check-label" htmlFor="trimming">גיזום</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="שתילה" id="planting" onChange={handleTreatmentChange} checked={treatmentType.includes("שתילה")} />
                    <label className="form-check-label" htmlFor="planting">שתילה</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" value="אחר" id="else" onChange={handleTreatmentChange} checked={treatmentType.includes("אחר")} />
                    <label className="form-check-label" htmlFor="else">אחר</label>
                  </div>
                </div>
                {treatmentType.length > 0 && (
                  <div className="mb-3 text-center">
                    <label htmlFor="treatmentDetails" className="form-label">פירוט הטיפול</label>
                    <input
                      type="text"
                      className="form-control"
                      id="treatmentDetails"
                      value={treatmentDetails}
                      onChange={(e) => setTreatmentDetails(e.target.value)}
                    />
                  </div>
                )}
                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">שמור</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Gardening;
