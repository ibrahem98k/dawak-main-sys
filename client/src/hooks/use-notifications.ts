import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import type { Role } from "@shared/schema";
import {
  notificationsList,
  notificationsMarkAllRead,
  notificationsMarkRead,
} from "@/lib/localStoreApi";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useNotifications(input?: { role: Role; userId: string }) {
  return useQuery({
    queryKey: [api.entities.notifications.list.path, input || null],
    queryFn: async () => {
      const data = await notificationsList(input);
      return parseWithLogging(api.entities.notifications.list.responses[200], data, "notifications.list");
    },
    enabled: !input || (!!input.role && !!input.userId),
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await notificationsMarkRead(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.entities.notifications.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.state.get.path] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { role: Role; userId: string }) => {
      await notificationsMarkAllRead(input);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.entities.notifications.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.state.get.path] });
    },
  });
}
