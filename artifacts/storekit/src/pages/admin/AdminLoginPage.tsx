import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAdminLogin } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const adminLogin = useAdminLogin();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await adminLogin.mutateAsync({ data: { password } });
      localStorage.setItem("sk-admin-session", "1");
      setLocation("/admin");
    } catch {
      toast({ title: "Invalid password", variant: "destructive" });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/20 rounded-full mb-5">
            <Lock className="w-6 h-6 text-accent" />
          </div>
          <h1 className="font-accent text-3xl tracking-[0.2em] text-background mb-2" style={{ fontFamily: "var(--font-accent)" }}>
            ADMIN
          </h1>
          <p className="text-sm text-background/40">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoFocus
            className="w-full bg-background/10 border border-background/20 text-background placeholder:text-background/30 px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground py-3 text-xs tracking-[0.2em] uppercase font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
