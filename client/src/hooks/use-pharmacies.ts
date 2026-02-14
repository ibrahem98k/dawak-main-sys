import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { pharmaciesList } from "@/lib/localStoreApi";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function usePharmacies() {
  return useQuery({
    queryKey: [api.entities.pharmacies.list.path],
    queryFn: async () => {
      const data = await pharmaciesList();
      return parseWithLogging(api.entities.pharmacies.list.responses[200], data, "pharmacies.list");
    },
  });
}
