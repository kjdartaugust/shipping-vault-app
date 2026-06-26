import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in — VaultEx" };

export default function LoginPage() {
  return (
    <AuthShell title="Access your vault" subtitle="Sign in to your secure command center.">
      <Suspense>
        <AuthForm mode="signin" />
      </Suspense>
    </AuthShell>
  );
}
