import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Create account — VaultEx" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Open a secure account"
      subtitle="Start shipping and protect your documents in an encrypted vault."
    >
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  );
}
