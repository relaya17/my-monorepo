import React from 'react';
import { Button, ListGroupItem } from 'react-bootstrap';



// הגדרת סוג המשתמש
interface UserInfo {
  id: string;
  userName: string;
  email: string;
  dob: string;
}

// הגדרת מאפיינים לקומפוננטת ניהול המשתמש
interface UserMngComponentProps {
  userInfo: UserInfo;
  onDelete: (id: string) => void;
}

const UserMngComponent: React.FC<UserMngComponentProps> = ({ userInfo, onDelete }) => {
  
  // מחיקת משתמש כאשר לוחצים על הכפתור
  const handleDeleteClick = () => onDelete(userInfo.id);

  return (
    <ListGroupItem className="d-flex justify-content-between align-items-center">
      <div>
        <strong>{userInfo.userName}</strong> {/* הצגת שם המשתמש */}
        <div>{userInfo.email}</div> {/* הצגת הדואר האלקטרוני */}
        <div>{userInfo.dob}</div> {/* הצגת תאריך הלידה */}
      </div>
      <Button variant="danger" onClick={handleDeleteClick}>
        מחק
      </Button>
    </ListGroupItem>
  );
};

export default UserMngComponent;
