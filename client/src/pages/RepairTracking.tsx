// src/pages/RepairTracking.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addRepair } from '../redux/slice/repairTrackingSlice';

const RepairTracking = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState('');
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addRepair({ date, task, status }));
  };

  return (
    <div className="container mt-4">
      <h1 className="text-right">מעקב שיפוצים</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">תאריך</label>
          <input type="date" className="form-control" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="task" className="form-label">משימה</label>
          <input type="text" className="form-control" id="task" value={task} onChange={(e) => setTask(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="status" className="form-label">סטטוס</label>
          <input type="text" className="form-control" id="status" value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">שמור</button>
      </form>
    </div>
  );
};

export default RepairTracking;
