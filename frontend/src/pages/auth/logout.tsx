import { AppLoading } from "@/components/app/app-loading";
import { useAuth } from "@/hooks/use-auth";
import { navigate } from "@/lib/router";
import { useEffect } from "react";

export default function LogoutPage() {
  const { action } = useAuth();

  useEffect(() => {
    action.logout().then(() => {
      navigate("/auth/login");
    });
  }, []);

  return <AppLoading />;
}
