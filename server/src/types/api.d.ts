// types/api.d.ts

// מיועד לתשלום
export interface PaymentRequestBody {
  payer: string;
  amount: number;
}

// מיועד לרישום משתמש
export interface SignUpRequestBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
  apartment?: string;
  familyMembers?: number;
}

// מיועד לכניסת מנהל
export interface AdminLoginRequestBody {
  username: string;
  password: string;
}

// מיועד לכניסת משתמש
export interface UserLoginRequestBody {
  email: string;
  password: string;
}

// מיועד לקבלה
export interface ReceiptRequestBody {
  payer: string;
  amount: number;
  chairmanName: string;
}

// מיועד לשינוי סיסמה
export interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
