import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import type { AppState } from "@shared/schema";
import { stateGet, stateResetToSeed } from "@/lib/localStoreApi";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useAppState() {
  return useQuery({
    queryKey: [api.state.get.path],
    queryFn: async () => {
      const data = await stateGet();
      return parseWithLogging(api.state.get.responses[200], data, "state.get");
    },
  });
}

export function useResetDemoData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<AppState> => {
      const data = await stateResetToSeed();
      return parseWithLogging(api.state.get.responses[200], data, "state.reset");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.state.get.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.medicines.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.suppliers.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.pharmacies.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.notifications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.orders.list.path] });
      // supplier medicines list is keyed with supplierId appended; we rely on broad invalidation:
      queryClient.invalidateQueries();
    },
  });
}
