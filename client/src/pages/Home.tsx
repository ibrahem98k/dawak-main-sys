import { Link } from "wouter";
import { ArrowRight, Boxes, ClipboardList, MapPinned, Pill } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMe } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function Home() {
  const { data: me } = useMe();

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 grain-overlay" />

      {/* Decorative floating elements */}
      <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float opacity-50" />
      <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float opacity-30" style={{ animationDelay: '-3s' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-black dark:bg-black/40 text-primary-foreground overflow-hidden shadow-premium-lg">
              <img src="/logo.png" alt="DAWAK Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tighter" style={{ fontFamily: "var(--font-serif)" }}>
                DAWAK
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/80">Platform Console</div>
            </div>
          </div>
          <ThemeToggle />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, cubicBezier: [0.2, 0.9, 0.2, 1] }}
        >
          <Card className="glass rounded-[2.5rem] overflow-hidden mt-10 border-none shadow-premium-lg">
            <div className="p-8 sm:p-14 relative overflow-hidden">
              <div className="max-w-3xl relative z-10">
                <h1 className="text-5xl sm:text-7xl leading-[1.1] font-black tracking-tight">
                  The <span className="text-gradient">electric way</span> to manage your health.
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-muted-foreground/90 font-medium leading-relaxed">
                  DAWAK offers a premium B2B ordering experience for modern pharmaceutical partners. Precision tools for high-stakes inventory management.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link href={me ? (me.role === "supplier" ? "/supplier" : "/pharmacy") : "/login"} className="inline-flex">
                    <Button
                      className="rounded-2xl py-7 px-8 bg-primary text-primary-foreground shadow-premium-lg hover:shadow-primary/25 hover:-translate-y-1 transition-all duration-300 font-bold text-lg"
                      data-testid="btn-get-started"
                    >
                      {me ? "Enter Dashboard" : "Sign In Now"}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/register" className="inline-flex">
                    <Button variant="outline" className="rounded-2xl py-7 px-8 border-border/50 font-bold text-lg glass-card" data-testid="btn-create-account">
                      Register Organization
                    </Button>
                  </Link>
                </div>

                <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[
                    { icon: Pill, title: "Catalog CRUD", desc: "Full control over supplier listings with real-time updates." },
                    { icon: ClipboardList, title: "Order Logic", desc: "Automated validation for stock levels and pricing." },
                    { icon: MapPinned, title: "Market View", desc: "Visualize partner networks with integrated map views." }
                  ].map((feat, i) => (
                    <motion.div
                      key={feat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + (i * 0.1) }}
                      className="rounded-3xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm hover:bg-card/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 font-black tracking-tight text-lg mb-2">
                        <feat.icon className="h-6 w-6 text-primary" />
                        {feat.title}
                      </div>
                      <div className="text-sm text-muted-foreground/80 font-medium leading-relaxed">
                        {feat.desc}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Decorative pill shape */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl" />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50"
        >
          Seeded demo environment • High-performance B2B stack
        </motion.div>
      </div>
    </div>
  );
}
