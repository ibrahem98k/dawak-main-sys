import { z } from "zod";

export const medicineSchema = z.object({
    id: z.string(),
    name: z.string(),
    dosage: z.string(),
    form: z.string(),
});
export type Medicine = z.infer<typeof medicineSchema>;

export const supplierSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    phone: z.string(),
    locationName: z.string(),
    lat: z.number(),
    lng: z.number(),
});
export type Supplier = z.infer<typeof supplierSchema>;

export const pharmacySchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    phone: z.string(),
    address: z.string(),
});
export type Pharmacy = z.infer<typeof pharmacySchema>;

export const supplierMedicineSchema = z.object({
    id: z.string(),
    supplierId: z.string(),
    medicineId: z.string(),
    price: z.number(),
    stock: z.number(),
    available: z.boolean(),
});
export type SupplierMedicine = z.infer<typeof supplierMedicineSchema>;

export const supplierMedicineWithRelationsSchema = supplierMedicineSchema.extend({
    medicine: medicineSchema,
    supplier: supplierSchema.omit({ password: true }),
});
export type SupplierMedicineWithRelations = z.infer<typeof supplierMedicineWithRelationsSchema>;

export const orderSchema = z.object({
    id: z.string(),
    supplierId: z.string(),
    pharmacyId: z.string(),
    status: z.enum(["pending", "approved", "rejected"]),
    createdAt: z.string(),
    items: z.array(
        z.object({
            id: z.string(),
            supplierMedicineId: z.string(),
            quantity: z.number(),
            unitPrice: z.number(),
        })
    ),
    note: z.string().optional(),
    decisionNote: z.string().optional(),
});
export type Order = z.infer<typeof orderSchema>;
export type OrderStatus = Order["status"];

export const ratingSchema = z.object({
    id: z.string(),
    supplierId: z.string(),
    pharmacyId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    createdAt: z.string(),
});
export type Rating = z.infer<typeof ratingSchema>;

export const supplierPerformanceSchema = z.object({
    score: z.number(), // 0-100
    fulfillmentRate: z.number(), // 0-100
    onTimeRate: z.number(), // 0-100 (simulated)
    cancellationRate: z.number(), // 0-100
    totalRatings: z.number(),
    averageRating: z.number(),
    status: z.enum(["Excellent", "Good", "Average", "Poor"]),
});
export type SupplierPerformance = z.infer<typeof supplierPerformanceSchema>;

export const notificationSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    title: z.string(),
    message: z.string(),
    read: z.boolean(),
    user: z
        .object({
            role: z.enum(["supplier", "pharmacy"]),
            userId: z.string(),
        })
        .optional(),
});
export type Notification = z.infer<typeof notificationSchema>;

export const currentUserSchema = z.object({
    role: z.enum(["supplier", "pharmacy"]),
    userId: z.string(),
});
export type CurrentUser = z.infer<typeof currentUserSchema>;

export const appStateSchema = z.object({
    version: z.number(),
    medicines: z.array(medicineSchema),
    suppliers: z.array(supplierSchema),
    pharmacies: z.array(pharmacySchema),
    supplierMedicines: z.array(supplierMedicineSchema),
    orders: z.array(orderSchema),
    ratings: z.array(ratingSchema),
    notifications: z.array(notificationSchema),
});
export type AppState = z.infer<typeof appStateSchema>;

export const loginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.enum(["supplier", "pharmacy"]),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const registerRequestSchema = z.object({
    role: z.enum(["supplier", "pharmacy"]),
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    phone: z.string(),
    locationName: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    address: z.string().optional(),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const createOrderRequestSchema = z.object({
    supplierId: z.string(),
    pharmacyId: z.string(),
    items: z.array(
        z.object({
            supplierMedicineId: z.string(),
            quantity: z.number(),
        })
    ),
    note: z.string().optional(),
});
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const decideOrderRequestSchema = z.object({
    status: z.enum(["approved", "rejected"]),
    decisionNote: z.string().optional(),
});
export type DecideOrderRequest = z.infer<typeof decideOrderRequestSchema>;

export const createSupplierMedicineRequestSchema = z.object({
    supplierId: z.string(),
    medicineId: z.string(),
    price: z.number(),
    stock: z.number(),
    available: z.boolean(),
});
export type CreateSupplierMedicineRequest = z.infer<typeof createSupplierMedicineRequestSchema>;

export const updateSupplierMedicineRequestSchema = z.object({
    price: z.number().optional(),
    stock: z.number().optional(),
    available: z.boolean().optional(),
});
export type UpdateSupplierMedicineRequest = z.infer<typeof updateSupplierMedicineRequestSchema>;

export type Role = "supplier" | "pharmacy";
