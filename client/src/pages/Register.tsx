import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { Building2, Compass, KeyRound, Mail, Phone, Store, Truck } from "lucide-react";
import type { RegisterRequest, Role } from "@shared/schema";
import { ensureSeeded } from "@/lib/localStoreApi";
import { useRegister } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const baseSchema = z.object({
  role: z.enum(["pharmacy", "supplier"]),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(4),
  phone: z.string().min(3),
  address: z.string().optional(),
  locationName: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegister();

  const [role, setRole] = useState<Role>("pharmacy");
  const [name, setName] = useState("New Account");
  const [email, setEmail] = useState(`new${Math.floor(Math.random() * 999)}@demo.com`);
  const [password, setPassword] = useState("demo1");
  const [phone, setPhone] = useState("+1 (555) 000-0000");
  const [address, setAddress] = useState("100 Main Street, New York, NY");
  const [locationName, setLocationName] = useState("Manhattan, NY");
  const [lat, setLat] = useState<number>(40.758);
  const [lng, setLng] = useState<number>(-73.9855);

  useEffect(() => {
    ensureSeeded();
  }, []);

  const title = useMemo(() => (role === "supplier" ? "Create supplier account" : "Create pharmacy account"), [role]);

  const submit = async () => {
    try {
      const payload: RegisterRequest = baseSchema.parse({
        role,
        name,
        email,
        password,
        phone,
        address: role === "pharmacy" ? address : undefined,
        locationName: role === "supplier" ? locationName : undefined,
        lat: role === "supplier" ? lat : undefined,
        lng: role === "supplier" ? lng : undefined,
      });
      await register.mutateAsync(payload);
      toast({ title: "Account created", description: "Redirecting to your dashboard…" });
      setLocation(role === "supplier" ? "/supplier" : "/pharmacy");
    } catch (e: any) {
      toast({
        title: "Registration failed",
        description: e?.errors?.[0]?.message || e?.message || "Please check fields and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="pointer-events-none fixed inset-0 grain-overlay" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between">
          <Link href="/login" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-login">
            ← Back to sign in
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <Card className="glass rounded-3xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className={cn("h-11 w-11 rounded-2xl grid place-items-center shadow-lg",
                  role === "supplier"
                    ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/20"
                    : "bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-primary/20"
                )}>
                  {role === "supplier" ? <Truck className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                    {title}
                  </div>
                  <div className="text-xs text-muted-foreground">LocalStorage demo — no backend required</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("pharmacy")}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-extrabold transition-all duration-200",
                    role === "pharmacy"
                      ? "border-primary/40 bg-gradient-to-r from-primary/14 to-accent/10 shadow-md shadow-primary/10"
                      : "border-border/60 bg-card/50 hover:bg-card",
                  )}
                  data-testid="register-role-pharmacy"
                >
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Pharmacy
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("supplier")}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-extrabold transition-all duration-200",
                    role === "supplier"
                      ? "border-primary/40 bg-gradient-to-r from-primary/14 to-accent/10 shadow-md shadow-primary/10"
                      : "border-border/60 bg-card/50 hover:bg-card",
                  )}
                  data-testid="register-role-supplier"
                >
                  <span className="inline-flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Supplier
                  </span>
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-card/50 p-4 text-sm text-muted-foreground">
                <div className="font-extrabold text-foreground">Tip</div>
                <div className="mt-1">
                  Supplier accounts require a location for maps. Pharmacy accounts require an address for delivery.
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-border/60 bg-card/75 backdrop-blur shadow-2xl shadow-black/10">
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Name</div>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 rounded-xl" data-testid="input-name" />
                </div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Phone</div>
                  <div className="mt-2 relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9 rounded-xl" data-testid="input-phone" />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Email</div>
                  <div className="mt-2 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 rounded-xl" data-testid="input-email" />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Password</div>
                  <div className="mt-2 relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 rounded-xl" data-testid="input-password" />
                  </div>
                </div>
              </div>

              {role === "pharmacy" ? (
                <div className="mt-4">
                  <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Address</div>
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-2 rounded-xl" data-testid="input-address" />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Location name</div>
                    <div className="mt-2 relative">
                      <Compass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} className="pl-9 rounded-xl" data-testid="input-locationName" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Latitude</div>
                      <Input type="number" value={lat} onChange={(e) => setLat(Number(e.target.value))} className="mt-2 rounded-xl" data-testid="input-lat" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Longitude</div>
                      <Input type="number" value={lng} onChange={(e) => setLng(Number(e.target.value))} className="mt-2 rounded-xl" data-testid="input-lng" />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={submit}
                disabled={register.isPending}
                className="mt-6 w-full rounded-xl py-6 bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                data-testid="btn-register"
              >
                {register.isPending ? "Creating…" : "Create account"}
              </Button>

              <div className="mt-4 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline" data-testid="link-login">
                  Sign in
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          By creating an account you agree to this demo app’s imaginary terms.
        </div>
      </div>
    </div>
  );
}
