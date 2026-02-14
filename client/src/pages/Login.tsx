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
import { motion } from "framer-motion";

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
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 grain-overlay" />

      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="h-12 w-12 rounded-2xl bg-black dark:bg-black/40 text-primary-foreground overflow-hidden shadow-premium-lg">
            <img src="/logo.png" alt="DAWAK Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tighter" style={{ fontFamily: "var(--font-serif)" }}>
              DAWAK
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Security Access</div>
          </div>
          <ThemeToggle />
        </motion.div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-premium-lg">
              <div className="p-8 sm:p-12">
                <h1 className="text-4xl sm:text-5xl leading-tight font-black">
                  Fast ordering. <br />
                  <span className="text-gradient">Clear inventory.</span> <br />
                  Zero friction.
                </h1>
                <p className="mt-6 text-lg text-muted-foreground/90 font-medium leading-relaxed max-w-2xl">
                  Switch between Supplier and Pharmacy roles, manage catalog, place orders, and track decisions — all persisted with zero latency.
                </p>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="rounded-3xl border border-border/40 bg-card/30 p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 font-black tracking-tight text-lg">
                      <Truck className="h-6 w-6 text-primary" />
                      Supplier Unit
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground/80 font-medium">
                      Control medicine listings, stock depth, and order approvals.
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border/40 bg-card/30 p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-3 font-black tracking-tight text-lg">
                      <Building2 className="h-6 w-6 text-primary" />
                      Pharmacy Unit
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground/80 font-medium">
                      Browse partners via maps and submit validated orders instantly.
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-[2.5rem] border-none glass-card shadow-premium-lg">
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
          </motion.div>
        </div>

        <div className="mt-10 text-center text-xs text-muted-foreground">
          Built with React + TanStack Query + LocalStorage simulation.
        </div>
      </div>
    </div>
  );
}
