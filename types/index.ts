export interface IAPIResponse<T> {
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardPayload {
  kpi: {
    centers: { active: number; total: number };
    students: { new_this_month: number; total: number };
    revenue: {
      total_this_month: number;
      percentage_change: number;
      is_up: boolean;
    };
    subscriptions: {
      trial: number;
      pro: number;
      enterprise: number;
      total: number;
    };
    tickets: { open: number };
  };
  charts: {
    revenue_12m: { month: string; amount: number }[];
    student_growth: { month: string; count: number }[];
    center_distribution: { name: string; value: number; color: string }[];
    top_centers: {
      id: string;
      name: string;
      students: number;
      percentage: number;
    }[];
  };
  recent_activities: {
    id: string;
    center_name: string;
    created_at: string;
    status: string;
  }[];
}

export interface Director {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface IStudent {
  id: string;
  student_id: string;
  full_name: string;
  avatar: string;
  phone: string;
  email: string;
  center_name: string;
  date_of_birth: string;
  notes: string;
  status: "active" | "inactive";
  enrolled_at: string;
}

export interface ILearningCenter {
  id: string;
  name: string;
  slug: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  longitude: string;
  latitude: string;
  status: "active" | "inactive";
  plan: string;
  director: string;
  director_name: string;
  students_count: number;
  subscription_expires: string;
}

export interface IDirector {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  avatar?: string | null;
  created_at: string;
}

export interface ITeacher {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  avatar?: string | null;
  center_name?: string;
}

// Finance

export interface FinanceSummary {
  total_revenue: number;
  month_revenue: number;
  month_revenue_change: number;
  active_centers: number;
  total_centers: number;
  pending_debts: number;
  pending_debts_students_count: number;
  pending_debts_change: number;
}

export interface FinanceCenter {
  id: number;
  name: string;
  director: string;
  students_count: number;
  month_revenue: number;
  total_revenue: number;
  status: "active" | "inactive";
}

export interface FinanceCentersResponse {
  data: FinanceCenter[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_revenue_sum: number;
  };
}

export interface Transaction {
  id: number;
  created_at: string;
  center_name: string;
  amount: number;
  payment_method: "uzcard" | "humo" | "cash";
}

export interface TransactionsResponse {
  data: Transaction[];
  meta: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface CentersParams {
  status?: "all" | "active" | "inactive";
  search?: string;
  sort_by?: "month_revenue" | "total_revenue" | "students_count";
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

// Detail

export interface DirectorDetailData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  is_active: boolean;
  avatar?: string | null;
  created_at: string;
}

export interface ILearningCenterDetailData {
  id: string;
  name: string;
  slug: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  plan: string;
  director: string;
  director_name: string;
  director_phone: string;
  longitude: string;
  latitude: string;
  subscription_expires: string;
  is_subscription_active: true;
  students_count: 0;
  teachers_count: 0;
  created_at: string;
}

export interface IStudentDetailData {
  id: string;
  student_id: string;
  full_name: string;
  avatar: string | null;
  phone: string;
  email: string;
  center_name: string;
  date_of_birth: string;
  notes: string;
  status: "active" | "graduated" | "inactive" | "suspended";
  enrolled_at: string;
  parent: {
    id: string;
    full_name: string;
    phone: string;
    occupation: string;
  } | null;
  parent_phone: string;
}
