// src/pages/PoolMaintenance.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMaintenance } from '../redux/slice/poolMaintenanceSlice';

const PoolMaintenance = () => {
  const dispatch = useDispatch();
  const [date, setDate] = useState('');
  const [maintenanceTask, setMaintenanceTask] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(addMaintenance({ date, maintenanceTask, employeeName, paymentAmount }));
  };

  return (
    <div className="container mt-4">
      <h1 className="text-right">תחזוקת בריכה ותשלומים</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="date" className="form-label">תאריך</label>
          <input type="date" className="form-control" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="maintenanceTask" className="form-label">משימת תחזוקה</label>
          <input type="text" className="form-control" id="maintenanceTask" value={maintenanceTask} onChange={(e) => setMaintenanceTask(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="employeeName" className="form-label">שם העובד</label>
          <input type="text" className="form-control" id="employeeName" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="paymentAmount" className="form-label">סכום תשלום</label>
          <input type="text" className="form-control" id="paymentAmount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary">שמור</button>
      </form>
    </div>
  );
};

export default PoolMaintenance;
