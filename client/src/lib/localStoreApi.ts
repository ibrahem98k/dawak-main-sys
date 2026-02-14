import { z } from "zod";
import {
  appStateSchema,
  currentUserSchema,
  medicineSchema,
  pharmacySchema,
  supplierSchema,
  supplierMedicineSchema,
  orderSchema,
  ratingSchema,
  notificationSchema,
  type AppState,
  type CreateOrderRequest,
  type CreateSupplierMedicineRequest,
  type CurrentUser,
  type DecideOrderRequest,
  type LoginRequest,
  type Rating,
  type RegisterRequest,
  type SupplierMedicine,
  type UpdateSupplierMedicineRequest,
  type SupplierPerformance,
} from "@shared/schema";

const LS_STATE_KEY = "pharmsync.state.v1";
const LS_ME_KEY = "pharmsync.me.v1";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function ensureSeeded() {
  const raw = localStorage.getItem(LS_STATE_KEY);
  if (!raw) {
    const seeded = seedState();
    localStorage.setItem(LS_STATE_KEY, JSON.stringify(seeded));
    // keep me null by default
  } else {
    try {
      parseWithLogging(appStateSchema, JSON.parse(raw), "state(existing)");
    } catch {
      const seeded = seedState();
      localStorage.setItem(LS_STATE_KEY, JSON.stringify(seeded));
      localStorage.removeItem(LS_ME_KEY);
    }
  }
}

function readState(): AppState {
  ensureSeeded();
  const raw = localStorage.getItem(LS_STATE_KEY);
  return parseWithLogging(appStateSchema, raw ? JSON.parse(raw) : seedState(), "state.read");
}

function writeState(next: AppState) {
  const validated = parseWithLogging(appStateSchema, next, "state.write");
  localStorage.setItem(LS_STATE_KEY, JSON.stringify(validated));
}

function readMe(): CurrentUser | null {
  const raw = localStorage.getItem(LS_ME_KEY);
  if (!raw) return null;
  return parseWithLogging(currentUserSchema, JSON.parse(raw), "me.read");
}

function writeMe(me: CurrentUser | null) {
  if (!me) {
    localStorage.removeItem(LS_ME_KEY);
    return;
  }
  const validated = parseWithLogging(currentUserSchema, me, "me.write");
  localStorage.setItem(LS_ME_KEY, JSON.stringify(validated));
}

