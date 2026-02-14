import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { Building2, Lock, Mail, ShieldCheck, Truck } from "lucide-react";
import type { LoginRequest, Role } from "@shared/schema";
import { ensureSeeded } from "@/lib/localStoreApi";
import { useLogin, useMe } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const schema = z.object({
  role: z.enum(["pharmacy", "supplier"]),
  email: z.string().email(),
  password: z.string().min(1),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: me } = useMe();
  const login = useLogin();

  const [role, setRole] = useState<Role>("pharmacy");
  const [email, setEmail] = useState("pharmacy1@demo.com");
  const [password, setPassword] = useState("demo1");

  useEffect(() => {
    ensureSeeded();
  }, []);

  useEffect(() => {
    if (me?.role === "supplier") setLocation("/supplier");
    if (me?.role === "pharmacy") setLocation("/pharmacy");
  }, [me, setLocation]);

  const presets = useMemo(
    () => ({
      pharmacy: { email: "pharmacy1@demo.com", password: "demo1" },
      supplier: { email: "supplier1@demo.com", password: "demo1" },
    }),
    [],
  );

  const switchRole = (r: Role) => {
    setRole(r);
    setEmail(presets[r].email);
    setPassword(presets[r].password);
  };

  const submit = async () => {
    try {
      const payload: LoginRequest = schema.parse({ role, email, password });
      await login.mutateAsync(payload);
      toast({
        title: "Welcome back",
        description: "You’re signed in. Redirecting…",
      });
      setLocation(role === "supplier" ? "/supplier" : "/pharmacy");
    } catch (e: any) {
      toast({
        title: "Sign in failed",
        description: e?.message || "Check email/password and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="pointer-events-none fixed inset-0 grain-overlay" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground grid place-items-center shadow-lg shadow-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ fontFamily: "var(--font-serif)" }}>
                PharmSync
              </div>
              <div className="text-xs text-muted-foreground">B2B ordering console (LocalStorage demo)</div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
          <Card className="glass rounded-3xl overflow-hidden">
            <div className="p-6 sm:p-8">
              <h1 className="text-3xl sm:text-4xl leading-tight">
                Fast ordering. Clear inventory.{" "}
                <span className="text-primary">Zero friction</span>.
              </h1>
              <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl">
                Switch between Supplier and Pharmacy roles, manage catalog, place orders, and track decisions — all persisted locally.
              </p>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
                  <div className="flex items-center gap-2 font-extrabold tracking-tight">
                    <Truck className="h-5 w-5 text-primary" />
                    Supplier Console
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Add/edit medicine listings, update stock, approve or reject incoming orders.
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
                  <div className="flex items-center gap-2 font-extrabold tracking-tight">
                    <Building2 className="h-5 w-5 text-primary" />
                    Pharmacy Console
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Browse suppliers with maps, filter medicines, and submit validated orders.
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Seeded demo data
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Toast notifications
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Order workflow
                </span>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border border-border/60 bg-card/75 backdrop-blur shadow-2xl shadow-black/10 animate-in-soft">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-2xl font-bold tracking-tight">Sign in</div>
                  <div className="mt-1 text-sm text-muted-foreground">Use demo credentials or register a new account.</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => switchRole("pharmacy")}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-extrabold transition-all duration-200",
                    role === "pharmacy"
                      ? "border-primary/40 bg-gradient-to-r from-primary/14 to-accent/10 shadow-md shadow-primary/10"
                      : "border-border/60 bg-card/50 hover:bg-card",
                  )}
                  data-testid="role-pharmacy"
                >
                  Pharmacy
                </button>
                <button
                  type="button"
                  onClick={() => switchRole("supplier")}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-extrabold transition-all duration-200",
                    role === "supplier"
                      ? "border-primary/40 bg-gradient-to-r from-primary/14 to-accent/10 shadow-md shadow-primary/10"
                      : "border-border/60 bg-card/50 hover:bg-card",
                  )}
                  data-testid="role-supplier"
                >
                  Supplier
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                    Email
                  </div>
                  <div className="mt-2 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 rounded-xl"
                      placeholder="you@company.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                    Password
                  </div>
                  <div className="mt-2 relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 rounded-xl"
                      placeholder="••••"
                      data-testid="input-password"
                    />
                  </div>
                </div>

                <Button
                  onClick={submit}
                  disabled={login.isPending}
                  className="w-full rounded-xl py-6 bg-gradient-to-r from-primary to-primary/85 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  data-testid="btn-login"
                >
                  {login.isPending ? "Signing in…" : "Sign in"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <Link
                    href="/register"
                    className="text-primary font-semibold hover:underline"
                    data-testid="link-register"
                  >
                    Create an account
                  </Link>
                  <Link
                    href="/"
                    className="text-muted-foreground font-semibold hover:text-foreground transition-colors"
                    data-testid="link-home"
                  >
                    Back
                  </Link>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
                  <div className="font-extrabold text-foreground">Demo credentials</div>
                  <div className="mt-1">
                    Supplier: supplier1@demo.com / demo1
                    <br />
                    Pharmacy: pharmacy1@demo.com / demo1
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Built with React + TanStack Query + LocalStorage simulation.
        </div>
      </div>
    </div>
  );
}
