import React from "react";
import { Link, useLocation } from "wouter";
import {
  Bell,
  Boxes,
  ClipboardList,
  Home,
  LogOut,
  Pill,
  Settings2,
  Store,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useMe, useLogout } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationsPanel } from "@/components/NotificationsPanel";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  testId: string;
};

export function AppShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const [location] = useLocation();
  const { data: me } = useMe();
  const logout = useLogout();
  const { toast } = useToast();

  const { data: notifications } = useNotifications(
    me ? { role: me.role, userId: me.userId } : undefined,
  );
  const unread = (notifications || []).filter((n) => !n.read).length;

  const supplierNav: NavItem[] = [
    { label: "Overview", href: "/supplier", icon: Home, testId: "nav-supplier-overview" },
    { label: "Medicines", href: "/supplier/medicines", icon: Pill, testId: "nav-supplier-medicines" },
    { label: "Orders", href: "/supplier/orders", icon: ClipboardList, testId: "nav-supplier-orders" },
    { label: "Notifications", href: "/notifications", icon: Bell, testId: "nav-notifications" },
  ];

  const pharmacyNav: NavItem[] = [
    { label: "Overview", href: "/pharmacy", icon: Home, testId: "nav-pharmacy-overview" },
    { label: "Suppliers", href: "/pharmacy/suppliers", icon: Truck, testId: "nav-pharmacy-suppliers" },
    { label: "Orders", href: "/pharmacy/orders", icon: ClipboardList, testId: "nav-pharmacy-orders" },
    { label: "Notifications", href: "/notifications", icon: Bell, testId: "nav-notifications" },
  ];

  const nav = me?.role === "supplier" ? supplierNav : pharmacyNav;

  const brandIcon = me?.role === "supplier" ? Boxes : Store;
  const BrandIcon = brandIcon;

  const onLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({ title: "Signed out", description: "You’ve been logged out successfully." });
      window.location.href = "/login";
    } catch (e: any) {
      toast({ title: "Logout failed", description: e?.message || "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="pointer-events-none fixed inset-0 grain-overlay" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="glass rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-black dark:bg-black/40 text-primary-foreground shadow-premium-md overflow-hidden ring-1 ring-white/10">
                        <img src="/logo.png" alt="DAWAK Logo" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xl font-black tracking-tighter leading-none" style={{ fontFamily: "var(--font-serif)" }}>
                          DAWAK
                        </div>
                        <div className="text-[11px] uppercase font-bold tracking-widest text-muted-foreground/70 mt-1.5">Platform Console</div>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl border border-border/60 bg-card/60 px-3 py-2">
                      <div className="text-xs text-muted-foreground">Signed in as</div>
                      <div className="mt-0.5 text-sm font-semibold">
                        {me?.role === "supplier" ? "Supplier" : "Pharmacy"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{me?.userId || "-"}</div>
                    </div>
                  </div>
                </div>

                <Separator className="my-5" />

                <nav className="space-y-1.5 p-1">
                  {nav.map((item) => {
                    const Icon = item.icon;
                    const active =
                      location === item.href ||
                      (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-testid={item.testId}
                        className={cn(
                          "group relative flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300",
                          active
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            className={cn(
                              "h-5 w-5 transition-transform duration-300 group-hover:scale-110",
                              active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary",
                            )}
                          />
                          {item.label}
                        </span>

                        {item.href === "/notifications" && unread > 0 ? (
                          <Badge className={cn(
                            "shadow-sm",
                            active ? "bg-white text-primary" : "bg-primary text-primary-foreground"
                          )} data-testid="badge-unread">
                            {unread}
                          </Badge>
                        ) : null}
                      </Link>
                    );
                  })}
                </nav>

                <Separator className="my-5 opacity-50" />

                <div className="space-y-2">
                  <Link
                    href="/settings"
                    data-testid="nav-settings"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/30 px-3 py-2.5 text-xs font-bold text-muted-foreground hover:bg-card hover:text-foreground transition-all duration-300"
                  >
                    <Settings2 className="h-4 w-4" />
                    Settings
                  </Link>

                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={onLogout}
                    data-testid="btn-logout"
                    disabled={logout.isPending}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logout.isPending ? "Signing out…" : "Logout"}
                  </Button>
                </div>
              </div>
            </div>

          </aside>

          {/* Mobile top bar + content */}
          <main className="min-w-0">
            <header className="glass rounded-2xl px-4 sm:px-5 py-4 sm:py-5 animate-in-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="lg:hidden">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="outline" className="rounded-xl" data-testid="btn-open-mobile-nav">
                            <span className="inline-flex items-center gap-2">
                              <BrandIcon className="h-4 w-4" />
                              Menu
                            </span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[320px] p-0">
                          <div className="h-full bg-sidebar text-sidebar-foreground">
                            <SheetHeader className="p-5">
                              <SheetTitle className="text-sidebar-foreground flex items-center gap-2">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sidebar-primary to-accent text-primary-foreground grid place-items-center shadow-lg shadow-black/20">
                                  <BrandIcon className="h-5 w-5" />
                                </div>
                                <span style={{ fontFamily: "var(--font-serif)" }}>DAWAK</span>
                              </SheetTitle>
                              <div className="text-xs text-sidebar-foreground/70">
                                {me?.role === "supplier" ? "Supplier Console" : "Pharmacy Console"}
                              </div>
                            </SheetHeader>
                            <div className="px-3 pb-5">
                              <nav className="space-y-1">
                                {nav.map((item) => {
                                  const Icon = item.icon;
                                  const active =
                                    location === item.href ||
                                    (item.href !== "/" && location.startsWith(item.href));
                                  return (
                                    <Link
                                      key={item.href}
                                      href={item.href}
                                      data-testid={`${item.testId}-mobile`}
                                      className={cn(
                                        "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                                        active
                                          ? "bg-sidebar-accent text-sidebar-foreground"
                                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                      )}
                                    >
                                      <span className="flex items-center gap-2.5">
                                        <Icon className="h-4.5 w-4.5" />
                                        {item.label}
                                      </span>
                                      {item.href === "/notifications" && unread > 0 ? (
                                        <Badge className="bg-sidebar-primary text-sidebar-primary-foreground">
                                          {unread}
                                        </Badge>
                                      ) : null}
                                    </Link>
                                  );
                                })}
                              </nav>
                              <Separator className="my-5 bg-sidebar-border" />
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-xs text-sidebar-foreground/70">
                                  Signed in as <span className="font-semibold text-sidebar-foreground">{me?.role}</span>
                                </div>
                                <Button
                                  variant="secondary"
                                  className="rounded-xl bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
                                  onClick={onLogout}
                                  data-testid="btn-logout-mobile"
                                >
                                  <LogOut className="h-4 w-4 mr-2" />
                                  Logout
                                </Button>
                              </div>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>

                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl leading-tight">{title}</h1>
                      {subtitle ? (
                        <p className="mt-1 text-sm text-muted-foreground max-w-2xl" data-testid="page-subtitle">
                          {subtitle}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:block">
                    <ThemeToggle />
                  </div>

                  <Link
                    href="/notifications"
                    className="relative inline-flex items-center justify-center rounded-xl border border-border/70 bg-card/60 px-3 py-2 text-sm font-semibold hover:bg-card transition-all duration-200 fancy-ring"
                    data-testid="btn-open-notifications"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    {unread > 0 ? (
                      <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-extrabold grid place-items-center shadow-md shadow-primary/20">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    ) : null}
                  </Link>

                  {actions ? <div className="hidden md:flex items-center gap-2">{actions}</div> : null}
                </div>
              </div>
            </header>

            {actions ? <div className="mt-3 md:hidden">{actions}</div> : null}

            <div className="mt-6 animate-in-soft">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