function seedState(): AppState {
  const medicines = [
    { id: uid("med"), name: "Amoxicillin", dosage: "500 mg", form: "Capsule" },
    { id: uid("med"), name: "Ibuprofen", dosage: "200 mg", form: "Tablet" },
    { id: uid("med"), name: "Paracetamol", dosage: "500 mg", form: "Tablet" },
    { id: uid("med"), name: "Omeprazole", dosage: "20 mg", form: "Capsule" },
    { id: uid("med"), name: "Metformin", dosage: "850 mg", form: "Tablet" },
    { id: uid("med"), name: "Amlodipine", dosage: "5 mg", form: "Tablet" },
    { id: uid("med"), name: "Ciprofloxacin", dosage: "500 mg", form: "Tablet" },
    { id: uid("med"), name: "Cetirizine", dosage: "10 mg", form: "Tablet" },
    { id: uid("med"), name: "Salbutamol", dosage: "100 mcg", form: "Inhaler" },
    { id: uid("med"), name: "Insulin Glargine", dosage: "100 IU/mL", form: "Injection" },
    { id: uid("med"), name: "Hydrocortisone", dosage: "1%", form: "Cream" },
    { id: uid("med"), name: "Azithromycin", dosage: "250 mg", form: "Tablet" },
  ].map((m) => parseWithLogging(medicineSchema, m, "seed.medicine"));

  const suppliers = [
    {
      id: uid("sup"),
      name: "Farabi Pharma Scientific Bureau",
      email: "farabi@pharma.iq",
      password: "demo1",
      phone: "+964 780 123 4567",
      locationName: "Al-Sa'adoon St, Baghdad",
      lat: 33.3152,
      lng: 44.3661,
    },
    {
      id: uid("sup"),
      name: "Al-Raed Group",
      email: "contact@raed-group.iq",
      password: "demo1",
      phone: "+964 770 987 6543",
      locationName: "Al-Mansour, Baghdad",
      lat: 33.3333,
      lng: 44.3211,
    },
    {
      id: uid("sup"),
      name: "Al-Thuraya Pharma Group",
      email: "info@thuraya-pharma.iq",
      password: "demo1",
      phone: "+964 790 111 2222",
      locationName: "Al-Karrada, Baghdad",
      lat: 33.3012,
      lng: 44.4231,
    },
    {
      id: uid("sup"),
      name: "Areej Baghdad Wholesales",
      email: "areej@baghdad.iq",
      password: "demo1",
      phone: "+964 781 222 3333",
      locationName: "Al-Harithiya, Baghdad",
      lat: 33.3188,
      lng: 44.3544,
    },
    {
      id: uid("sup"),
      name: "Xenofarma Iraq",
      email: "office@xenofarma.iq",
      password: "demo1",
      phone: "+964 750 444 5555",
      locationName: "Gulan Street, Erbil",
      lat: 36.1901,
      lng: 44.0091,
    },
    {
      id: uid("sup"),
      name: "ESB Group",
      email: "info@esb-group.iq",
      password: "demo1",
      phone: "+964 750 666 7777",
      locationName: "100m Road, Erbil",
      lat: 36.2122,
      lng: 43.9877,
    },
    {
      id: uid("sup"),
      name: "Organo Pharmaceuticals",
      email: "dist@organo.iq",
      password: "demo1",
      phone: "+964 750 888 9999",
      locationName: "Bakhtyari, Erbil",
      lat: 36.1755,
      lng: 44.0122,
    },
    {
      id: uid("sup"),
      name: "Madar Al-Hayat",
      email: "sales@madar-alhayat.iq",
      password: "demo1",
      phone: "+964 750 000 1111",
      locationName: "Ankawa Rd, Erbil",
      lat: 36.2344,
      lng: 43.9988,
    },
    {
      id: uid("sup"),
      name: "SaMed Pharma Basra",
      email: "basra@samed.iq",
      password: "demo1",
      phone: "+964 780 333 4444",
      locationName: "Al-Ashar, Basra",
      lat: 30.5081,
      lng: 47.7835,
    },
    {
      id: uid("sup"),
      name: "Al Tawasul Logistics",
      email: "ops@tawasul.iq",
      password: "demo1",
      phone: "+964 781 555 6666",
      locationName: "Al-Zubair Industrial, Basra",
      lat: 30.3988,
      lng: 47.6544,
    },
    {
      id: uid("sup"),
      name: "Kawkab Group Mosul",
      email: "mosul@kawkab.iq",
      password: "demo1",
      phone: "+964 771 777 8888",
      locationName: "Al-Zuhour District, Mosul",
      lat: 36.3489,
      lng: 43.1577,
    },
    {
      id: uid("sup"),
      name: "Nineveh Med Supply",
      email: "contact@nineveh-med.iq",
      password: "demo1",
      phone: "+964 770 222 9999",
      locationName: "Al-Muthanna, Mosul",
      lat: 36.3655,
      lng: 43.1422,
    },
    {
      id: uid("sup"),
      name: "Sulaymaniyah Health Bridge",
      email: "info@sul-health.iq",
      password: "demo1",
      phone: "+964 770 123 0000",
      locationName: "Salim St, Sulaymaniyah",
      lat: 35.5558,
      lng: 45.4329,
    },
    {
      id: uid("sup"),
      name: "Najaf Al-Ashraf Medical",
      email: "najaf@med-center.iq",
      password: "demo1",
      phone: "+964 782 444 0000",
      locationName: "Medina St, Najaf",
      lat: 31.9922,
      lng: 44.3195,
    },
    {
      id: uid("sup"),
      name: "Karbala Pharma Care",
      email: "care@karbala-pharma.iq",
      password: "demo1",
      phone: "+964 781 666 1111",
      locationName: "Al-Abbas St, Karbala",
      lat: 32.6160,
      lng: 44.0248,
    },
    {
      id: uid("sup"),
      name: "Kirkuk Medical Depot",
      email: "kirkuk@depot.iq",
      password: "demo1",
      phone: "+964 770 555 2222",
      locationName: "Baghdad Rd, Kirkuk",
      lat: 35.4687,
      lng: 44.3924,
    },
    {
      id: uid("sup"),
      name: "Duhok Pharma Distro",
      email: "duhok@pharma-dist.iq",
      password: "demo1",
      phone: "+964 750 777 3333",
      locationName: "KRO District, Duhok",
      lat: 36.8665,
      lng: 42.9888,
    },
  ].map((s) => parseWithLogging(supplierSchema, s, "seed.supplier"));

  const pharmacies = [
    {
      id: uid("pha"),
      name: "Elm Street Pharmacy",
      email: "pharmacy1@demo.com",
      password: "demo1",
      phone: "+1 (555) 020-1001",
      address: "112 Elm Street, New York, NY",
    },
    {
      id: uid("pha"),
      name: "Riverside Rx",
      email: "pharmacy2@demo.com",
      password: "demo2",
      phone: "+1 (555) 020-2102",
      address: "48 Riverside Drive, New York, NY",
    },
    {
      id: uid("pha"),
      name: "Sunrise Community Pharmacy",
      email: "pharmacy3@demo.com",
      password: "demo3",
      phone: "+1 (555) 020-3333",
      address: "9-17 28th Ave, Queens, NY",
    },
  ].map((p) => parseWithLogging(pharmacySchema, p, "seed.pharmacy"));

  // Create 20 supplier medicines across suppliers
  const sm: SupplierMedicine[] = [];
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  for (let i = 0; i < 20; i++) {
    const supplier = suppliers[i % suppliers.length];
    const med = pick(medicines);
    const price = Number((6 + Math.random() * 38).toFixed(2));
    const stock = Math.floor(10 + Math.random() * 220);
    const available = Math.random() > 0.12;
    sm.push(
      parseWithLogging(
        supplierMedicineSchema,
        {
          id: uid("sm"),
          supplierId: supplier.id,
          medicineId: med.id,
          price,
          stock,
          available,
        },
        "seed.supplierMedicine",
      ),
    );
  }

  // 8 orders with mixed status
  const statuses = ["pending", "approved", "rejected"] as const;
  const orders = Array.from({ length: 8 }).map((_, idx) => {
    const supplier = pick(suppliers);
    const pharmacy = pick(pharmacies);
    const supplierItems = sm.filter((x) => x.supplierId === supplier.id && x.available);
    const itemsCount = Math.max(1, Math.min(3, supplierItems.length ? 1 + Math.floor(Math.random() * 3) : 1));
    const chosen = Array.from({ length: itemsCount }).map(() => pick(supplierItems.length ? supplierItems : sm.filter((x) => x.supplierId === supplier.id)));
    const items = chosen
      .filter(Boolean)
      .slice(0, 3)
      .map((it) => ({
        id: uid("oi"),
        supplierMedicineId: it.id,
        quantity: Math.max(1, Math.min(8 + Math.floor(Math.random() * 30), Math.max(1, it.stock))),
        unitPrice: it.price,
      }));

    const status = statuses[idx % statuses.length];
    const base = {
      id: uid("ord"),
      supplierId: supplier.id,
      pharmacyId: pharmacy.id,
      status,
      createdAt: new Date(Date.now() - idx * 1000 * 60 * 60 * 11).toISOString(),
      items,
      note: idx % 2 === 0 ? "Please pack with batch/expiry labels visible." : undefined,
      decisionNote:
        status === "approved"
          ? "Approved — ready for dispatch."
          : status === "rejected"
            ? "Rejected — insufficient stock for requested quantity."
            : undefined,
    };
    return parseWithLogging(orderSchema, base, "seed.order");
  });

  const notifications = [
    {
      id: uid("ntf"),
      createdAt: nowIso(),
      title: "Welcome to PharmSync",
      message: "Demo data is seeded. Log in as a supplier or pharmacy to explore workflows.",
      read: false,
      user: undefined,
    },
  ].map((n) => parseWithLogging(notificationSchema, n, "seed.notification"));

  return parseWithLogging(
    appStateSchema,
    {
      version: 1,
      medicines,
      suppliers,
      pharmacies,
      supplierMedicines: sm,
      orders,
      ratings: [],
      notifications,
    },
    "seed.state",
  );
}

