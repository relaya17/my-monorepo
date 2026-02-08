/**
 * מבנה נתונים ל-Backend – ניהול נכסים
 */

export interface Building {
  id: string;
  address: string;
  apartments: string[];
}

export type UserRole = 'tenant' | 'committee' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  buildingId: string;
}

export type MaintenancePriority = 'low' | 'urgent' | 'critical';

export type MaintenanceStatus = 'open' | 'in_progress' | 'closed';

export interface MaintenanceTicket {
  id: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  buildingId: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
