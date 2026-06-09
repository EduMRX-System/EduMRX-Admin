import { useQuery } from "@tanstack/react-query";
import { superAdminService } from "@/services/super-admin.service";

export const superAdminKeys = {
  dashboard: () => ["super-admin", "dashboard"] as const,
};

export const useSuperAdminDashboard = () =>
  useQuery({
    queryKey: superAdminKeys.dashboard(),
    queryFn: () =>
      superAdminService.getDashboard().then((r: any) => r.data.data),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
