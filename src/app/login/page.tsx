import { Suspense } from "react";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sign in — ShipVault" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center vault-grid px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <Card className="glow">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to access your shipments and secure vault.
            </p>
          </CardHeader>
          <CardContent>
            <Suspense>
              <AuthForm mode="signin" />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
