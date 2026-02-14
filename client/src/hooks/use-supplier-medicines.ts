import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import type {
  CreateSupplierMedicineRequest,
  UpdateSupplierMedicineRequest,
} from "@shared/schema";
import {
  supplierMedicinesListBySupplier,
  supplierMedicinesCreate,
  supplierMedicinesUpdate,
  supplierMedicinesDelete,
} from "@/lib/localStoreApi";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export type SupplierMedicinesQuery = {
  search?: string;
  sortBy?: "name" | "price" | "stock";
  sortDir?: "asc" | "desc";
  onlyAvailable?: boolean;
};

export function useSupplierMedicinesBySupplier(supplierId: string, query?: SupplierMedicinesQuery) {
  const url = buildUrl(api.entities.supplierMedicines.listBySupplier.path, { supplierId });
  return useQuery({
    queryKey: [url, query || {}],
    queryFn: async () => {
      const data = await supplierMedicinesListBySupplier(supplierId, query);
      return parseWithLogging(
        api.entities.supplierMedicines.listBySupplier.responses[200],
        data,
        "supplierMedicines.listBySupplier",
      );
    },
    enabled: !!supplierId,
  });
}

export function useCreateSupplierMedicine(supplierId: string) {
  const queryClient = useQueryClient();
  const url = buildUrl(api.entities.supplierMedicines.listBySupplier.path, { supplierId });
  return useMutation({
    mutationFn: async (payload: CreateSupplierMedicineRequest) => {
      const data = await supplierMedicinesCreate(payload);
      // Return full list item shape not strictly defined for mutation; just return created entity
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [url] });
      await queryClient.invalidateQueries({ queryKey: [api.state.get.path] });
    },
  });
}

export function useUpdateSupplierMedicine(supplierId: string) {
  const queryClient = useQueryClient();
  const url = buildUrl(api.entities.supplierMedicines.listBySupplier.path, { supplierId });
  return useMutation({
    mutationFn: async (input: { id: string; updates: UpdateSupplierMedicineRequest }) => {
      const data = await supplierMedicinesUpdate(input.id, input.updates);
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [url] });
      await queryClient.invalidateQueries({ queryKey: [api.state.get.path] });
    },
  });
}

export function useDeleteSupplierMedicine(supplierId: string) {
  const queryClient = useQueryClient();
  const url = buildUrl(api.entities.supplierMedicines.listBySupplier.path, { supplierId });
  return useMutation({
    mutationFn: async (id: string) => {
      await supplierMedicinesDelete(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [url] });
      await queryClient.invalidateQueries({ queryKey: [api.state.get.path] });
    },
  });
}
