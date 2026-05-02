import { useEffect } from "react";
import { useLocation } from "wouter";

export function useAdminGuard() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    const session = localStorage.getItem("sk-admin-session");
    if (!session) {
      setLocation("/admin/login");
    }
  }, []);
}
