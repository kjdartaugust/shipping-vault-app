import { Suspense } from "react";
import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Create account — ShipVault" };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center vault-grid px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <Card className="glow">
          <CardHeader>
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Start shipping and protect your documents in an encrypted vault.
            </p>
          </CardHeader>
          <CardContent>
            <Suspense>
              <AuthForm mode="signup" />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
