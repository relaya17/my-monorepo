// src/components/Management.tsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResidentsRequest, fetchResidentsSuccess } from '../redux/slice/ManagementSlice';
import type { RootState } from '../redux/store';

const Management: React.FC = () => {
  const dispatch = useDispatch();
  const { residents, loading, error } = useSelector((state: RootState) => state.management); // חשוב לפנות ל-state הנכון

  useEffect(() => {
    dispatch(fetchResidentsRequest());
    // Simulate API call
    setTimeout(() => {
      dispatch(fetchResidentsSuccess([{ id: '1', name: 'John Doe', apartment: '101', status: 'active' }])); // העברת מידע לדיספטצ'ר
    }, 1000);
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Residents Management</h1>
      <ul>
        {residents.map((resident) => (
          <li key={resident.id}>
            {resident.name} - {resident.apartment}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Management;