// =====================
// "API" functions
// =====================

export async function stateGet() {
  return readState();
}

export async function stateResetToSeed() {
  const seeded = seedState();
  writeState(seeded);
  writeMe(null);
  return seeded;
}

export async function authMe() {
  ensureSeeded();
  return readMe();
}

export async function authLogout() {
  writeMe(null);
}

export async function authLogin(input: LoginRequest) {
  ensureSeeded();
  const state = readState();

  if (input.role === "supplier") {
    const user = state.suppliers.find((s) => s.email.toLowerCase() === input.email.toLowerCase());
    if (!user || user.password !== input.password) throw new Error("Invalid supplier credentials");
    writeMe({ role: "supplier", userId: user.id });
    pushNotification({
      title: "Signed in",
      message: `Welcome back, ${user.name}.`,
      user: { role: "supplier", userId: user.id },
    });
    return readMe();
  }

  const user = state.pharmacies.find((p) => p.email.toLowerCase() === input.email.toLowerCase());
  if (!user || user.password !== input.password) throw new Error("Invalid pharmacy credentials");
  writeMe({ role: "pharmacy", userId: user.id });
  pushNotification({
    title: "Signed in",
    message: `Welcome back, ${user.name}.`,
    user: { role: "pharmacy", userId: user.id },
  });
  return readMe();
}

