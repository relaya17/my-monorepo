// בקובץ types.ts

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  apartment?: string;
  familyMembers?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Admin = {
  id: string;
  username: string;
  password: string;
  role: 'admin';
  createdAt?: Date;
  updatedAt?: Date;
};

export type Payment = {
  id: string;
  payer: string;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Receipt = {
  id: string;
  payer: string;
  amount: number;
  chairmanName: string;
  createdAt?: Date;
};

export type SignUpAction =
  | { type: 'SIGN_UP_REQUEST' }
  | { type: 'SIGN_UP_SUCCESS'; payload: { user: User } }
  | { type: 'SIGN_UP_ERROR'; payload: { error: string } };

export type AdminLoginAction =
  | { type: 'ADMIN_LOGIN_REQUEST' }
  | { type: 'ADMIN_LOGIN_SUCCESS'; payload: { admin: Admin } }
  | { type: 'ADMIN_LOGIN_ERROR'; payload: { error: string } };

export type UserLoginAction =
  | { type: 'USER_LOGIN_REQUEST' }
  | { type: 'USER_LOGIN_SUCCESS'; payload: { user: User } }
  | { type: 'USER_LOGIN_ERROR'; payload: { error: string } };
