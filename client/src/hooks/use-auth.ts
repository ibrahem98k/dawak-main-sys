import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type {
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from "@shared/schema";
import { z } from "zod";
import {
  authLogin,
  authLogout,
  authMe,
  authRegister,
} from "@/lib/localStoreApi";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useMe() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const data = await authMe();
      return parseWithLogging(api.auth.me.responses[200], data, "auth.me");
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const data = await authLogin(payload);
      return parseWithLogging(api.auth.me.responses[200], data, "auth.login->me");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.notifications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.orders.list.path] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const data = await authRegister(payload);
      return parseWithLogging(api.auth.me.responses[200], data, "auth.register->me");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.suppliers.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.pharmacies.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.notifications.list.path] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authLogout();
      return null as CurrentUser | null;
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      queryClient.invalidateQueries({ queryKey: [api.entities.notifications.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.entities.orders.list.path] });
    },
  });
}