export async function authRegister(input: RegisterRequest) {
  ensureSeeded();
  const state = readState();

  const emailLower = input.email.toLowerCase();

  const emailExists =
    state.suppliers.some((s) => s.email.toLowerCase() === emailLower) ||
    state.pharmacies.some((p) => p.email.toLowerCase() === emailLower);

  if (emailExists) throw new Error("Email already registered");

  if (input.role === "supplier") {
    const supplier = parseWithLogging(
      supplierSchema,
      {
        id: uid("sup"),
        name: input.name,
        email: input.email,
        password: input.password,
        phone: input.phone,
        locationName: input.locationName || "New Supplier Location",
        lat: typeof input.lat === "number" ? input.lat : 40.7128,
        lng: typeof input.lng === "number" ? input.lng : -74.006,
      },
      "register.supplier",
    );
    state.suppliers = [supplier, ...state.suppliers];
    writeState(state);
    writeMe({ role: "supplier", userId: supplier.id });
    pushNotification({
      title: "Account created",
      message: `You're in! Start listing medicines for ${supplier.name}.`,
      user: { role: "supplier", userId: supplier.id },
    });
    return readMe();
  }

  const pharmacy = parseWithLogging(
    pharmacySchema,
    {
      id: uid("pha"),
      name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone,
      address: input.address || "New Pharmacy Address",
    },
    "register.pharmacy",
  );
  state.pharmacies = [pharmacy, ...state.pharmacies];
  writeState(state);
  writeMe({ role: "pharmacy", userId: pharmacy.id });
  pushNotification({
    title: "Account created",
    message: `Welcome to PharmSync, ${pharmacy.name}. Browse suppliers and place your first order.`,
    user: { role: "pharmacy", userId: pharmacy.id },
  });
  return readMe();
}

export async function medicinesList() {
  ensureSeeded();
  const state = readState();
  return state.medicines.map((m) => parseWithLogging(medicineSchema, m, "medicines.list.item"));
}

export async function suppliersList(input?: { search?: string }) {
  ensureSeeded();
  const state = readState();
  const search = (input?.search || "").trim().toLowerCase();
  const list = state.suppliers
    .filter((s) => (search ? `${s.name} ${s.locationName} ${s.email}`.toLowerCase().includes(search) : true))
    .map((s) => {
      const { password: _pw, ...safe } = s;
      return safe;
    });
  return list;
}

