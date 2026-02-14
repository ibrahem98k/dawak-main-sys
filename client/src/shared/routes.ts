import { z } from "zod";
import {
    appStateSchema,
    currentUserSchema,
    medicineSchema,
    notificationSchema,
    orderSchema,
    pharmacySchema,
    supplierMedicineSchema,
    supplierMedicineWithRelationsSchema,
    supplierSchema,
} from "./schema";

export const api = {
    auth: {
        me: {
            path: "/api/auth/me",
            responses: {
                200: currentUserSchema,
            },
        },
        login: {
            path: "/api/auth/login",
        },
        logout: {
            path: "/api/auth/logout",
        },
        register: {
            path: "/api/auth/register",
        },
    },
    state: {
        get: {
            path: "/api/state",
            responses: {
                200: appStateSchema,
            },
        },
    },
    entities: {
        medicines: {
            list: {
                path: "/api/medicines",
                responses: {
                    200: z.array(medicineSchema),
                },
            },
        },
        supplierMedicines: {
            list: {
                path: "/api/supplier-medicines",
                responses: {
                    200: z.array(supplierMedicineSchema),
                },
            },
            listBySupplier: {
                path: "/api/suppliers/:supplierId/medicines",
                responses: {
                    200: z.array(supplierMedicineWithRelationsSchema),
                },
            },
        },
        notifications: {
            list: {
                path: "/api/notifications",
                responses: {
                    200: z.array(notificationSchema),
                },
            },
        },
        orders: {
            list: {
                path: "/api/orders",
                responses: {
                    200: z.array(orderSchema),
                },
            },
        },
        suppliers: {
            list: {
                path: "/api/suppliers",
                responses: {
                    200: z.array(supplierSchema.omit({ password: true })),
                },
            },
        },
        pharmacies: {
            list: {
                path: "/api/pharmacies",
                responses: {
                    200: z.array(pharmacySchema.omit({ password: true })),
                },
            },
        },
    },
};

export function buildUrl(template: string, params: Record<string, string | number>) {
    let url = template;
    for (const key in params) {
        url = url.replace(`:${key}`, String(params[key]));
    }
    return url;
}
