import React from "react";
import { Form, Button } from "react-bootstrap";

interface ResidentFormProps {
  name: string;
  age: number | undefined;
  familyStatus: string;
  apartment: string;
  onSubmit: () => void;
  setName: (value: string) => void;
  setAge: (value: number | undefined) => void;
  setFamilyStatus: (value: string) => void;
  setApartment: (value: string) => void;
  isEdit: boolean;
}

const ResidentForm: React.FC<ResidentFormProps> = ({
  name, age, familyStatus, apartment, onSubmit,
  setName, setAge, setFamilyStatus, setApartment, isEdit
}) => {
  return (
    <Form>
      <Form.Group controlId="name">
        <Form.Label>שם</Form.Label>
        <Form.Control
          type="text"
          placeholder="הכנס שם"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="age">
        <Form.Label>גיל</Form.Label>
        <Form.Control
          type="number"
          placeholder="הכנס גיל"
          value={age === undefined ? "" : age}
          onChange={(e) => setAge(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      </Form.Group>

      <Form.Group controlId="familyStatus">
        <Form.Label>מצב משפחתי</Form.Label>
        <Form.Control
          type="text"
          placeholder="הכנס מצב משפחתי"
          value={familyStatus}
          onChange={(e) => setFamilyStatus(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="apartment">
        <Form.Label>דירה מס</Form.Label>
        <Form.Control
          type="text"
          placeholder="הכנס מספר דירה"
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
        />
      </Form.Group>

      <Button
        variant={isEdit ? "warning" : "primary"}
        className="w-100 mt-3"
        onClick={onSubmit}
        disabled={!name.trim() || age === undefined || isNaN(Number(age)) || age <= 0}
      >
        {isEdit ? "עדכן דייר" : "הוסף דייר"}
      </Button>
    </Form>
  );
};

export default ResidentForm;