export async function pharmaciesList() {
  ensureSeeded();
  const state = readState();
  return state.pharmacies.map((p) => {
    const { password: _pw, ...safe } = p;
    return safe;
  });
}

export async function supplierMedicinesListBySupplier(
  supplierId: string,
  input?: { search?: string; sortBy?: "name" | "price" | "stock"; sortDir?: "asc" | "desc"; onlyAvailable?: boolean },
) {
  ensureSeeded();
  const state = readState();
  const supplier = state.suppliers.find((s) => s.id === supplierId);
  if (!supplier) throw new Error("Supplier not found");

  const search = (input?.search || "").trim().toLowerCase();
  const onlyAvailable = !!input?.onlyAvailable;
  let list = state.supplierMedicines
    .filter((sm) => sm.supplierId === supplierId)
    .filter((sm) => (onlyAvailable ? sm.available : true))
    .map((sm) => {
      const medicine = state.medicines.find((m) => m.id === sm.medicineId)!;
      const { password: _pw, ...safeSupplier } = supplier;
      return {
        ...sm,
        medicine: parseWithLogging(medicineSchema, medicine, "supplierMedicines.list.medicine"),
        supplier: safeSupplier,
      };
    });

  if (search) {
    list = list.filter((x) =>
      `${x.medicine.name} ${x.medicine.form} ${x.medicine.dosage}`.toLowerCase().includes(search),
    );
  }

  const dir = input?.sortDir === "desc" ? -1 : 1;
  const sortBy = input?.sortBy || "name";
  list.sort((a, b) => {
    if (sortBy === "name") return a.medicine.name.localeCompare(b.medicine.name) * dir;
    if (sortBy === "price") return (a.price - b.price) * dir;
    return (a.stock - b.stock) * dir;
  });

  return list;
}

export async function supplierMedicinesCreate(payload: CreateSupplierMedicineRequest) {
  ensureSeeded();
  const state = readState();
  // Validate references
  if (!state.suppliers.find((s) => s.id === payload.supplierId)) throw new Error("Supplier not found");
  if (!state.medicines.find((m) => m.id === payload.medicineId)) throw new Error("Medicine not found");

  const next = parseWithLogging(
    supplierMedicineSchema,
    {
      ...payload,
      id: uid("sm"),
      price: Number(payload.price),
      stock: Math.max(0, Math.floor(payload.stock)),
      available: !!payload.available,
    },
    "supplierMedicines.create",
  );

  state.supplierMedicines = [next, ...state.supplierMedicines];
  writeState(state);

  pushNotification({
    title: "Medicine listed",
    message: "A medicine listing was added to your catalog.",
    user: { role: "supplier", userId: payload.supplierId },
  });

  return next;
}

export async function supplierMedicinesUpdate(id: string, updates: UpdateSupplierMedicineRequest) {
  ensureSeeded();
  const state = readState();
  const idx = state.supplierMedicines.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Supplier medicine not found");

  const current = state.supplierMedicines[idx];
  const next = parseWithLogging(
    supplierMedicineSchema,
    {
      ...current,
      ...updates,
      price: typeof updates.price === "number" ? Number(updates.price) : current.price,
      stock: typeof updates.stock === "number" ? Math.max(0, Math.floor(updates.stock)) : current.stock,
      available: typeof updates.available === "boolean" ? updates.available : current.available,
    },
    "supplierMedicines.update",
  );

  state.supplierMedicines[idx] = next;
  writeState(state);

  pushNotification({
    title: "Catalog updated",
    message: "A medicine listing was updated.",
    user: { role: "supplier", userId: current.supplierId },
  });

  return next;
}

export async function supplierMedicinesDelete(id: string) {
  ensureSeeded();
  const state = readState();
  const current = state.supplierMedicines.find((x) => x.id === id);
  if (!current) throw new Error("Supplier medicine not found");
  state.supplierMedicines = state.supplierMedicines.filter((x) => x.id !== id);
  writeState(state);

  pushNotification({
    title: "Listing removed",
    message: "A medicine listing was deleted from your catalog.",
    user: { role: "supplier", userId: current.supplierId },
  });
}

