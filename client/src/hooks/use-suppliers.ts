import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { suppliersList } from "@/lib/localStoreApi";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useSuppliers(search?: string) {
  return useQuery({
    queryKey: [api.entities.suppliers.list.path, { search: search || "" }],
    queryFn: async () => {
      const data = await suppliersList({ search });
      return parseWithLogging(api.entities.suppliers.list.responses[200], data, "suppliers.list");
    },
  });
}

export function useSupplierPerformance(supplierId: string) {
  return useQuery({
    queryKey: ["supplier-performance", supplierId],
    queryFn: async () => {
      const { supplierPerformanceGet } = await import("@/lib/localStoreApi");
      return supplierPerformanceGet(supplierId);
    },
    enabled: !!supplierId,
  });
}
