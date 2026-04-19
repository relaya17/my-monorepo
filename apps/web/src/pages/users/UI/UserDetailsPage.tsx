import React from 'react';
import { useParams } from 'react-router-dom';

// הגדרת Params כ-Record
type Params = {
  id: string;
};

const UserDetailsPage: React.FC = () => {
  // שימוש ב-useParams עם טיפוס Params
  const { id } = useParams<Params>();

  return (
    <div>
      <h1>User Details</h1>
      <p>User ID: {id}</p>
    </div>
  );
};

export default UserDetailsPage;