export async function ordersList(input?: { role: "pharmacy" | "supplier"; userId: string; status?: "pending" | "approved" | "rejected" }) {
  ensureSeeded();
  const state = readState();
  let list = state.orders.slice();

  if (input?.role && input?.userId) {
    if (input.role === "supplier") list = list.filter((o) => o.supplierId === input.userId);
    if (input.role === "pharmacy") list = list.filter((o) => o.pharmacyId === input.userId);
  }

  if (input?.status) list = list.filter((o) => o.status === input.status);

  list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return list.map((o) => parseWithLogging(orderSchema, o, "orders.list.item"));
}

export async function ordersCreate(payload: CreateOrderRequest) {
  ensureSeeded();
  const state = readState();

  const supplier = state.suppliers.find((s) => s.id === payload.supplierId);
  if (!supplier) throw new Error("Supplier not found");

  const pharmacy = state.pharmacies.find((p) => p.id === payload.pharmacyId);
  if (!pharmacy) throw new Error("Pharmacy not found");

  if (!payload.items?.length) throw new Error("Order must include at least one item");

  const items = payload.items.map((it) => {
    const sm = state.supplierMedicines.find((x) => x.id === it.supplierMedicineId);
    if (!sm) throw new Error("Supplier medicine not found");
    if (sm.supplierId !== payload.supplierId) throw new Error("Item does not belong to supplier");
    if (!sm.available) throw new Error("Item is not available");
    const qty = Math.floor(it.quantity);
    if (qty <= 0) throw new Error("Quantity must be positive");
    if (qty > sm.stock) throw new Error("Quantity exceeds stock");
    return {
      id: uid("oi"),
      supplierMedicineId: sm.id,
      quantity: qty,
      unitPrice: sm.price,
    };
  });

  // Decrement stock on create (reservation-style)
  for (const it of items) {
    const idx = state.supplierMedicines.findIndex((x) => x.id === it.supplierMedicineId);
    state.supplierMedicines[idx] = { ...state.supplierMedicines[idx], stock: Math.max(0, state.supplierMedicines[idx].stock - it.quantity) };
  }

  const next = parseWithLogging(
    orderSchema,
    {
      id: uid("ord"),
      supplierId: payload.supplierId,
      pharmacyId: payload.pharmacyId,
      status: "pending",
      createdAt: nowIso(),
      items,
      note: payload.note?.trim() ? payload.note.trim() : undefined,
      decisionNote: undefined,
    },
    "orders.create",
  );

  state.orders = [next, ...state.orders];
  writeState(state);

  pushNotification({
    title: "Order created",
    message: `New order from ${pharmacy.name} is pending review.`,
    user: { role: "supplier", userId: supplier.id },
  });

  pushNotification({
    title: "Order submitted",
    message: `Your order to ${supplier.name} is now pending.`,
    user: { role: "pharmacy", userId: pharmacy.id },
  });

  return next;
}

export async function ordersDecide(orderId: string, decision: DecideOrderRequest) {
  ensureSeeded();
  const state = readState();
  const idx = state.orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error("Order not found");

  const current = state.orders[idx];
  if (current.status !== "pending") throw new Error("Only pending orders can be decided");

  const status = decision.status;
  if (status !== "approved" && status !== "rejected") throw new Error("Invalid decision");

  const next = parseWithLogging(
    orderSchema,
    {
      ...current,
      status,
      decisionNote: decision.decisionNote?.trim() ? decision.decisionNote.trim() : undefined,
    },
    "orders.decide",
  );

  state.orders[idx] = next;
  writeState(state);

  const supplier = state.suppliers.find((s) => s.id === current.supplierId);
  const pharmacy = state.pharmacies.find((p) => p.id === current.pharmacyId);

  pushNotification({
    title: status === "approved" ? "Order approved" : "Order rejected",
    message:
      status === "approved"
        ? `Order approved. ${pharmacy?.name || "Pharmacy"} will be notified.`
        : `Order rejected. ${pharmacy?.name || "Pharmacy"} will be notified.`,
    user: supplier ? { role: "supplier", userId: supplier.id } : undefined,
  });

  pushNotification({
    title: status === "approved" ? "Order approved" : "Order rejected",
    message:
      status === "approved"
        ? `Your order to ${supplier?.name || "supplier"} was approved.`
        : `Your order to ${supplier?.name || "supplier"} was rejected.`,
    user: pharmacy ? { role: "pharmacy", userId: pharmacy.id } : undefined,
  });

  return next;
}

