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

export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  metadata?: string | null;
  createdAt: Date;
  userId: string;
  organizationId: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

