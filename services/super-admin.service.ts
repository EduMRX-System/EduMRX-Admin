/* ── Types ─────────────────────────────────────────────────── */

import { API } from "./api";

export interface DashboardCenters {
  total: number;
  active: number;
  new_this_month: number;
  demo_requests: number;
}

export interface DashboardStudents {
  total: number;
  new_this_month: number;
  growth_percent: number;
}

export interface DashboardFinance {
  total_revenue: number;
  month_revenue: number;
  prev_month_revenue: number;
  growth_percent: number;
}

export interface DashboardSubscriptions {
  total: number;
  trial: number;
  pro: number;
  enterprise: number;
}

export interface DashboardTickets {
  open: number;
  critical: number;
  in_progress: number;
  resolved_today: number;
}

export interface RevenuePoint {
  name: string;
  mrr: number;
  net: number;
}

export interface StudentGrowthPoint {
  name: string;
  students: number;
}

export interface PlanDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopCenter {
  id: number;
  name: string;
  students_count: number;
  month_revenue: number;
  plan: "trial" | "pro" | "enterprise";
  progress: number; // 0-100
}

export interface RecentCenter {
  id: number;
  name: string;
  director: string;
  plan: "trial" | "pro" | "enterprise";
  registered_at: string; // ISO 8601
}

export interface PaymentError {
  id: number;
  center_name: string;
  amount: number;
  error_code:
    | "INSUFFICIENT_FUNDS"
    | "CARD_EXPIRED"
    | "PAYMENT_DECLINED"
    | "TIMEOUT"
    | "UNKNOWN";
  occurred_at: string; // ISO 8601
}

export interface SystemStatus {
  status: "healthy" | "degraded" | "down";
  uptime_percent: number;
  gateway_rps: number;
  db_locks: number;
  memory_usage_percent: number;
  sms_service: "online" | "offline";
  api_latency_ms: number;
}

export interface SuperAdminDashboard {
  centers: DashboardCenters;
  students: DashboardStudents;
  finance: DashboardFinance;
  subscriptions: DashboardSubscriptions;
  tickets: DashboardTickets;
  analytics: {
    revenue_growth: RevenuePoint[];
    student_growth: StudentGrowthPoint[];
    plan_distribution: PlanDistribution[];
  };
  top_centers: TopCenter[];
  recent_centers: RecentCenter[];
  payment_errors: PaymentError[];
  system: SystemStatus;
}

/* ── Service ────────────────────────────────────────────────── */

export const superAdminService = {
  /**
   * Barcha dashboard ma'lumotlari — bitta so'rov
   * GET /api/v1/super-admin/dashboard/
   */
  getDashboard: () =>
    API.get<{ data: SuperAdminDashboard }>("/super-admin/dashboard/"),
};