export async function ratingsCreate(rating: Omit<Rating, "id" | "createdAt">) {
  ensureSeeded();
  const state = readState();
  const next = parseWithLogging(
    ratingSchema,
    {
      ...rating,
      id: uid("rat"),
      createdAt: nowIso(),
    },
    "ratings.create"
  );
  state.ratings = [next, ...state.ratings];
  writeState(state);
  return next;
}

export async function supplierPerformanceGet(supplierId: string): Promise<SupplierPerformance> {
  ensureSeeded();
  const state = readState();

  const supplierOrders = state.orders.filter(o => o.supplierId === supplierId);
  const supplierRatings = state.ratings.filter(r => r.supplierId === supplierId);

  const total = supplierOrders.length;
  const approved = supplierOrders.filter(o => o.status === "approved").length;
  const rejected = supplierOrders.filter(o => o.status === "rejected").length;

  const fulfillmentRate = total > 0 ? (approved / total) * 100 : 100;
  const cancellationRate = total > 0 ? (rejected / total) * 100 : 0;
  // Simulated on-time rate for demo
  const onTimeRate = total > 0 ? Math.max(85, 100 - (cancellationRate / 2)) : 100;

  const avgRating = supplierRatings.length > 0
    ? supplierRatings.reduce((sum, r) => sum + r.rating, 0) / supplierRatings.length
    : 4.5; // Default for new or unrated suppliers in demo

  // Calculate aggregate score
  const score = Math.round(
    (fulfillmentRate * 0.4) +
    (onTimeRate * 0.3) +
    ((avgRating / 5) * 100 * 0.3)
  );

  let status: SupplierPerformance["status"] = "Average";
  if (score >= 90) status = "Excellent";
  else if (score >= 75) status = "Good";
  else if (score < 50) status = "Poor";

  return {
    score,
    fulfillmentRate: Math.round(fulfillmentRate),
    onTimeRate: Math.round(onTimeRate),
    cancellationRate: Math.round(cancellationRate),
    totalRatings: supplierRatings.length,
    averageRating: Number(avgRating.toFixed(1)),
    status,
  };
}

export async function notificationsList(input?: { role: "pharmacy" | "supplier"; userId: string }) {
  ensureSeeded();
  const state = readState();
  let list = state.notifications.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (input?.role && input?.userId) {
    list = list.filter((n) => {
      if (!n.user) return true; // broadcast
      return n.user.role === input.role && n.user.userId === input.userId;
    });
  }

  return list.map((n) => parseWithLogging(notificationSchema, n, "notifications.list.item"));
}

export async function notificationsMarkRead(id: string) {
  ensureSeeded();
  const state = readState();
  const idx = state.notifications.findIndex((n) => n.id === id);
  if (idx === -1) return;
  state.notifications[idx] = { ...state.notifications[idx], read: true };
  writeState(state);
}

export async function notificationsMarkAllRead(input: { role: "pharmacy" | "supplier"; userId: string }) {
  ensureSeeded();
  const state = readState();
  state.notifications = state.notifications.map((n) => {
    const matches = !n.user || (n.user.role === input.role && n.user.userId === input.userId);
    return matches ? { ...n, read: true } : n;
  });
  writeState(state);
}

function pushNotification(n: { title: string; message: string; user?: CurrentUser }) {
  const state = readState();
  const next = parseWithLogging(
    notificationSchema,
    {
      id: uid("ntf"),
      createdAt: nowIso(),
      title: n.title,
      message: n.message,
      read: false,
      user: n.user,
    },
    "notifications.push",
  );
  state.notifications = [next, ...state.notifications].slice(0, 200);
  writeState(state);
}
