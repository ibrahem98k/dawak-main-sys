import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { medicinesList } from "@/lib/localStoreApi";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMedicines() {
  return useQuery({
    queryKey: [api.entities.medicines.list.path],
    queryFn: async () => {
      const data = await medicinesList();
      return parseWithLogging(api.entities.medicines.list.responses[200], data, "medicines.list");
    },
  });
}
