export interface User {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string | null;
}

export interface Organization {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Emission {
  id: string;
  scope: string;
  category: string;
  activity: string;
  source: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  co2e: number;
  date: Date;
  notes?: string | null;
  userId: string;
  organizationId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmissionInput {
  scope: string;
  category: string;
  activity: string;
  source: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  date: Date;
  notes?: string;
  organizationId?: string;
}

