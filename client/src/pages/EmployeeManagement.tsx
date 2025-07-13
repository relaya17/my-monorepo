import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { updateEmployeeHours, fetchEmployees } from "../redux/slice/employeesSlice";

const EmployeeManagement: React.FC = () => {
  const { employees, loading, error } = useSelector((state: RootState) => state.employees);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleUpdateHours = (id: string, hours: number) => {
    dispatch(updateEmployeeHours({ id, hours }));
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
    <div className="container-fluid d-flex flex-column align-items-center mt-5">
      <h1 className="mt-4 text-center">ניהול עובדים זמניים</h1>
      <div className="mt-4 w-100 d-flex flex-column align-items-center">
        {employees.length > 0 ? (
          employees.map((employee) => (
            <div key={employee.id} className="card p-3 mb-3 shadow w-50 text-end">
              <div className="card-body">
                <h5 className="card-title">{employee.name}</h5>
                <p className="card-text">
                  <strong>תפקיד:</strong> {employee.role}
                  <br />
                  <strong>שעות עבודה:</strong> {employee.hoursWorked}
                </p>
                <input
                  type="number"
                  className="form-control text-end"
                  value={employee.hoursWorked}
                  onChange={(e) => handleUpdateHours(employee.id, parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          ))
        ) : (
          <p>לא נמצאו עובדים.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
