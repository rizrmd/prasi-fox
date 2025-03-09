import { SideForm } from "@/components/ext/side-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthRoute, getStoredRedirectPath } from "@/lib/auth";
import { Link } from "@/lib/router";
import { useState } from "react";

import sideImage from "@/img/side-bg.jpeg";
import { useAuth } from "@/hooks/use-auth";
import { Alert } from "@/components/ui/global-alert";

function LoginPageContent() {
  const { state, action } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await action.login({ username, password });
      if (res?.error) {
        setIsLoading(false);
        setError(res.error);
        return;
      }
      const redirectPath = getStoredRedirectPath();
      window.location.href = redirectPath || "/";
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message);
    }
  };

  return (
    <SideForm sideImage={sideImage}>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Login</h1>
        </div>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="text-center text-sm">
          <Link to="/auth/register" className="text-blue-500 hover:underline">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </SideForm>
  );
}

export default function LoginPage() {
  return (
    <AuthRoute>
      <LoginPageContent />
    </AuthRoute>
  );
}
