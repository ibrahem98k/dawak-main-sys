import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import type { CreateOrderRequest, DecideOrderRequest, Role } from "@shared/schema";
import { ordersCreate, ordersDecide, ordersList } from "@/lib/localStoreApi";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useOrders(input?: { role: Role; userId: string; status?: "pending" | "approved" | "rejected" }) {
  return useQuery({
    queryKey: [api.entities.orders.list.path, input || null],
    queryFn: async () => {
      const data = await ordersList(input);
      return parseWithLogging(api.entities.orders.list.responses[200], data, "orders.list");
    },
    enabled: !input || (!!input.role && !!input.userId),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateOrderRequest) => {
      const data = await ordersCreate(payload);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.entities.orders.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.entities.notifications.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.state.get.path] });
    },
  });
}

export function useDecideOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { orderId: string; decision: DecideOrderRequest }) => {
      const data = await ordersDecide(input.orderId, input.decision);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.entities.orders.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.entities.notifications.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.state.get.path] });
    },
  });
}
